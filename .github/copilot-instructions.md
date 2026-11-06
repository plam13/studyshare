# StudyShare — Agent Instructions

These instructions give AI dev agents (GitHub Copilot, Claude Code, etc.) the context and rules for working on this project.

## Project

**StudyShare** is a web app where students share study materials (PDF, DOCX, PPTX) organized by courses.

- **Guests** browse courses and material lists.
- **Users** (registered) upload materials, download files, comment, rate (1–5 stars), edit/delete **only their own** content, manage a profile with avatar, see a personal dashboard.
- **Admins** additionally manage courses, moderate (delete any material/comment) and assign roles.

UI language is **Bulgarian**. Code, identifiers, comments, commit messages and docs are in **English**.

## Tech stack (fixed — do not change)

- **Frontend:** vanilla JavaScript (ES modules), HTML, CSS, **Bootstrap 5**, **Bootstrap Icons**.
  - **No** TypeScript, **no** React/Vue/Angular/Svelte, no jQuery.
- **Build:** Node.js, npm, **Vite**.
- **Backend:** **Supabase** — Postgres DB, Auth (JWT), Storage, optional Edge Functions.
  - The browser talks to Supabase only via `@supabase/supabase-js` (REST API).
- **Deploy:** Netlify (`public/_redirects` serves `index.html` for all routes).

## Architecture

- **One `index.html` shell** with `#app-header`, `<main id="app">` and `#app-footer`. Entry point: `src/main.js`.
- **One client-side router** (`src/router.js`) using the History API (`pushState` / `popstate`):
  - Working Back/Forward, correct page on direct URL load, active nav link, page title, 404 page.
  - Internal `<a href="/...">` links are intercepted; modified clicks, `target`, `download`, `data-external` and external links stay native.
  - Focus moves to the page `<h1>` after navigation.
  - Route access rules (`any` / `guest` / `user` / `admin`) are UX only — **RLS is the authorization boundary**.
- **Pages** live in `src/pages/<page>/` as separate files: `<page>.html` (fragment), `<page>.css` (optional), `<page>.js`.
  - HTML fragments **must not** include `html`, `head` or `body`; import them with Vite `?raw`.
  - A page module exports `mount(container, ctx)`; it may return a cleanup function (called on unmount).
    `ctx = { params, query, user, route, signal, navigate, setTitle }`. Use `ctx.signal` to cancel/ignore stale requests.
  - Remove page-level listeners/subscriptions in the cleanup function (listeners on `container` children are dropped automatically).
- **Shared components** in `src/components/<name>/` (header, footer, cards, rating stars…), each with its own JS/HTML/CSS.

### Canonical routes

| Route | Page | Access |
|---|---|---|
| `/` | Landing page | any |
| `/login` | Login | guest |
| `/register` | Register | guest |
| `/dashboard` | User dashboard (after login) | user |
| `/courses` | Course list | any |
| `/courses/:id` | Materials in a course | any |
| `/materials/add` | Upload material | user |
| `/materials/:id` | Material details, download, comments, rating | any |
| `/materials/:id/edit` | Edit material | user (author/admin) |
| `/profile` | My profile | user |
| `/admin` | Admin panel | admin |
| `*` | Not Found | any |

After login go to the safe `?redirect=` target or `/dashboard`; after logout go to `/`. Never allow open redirects.

### Folder responsibilities

| Folder | Purpose |
|---|---|
| `src/main.js` | Global CSS/JS, layout, auth init, router start |
| `src/router.js` | Route table, matching, guards, mount/unmount |
| `src/pages/` | One folder per page: fragment + CSS + JS. No direct DB queries — call services. |
| `src/components/` | Reusable UI components |
| `src/services/` | All Supabase access: `supabase.js` (single client), `auth.js` (auth + current-user state), `courses.js`, `materials.js`, `storage.js`, `admin.js`… |
| `src/utils/` | Small helpers: DOM/escaping, validation, toasts, guards, formatting |
| `src/styles.css` | Global styles on top of Bootstrap; custom classes use the `ss-` prefix |
| `supabase/migrations/` | SQL migrations — the only way to change the DB schema |
| `scripts/` | Node.js maintenance scripts (seed, admin bootstrap) — server-side only |
| `public/` | Static assets copied as-is (favicon, `_redirects`) |

### Rules

- Keep files small and focused; avoid monolith scripts.
- Services return data or throw an `Error` with a user-friendly Bulgarian message; pages catch and display it.
- Always escape user content inserted via `innerHTML` with `escapeHtml()`, or use `textContent`.
- Use `async/await`, named exports, `const`/`let`, no globals.
- Responsive design is required (Bootstrap grid, test at mobile width). Use semantic HTML, visible focus, `prefers-reduced-motion`.
- Use Bootstrap Icons and visual feedback (spinners, disabled buttons while saving, empty states).
- **Toasts** (`src/utils/toast.js`: `showSuccess`, `showError`, `showInfo`): show for errors and significant mutations
  (created, saved, deleted, uploaded). Do **not** show obvious ones ("login successful", "data loaded").
  Keep field validation errors next to the input.

## Database & security

- Tables: `profiles`, `user_roles`, `courses`, `materials`, `comments`, `ratings` + view `material_stats` (see README).
- **Every schema change is a migration** in `supabase/migrations/`:
  `npx supabase migration new <name>` → write SQL → `npx supabase db push --remote --dry-run` → `npx supabase db push --remote`.
  Never change the schema only in the dashboard.
- **RLS is enabled on every table.** Roles are in `user_roles` (`user` | `admin`); policies use `public.is_admin()`.
  Never accept roles from signup metadata. No public "become admin" operation.
- Least-privilege grants: clients may only update allowed columns (e.g. not `author_id`, `downloads_count`).
- Storage: `avatars` (public) and `materials` (private, downloaded by logged-in users through the authenticated
  `storage.download()` API and saved under the original file name), protected by storage policies.
  Uploads are re-wrapped with the MIME type derived from the extension (supabase-js ignores `contentType` for Blobs).
  Delete Storage objects explicitly — DB cascades do not remove files.

## Secrets

- `.env` holds only public values: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`. `.env.example` is the template.
- Never commit `.env`, `.secrets/`, the DB password, the service-role key or access tokens.
- Privileged keys (service role) are used only in `scripts/` or Edge Functions, never with a `VITE_` prefix, never printed in logs.

## Workflow

- AI dev loop: prompt → implement → run & test (`npm run dev`, `npm run build`) → refine → commit & push.
- Small, working commits with Conventional Commit messages (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `style:`).
- Update `README.md` when adding routes, tables or setup steps.
