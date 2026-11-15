# Media storage design (covers + chapter pages)

## Goals

- **Durable in production** — images must survive API redeploys (ephemeral disks).
- **Efficient grids** — home/library load many covers; serve from CDN, not Node.
- **Simple admin UX** — upload/replace cover and publish status without fighting multipart/CORS.
- **Dev-friendly** — without R2 credentials, files still work on local disk.

## Architecture

| Asset | When R2 is configured | When R2 is not configured (local) |
|--------|------------------------|-----------------------------------|
| **Book covers** | Cloudflare R2 public URL | `uploads/covers/books/{slug}/cover-*.webp` via Express |
| **Chapter pages** | Cloudflare R2 public URL | `uploads/pages/...` via Express |

```
Admin upload (multipart)
  → Express + multer (memory)
  → sharp → webp
  → R2 PutObject  OR  local uploads/
  → MongoDB stores the final URL / path
  → Client resolveMediaUrl() → <img src>
```

### Cover object keys (R2)

```text
covers/books/{slug}/cover-{timestamp}.webp
```

Versioned filenames so replace-cover always gets a **new URL** (avoids stale CDN/browser cache). Old object is deleted when the book cover is replaced or the book is deleted.

### Chapter page keys (unchanged)

```text
pages/books/{slug}/chapters/{n}/{filename}.webp
```

## Client rules

1. **Never** set `Content-Type: multipart/form-data` manually — the browser must add the boundary.
2. Axios must **not** force `application/json` onto `FormData` requests.
3. `resolveMediaUrl`:
   - `https://…` (R2) → use as-is
   - `/uploads/…` in DEV → relative (Vite proxy)
   - `/uploads/…` in PROD → prefix API origin (legacy local paths)
4. Cover `<img>`: `loading="lazy"` + `decoding="async"` on grids.
5. Book **edit save** keeps current status; **new** books start as `draft`. Publish/hide from the books list.

## Server rules

1. `isR2Configured()` → covers and pages go to R2.
2. Helmet `crossOriginResourcePolicy: cross-origin` so the SPA origin can load API-hosted legacy `/uploads` if needed.
3. CORS allows `CLIENT_URL` and its `www` / apex twin.
4. Status-only updates use multipart `FormData` on `PUT /api/books/:id` (same route as full updates).

## Production checklist

- [ ] `R2_*` env vars set on the API (not placeholders)
- [ ] R2 bucket public access / custom domain matches `R2_PUBLIC_URL`
- [ ] `CLIENT_URL=https://pictoriya.com` (CORS)
- [ ] Client build: `VITE_API_URL=https://api.pictoriya.com/api`
- [ ] After deploy: **re-upload covers** once for books that still point at dead `/uploads/covers/...` paths

## Why not API-disk covers in prod?

API hosts often wipe the filesystem on redeploy. Covers on R2 match chapter-page durability and offload grid traffic to the CDN. Local disk remains the fallback when R2 is unset (development).
