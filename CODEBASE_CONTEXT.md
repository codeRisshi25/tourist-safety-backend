# Tourist Safety Backend — LLM Context Summary

Purpose
- Backend API for a "tourist safety" application. Provides user (tourist/authority) models, IoT devices, health vitals, blockchain IDs, and itineraries. Built to run on Node.js + Express with PostgreSQL (Supabase).

Quick facts
- Repo root: `tourist-safety-backend`
- Main entry: `app.js`
- Language: JavaScript (Node 18+/22 tested)
- Frameworks/libraries: Express, Sequelize (ORM), pg, sequelize-cli, dotenv, cookie-parser, jsonwebtoken
- Database: PostgreSQL (Supabase pooler used in production via `DATABASE_URL`)

Important files & folders
- `app.js` — application bootstrap, middleware (CORS, cookie-parser), and DB import (`models/index.js`). Contains code that forces IPv4 for `pg` in runtime in prior troubleshooting.
- `package.json` — project dependencies and scripts (see for npm scripts).
- `config/database.cjs` — Sequelize config. Current shape: uses `process.env.DATABASE_URL` for `development` and sets `dialectOptions.ssl` and `family: 4` to prefer IPv4.
- `models/` — Sequelize model definitions. Notable models: `tourist.cjs`, `authority.cjs`, `blockchainId.cjs`, `healthVital.cjs`, `iotDevice.cjs`, `itinerary.js` (new model added).
- `migrations/` — Sequelize migrations. Contains migration files such as `20250918184807-full-db-reset.js`, `20250918202557-added-itinerary.js` (empty originally), and `20250919000001-create-itineraries.js` (created to add `itineraries` table).
- `controllers/` and `routes/` — express controllers and route wiring (auth routes, index). Look here for endpoints.
- `middleware/` — auth middleware (`authenticateToken.js`) and other middleware.
- `services/`, `utils/` — helper modules and services.

Environment variables (observed)
- `.env` contains keys used in development; important vars:
  - `DATABASE_URL` — recommended format: `postgresql://<user>:<pass>@<host>:<port>/<db>` (this repo uses Supabase pooler host like `aws-1-ap-south-1.pooler.supabase.com`).
  - `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_DATABASE`, `DB_PORT` — used in config fallback
  - `JWT_SECRET` — JWT signing secret

DB / Schema highlights
- Primary DB: PostgreSQL (Supabase). CLI migrations applied to remote DB.
- Tables (observed in `public` schema): `tourists`, `authorities`, `blockchain_ids`, `iot_devices`, `health_vitals`, `SequelizeMeta`, `itineraries` (created via migration).
- `itineraries` schema (created migration):
  - id: integer PK
  - tourist_id: integer FK -> tourists(id) ON DELETE CASCADE
  - trip_name: string
  - start_date, end_date: timestamps with timezone
  - details: JSONB (default [])
  - created_at, updated_at: timestamps (default now in migration)

Authentication
- JWT-based auth. Cookies are used via `cookie-parser` integration.
- Middleware `authenticateToken.js` validates JWTs; controllers use `authController.js` and `authRoutes.js`.

Known runtime / deployment notes (important for LLM consumers)
- Past issue: ENETUNREACH errors when DNS resolved IPv6 addresses and host had no IPv6 route. Fixes applied:
  - `dialectOptions.family = 4` set in Sequelize config to prefer IPv4
  - `dialectOptions.ssl` set with `rejectUnauthorized: false` for Supabase TLS
  - `DATABASE_URL` is used for production/development to avoid host-based resolution issues
  - In `app.js` some runs included `Client.prototype.family = 4` to force `pg` to use IPv4
- When running migrations against remote DB, pass `DATABASE_URL` or set `config/database.cjs` to reference `process.env.DATABASE_URL`.

How to run (dev)
- Ensure `.env` contains a valid `DATABASE_URL` for Supabase + `JWT_SECRET`.
- From repo root:

```bash
# install deps
npm install

# run app (reads .env)
node app.js
```

How to run migrations (against cloud DB)
- Recommended (works in this repo):

```bash
# use NODE_ENV=development which reads config/database.cjs
NODE_ENV=development npx sequelize-cli db:migrate

# or pass URL directly (shell):
npx sequelize-cli db:migrate --url "$DATABASE_URL"
```

Notes about CLI and environment
- If `psql` is used locally, it may not be installed on the dev machine (as observed). Use `sequelize-cli` or a DB client that supports SSL.
- When using `DATABASE_URL` with query params, be careful with quoting in zsh/bash.

Model/data shapes (short contract)
- Tourist (example fields): id (int), name (string), email (string), password (string), phone (string), nationality (string), kycId (string), emergencyContact (string), safetyScore (number), createdAt/updatedAt
- Itinerary: { id, tourist_id, trip_name, start_date, end_date, details: array/object, created_at, updated_at }

Edge cases & validation points for LLM tasks
- Missing or invalid `DATABASE_URL` -> Sequelize startup will error
- IPv6-only DNS resolution can cause ENETUNREACH; prefer explicit IPv4/family option
- Migrations may be empty (there is an earlier empty migration file); ensure migrations contain create/drop actions
- Timestamps stored as timestamptz — timezone handling matters when reading/writing

Quick troubleshooting checklist for DB errors
- Verify `.env` and `DATABASE_URL`
- Confirm `config/database.cjs` references `process.env.DATABASE_URL` or contains DB host/port
- Ensure `dialectOptions` includes `ssl: { require: true, rejectUnauthorized: false }` for Supabase and `family: 4`
- Use `NODE_ENV=development npx sequelize-cli db:migrate` to apply migrations

Useful snippets (for the LLM to reuse)
- Create a Sequelize instance (used for scripts):
```js
const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false }, family: 4 }
});
```

- SQL to list public tables:
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

Repository status / TODOs
- Confirm all migrations represent desired production schema (one migration was empty and required a fix).
- Add integration tests for DB models and migration idempotency.
- Consider removing `rejectUnauthorized: false` in production and configure proper CA / cert validation.

Contact points in repo
- `controllers/` — API behavior and business logic
- `models/` — data shapes and associations
- `migrations/` — schema history
- `config/database.cjs` and `.env` — DB connection configuration

Last verified
- Date: 2025-09-19
- Verified: migrations ran and `itineraries` table exists on Supabase. IPv4 workaround applied and app runs successfully.


---
Append this file as a compact reference for automated agents or new maintainers to quickly understand how to run, migrate, and reason about the project.
