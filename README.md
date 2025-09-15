## Tourist Safety Backend (Prototype Phase)

Implements itinerary creation with geocoding (OpenStreetMap via node-geocoder) and safety score calculation against JSON-defined risk zones.

### Current Features
* POST /api/itineraries: Accepts trip itinerary, geocodes each location constrained to Assam, India, computes safety_score, persists to JSON.

### Temporary JSON Storage
* data/itineraries.json – stored itineraries
* data/riskZones.json – polygon risk zones (lat/lon points, risk_level, is_restricted)

### Safety Score Logic
* Start 100; subtract risk_level * 2 when inside a zone; subtract 50 if restricted; min 0.

### Request Body Example
```json
{
  "trip_name": "Meghalaya Adventure",
  "start_date": "2025-10-20",
  "end_date": "2025-10-25",
  "days": [
    {"day":1,"date":"2025-10-20","locations":[{"name":"Umiam Lake"}]}
  ]
}
```

### Next Steps
Migrate JSON storage to Prisma/Postgres with PostGIS geometry for zones and points.
## Tourist Safety Backend (Prototype Phase)

Implements itinerary creation with geocoding (OpenStreetMap via node-geocoder) and safety score calculation against JSON-defined risk zones.

### Current Features
* POST /api/itineraries: Accepts trip itinerary, geocodes each location constrained to Assam, India, computes safety_score, persists to JSON.

### Data Storage (Temporary JSON DB)
* data/itineraries.json – stored itineraries
* data/riskZones.json – polygon risk zones (lat/lon points, risk_level, is_restricted)

### Safety Score Logic
* Start 100
* For each location inside a zone: - risk_level * 2
* If is_restricted: -50
* Floor at 0

### Request Body Example
```json
{
  "trip_name": "Meghalaya Adventure",
  "start_date": "2025-10-20",
  "end_date": "2025-10-25",
  "days": [
    {
      "day": 1,
      "date": "2025-10-20",
      "locations": [
        { "name": "Umiam Lake" },
        { "name": "Shillong City Center" }
      ]
    },
    {
      "day": 2,
      "date": "2025-10-21",
      "locations": [
        { "name": "Laitlum Canyons" },
        { "name": "Elephant Falls" }
      ]
    }
  ]
}
```

### Response Example (201)
```json
{
  "success": true,
  "itinerary": {
    "id": 1,
    "trip_name": "Meghalaya Adventure",
    "start_date": "2025-10-20",
    "end_date": "2025-10-25",
    "safety_score": 84,
    "locations": [
      { "day": 1, "name": "Umiam Lake", "latitude": 25.675, "longitude": 91.893 },
      { "day": 1, "name": "Shillong City Center", "latitude": 25.575, "longitude": 91.883 }
    ]
  }
}
```

### Setup
1. Install Node.js (if npm not found):
   * winget install OpenJS.NodeJS.LTS
   * Restart terminal
2. Install deps: `npm install`
3. Run dev: `node app.js` (or add nodemon: `npm install -D nodemon && npm run dev`)

### Testing Quickly (PowerShell)
```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/itineraries -ContentType 'application/json' -Body (@'{
  "trip_name": "Test Trip",
  "start_date": "2025-11-01",
  "end_date": "2025-11-02",
  "days": [
    {"day":1,"date":"2025-11-01","locations":[{"name":"Kaziranga National Park"}]}
  ]
}'@)
```

### Notes / Next Steps
* Replace JSON with PostgreSQL + PostGIS later.
* Add caching layer (Redis) for geocode results.
* Add authentication & validation library (e.g., zod / joi) later.
* Improve polygon algorithm or move to geo DB.
