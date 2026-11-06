-- StudyShare: authors cannot rate their own materials
-- (the UI hides the rating control for authors; RLS is the real boundary)

drop policy if exists "Users can rate as themselves" on public.ratings;

create policy "Users can rate other users' materials as themselves"
  on public.ratings for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and not exists (
      select 1
      from public.materials m
      where m.id = material_id
        and m.author_id = (select auth.uid())
    )
  );
