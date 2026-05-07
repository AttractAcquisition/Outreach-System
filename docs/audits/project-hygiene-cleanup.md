# Project Hygiene Cleanup

Audit date: 2026-05-05  
Repo: `aa-outreach-auto`

## Files Searched

Searched all repository files except `.git` and `node_modules`.

Search terms:

- Known previous incorrect Supabase project ref
- `fgyvcyksgbivhrqoxkmj`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `WHATSAPP_ACCESS_TOKEN`
- `META_ACCESS_TOKEN`
- `ANTHROPIC_API_KEY`
- `OPENAI_API_KEY`
- `APIFY_TOKEN`

Primary searched areas:

- Root config/docs: `README.md`, `.gitignore`, `.env.local`, package/config files
- Supabase local metadata: `supabase/.temp/*`
- Supabase migrations: `supabase/migrations/*`
- Application source: `src/**/*`
- Existing docs: `docs/**/*`
- Build output: `dist/**/*`

## Old Refs Found

The previous incorrect Supabase project ref was found in docs only:

| File | Lines | Action |
| --- | --- | --- |
| `docs/audits/whatsapp-live-integration-progress.md` | 123, 131 | Replaced with `fgyvcyksgbivhrqoxkmj` |
| `docs/audits/aa-project-ref-check.md` | Existing audit references | Reworded to avoid preserving stale ref text |
| `docs/audits/aa-shared-supabase-whatsapp-backend-audit.md` | Existing audit reference | Reworded to reflect cleanup completion |

No migrations or application source files contained the previous incorrect project ref.

## Replacements Made

- Updated the remote Supabase type generation command in `docs/audits/whatsapp-live-integration-progress.md`.
- Reworded existing audit docs so they no longer carry stale project ref text.
- Added `.env.example` with placeholders only.
- Replaced starter `README.md` with project setup, Supabase project, type generation, secret handling, workflow, and build documentation.
- Updated `.gitignore` to explicitly exclude `.env`, `.env.local`, and `.env.*.local`.

## Env Files Found

| File | Status |
| --- | --- |
| `.env.local` | Exists locally and was not edited |
| `.env.example` | Added with placeholders only |

## Secret Exposure Risks

- `.env.local` contains a real Supabase anon key. This is browser-safe in principle, but it must remain uncommitted.
- `dist/assets/index-DVuN4Q95.js` contains the current Vite build output with the Supabase URL and anon key embedded. This is expected for frontend builds using anon keys, but `dist` should remain ignored and should never contain service role or provider secrets.
- No configured values were found for `SUPABASE_SERVICE_ROLE_KEY`, `WHATSAPP_ACCESS_TOKEN`, `META_ACCESS_TOKEN`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, or `APIFY_TOKEN`. These names now appear only in documentation as searched terms and forbidden frontend secrets.
- No service role key or provider secret was added.

## Files Changed

- `.env.example`
- `.gitignore`
- `README.md`
- `docs/audits/whatsapp-live-integration-progress.md`
- `docs/audits/aa-project-ref-check.md`
- `docs/audits/aa-shared-supabase-whatsapp-backend-audit.md`
- `docs/audits/project-hygiene-cleanup.md`
