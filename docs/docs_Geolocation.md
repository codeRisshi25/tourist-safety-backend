# Geolocation Backend: Implementation & Migration Notes

**Date:** 2025-09-16

---

## 1. Overview

This document details the geolocation backend for the Tourist Safety project, including the evolution of the implementation, key architectural decisions, API endpoints, and migration notes for moving to PostgreSQL/PostGIS (Supabase). It is intended as a comprehensive reference for future developers and maintainers.

---

## 2. Initial Implementation (Prototype)

- **Storage:** JSON files (append-only) for itineraries and risk zones.
- **Geocoding:** OpenStreetMap via `node-geocoder`.
- **Safety Scoring:** Point-in-polygon checks against risk zones, with deductions for risk/restricted areas.
- **Endpoints:**
  - `POST /api/itineraries` — Accepts multi-day itinerary, geocodes locations, computes safety score, persists to JSON.
- **Limitations:**
  - No persistent DB, no real-time features, no robust validation, no authentication.

---

## 3. Current Implementation (Postgres + WebSocket)

- **Database:** PostgreSQL with PostGIS (via Prisma ORM) is used for persistent location pings and other stored data.
- **Geospatial Data:**
  - Regular location pings are stored as `geometry(Point,4326)` in the `location_ping` table.
  - Geofenced zones are represented as polygons (prototype stored in `data/riskZones.json` or to be migrated to DB).
- **Authentication:** JWT for all sensitive HTTP endpoints and WebSocket connections. The JWT payload must contain the tourist UUID as `id`.
- **Endpoints & Real-time Flows:**
  - `POST /api/location/ping` — Receives periodic location updates (latitude, longitude, accuracy, speed, timestamp). These are persisted to `location_ping` (PostGIS) — regular pings are persisted.
  - `POST /api/emergency/activate` — Activates a panic alert. Per current design this endpoint does NOT persist the emergency to the database; instead it emits a real-time `emergency:update` message to connected authority dashboards (Socket.IO `authorities` room).
  - WebSocket: `emergency:ping` — For real-time emergency streaming from tourists: the server emits `emergency:update` to authorities and does NOT persist the emergency ping to the DB.
- **Business Logic & Conventions:**
  - Regular pings are persisted using raw SQL / Prisma helpers and PostGIS: `ST_GeomFromText('POINT(lon lat)', 4326)`.
  - Emergency flows are emit-only (no automatic DB persistence) to satisfy requirement: emergency data should go directly to authority dashboards.
  - DB persistence for emergencies remains available via an explicit helper `EmergencyService.persistPanic()` but it is not called by default.
- **Schema & Field Names:**
  - All DB-related fields use camelCase (e.g., `touristId`, `accuracyMeters`, `speedMps`). Codebase was updated to match the Prisma schema.
- **Security & CORS:**
  - JWT required for all location/emergency endpoints and sockets. CORS is wide-open for development — restrict in production.

---

## 4. Changes & Evolution

- **From:** JSON file storage, no DB, no real-time, no auth, snake_case fields.
- **To:** PostgreSQL/PostGIS, Prisma ORM, JWT auth, real-time WebSocket, camelCase fields.
- **Key Migration Steps:**
  - Refactored all code to use camelCase for DB fields.
  - Updated Prisma schema to match Supabase/Postgres structure.
  - All geospatial logic now uses PostGIS types and functions.
  - All endpoints now require JWT.

---

## 5. API Endpoints & WebSocket Events

### HTTP Endpoints

- `POST /api/location/ping`

  - Body: `{ latitude, longitude, accuracy, speed, timestamp }`
  - Auth: JWT required
  - Stores location as PostGIS point in `location_ping` table.

- `POST /api/emergency/activate`

  - Body: `{ latitude, longitude }`
  - Auth: JWT required
  - Creates a panic alert with location.

- `POST /api/itineraries` (prototype)
  - Body: `{ trip_name, start_date, end_date, days: [...] }`
  - No auth (prototype)
  - Geocodes locations, computes safety score, stores in JSON.

### WebSocket Events

- `emergency:ping`
  - Payload: `{ latitude, longitude, accuracy, speed, timestamp }`
  - Auth: JWT required (in handshake)
  - Behaviour: emits `emergency:update` to the `authorities` room (real-time). Does NOT persist emergency pings to DB by default.
- `emergency:update`
  - Emitted to authority dashboards with latest location data: `{ touristId, latitude, longitude, accuracyMeters?, speedMps?, timestamp }`.

---

## 6. Important Notes & Best Practices

- **Regular pings vs emergency pings:** Regular pings (from `/api/location/ping`) are persisted. Emergency pings are emitted only and not persisted by default.
- **Always use latitude/longitude from client, convert to PostGIS point in backend for persisted pings.**
- **All geospatial DB fields use camelCase to match Prisma and Supabase.**
- **JWT must be validated for all sensitive endpoints and sockets.**
- **Prisma datasource URL must point to Supabase Postgres for production.**
- **Push Prisma schema to Supabase before production migration.**
- **CORS should be restricted in production.**
- **Add input validation for all endpoints (lat/lon ranges, timestamp sanity, required fields).**
- **Implement rate limiting, logging, and monitoring for production.**

---

## 7. Migration to Supabase/PostgreSQL

- **Update `.env` with Supabase Postgres connection string.**
- **Run `npx prisma db push` to sync schema.**
- **No code changes needed if using Prisma and schema matches.**
- **Test all endpoints after migration.**

---

## 8. Known Limitations & TODOs

- No enforcement of periodic ping interval (server expects client to send every 3 minutes). If you want server-side enforcement, add last-ping tracking and validation.
- No GET/list endpoints for pings or itineraries (add read APIs for dashboards or admin use).
- Prototype features (itinerary/risk zones) are stored in `data/*.json` and not yet migrated to DB. Consider migrating these to the DB and using PostGIS for zone storage.
- No automated tests or OpenAPI docs. Add tests for pings and emergency flows.
- Emergency events are emit-only; if you want an audit trail, call `EmergencyService.persistPanic()` explicitly from the controller or log to an append-only store.

---

