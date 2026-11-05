# StudyShare

A multi-page web app for sharing study materials by course. Students upload lecture notes, solved exercises and slides (PDF / DOCX / PPTX), download others' materials, comment and rate them. Admins manage courses, moderate content and assign roles.

> 🚧 Work in progress — capstone project for the SoftUni course “Software Technologies with AI”.

## Tech stack

- **Frontend:** HTML, CSS, JavaScript (ES modules), Bootstrap 5, Bootstrap Icons
- **Build:** Node.js, npm, Vite (multi-page)
- **Backend:** Supabase (Postgres DB, Auth, Storage)
- **Hosting:** Netlify

## Local development

```bash
git clone https://github.com/plam13/studyshare.git
cd studyshare
npm install
cp .env.example .env   # then fill in your Supabase URL and anon/publishable key
npm run dev
```

## Project structure

```
├── *.html                 # one file per page (index, login, register, courses, …)
├── public/                # static assets (favicon)
├── src/
│   ├── app.js             # shared page init (Bootstrap, CSS, header/footer)
│   ├── pages/             # page scripts — one per HTML page
│   ├── components/        # reusable UI renderers (header, footer, …)
│   ├── services/          # Supabase client and data-access services
│   ├── utils/             # generic helpers
│   └── styles/            # global CSS
├── supabase/migrations/   # DB migrations (SQL)
├── .github/copilot-instructions.md   # AI agent instructions
└── vite.config.js         # multi-page build config
```

Full documentation (architecture, DB schema, roles) will be added as the project grows.
