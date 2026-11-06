-- StudyShare: Storage buckets + access policies
--
-- materials (private): study files; downloaded via short-lived signed URLs by logged-in users.
--   Object path: <author_uid>/<uuid>-<safe-file-name>
-- avatars (public): profile pictures. Object path: <user_uid>/<file-name>

-- ---------------------------------------------------------------------------
-- Buckets (with size and MIME type limits)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'materials', 'materials', false, 20971520, -- 20 MB
    array[
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'application/zip'
    ]
  ),
  (
    'avatars', 'avatars', true, 2097152, -- 2 MB
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  )
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- ---------------------------------------------------------------------------
-- materials bucket policies
-- ---------------------------------------------------------------------------
create policy "Logged-in users can read material files"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'materials');

create policy "Users upload material files into their own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'materials'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Owners and admins can delete material files"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'materials'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or (select public.is_admin())
    )
  );

-- ---------------------------------------------------------------------------
-- avatars bucket policies
-- ---------------------------------------------------------------------------
create policy "Avatars are readable by everyone"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'avatars');

create policy "Users upload their own avatar"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users replace their own avatar"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users delete their own avatar"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
