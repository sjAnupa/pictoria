# OAuth migration tracker (Google → Facebook → prod)

Use this checklist when moving Pictoria from local dev to production. **Never commit secrets** — store them in hosting env vars only.

---

## What is implemented (Phase 1 — Google)

| Layer | Change |
|-------|--------|
| **User model** | `googleId` (sparse unique), optional `passwordHash`, `authProviders[]` (`local`, `google`, `facebook`) |
| **API** | `POST /api/auth/google` body: `{ credential, intent: "login" \| "register" }` |
| **Client** | “Continue with Google” on Login + Register (`@react-oauth/google`) |
| **Email/password** | Still available (will be removed after Facebook + migration) |

### Google Cloud Console (your setup)

| Item | Value / notes |
|------|----------------|
| **OAuth consent** | External, Testing mode until published |
| **Scopes** | `openid`, `userinfo.email`, `userinfo.profile` |
| **Test users** | Add every Gmail used for QA while in Testing |
| **Client type** | Web application |
| **Authorized JavaScript origins (dev)** | `http://localhost:5173` |
| **Authorized JavaScript origins (prod)** | `https://<your-production-domain>` |
| **Redirect URIs** | Not required for ID-token flow used here |

### Environment variables

| Variable | Where | Purpose |
|----------|--------|---------|
| `VITE_GOOGLE_CLIENT_ID` | Client (Vite) | Renders Google button |
| `GOOGLE_CLIENT_ID` | Server | Verifies ID token (`audience` must match) |
| `GOOGLE_CLIENT_SECRET` | Server | Stored for future server-side flows; ID-token verify uses Client ID only |

> **Security:** If a Client Secret was ever pasted in chat or committed, **rotate it** in Google Cloud Console → Credentials → your OAuth client → Reset secret.

---

## Account behaviour

| Scenario | Result |
|----------|--------|
| New Google user on **Register** | Creates user with `authProviders: ['google']`, no password |
| Existing Google user on **Login** | Issues JWT |
| Email exists (password account), **Login** with Google | Links `googleId` to same email |
| Email exists, **Register** with Google | `409 ACCOUNT_EXISTS` — “Sign in instead” |
| No account, **Login** with Google | `404 ACCOUNT_NOT_FOUND` — “Create an account” |
| OAuth-only user tries email login | `USE_GOOGLE_SIGNIN` — use Google button |

---

## User data cleanup (before first real Google login)

Removes test users and their activity. Use `--all` for a completely fresh OAuth start:

```powershell
cd server
npm run seed:cleanup-users -- --all --dry-run
npm run seed:cleanup-users -- --all
```

Then sign in with Google as `pictoria.library@gmail.com` and promote admin in MongoDB:

```js
db.users.updateOne(
  { email: "pictoria.library@gmail.com" },
  { $set: { is_super_admin: true, is_admin: true, role: "super_admin" } }
)
```

---

## Production migration checklist

- [ ] Create **production** OAuth Web client (or add prod origins to existing client)
- [ ] Set `CLIENT_URL` to production site URL on server
- [ ] Set `VITE_GOOGLE_CLIENT_ID` in client build env
- [ ] Set `GOOGLE_CLIENT_ID` (+ secret if needed) on server
- [ ] Add production origin to **Authorized JavaScript origins**
- [ ] Add privacy policy + terms URLs on consent screen
- [ ] Move OAuth app from **Testing** → **In production** when ready for all users
- [ ] Run `seed:cleanup-users` on prod only if clearing test accounts (backup DB first)

---

## Planned (not done yet)

| Phase | Work |
|-------|------|
| **Facebook** | Meta app, `POST /auth/facebook`, client button |
| **Remove email/password** | Readers social-only; optional `/admin/login` for staff |
| **Apple** | Before iOS app with other social logins |

---

## API reference

```http
POST /api/auth/google
Content-Type: application/json

{
  "credential": "<Google ID token JWT>",
  "intent": "login" | "register"
}
```

Success: `{ success, data: { user, token } }`  
Errors include `code`: `ACCOUNT_EXISTS`, `ACCOUNT_NOT_FOUND`, `USE_GOOGLE_SIGNIN`, `EMAIL_NOT_VERIFIED`, `GOOGLE_NOT_CONFIGURED`
