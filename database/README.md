# Database (MySQL)

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
   (via MySQL Workbench, phpMyAdmin, DBeaver, or command line: `mysql -u root -p < schema/001_create_database.sql`, etc.).
2. Optional: `scripts/create-db-user.sql` (recommended; use that user login in `backend/.env`).
3. Load starter content + admin login: `cd backend && npm run db:seed`.

Local dev with Docker: `docker compose up -d` in this folder.

## Tables
`Settings`, `SiteImages`, `Products`, `ProductFeatures`, `Messages`, `AdminUsers`.
