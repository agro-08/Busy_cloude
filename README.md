# Busy On Cloud

Website + Admin panel for BUSY accounting cloud hosting plans.

```
busy-on-cloud/
├── frontend/        Static website (HTML / CSS / vanilla JS)
│   └── public/      index.html, admin.html, css/, js/, assets/
├── backend/         Node.js + Express REST API  (connects to SQL Server)
│   └── src/         config, routes, controllers, services, repositories, middleware, utils, scripts
├── database/        SQL Server scripts (schema, procedures, seed, migrations)
└── docs/            Architecture + setup notes
```

## Tech stack
| Layer    | Technology |
|----------|------------|
| Frontend | HTML5, CSS3, vanilla JavaScript (no build step), Font Awesome, Google Fonts |
| Backend  | Node.js 18+, Express 4, `mssql` (tedious driver), `dotenv`, built-in `crypto` (scrypt password hashing) |
| Database | Microsoft SQL Server 2017+ (database `BusyOnCloud`) |

## Quick start
1. **Database** – run `database/schema/001_create_database.sql`, `002_create_tables.sql`, `database/procedures/*.sql`
   (or `docker compose up -d` inside `database/` for a local SQL Server).
2. **Backend**
   ```bash
   cd backend
   cp .env.example .env     # set DB_USER / DB_PASSWORD
   npm install
   npm run db:seed          # starter content + admin login
   npm start
   ```
3. Open http://localhost:3000 (site) and http://localhost:3000/admin.html (admin, first password `admin123` – change it in Admin → Security).

The backend serves `frontend/public`, so one process = full site. See `docs/ARCHITECTURE.md` and `database/README.md`.
