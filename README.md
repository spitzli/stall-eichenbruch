# Stall Eichenbruch

Website of Stall Eichenbruch, built on [Payload CMS](https://payloadcms.com) 3 + Next.js 16, Postgres (Neon/Vercel), Tailwind 4.

## Development

```bash
cp .env.example .env   # fill in POSTGRES_URL and PAYLOAD_SECRET
bun install
bun run dev            # http://localhost:3000, admin at /admin
bun run seed           # content + admin user (admin@stall-eichenbruch.eu / password). Destructive.
                       # Globals are cached by the running dev server – restart it after seeding.
```

After changing collections, blocks or globals: `bun run generate:types`.

## Deployment

Vercel project `spitzli/stall-eichenbruch`, auto-deploys from GitHub `main` (production) and PR branches (preview). Env: `POSTGRES_URL` (Neon integration), `BLOB_READ_WRITE_TOKEN` (Blob store `stall-eichenbruch-media`), `PAYLOAD_SECRET`, `PREVIEW_SECRET`, `CRON_SECRET`. `NEXT_PUBLIC_SERVER_URL` is optional – the production domain comes from `VERCEL_PROJECT_PRODUCTION_URL`. Pull env locally with `bunx vercel env pull`.

Schema changes: Payload pushes the schema in dev only. Run `bun run dev` (or the seed) against the database once before deploying a change to collections/globals, or add migrations.

## Content model

- **Pages** – hero (image + title / title only / none) and a block layout. Draft/publish, live preview, SEO.
- **Blocks** – `services` (offers with price), `facilities` (label/value facts), `content` (rich text columns), `mediaBlock`, `gallery`, `team`, `contact` (renders the site-info global), `cta`, `formBlock`.
- **Globals** – `site-info` (name, address, phone, e-mail, stable hours, map link), `header` and `footer` navigation.
- **Media**, **Users**, **Forms** (form-builder plugin), **Redirects**.

Admin UI is German (`i18n` fallback `de`); code, slugs of blocks and field names are English.

## SEO

Titles/descriptions come from the SEO tab (fallback: hero text), every page gets a generated OG image at `/og/<slug>`, and the layout emits LocalBusiness JSON-LD from the site-info global. Research notes and the owner's to-do list: `docs/seo.md`.

## Design

Light only. Tokens live in `src/app/(frontend)/globals.css`: fog background, bog-green text, oak-leaf green for actions, an oak rail on every "plate" (`.plate`), hay yellow as highlight. Display face Young Serif, body Albert Sans.
