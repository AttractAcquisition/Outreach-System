# AA Project Ref Check

Audit date: 2026-05-05  
Repo: `aa-outreach-auto`

## Correct Supabase Project

| Item | Correct value |
| --- | --- |
| Project ref | `fgyvcyksgbivhrqoxkmj` |
| Project URL | `https://fgyvcyksgbivhrqoxkmj.supabase.co` |
| Previous incorrect ref | Cleaned from docs during project hygiene cleanup |

## Confirmed Correct References

| File | Finding |
| --- | --- |
| `supabase/.temp/project-ref` | Contains `fgyvcyksgbivhrqoxkmj` |
| `supabase/.temp/linked-project.json` | Linked project ref is `fgyvcyksgbivhrqoxkmj` |
| `supabase/.temp/pooler-url` | Pooler host references `postgres.fgyvcyksgbivhrqoxkmj` |
| `.env.local` | `VITE_SUPABASE_URL` points to `https://fgyvcyksgbivhrqoxkmj.supabase.co`; anon key also belongs to this ref. The key value is intentionally not repeated here. |
| `dist/assets/index-DVuN4Q95.js` | Current build output embeds the correct Supabase URL and anon key because this is a Vite frontend bundle. This is expected for anon keys only; service role keys must never appear here. |

## Incorrect References Found

| File | Lines | Current value | Recommended replacement |
| --- | --- | --- | --- |
| `docs/audits/whatsapp-live-integration-progress.md` | 123, 131 | Previous incorrect project ref | `fgyvcyksgbivhrqoxkmj` |

## Missing/Incomplete Config Documentation

| File | Finding | Recommendation |
| --- | --- | --- |
| `.env.example` | Added during project hygiene cleanup | Contains placeholders only |
| `README.md` | Replaced during project hygiene cleanup | Documents local setup, correct Supabase project ref, type generation command, and secret-handling rules |

## Recommended Fixes

1. Keep old project refs out of docs and config.
2. Keep `.env.example` placeholder-only; do not include real keys.
3. Use the correct project ref for type generation:

```bash
npx supabase gen types typescript --project-id fgyvcyksgbivhrqoxkmj > src/integrations/supabase/database.types.ts
```

4. Keep only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in frontend env files.
5. Keep service role, Meta/WhatsApp, AI provider, Apify, webhook, and cron secrets in Supabase/Railway backend secret stores only.
