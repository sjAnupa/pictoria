# Pictoriya

Pictoriya is a public illustrated library. Guests browse published books and read free chapters. Readers sign in with Google, then keep progress, likes, saves, and reviews. Staff publish titles from `/admin`.

The site is two deployable apps plus a database and an image store:

| Piece | What it is in production |
| --- | --- |
| **Website** | `client/` — Vite build, static files, HTTPS |
| **API** | `server/` — Node process, HTTPS, always on |
| **Database** | MongoDB Atlas (`MONGODB_URI`) |
| **Images** | Cloudflare R2. Local `uploads/` is only for a machine you are developing on |

`VITE_API_URL=/api` and `http://localhost:5173` are development shortcuts. They are not the production configuration. The browser on the public internet cannot reach your laptop.

## Before the site is public

Do these in order. Sign-in and book images will fail if you skip them.

1. **Own a domain** and serve the website and API over HTTPS. Example: `https://pictoriya.com` and `https://api.pictoriya.com`.
2. **Put secrets in the host**, not in git. `server/.env` and `client/.env` are ignored. Set the same variables in the API host and in the client build environment.
3. **Point the client build at the public API.** `VITE_*` values are baked in at `npm run build`. Set `VITE_API_URL=https://api.pictoriya.com/api` before that command. A build made with `/api` only works behind a dev proxy.
4. **Allow the website origin on the API.** `CLIENT_URL=https://pictoriya.com` (no trailing path). CORS rejects every other origin.
5. **Store images on R2.** Set `CLOUDFLARE_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, and `R2_PUBLIC_URL` to real values. Placeholder values keep files on the API disk, which disappears on most hosts and is not a public URL.
6. **Configure Google for the live origin**, not localhost. In Google Cloud → the OAuth Web client:
   - Authorized JavaScript origins: `https://pictoriya.com`
   - Privacy policy URL: `https://pictoriya.com/privacy`
   - Homepage: the same site
   - The same Web client ID in both `GOOGLE_CLIENT_ID` (API) and `VITE_GOOGLE_CLIENT_ID` (client build)
7. **Publish Privacy Policy and Terms** on that domain, linked from the footer and from Login / Register, before you move the Google app from Testing to production. What those pages must cover is in [Legal](#legal).
8. **Do not seed the demo catalog onto the public database** unless you have rights to those stories and pictures. `npm run seed:books` is sample data for development.
9. **Create the admin after the first real Google sign-in**, in MongoDB:

```js
db.users.updateOne(
  { email: "your-admin@gmail.com" },
  { $set: { is_admin: true, is_super_admin: true, role: "super_admin" } }
)
```

10. **Confirm** `GET https://api.pictoriya.com/api/health` returns ok, the homepage loads books, Google sign-in returns to the site, and a cover image loads from the R2 public URL.

There is no Dockerfile or host config in this repo. Any host that can run a Node 20+ process and serve a static SPA is enough. The website host must rewrite unknown paths to `index.html` so `/library`, `/books/:slug`, and `/admin` work on refresh.

## Production environment

### API host

| Variable | Production value |
| --- | --- |
| `NODE_ENV` | `production` (hides internal 500 details) |
| `PORT` | whatever the host assigns |
| `MONGODB_URI` | Atlas URI for the **production** database |
| `JWT_SECRET` | long random secret, different from any dev secret |
| `JWT_EXPIRES_IN` | `7d` unless you want shorter sessions |
| `CLIENT_URL` | `https://<your-site>` exactly as the browser shows it |
| `GOOGLE_CLIENT_ID` | production OAuth Web client ID |
| `GOOGLE_CLIENT_SECRET` | from that same client |
| `FACEBOOK_APP_ID` / `FACEBOOK_APP_SECRET` | only if Facebook login is enabled |
| `CLOUDFLARE_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` | real R2 credentials |
| `R2_BUCKET_NAME` | your bucket (code default is `pictoria-books`) |
| `R2_PUBLIC_URL` | public base URL of that bucket, `https://…` |

Start command after `npm run build`: `npm start` (`node dist/server.js`).

### Website build

| Variable | Production value |
| --- | --- |
| `VITE_API_URL` | `https://<your-api>/api` |
| `VITE_GOOGLE_CLIENT_ID` | same Web client ID as `GOOGLE_CLIENT_ID` |
| `VITE_FACEBOOK_APP_ID` | only if Facebook login is enabled |
| `VITE_R2_PUBLIC_URL` | same public R2 base, if the client must prefix relative media |

Rebuild the client whenever any `VITE_` value changes. Restarting the API does not update a client that was already built.

## What the public site does

- **Catalog.** Home, library, and book pages. Guests only receive books with `status: published`. Draft, hidden, and archived titles stay on the admin API.
- **Reader.** Chapter images are served only when `chapterAccess` allows it.
  - `free` — anyone
  - `registered` — guests get chapters up to `freeChapterLimit`; the rest require a signed-in reader
  - `premium` — same preview, then an active premium subscription
  - admins can open any chapter
- **Account.** `POST /api/auth/google` checks the Google ID token, then returns Pictoriya’s own JWT (`Authorization: Bearer`). Progress, likes, saves, and reviews are tied to that user.
- **Admin.** `/admin` after `is_admin` is set. Dashboard, book editor, chapter images, review moderation.

| Area | Routes |
| --- | --- |
| Health | `GET /api/health` |
| Auth | `POST /api/auth/google`, `POST /api/auth/facebook`, `GET /api/auth/me` |
| Books | `GET /api/books`, `GET /api/books/:slug`, `GET /api/books/catalog-stats`, `GET /api/books/most-liked` |
| Books (admin) | `POST/PUT/DELETE /api/books`, `GET /api/books/manage/:id` |
| Chapters, progress, likes, reviews, views | `/api/chapters`, `/api/progress`, `/api/engagement`, `/api/reviews`, `/api/views` |
| Admin | `GET /api/admin/dashboard` |

Auth, uploads, review writes, and view pings are rate-limited.

Google account rules: Register creates the user; Login requires an existing user (`ACCOUNT_NOT_FOUND` / `ACCOUNT_EXISTS`). An inactive user is rejected.

## Legal

Publish these on the **production domain** before the Google OAuth app leaves Testing. This README is not those documents, and it is not legal advice. Have a lawyer review them if you take payment or host books you did not create.

**Privacy Policy** (`/privacy`). Google will not accept a public OAuth app without this URL. State that sign-in uses Google; that you store the Google account ID, email, name, and photo; that you keep a session plus reading progress, likes, saves, reviews, and view counts; that you do not sell that data; and how a person can close an account. Link Google’s own privacy policy for the Google sign-in step.

**Terms of Use** (`/terms`). State that a reader may read inside Pictoriya and may not copy, scrape, or republish pages. Describe free, registered, and premium access. Say that reviews can be removed. Give an email for copyright complaints.

**Rights for each book.** Google login does not license the illustrations. Before a title is `published` on the live database, record why you may show it: you made it, you have a written license, or it is public domain. Leave the development seed data off the production database unless that record exists.

Link both pages in the footer and beside **Continue with Google**. Then add the privacy URL on the Google consent screen and switch the app to production.

## Stack

React 18, TypeScript, Vite, Tailwind, React Router, TanStack Query, Zustand. Express 5, Zod, Helmet, MongoDB, Google Identity Services, Multer, Sharp, Cloudflare R2.

```
client/     public website
server/     API
docs/       OAuth notes (docs/OAUTH_MIGRATION.md)
```

## Developing locally

Only for working on the code. The public site does not use this layout.

Requirements: Node.js 20+ (22+ if you use R2), npm, a MongoDB URI.

```bash
cd server
cp .env.example .env   # MONGODB_URI, JWT_SECRET, GOOGLE_CLIENT_ID
npm install
npm run dev            # http://localhost:5000
```

```bash
cd client
cp .env.example .env   # VITE_API_URL=/api  and  VITE_GOOGLE_CLIENT_ID
npm install
npm run dev            # Vite proxies /api and /uploads to port 5000
```

For local Google sign-in, add `http://localhost:5173` (and the port Vite actually prints) under Authorized JavaScript origins, and add each Gmail as a test user while the consent screen stays in Testing.

`npm run seed:categories` and `npm run seed:books` load sample titles into whichever database `MONGODB_URI` points at. Point that URI at a dev database, not production.

Other server scripts: `npm run build`, `npm start`, `npm run migrate:media`, `npm run seed:clear-reading`, `npm run seed:cleanup-users`. Client: `npm run build`, `npm run preview`, `npm run lint`.

## License

The server package is marked `ISC`. Confirm the GitHub repo license before the repository or the live site includes anyone else’s artwork. Development seed books are not a license to republish those stories.
