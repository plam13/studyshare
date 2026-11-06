-- StudyShare: database-side aggregation for the user dashboard.
-- SECURITY INVOKER => runs with the caller's privileges and RLS; scoped to auth.uid().

create or replace function public.get_my_dashboard()
returns json
language sql
stable
security invoker
set search_path = ''
as $$
  with me as (
    select (select auth.uid()) as uid
  ),
  my_materials as (
    select m.id, m.downloads_count
    from public.materials m, me
    where m.author_id = me.uid
  )
  select json_build_object(
    'materials_count',     (select count(*) from my_materials),
    'downloads_total',     (select coalesce(sum(downloads_count), 0) from my_materials),
    'ratings_received',    (select count(*) from public.ratings r where r.material_id in (select id from my_materials)),
    'avg_rating_received', (select coalesce(round(avg(r.score)::numeric, 2), 0)
                              from public.ratings r where r.material_id in (select id from my_materials)),
    'comments_received',   (select count(*) from public.comments c, me
                              where c.material_id in (select id from my_materials) and c.author_id <> me.uid),
    'comments_written',    (select count(*) from public.comments c, me where c.author_id = me.uid),
    'ratings_given',       (select count(*) from public.ratings r, me where r.user_id = me.uid),
    'courses_count',       (select count(*) from public.courses)
  );
$$;

revoke execute on function public.get_my_dashboard() from public, anon;
grant execute on function public.get_my_dashboard() to authenticated;
