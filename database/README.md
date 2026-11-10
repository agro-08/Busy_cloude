# Database (SQL Server)

Database name: **BusyOnCloud**

| Folder        | Purpose                                              |
|---------------|------------------------------------------------------|
| `schema/`     | Create database + tables (run in order 001, 002)     |
| `procedures/` | Stored procedures                                    |
| `seed/`       | Initial website content (`initial-site-data.json`)   |
| `migrations/` | Future schema changes                                |
| `scripts/`    | App DB user, backup                                  |

## Setup
1. Run `schema/001_create_database.sql`, then `schema/002_create_tables.sql`, then `procedures/*.sql`
   (SSMS / Azure Data Studio, or `sqlcmd -S localhost -U sa -P <pwd> -i <file>`).
2. Optional: `scripts/create-db-user.sql` (recommended; use that login in `backend/.env`).
3. Load starter content + admin login: `cd backend && npm run db:seed`.

Local dev without installing SQL Server: `docker compose up -d` in this folder.

## Tables
`Settings`, `SiteImages`, `Products`, `ProductFeatures`, `Messages`, `AdminUsers`.
