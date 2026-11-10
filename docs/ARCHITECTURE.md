# Architecture

Browser ──► Express (`backend/src`) ──► SQL Server (`BusyOnCloud`)
              │
              └── also serves `frontend/public` as static files (same origin → cookies just work)

## Backend layers
`routes` → `controllers` (HTTP only) → `services` (rules, validation, auth) → `repositories` (SQL) → `config/db` (pool)

## API (unchanged from the old JSON-file version, so the frontend needed no code change)
| Method | Path                | Auth  | Purpose |
|--------|---------------------|-------|---------|
| GET    | /api/data           | –     | Public site content (no messages) |
| POST   | /api/login          | –     | Admin login (rate-limited, 8 tries / 15 min) |
| POST   | /api/logout         | –     | Logout |
| GET    | /api/admin/session  | –     | Is the cookie session valid |
| GET    | /api/admin/data     | admin | Full content incl. messages |
| PUT    | /api/admin/data     | admin | Save full content (one DB transaction) |
| POST   | /api/admin/password | admin | Change admin password |

## Security notes
- Passwords: scrypt + random salt, stored in `dbo.AdminUsers`.
- Session cookie: HttpOnly, SameSite=Strict (+Secure on HTTPS). Sessions are in memory.
- Use a least-privilege SQL login (`database/scripts/create-db-user.sql`), never `sa`.
- Production: set `NODE_ENV=production`, `BOC_ADMIN_PASSWORD`, `BOC_SECURE_COOKIES=true`, `TRUST_PROXY=true` behind a reverse proxy, use HTTPS.

## Migrating old data
The old `.private/site-data.json` content is already in `database/seed/initial-site-data.json`.
