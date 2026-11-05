-- StudyShare: initial schema
-- Tables: profiles, user_roles, courses, materials, comments, ratings
-- + view material_stats, updated_at triggers, new-user trigger

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------
create type public.app_role as enum ('user', 'admin');

-- ---------------------------------------------------------------------------
-- Helper: keep updated_at current
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles: public user profile, 1:1 with auth.users
-- ---------------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text not null default '' check (char_length(full_name) <= 100),
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- user_roles: one role per user (RBAC)
-- ---------------------------------------------------------------------------
create table public.user_roles (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  role        public.app_role not null default 'user',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index user_roles_role_idx on public.user_roles (role);

create trigger user_roles_set_updated_at
  before update on public.user_roles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- courses: managed by admins
-- ---------------------------------------------------------------------------
create table public.courses (
  id           uuid primary key default gen_random_uuid(),
  title        text not null unique check (char_length(title) between 2 and 120),
  description  text not null default '' check (char_length(description) <= 1000),
  created_by   uuid references public.profiles (id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index courses_created_by_idx on public.courses (created_by);

create trigger courses_set_updated_at
  before update on public.courses
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- materials: uploaded study files (file lives in Storage bucket "materials")
-- ---------------------------------------------------------------------------
create table public.materials (
  id               uuid primary key default gen_random_uuid(),
  course_id        uuid not null references public.courses (id) on delete cascade,
  author_id        uuid not null references public.profiles (id) on delete cascade,
  title            text not null check (char_length(title) between 3 and 150),
  description      text not null default '' check (char_length(description) <= 2000),
  file_path        text not null unique,          -- object path inside the "materials" bucket
  file_name        text not null,                 -- original file name, used for download
  file_type        text not null,                 -- MIME type
  file_size        bigint not null check (file_size > 0),
  downloads_count  integer not null default 0 check (downloads_count >= 0),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index materials_course_id_idx  on public.materials (course_id);
create index materials_author_id_idx  on public.materials (author_id);
create index materials_created_at_idx on public.materials (created_at desc);

create trigger materials_set_updated_at
  before update on public.materials
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- comments: discussion under a material
-- ---------------------------------------------------------------------------
create table public.comments (
  id           uuid primary key default gen_random_uuid(),
  material_id  uuid not null references public.materials (id) on delete cascade,
  author_id    uuid not null references public.profiles (id) on delete cascade,
  content      text not null check (char_length(content) between 1 and 1000),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index comments_material_id_idx on public.comments (material_id, created_at);
create index comments_author_id_idx   on public.comments (author_id);

create trigger comments_set_updated_at
  before update on public.comments
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- ratings: one 1–5 star rating per user per material
-- ---------------------------------------------------------------------------
create table public.ratings (
  material_id  uuid not null references public.materials (id) on delete cascade,
  user_id      uuid not null references public.profiles (id) on delete cascade,
  score        smallint not null check (score between 1 and 5),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  primary key (material_id, user_id)
);

create index ratings_user_id_idx on public.ratings (user_id);

create trigger ratings_set_updated_at
  before update on public.ratings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- material_stats: aggregated rating / comment counts per material
-- security_invoker => respects the caller's RLS on the underlying tables
-- ---------------------------------------------------------------------------
create view public.material_stats
with (security_invoker = true) as
select
  m.id as material_id,
  coalesce(round(avg(r.score)::numeric, 2), 0) as avg_rating,
  count(r.user_id)::int as ratings_count,
  (select count(*)::int from public.comments c where c.material_id = m.id) as comments_count
from public.materials m
left join public.ratings r on r.material_id = m.id
group by m.id;

-- ---------------------------------------------------------------------------
-- New user => create profile + default role
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(left(new.raw_user_meta_data ->> 'full_name', 100), ''));

  insert into public.user_roles (user_id, role)
  values (new.id, 'user');

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
