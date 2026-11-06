-- Promote the demo admin account to the "admin" role.
-- The account itself is created via regular sign-up (admin@studyshare.bg);
-- if it does not exist yet, this statement simply updates 0 rows.
update public.user_roles
set role = 'admin'
where user_id = (
  select id from auth.users where email = 'admin@studyshare.bg'
);
