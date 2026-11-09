-- StudyShare: reports ("Сигнализирай") — users flag a material (copyright, inappropriate, spam, wrong course);
-- admins review them in the moderation tab.

create table public.reports (
  id           uuid primary key default gen_random_uuid(),
  material_id  uuid not null references public.materials (id) on delete cascade,
  reporter_id  uuid not null references public.profiles (id) on delete cascade,
  reason       text not null check (reason in ('copyright', 'inappropriate', 'spam', 'wrong_course', 'other')),
  details      text not null default '' check (char_length(details) <= 500),
  status       text not null default 'open' check (status in ('open', 'resolved', 'dismissed')),
  created_at   timestamptz not null default now(),
  resolved_at  timestamptz,
  resolved_by  uuid references public.profiles (id) on delete set null,
  unique (material_id, reporter_id) -- one report per user per material
);

create index reports_status_created_idx on public.reports (status, created_at desc);
create index reports_reporter_id_idx    on public.reports (reporter_id);
create index reports_resolved_by_idx    on public.reports (resolved_by);

-- Who closed the report and when is set by the database, not by the client
create or replace function public.set_report_resolution()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'open' then
    new.resolved_at = null;
    new.resolved_by = null;
  elsif new.status is distinct from old.status then
    new.resolved_at = now();
    new.resolved_by = (select auth.uid());
  end if;
  return new;
end;
$$;

create trigger reports_set_resolution
  before update of status on public.reports
  for each row execute function public.set_report_resolution();

-- ---------------------------------------------------------------------------
-- Privileges (least privilege) and RLS
-- ---------------------------------------------------------------------------
revoke all on public.reports from anon, authenticated;
grant select on public.reports to authenticated;
grant insert (material_id, reporter_id, reason, details) on public.reports to authenticated;
grant update (status) on public.reports to authenticated;
grant delete on public.reports to authenticated;

alter table public.reports enable row level security;

create policy "Reporters see their own reports, admins see all"
  on public.reports for select
  to authenticated
  using (reporter_id = (select auth.uid()) or (select public.is_admin()));

create policy "Users report other users' materials as themselves"
  on public.reports for insert
  to authenticated
  with check (
    reporter_id = (select auth.uid())
    and not exists (
      select 1 from public.materials m
      where m.id = material_id and m.author_id = (select auth.uid())
    )
  );

create policy "Admins review reports"
  on public.reports for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admins delete reports"
  on public.reports for delete
  to authenticated
  using ((select public.is_admin()));
