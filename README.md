# Larkspur House

A country inn’s website with a hand-run reservations book. Built with **Next.js 15**, **Postgres** and a warm, editorial front end.

Guests can read about the inn, browse six rooms with photographs, capacity and nightly rates, check a calendar that shows what is already taken, and send a stay request. Requests stay **pending** until the innkeeper confirms or declines them by hand — **no payment is ever taken** on the site. A seasonal menu, a photograph walk of the grounds and a moderated guestbook complete the public side.

Behind sign-in, the innkeeper’s desk shows the month as a calendar of stays per room, answers requests with a note, closes dates, manages rooms and their photographs, edits the menu by season and approves guestbook entries.

---

## Quick start

```bash
npm install
npm run dev
```

Open **http://localhost:3000**. The innkeeper’s desk is at **http://localhost:3000/desk**.

> **Sign in:** `margaret@larkspurhouse.co.uk` · `larkspur`
> (shown on the sign-in page in preview; set `SHOW_DEMO_LOGIN=false` to hide it)

No database server is needed to look around. With no `DATABASE_URL`, the app uses an
embedded Postgres-compatible database ([PGlite](https://pglite.dev)) in `var/pglite`, creates
the schema on first request and seeds the inn with rooms, photographs, menus, guestbook
entries and a plausible diary of requests.

To reset the demo data at any time:

```bash
npm run db:reset
```

## Using a real Postgres

```bash
createdb larkspur
export DATABASE_URL=postgres://user:password@localhost:5432/larkspur
npm run db:migrate
npm run db:seed
npm run dev
```

The schema lives in [`lib/db/schema.sql`](lib/db/schema.sql) and is plain Postgres — no ORM.
`npm run db:seed -- --reset` empties the tables first. On first boot with an empty database,
the app also creates the schema and seeds itself (set `SEED_ON_BOOT=false` to disable that).

## Sign-in and secrets

Create `.env.local` (see [`.env.example`](.env.example)):

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string. Omit to use the embedded database. |
| `PGLITE_DIR` | Where the embedded database lives (default `var/pglite`). |
| `AUTH_SECRET` | HMAC key for the signed session cookie. **Set this in production.** |
| `INNKEEPER_EMAIL` / `INNKEEPER_PASSWORD` / `INNKEEPER_NAME` | Seeded innkeeper credentials. |
| `SHOW_DEMO_LOGIN` | Set to `false` to hide the preview credentials box. |

Sessions are a signed, `HttpOnly`, `SameSite=Lax` cookie — no auth library, no accounts for guests.
Passwords are hashed with scrypt.

## Photographs in cloud storage

Uploads go to `var/uploads` and are served through `/media/<key>` by default. To store them in
any S3-compatible bucket instead (AWS S3, Cloudflare R2, MinIO, Backblaze B2), set:

```bash
S3_BUCKET=larkspur-house
S3_REGION=eu-west-2
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
# optional:
S3_ENDPOINT=https://<account>.r2.cloudflarestorage.com
S3_PUBLIC_BASE_URL=https://cdn.example.com
S3_FORCE_PATH_STYLE=true
```

The bucket is used for uploads, deletes and (for private buckets) short-lived signed URLs. The
SDK-free SigV4 signer is in [`lib/storage.ts`](lib/storage.ts); room photographs are resized to
1,800px, converted to JPEG and given unguessable keys before they leave the server.

## What is where

```
app/
  (site)/            the public inn — header, footer, pages
    page.tsx         home, with a fortnight of availability at a glance
    rooms/           room index (filter by party size / dogs) and room detail + booking panel
    stay/            the reservations book, confirmation page, reference lookup
    menu/            seasonal menu with dietary codes
    grounds/         photograph walk
    guestbook/       approved notes and the (moderated) submission form
    find-us/         directions, hand-drawn map, practicalities
  desk/              the innkeeper’s desk
    (auth)/sign-in   sign in
    (book)/          authenticated: overview, requests, calendar, rooms, menu, guestbook
  media/[...key]/    serves locally stored uploads
components/
  calendar/          the shared month calendar with range selection
  booking/           room booking panel and whole-house stay planner
  desk/              request cards, decision forms, month grid, editors
lib/
  db/                connection (pg or PGlite), schema, bootstrap
  actions/           server actions: public, auth, desk
  availability.ts    occupancy intervals, conflicts, calendar marks
  queries.ts         all reads (rooms, requests, menus, guestbook, desk month)
  storage.ts         local + S3 object storage, SigV4 signing
  seed-data.ts       the inn’s rooms, menus, guestbook and diary
scripts/             migrate, seed
```

## How the book works

- **A request is a request.** Submitting a stay creates a `pending` row and a reference such as
  `LH-4K2P9X`. Nothing is held and nothing is charged.
- **Confirmed stays and closed dates** block nights on the public calendar. **Pending requests**
  are drawn with a gold ring so guests can see that someone else has asked, but they do not
  prevent another request — the innkeeper decides.
- **Confirmation is guarded.** The desk refuses to confirm a request that overlaps a confirmed
  stay or a closed date, and explains the clash so the innkeeper can resolve it first.
- **Declines carry a note** that the guest can read on their reference page.
- **Closed dates** are per room, chosen from the calendar by clicking a day.
- **The month** is drawn as a grid of rooms × days: green for stays, gold for requests, clay
  for closed dates, initials of the guest in each cell.
- Rates are whole pounds per night; the room page and request form show the sum, but there is no
  payment step anywhere in the code.

## Design notes

- Cream paper, ink, moss and clay; hairline rules and small-caps labels.
- **Fraunces** (variable, with its `SOFT`/`WONK` axes) for display and **Instrument Sans** for
  text, self-hosted through Fontsource — no external font requests.
- Lightly grained background, generous margins, asymmetric editorial grids.
- The calendar is a real interactive component: pick a first night, then a last; unavailable
  nights cannot be selected, and if a span is interrupted the selection restarts from the new
  date with an explanation.
- The desk is denser and more functional, but the same palette.

## Quality checks

```bash
npm run typecheck
npm run build
```

During development every server action was exercised end-to-end against a running instance
(requests, capacity and past-date validation, double-booking refusals, closing/reopening dates,
room edits, photo upload and deletion, menu edits, guestbook moderation, sign-in) — 22 checks,
all passing. The temporary harness was removed afterwards.

## Deploying

Works on Vercel or any Node host.

1. Provision Postgres (Neon, Supabase, RDS…) and set `DATABASE_URL`, `AUTH_SECRET` and the
   `INNKEEPER_*` variables.
2. Run `npm run db:migrate && npm run db:seed` once — or let the first request do it.
3. Set the `S3_*` variables if you want photographs to survive deployments. The local
   `var/uploads` folder is **not** durable on serverless hosts, and PGlite is not suitable for
   production — use a real Postgres there.
4. `npm run build && npm run start`.

## Photography

The photographs in `public/seed` are **placeholders gathered from public editorial pages** for
the purpose of this demonstration. They are not licensed for production use: replace them with
your own (or licensed) photography before the inn opens. Uploaded photographs in the desk are
stored separately in `var/uploads` or your bucket.

---

*Kept by Margaret & Tom Ellery, and a dog called Pip.*
