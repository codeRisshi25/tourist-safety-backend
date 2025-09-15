# Project Update: Itinerary Geocoding & Safety Scoring Feature

Date: 2025-09-16
Branch: `feat/prisma-sync`
Scope: This document only covers the newly added itinerary creation feature (geocoding, JSON storage, safety scoring). It does NOT document unrelated Prisma models yet.

---
## 1. Feature Overview
We introduced a prototype endpoint to accept a multi-day travel itinerary, geocode each location (constrained to Assam, India), compute a safety score based on predefined risk zones, and persist the result.

Endpoint: `POST /api/itineraries`
Storage (temporary): JSON files in `data/`
Geocoding Provider: OpenStreetMap via `node-geocoder`
Primary Goal: Unblock early mobile client integration before full PostgreSQL/PostGIS migration.

---
## 2. High-Level Flow
1. Client sends itinerary payload (trip metadata + days + locations).
2. Service validates structural integrity of payload.
3. Each `location.name` is geocoded using query pattern: `<name>, Assam, India` to reduce ambiguity.
4. Coordinates are cached in-memory (Map) to avoid duplicate provider calls.
5. Safety score is computed by checking each geocoded point against risk zone polygons.
6. Resulting itinerary (with expanded coordinate list + score) is appended to `data/itineraries.json`.
7. Response returns `201 Created` with the persisted record.

---
## 3. Request & Response Schema
### Request Body (Example)
```json
{
  "trip_name": "Assam Wildlife Trail",
  "start_date": "2025-11-10",
  "end_date": "2025-11-13",
  "days": [
    {
      "day": 1,
      "date": "2025-11-10",
      "locations": [ { "name": "Kaziranga National Park" } ]
    },
    {
      "day": 2,
      "date": "2025-11-11",
      "locations": [ { "name": "Some Other Place" } ]
    }
  ]
}
```
Required root fields: `trip_name`, `start_date`, `end_date`, `days`.
Each `days[]` element: numeric `day`, optional `date`, non-empty `locations` array of `{ name: string }`.

### Successful Response (Shape)
```json
{
  "success": true,
  "itinerary": {
    "id": 2,
    "trip_name": "Assam Wildlife Trail",
    "start_date": "2025-11-10",
    "end_date": "2025-11-13",
    "safety_score": 100,
    "locations": [
      { "day": 1, "name": "Kaziranga National Park", "latitude": 26.6581046, "longitude": 93.3927441 }
    ]
  }
}
```
### Failure Response (Example)
```json
{
  "success": false,
  "error": "Location \"Invalid Place\" could not be found in Assam."
}
```

---
## 4. Geocoding Strategy
Library: `node-geocoder@4.4.1`
Provider: OpenStreetMap (Nominatim)
Configuration file: `config/geocoder.js`
- Custom `user-agent` header added to be polite and mitigate rate limiting risk.
- No API key needed in development.

Function: `getCoordinatesForLocation(locationName)` in `services/geo/geocodingService.js`
- Normalizes input (trim + lowercase for cache key)
- Query pattern: `<raw user string>, Assam, India`
- Returns `{ latitude, longitude }` or throws if no results.
- Simple in-memory cache (`Map`) avoids repeated lookups for identical names during a single process lifetime.

Potential Improvements:
- Add disk/Redis cache.
- Fuzzy match scoring / fallback queries (e.g., if user enters partial names).
- Rate-limit & retry logic.

---
## 5. Safety Scoring Logic
Implemented in `services/itineraryService.js`:
- Score starts at 100.
- For each location inside a risk zone polygon:
  - Deduct `risk_level * 2`.
  - If zone is `is_restricted`, deduct flat 50 instead (or in addition? Currently instead, as implemented by using conditional 50 OR risk-based deduction; can refine later).
- Minimum score floored at 0.

Point-In-Polygon: `utils/geo.js` uses ray-casting algorithm over an array of `{ lat, lon }` vertices.

Risk Zones Source: `data/riskZones.json` (temporary manual seed). Structure:
```json
[
  {
    "id": 1,
    "zone_name": "Sample Landslide Area",
    "risk_level": 7,
    "is_restricted": false,
    "polygon": [ { "lat": 26.7000, "lon": 93.3000 }, ... ]
  }
]
```

---
## 6. Persistence (Temporary JSON Layer)
Utilities: `utils/jsonDb.js`
Files:
- `data/itineraries.json` (append-only list of itinerary objects)
- `data/riskZones.json` (manually curated polygons)

Write Strategy:
- Read full file, push new record, write entire file (sufficient for prototype; not for scale).
- Generates incremental numeric `id`.

Migration Path:
- Map to Prisma model `itinerary` (already exists) with `details` JSON for `locations` or create normalized child table.
- Move riskZones to `geofenced_zone` (with geometry) and compute safety using PostGIS `ST_Contains`.

---
## 7. Files Added / Modified (Feature Scope)
- `config/geocoder.js` – Geocoder initialization.
- `services/geo/geocodingService.js` – Geocoding + cache.
- `services/itineraryService.js` – Validation, geocoding loop, safety score, persistence.
- `controllers/itineraryController.js` – Express controller exposing POST handler.
- `routes/index.js` – Added `router.post('/itineraries', ...)`.
- `utils/geo.js` – Point-in-polygon.
- `utils/jsonDb.js` – Simple JSON persistence.
- `data/riskZones.json` – Sample polygon zones.
- `data/itineraries.json` – Storage file.
- `README.md` / `update.md` – Documentation (this file + summary in README).

---
## 8. Error Handling & Edge Cases
Current Handling:
- Missing required fields -> thrown validation error -> 400 response.
- Empty geocode results -> 400 with explicit location name.
- JSON write failure -> surfaces as 400 (could be improved to 500).
Not Yet Covered:
- Duplicate day numbers.
- Overlapping zones (deductions stack; may want max per location cap).
- Timezone or date validation.
- Large itineraries (no batching / concurrency control yet).

---
## 9. Security & Rate Limit Considerations
- OpenStreetMap Nominatim usage guidelines require identifiable User-Agent (added).
- No API key or auth for this prototype endpoint (should add auth later).
- Input not sanitized beyond structural checks (potential for extremely large payloads -> simple size guard recommended later).

---
## 10. Planned Next Steps (Recommended)
| Priority | Item | Rationale |
|----------|------|-----------|
| High | Migrate risk zone & itinerary storage to PostgreSQL/PostGIS | Durable and query-efficient |
| High | Add GET /api/itineraries | Allow clients to list created itineraries |
| Medium | Introduce validation library (e.g., Zod) | Better error clarity & security |
| Medium | TTL / persistent cache for geocodes | Performance & provider friendliness |
| Medium | Batch geocode with concurrency cap | Avoid rate spikes |
| Low | Add tests (unit+integration) | Reliability & regression prevention |
| Low | Polygon edge-case handling | Numerical stability improvements |

---
## 11. Quick Test Command (Node One-Liner)
```bash
node -e "fetch('http://localhost:3000/api/itineraries',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({trip_name:'Quick Test',start_date:'2025-10-01',end_date:'2025-10-02',days:[{day:1,date:'2025-10-01',locations:[{name:'Kaziranga National Park'}]}]})}).then(r=>r.text()).then(t=>console.log(t))"
```
(Use this instead of raw PowerShell curl syntax to avoid quoting issues.)

---
## 12. Known Limitations
- No idempotency: re-sending identical itineraries creates duplicates.
- No pagination or retrieval endpoint yet.
- Safety scoring is simplistic (binary inclusion, linear deductions).
- Single-process in-memory cache lost on restart; no persistence.
- No logging abstraction (console only).

---
## 13. Rollback Strategy
Since changes are additive:
1. Remove itinerary-related route line from `routes/index.js`.
2. Delete added service/controller/util/data files.
3. Remove `node-geocoder` dependency if unused elsewhere.
4. Clean docs (README/update entries).

---
## 14. Glossary
- Geocoding: Converting place names to coordinates.
- Risk Zone: Polygon area with assigned risk level or restriction.
- Safety Score: Heuristic 0–100 indicator after deductions.

---
## 15. Contact / Ownership
Temporary Owner: (Add maintainer name/email here)
Escalation: Convert to DB-backed implementation before production.

---
End of update.
