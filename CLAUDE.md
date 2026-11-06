# CLAUDE.md

The single source of truth for project context, architecture and rules is
[.github/copilot-instructions.md](.github/copilot-instructions.md) — read and follow it.

@.github/copilot-instructions.md

## Commands

- `npm run dev` — start Vite dev server
- `npm run build` — production build into `dist/`
- `npm run preview` — preview the production build

## Notes for Claude Code

- Shell is Windows PowerShell 5.1.
- The project spec (assignment) is in `docs/` (not committed). `docs/Implementation-Workshop-Taskboard.docx`
  is the instructors' reference solution — follow its conventions (routing, toasts, seed/admin scripts, storage).
- Remote DB commands need `--remote` (Supabase CLI v3), e.g. `npx supabase db push --remote --dry-run`.
- Secrets live in `.secrets/` (git-ignored) — never print or commit them.
