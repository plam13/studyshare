# StudyShare — Agent Instructions

These instructions give AI dev agents (GitHub Copilot, Claude Code, etc.) the context and rules for working on this project.

## App context

**StudyShare** is a multi-page web app where students share study materials (PDF, DOCX, PPTX) organized by courses.

- **Guests** browse courses and material lists.
- **Users** (registered) upload materials, download files, comment, rate (1–5 stars), edit/delete **only their own** content, manage a profile with avatar.
- **Admins** additionally manage courses, moderate (delete any material/comment) and assign roles.

UI language is **Bulgarian**. Code, identifiers, comments, commit messages and docs are in **English**.

## Tech stack (fixed — do not change)

- **Frontend:** plain HTML, CSS, JavaScript (ES modules) + **Bootstrap 5** + **Bootstrap Icons**.
  - **No** TypeScript, **no** React/Vue/Angular/Svelte, no jQuery.
- **Build:** Node.js, npm, **Vite** (multi-page mode).
- **Backend:** **Supabase** — Postgres DB, Auth (JWT), Storage. Optional Edge Functions.
  - Frontend talks to Supabase only via `@supabase/supabase-js` (REST API).
- **Deploy:** Netlify.

## Architecture

- **Multi-page navigation:** every screen is its own `*.html` file in the project root. No SPA router, no screens built as popups.
  - Each new page must be registered in the `pages` list in `vite.config.js`.
  - Pass parameters via the query string, e.g. `material.html?id=<uuid>`.
- **Each HTML page** contains `<div id="app-header">`, `<main>`, `<div id="app-footer">` and loads exactly one module: `/src/pages/<page>.js`.
- **Each page script** starts with `initPage({ activePage: '<page>' })` from `src/app.js` (loads Bootstrap, global CSS, renders header/footer).

### Folder responsibilities

| Folder | Purpose |
|---|---|
| `src/pages/` | One JS file per HTML page: wires DOM events, calls services, renders results. No direct DB queries here. |
| `src/components/` | Reusable UI renderers (header, footer, cards, rating stars…). Pure functions that return/insert HTML. |
| `src/services/` | All Supabase access: `supabase.js` (single client), `auth.js`, `courses.js`, `materials.js`, `storage.js`, `admin.js`… |
| `src/utils/` | Small generic helpers (DOM, formatting, validation, toasts, guards). |
| `src/styles/` | Global CSS on top of Bootstrap (`main.css`). Prefer Bootstrap utility classes; add custom CSS with the `ss-` prefix. |
| `supabase/migrations/` | SQL migrations — the only way to change the DB schema. |
| `public/` | Static assets copied as-is (favicon, images). |

### Rules

- Keep files small and focused; avoid monolith scripts. Split logic into services/components when a page script grows.
- Services return data or throw an `Error` with a user-friendly message; pages catch errors and show them to the user.
- Always escape user content inserted via `innerHTML` with `escapeHtml()` from `src/utils/dom.js`.
- Use `async/await`, named exports, `const`/`let`, no globals.
- Responsive design is required: use the Bootstrap grid, test at mobile width.
- Use Bootstrap Icons (`<i class="bi bi-...">`) and visual feedback (spinners, toasts, disabled buttons while loading).

## Database & security

- Tables: `profiles`, `user_roles`, `courses`, `materials`, `comments`, `ratings` (see README for the schema).
- **Every schema change goes through a Supabase migration** in `supabase/migrations/` (`npx supabase migration new <name>`), then `npx supabase db push`. Never edit the schema only in the dashboard.
- **RLS is enabled on every table.** Access control lives in RLS policies, not in the frontend. Frontend checks are only for UX.
- Roles are stored in `user_roles` (`user` | `admin`); policies use the SQL helper `public.is_admin()`.
- Storage buckets: `avatars` (public) and `materials` (private, downloaded via signed URLs). Bucket access is also enforced with storage policies.

## Secrets

- `.env` holds `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (publishable key — safe for the browser). It is git-ignored; `.env.example` is the template.
- Never commit `.env`, `.secrets/`, the DB password, the service-role key or access tokens. Never use the service-role key in frontend code.

## Workflow

- AI dev loop: prompt → implement → run & test (`npm run dev`, `npm run build`) → refine → commit & push.
- Make small, working commits with Conventional Commit messages (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `style:`).
- Update `README.md` when adding pages, tables or setup steps.
