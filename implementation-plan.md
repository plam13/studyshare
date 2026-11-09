# StudyShare — Implementation Plan

The plan for building StudyShare with AI-assisted development, split into small stages, with the status of each stage.

> **About this document.** The plan was originally kept in the AI agent sessions and in the Agent Instructions
> ([AGENTS.md](AGENTS.md)). This file was written on 2026-11-09 to collect it in one place: the completed stages
> below are reconstructed from the Git commit history (dates are local time), and the remaining stages are the
> current plan.

## Goal and constraints

- A multi-page web app where students share study materials by course: upload, download, comment, rate, share.
- Fixed stack: vanilla JS (ES modules), HTML, CSS, Bootstrap 5, Vite, Supabase (DB, Auth, Storage), Netlify.
- Assignment requirements: ≥ 5 screens, ≥ 4 DB tables with RLS, users and roles with an admin panel,
  file upload/download, live deployment, documentation, ≥ 15 commits on ≥ 3 different days.
- Deadline: 2026-11-10, 16:00.

## Method — the AI dev loop

For every stage: **prompt** the AI agent with a small, clear task → **implement** → **run and test**
(`npm run dev`, `npm run build`, RLS checks with real demo logins) → **refine** → **commit and push**
(one Conventional Commit per working step). Database changes always go through Supabase migrations.

## Stages

### Stage 1 — Project setup and architecture · 06.11 · ✅ done

- Vite project with Bootstrap, Bootstrap Icons and `supabase-js`; shared layout (header, footer, global styles).
- Page skeletons for all screens; one shared Supabase client configured from `.env`.
- Agent Instructions, `CLAUDE.md` and the first README.
- Switched to the course workshop architecture: one app shell, a History API router with clean URLs,
  one folder per page (HTML fragment + CSS + JS).

### Stage 2 — Database, security and auth · 06.11 · ✅ done

- Schema: `profiles`, `user_roles`, `courses`, `materials`, `comments`, `ratings` + view `material_stats`.
- RLS on every table, `is_admin()` helper, least-privilege column grants.
- Auth service, register and login with validation, route guards (UX only — RLS is the boundary).
- Demo admin role assigned through a migration (no public "become admin" operation).

### Stage 3 — Storage, read pages and demo data · 06.11 · ✅ done

- Storage buckets: `materials` (private) and `avatars` (public) with storage policies.
- Dashboard statistics RPC with database-side aggregation.
- Idempotent seed script with dry-run (users through the Auth Admin API).
- Course list with search, course page with sorting, material details, dashboard, landing page.

### Stage 4 — Create, edit and delete · 07.11 · ✅ done

- Download counter RPC; authors cannot rate their own materials.
- Upload and edit form with file validation; comments CRUD; star rating; delete with confirmation.
- Profile with avatar upload and name editing.
- Fixes: Cyrillic download names, MIME types on upload, live re-validation of form fields.

### Stage 5 — Deployment · 07.11 · ✅ done

- Netlify configuration, SPA redirects, environment variables, Supabase Auth URLs; live at
  https://studyshare-learn.netlify.app.

### Stage 6 — Design refresh · 07.11 · ✅ done

- Neo-brutalist theme on top of Bootstrap (design tokens, Bootstrap theme, shared `ss-` blocks),
  SVG illustrations, window-style cards, applied to every page; responsive checks at mobile width.

### Stage 7 — Admin panel · 08.11 · ✅ done

- Admin-only RPCs (user list with emails, site statistics) that check `is_admin()` in the database.
- Admin panel: users and roles (never your own role), courses CRUD, moderation of materials and comments.
- Generated SVG banner on the material page; README: admin panel, migration workflow.

### Stage 8 — Documentation and demo data · 09.11 · ✅ done

- README: ER diagram of the database, design notes, migration workflow.
- Demo data: 30 materials with generated PDF, DOCX, PPTX, XLSX, TXT and ZIP files of realistic sizes,
  comment discussions, ratings and dates spread over a semester.
- Change of plan: real SoftUni slides were tried as demo files and **removed** — they are marked
  "© SoftUni — Copyrighted document", and attribution alone does not grant the right to redistribute them.

### Stage 9 — Sharing · 09.11 · ✅ done

- "Сподели" menu: native share sheet, copy link (Discord), QR code with PNG download, social networks.
- Link previews: static Open Graph tags + a Netlify Edge Function that adds the material/course title and
  description for social crawlers only.
- Small accents: one-time nudge of the share icon, highlight after a download or a 4–5 star rating.
- Netlify free plan: production deploys only for commits marked `[deploy]`; checks on free draft deploys.

### Stage 10 — Trust and usability · 09.11 · ✅ done (released together with Stage 11)

- Copyright confirmation on upload/edit.
- "Сигнализирай" reports: new `reports` table with RLS, column grants and a resolution trigger;
  admin review in the moderation tab. RLS verified with real demo logins (11/11 checks).
- In-browser PDF preview with pdf.js (lazy-loaded; not counted as a download).
- Documentation: Agent Instructions moved to `AGENTS.md`, "Who can do what" table, multi-page notes.
- Landing page: "Как работи?" redesigned as a 4-step process (a row with arrows on desktop, 2 × 2 on tablet,
  a list on phones) — the old full-width list left most of a wide screen empty. Each step is a link whose
  target depends on login (e.g. "Качи и сподели" → login and back for guests), with 🔒 badges for guests.

### Stage 11 — Final features and release · 10.11 · ✅ done

- [x] "Запази" / favorites: `favorites` table (migration + private RLS), save button on the material page,
  "Запазени материали" in the dashboard.
- [x] Global search across all courses (`/search?q=`, link in the header) with `pg_trgm` GIN indexes
  (works for Bulgarian, partial words; every word must match).
  Not done (optional): pointing the home page step 03 to search results — it keeps opening the most downloaded material.
- [x] Admin panel: count of open reports on the "Модерация" tab and a notice above the tabs.
- [x] README: how to run the project with your own Supabase backend.
- [x] Polish: two-sentence demo descriptions (updated in place by a data script), tighter word spacing in the
  monospace headings, hero title alignment.
- [x] Final check: responsive screens, demo accounts, README; RLS for favorites verified with real demo logins (10/10).
- [x] One production deploy (`[deploy]`) before 16:00 — released on 10.11 together with Stage 10.

## After the exam (backlog)

- Video lectures as link materials (YouTube / Drive / Teams recordings) — needs a schema change
  (`external_url`, optional file), so it is not done before the deadline.
- PDF cover thumbnails, tags, notifications about new comments on my materials.
