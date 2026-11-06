# StudyShare

A web app for sharing study materials by course. Students upload lecture notes, solved exercises and slides (PDF / DOCX / PPTX), download others' materials, comment and rate them. Admins manage courses, moderate content and assign roles.

> 🚧 Work in progress — capstone project for the SoftUni course “Software Technologies with AI”.

## Tech stack

- **Frontend:** HTML, CSS, vanilla JavaScript (ES modules), Bootstrap 5, Bootstrap Icons
- **Build:** Node.js, npm, Vite
- **Backend:** Supabase (Postgres DB, Auth, Storage)
- **Hosting:** Netlify

## Architecture (short)

- Single `index.html` shell + client-side router (`src/router.js`, History API) with clean URLs.
- Each page is a separate folder in `src/pages/` (HTML fragment + CSS + JS), loaded on demand.
- All data access goes through services in `src/services/`; authorization is enforced by Supabase RLS.

### Routes

| Route | Page | Access |
|---|---|---|
| `/` | Landing page | everyone |
| `/login`, `/register` | Login / registration | guests |
| `/dashboard` | User dashboard | users |
| `/courses`, `/courses/:id` | Courses and their materials | everyone |
| `/materials/add`, `/materials/:id/edit` | Upload / edit material | users |
| `/materials/:id` | Material details | everyone |
| `/profile` | My profile | users |
| `/admin` | Admin panel | admins |

## Local development

```bash
git clone https://github.com/plam13/studyshare.git
cd studyshare
npm install
cp .env.example .env   # fill in VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY
npm run dev
```

## Sample data (seed)

The seed script creates demo users (through the Supabase Auth Admin API), courses, materials with sample PDF files in Storage, comments and ratings. It is safe to rerun: existing records are skipped and passwords are never reset.

```bash
cp .env.server.example .env.server.local   # server-side only: SUPABASE_URL, SUPABASE_SECRET_KEY, SEED_EXPECTED_PROJECT_REF
npm run seed:dry-run                        # shows what would be created, writes nothing
npm run seed                                # applies the seed
```

> The secret key is used only by Node.js scripts in `scripts/`. It never has a `VITE_` prefix and never reaches the browser.

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@studyshare.bg` | `admin123` |
| User | `demo@studyshare.bg` | `demo123` |
| User | `maria@studyshare.bg`, `peter@studyshare.bg`, `elena@studyshare.bg` | `pass123` |

## Project structure

```
├── index.html             # app shell
├── public/                # static assets (favicon, Netlify _redirects)
├── src/
│   ├── main.js            # entry: global CSS/JS, layout, auth init, router start
│   ├── router.js          # routes, guards, mount/unmount
│   ├── styles.css         # global styles
│   ├── pages/<page>/      # page fragment (.html) + styles (.css) + logic (.js)
│   ├── components/        # header, footer, …
│   ├── services/          # Supabase client, auth and data services
│   └── utils/             # escaping, validation, toasts, guards
├── supabase/migrations/   # DB migrations (SQL)
├── scripts/               # server-side Node.js scripts (seed)
├── .github/copilot-instructions.md   # AI agent instructions
└── vite.config.js
```

Full documentation (DB schema diagram, roles, deployment) will be added as the project grows.
