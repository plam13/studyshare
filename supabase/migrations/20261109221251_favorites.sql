-- StudyShare: favorites ("Запази") — users bookmark materials and find them in their dashboard.
-- A user's saved list is private: nobody else (not even admins) reads it through the API.

create table public.favorites (
  user_id      uuid not null references public.profiles (id) on delete cascade,
  material_id  uuid not null references public.materials (id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (user_id, material_id) -- saving the same material twice is impossible
);

-- The primary key covers lookups by user; this one serves the cascade from materials
create index favorites_material_id_idx on public.favorites (material_id);

-- ---------------------------------------------------------------------------
-- Privileges (least privilege) and RLS
-- ---------------------------------------------------------------------------
revoke all on public.favorites from anon, authenticated;
grant select on public.favorites to authenticated;
grant insert (user_id, material_id) on public.favorites to authenticated;
grant delete on public.favorites to authenticated;
-- no update: a favorite is only added or removed

alter table public.favorites enable row level security;

create policy "Users see their own favorites"
  on public.favorites for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "Users save materials for themselves"
  on public.favorites for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "Users remove their own favorites"
  on public.favorites for delete
  to authenticated
  using (user_id = (select auth.uid()));
