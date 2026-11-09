-- StudyShare demo data: make account and course dates consistent with the backdated demo materials.
-- Data only (not a schema change), so it is not a migration. Run after `npm run seed`:
--
--   npx supabase db query --remote -f scripts/sql/backdate-demo-accounts.sql
--
-- Order of events it produces: admin registers → admin creates the courses → students register
-- (2–6 days before their first material, comment or rating). Touches only the seed accounts and courses.
-- updated_at triggers are paused so nothing looks "edited"; the transaction keeps it all-or-nothing.

begin;

alter table public.profiles   disable trigger profiles_set_updated_at;
alter table public.user_roles disable trigger user_roles_set_updated_at;
alter table public.courses    disable trigger courses_set_updated_at;

create temporary table demo_dates (user_id uuid primary key, email text, registered_at timestamptz) on commit drop;

-- Students: 2–6 days before their first activity
insert into demo_dates (user_id, email, registered_at)
select u.id, u.email,
       least(
         (select min(created_at) from public.materials where author_id = u.id),
         (select min(created_at) from public.comments  where author_id = u.id),
         (select min(created_at) from public.ratings   where user_id   = u.id)
       ) - interval '2 days' - (abs(hashtext(u.email)) % 96) * interval '1 hour'
from auth.users u
where u.email in ('demo@studyshare.bg', 'maria@studyshare.bg', 'peter@studyshare.bg', 'elena@studyshare.bg');

-- Courses: a few hours apart, the day before the first student registers
update public.courses c
set created_at = d.first_student - interval '1 day' - (abs(hashtext(c.title)) % 12) * interval '1 hour',
    updated_at = d.first_student - interval '1 day' - (abs(hashtext(c.title)) % 12) * interval '1 hour'
from (select min(registered_at) as first_student from demo_dates) d
where c.title in ('Programming Basics', 'Programming Fundamentals', 'JS Advanced',
                  'Databases Basics', 'Web Design', 'Software Technologies with AI');

-- Admin: one day before the first course
insert into demo_dates (user_id, email, registered_at)
select u.id, u.email, (select min(created_at) from public.courses
                       where title in ('Programming Basics', 'Programming Fundamentals', 'JS Advanced',
                                       'Databases Basics', 'Web Design', 'Software Technologies with AI')) - interval '1 day'
from auth.users u
where u.email = 'admin@studyshare.bg';

update auth.users u        set created_at = d.registered_at from demo_dates d where u.id = d.user_id;
update public.profiles p   set created_at = d.registered_at, updated_at = d.registered_at from demo_dates d where p.id = d.user_id;
update public.user_roles r set created_at = d.registered_at, updated_at = d.registered_at from demo_dates d where r.user_id = d.user_id;

alter table public.profiles   enable trigger profiles_set_updated_at;
alter table public.user_roles enable trigger user_roles_set_updated_at;
alter table public.courses    enable trigger courses_set_updated_at;

select email, to_char(registered_at at time zone 'Europe/Sofia', 'YYYY-MM-DD HH24:MI') as registered
from demo_dates order by registered_at;

commit;
