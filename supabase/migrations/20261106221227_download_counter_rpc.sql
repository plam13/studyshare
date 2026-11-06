-- StudyShare: download counter
--
-- Clients cannot update materials.downloads_count directly (no column grant).
-- This function increments it by exactly one for an existing material and is
-- callable only by logged-in users (the same users who may download files).

-- A download must not look like an edit: bump updated_at only when content columns change.
drop trigger if exists materials_set_updated_at on public.materials;
create trigger materials_set_updated_at
  before update of course_id, title, description, file_path, file_name, file_type, file_size
  on public.materials
  for each row execute function public.set_updated_at();

create or replace function public.increment_material_downloads(p_material_id uuid)
returns integer
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  new_count integer;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  update public.materials
     set downloads_count = downloads_count + 1
   where id = p_material_id
  returning downloads_count into new_count;

  return new_count; -- null when the material does not exist
end;
$$;

revoke execute on function public.increment_material_downloads(uuid) from public, anon;
grant execute on function public.increment_material_downloads(uuid) to authenticated;
