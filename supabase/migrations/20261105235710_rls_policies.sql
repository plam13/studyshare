-- StudyShare: Row-Level Security, role helper and table privileges

-- ---------------------------------------------------------------------------
-- Role helper (security definer => can read user_roles without RLS recursion)
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = (select auth.uid())
      and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Table privileges (least privilege; RLS further restricts rows)
-- ---------------------------------------------------------------------------
revoke all on public.profiles, public.user_roles, public.courses,
              public.materials, public.comments, public.ratings
  from anon, authenticated;

grant select on public.profiles, public.courses, public.materials,
                public.comments, public.ratings, public.material_stats
  to anon, authenticated;

-- profiles: users may only edit their name and avatar
grant update (full_name, avatar_url) on public.profiles to authenticated;

-- user_roles: users read their own role; admins change roles
grant select on public.user_roles to authenticated;
grant update (role) on public.user_roles to authenticated;

-- courses: admins only (enforced by RLS)
grant insert, update, delete on public.courses to authenticated;

-- materials: downloads_count is not editable by clients
grant insert (course_id, author_id, title, description, file_path, file_name, file_type, file_size)
  on public.materials to authenticated;
grant update (course_id, title, description, file_path, file_name, file_type, file_size)
  on public.materials to authenticated;
grant delete on public.materials to authenticated;

-- comments
grant insert (material_id, author_id, content) on public.comments to authenticated;
grant update (content) on public.comments to authenticated;
grant delete on public.comments to authenticated;

-- ratings
grant insert (material_id, user_id, score) on public.ratings to authenticated;
grant update (score) on public.ratings to authenticated;
grant delete on public.ratings to authenticated;

-- ---------------------------------------------------------------------------
-- Enable RLS
-- ---------------------------------------------------------------------------
alter table public.profiles   enable row level security;
alter table public.user_roles enable row level security;
alter table public.courses    enable row level security;
alter table public.materials  enable row level security;
alter table public.comments   enable row level security;
alter table public.ratings    enable row level security;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  to anon, authenticated
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- user_roles
-- ---------------------------------------------------------------------------
create policy "Users see their own role, admins see all"
  on public.user_roles for select
  to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

-- Admins can change other users' roles (not their own => no self-lockout)
create policy "Admins can change other users' roles"
  on public.user_roles for update
  to authenticated
  using ((select public.is_admin()) and user_id <> (select auth.uid()))
  with check ((select public.is_admin()) and user_id <> (select auth.uid()));

-- ---------------------------------------------------------------------------
-- courses
-- ---------------------------------------------------------------------------
create policy "Courses are viewable by everyone"
  on public.courses for select
  to anon, authenticated
  using (true);

create policy "Admins can create courses"
  on public.courses for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "Admins can update courses"
  on public.courses for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admins can delete courses"
  on public.courses for delete
  to authenticated
  using ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- materials
-- ---------------------------------------------------------------------------
create policy "Materials are viewable by everyone"
  on public.materials for select
  to anon, authenticated
  using (true);

create policy "Users can upload materials as themselves"
  on public.materials for insert
  to authenticated
  with check (author_id = (select auth.uid()));

create policy "Authors and admins can update materials"
  on public.materials for update
  to authenticated
  using (author_id = (select auth.uid()) or (select public.is_admin()))
  with check (author_id = (select auth.uid()) or (select public.is_admin()));

create policy "Authors and admins can delete materials"
  on public.materials for delete
  to authenticated
  using (author_id = (select auth.uid()) or (select public.is_admin()));

-- ---------------------------------------------------------------------------
-- comments
-- ---------------------------------------------------------------------------
create policy "Comments are viewable by everyone"
  on public.comments for select
  to anon, authenticated
  using (true);

create policy "Users can comment as themselves"
  on public.comments for insert
  to authenticated
  with check (author_id = (select auth.uid()));

create policy "Authors can edit their comments"
  on public.comments for update
  to authenticated
  using (author_id = (select auth.uid()))
  with check (author_id = (select auth.uid()));

create policy "Authors and admins can delete comments"
  on public.comments for delete
  to authenticated
  using (author_id = (select auth.uid()) or (select public.is_admin()));

-- ---------------------------------------------------------------------------
-- ratings
-- ---------------------------------------------------------------------------
create policy "Ratings are viewable by everyone"
  on public.ratings for select
  to anon, authenticated
  using (true);

create policy "Users can rate as themselves"
  on public.ratings for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "Users can change their own rating"
  on public.ratings for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Users and admins can delete ratings"
  on public.ratings for delete
  to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));
