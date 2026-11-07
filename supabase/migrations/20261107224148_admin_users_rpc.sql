-- StudyShare: admin-only read functions for the admin panel.
--
-- Emails live in auth.users, which clients cannot read. These SECURITY DEFINER functions
-- check the caller's admin role in the database first (never a role sent by the browser)
-- and return only the fields the admin panel needs (no tokens, hashes or raw metadata).
-- Role changes themselves still go through public.user_roles + its RLS policies.

-- ---------------------------------------------------------------------------
-- Users with role and activity counters
-- ---------------------------------------------------------------------------
create or replace function public.admin_list_users()
returns table (
  id               uuid,
  email            text,
  full_name        text,
  avatar_url       text,
  role             public.app_role,
  created_at       timestamptz,
  last_sign_in_at  timestamptz,
  materials_count  integer,
  comments_count   integer
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Only admins can list users' using errcode = '42501';
  end if;

  return query
  select
    u.id,
    u.email::text,
    coalesce(p.full_name, ''),
    p.avatar_url,
    coalesce(r.role, 'user'::public.app_role),
    u.created_at,
    u.last_sign_in_at,
    (select count(*)::int from public.materials m where m.author_id = u.id),
    (select count(*)::int from public.comments c where c.author_id = u.id)
  from auth.users u
  left join public.profiles p on p.id = u.id
  left join public.user_roles r on r.user_id = u.id
  order by u.created_at;
end;
$$;

revoke execute on function public.admin_list_users() from public, anon;
grant execute on function public.admin_list_users() to authenticated;

-- ---------------------------------------------------------------------------
-- Site-wide totals for the admin overview
-- ---------------------------------------------------------------------------
create or replace function public.admin_get_stats()
returns json
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Only admins can read site statistics' using errcode = '42501';
  end if;

  return json_build_object(
    'users_count',     (select count(*) from auth.users),
    'admins_count',    (select count(*) from public.user_roles where role = 'admin'),
    'courses_count',   (select count(*) from public.courses),
    'materials_count', (select count(*) from public.materials),
    'comments_count',  (select count(*) from public.comments),
    'downloads_total', (select coalesce(sum(downloads_count), 0) from public.materials)
  );
end;
$$;

revoke execute on function public.admin_get_stats() from public, anon;
grant execute on function public.admin_get_stats() to authenticated;
