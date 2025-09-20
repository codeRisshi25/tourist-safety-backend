// testSafetyScoreNortheast.js
// Test script for safety score workflow with Northeast itinerary and dummy zones
const { calculateSafetyScore } = require("./services/locationService.js");

// SQL commands to insert dummy zones (run these in your DB before testing)
// These add zones in the Northeast region for testing
/*
INSERT INTO "Zones" (name, lat, lng, radius, type, "penalty_bonus", "createdAt", "updatedAt") VALUES
('Boston Harbor Zone', 42.3601, -71.0589, 1.0, 'highRisk', -50, NOW(), NOW()),
('Philadelphia Downtown', 39.9526, -75.1652, 0.8, 'lowRisk', -15, NOW(), NOW()),
('Manhattan Military Base', 40.7589, -73.9851, 2.5, 'geofenced', 0, NOW(), NOW()),
('Albany Safe Area', 42.6526, -73.7562, 1.2, 'lowRisk', -5, NOW(), NOW());
*/

// Sample geocoded itinerary for Northeast region
// Locations chosen to overlap with dummy zones for testing
const northeastItinerary = {
  days: [
    {
      day: 1,
      location: "Boston, MA",
      latitude: 42.3601,  // Matches Boston Harbor Zone (highRisk, -50)
      longitude: -71.0589,
      notes: "Near harbor - high risk",
    },
    {
      day: 2,
      location: "New York City, NY",
      latitude: 40.7128,  // Matches Downtown Crime Zone (highRisk, -40) and Manhattan Military Base (geofenced)
      longitude: -74.006,
      notes: "Downtown and military area",
    },
    {
      day: 3,
      location: "Philadelphia, PA",
      latitude: 39.9526,  // Matches Philadelphia Downtown (lowRisk, -15)
      longitude: -75.1652,
      notes: "City center - low risk",
    },
    {
      day: 4,
      location: "Albany, NY",
      latitude: 42.6526,  // Matches Albany Safe Area (lowRisk, -5)
      longitude: -73.7562,
      notes: "Capital area - low risk",
    },
    {
      day: 5,
      location: "Portland, ME",
      latitude: 43.6591,  // No zone overlap - safe
      longitude: -70.2568,
      notes: "Coastal town - no known zones",
    },
  ],
};

async function runNortheastTest() {
  console.log("--- Northeast Safety Score Test ---");
  console.log("Itinerary covers Boston, NYC, Philadelphia, Albany, Portland.");
  console.log("Expected overlaps:");
  console.log("- Day 1: Boston Harbor (highRisk, -50) -> dayScore = 50");
  console.log("- Day 2: NYC Crime Zone (highRisk, -40) + Manhattan Military (geofenced) -> dayScore = 0");
  console.log("- Day 3: Philadelphia Downtown (lowRisk, -15) -> dayScore = 85");
  console.log("- Day 4: Albany Safe (lowRisk, -5) -> dayScore = 95");
  console.log("- Day 5: No zones -> dayScore = 100");
  console.log("Expected totalScore: Average of (50+0+85+95+100)/5 = 66");

  const safetyScore = await calculateSafetyScore(northeastItinerary);

  console.log("\n--- Calculation Complete ---");
  console.log(`Total Safety Score: ${safetyScore.totalScore}`);
  console.log("Breakdown:");
  safetyScore.breakdown.forEach(day => {
    console.log(`Day ${day.day} (${day.location}): ${day.dayScore} - ${day.triggeredZones.length} zones triggered`);
    day.triggeredZones.forEach(zone => console.log(`  - ${zone.zoneName}: ${zone.effect}`));
  });
  console.log("Summary:", JSON.stringify(safetyScore.summary, null, 2));

  // Assertions
  const expectedScore = 66;
  if (safetyScore.totalScore === expectedScore) {
    console.log("\n✅ Test PASSED: Score matches expected 66.");
  } else {
    console.log(`\n❌ Test FAILED: Expected 66, got ${safetyScore.totalScore}.`);
  }

  // Check specific days
  const day1Score = safetyScore.breakdown.find(d => d.day === 1).dayScore;
  const day2Geofenced = safetyScore.breakdown.find(d => d.day === 2).isGeofenced;
  if (day1Score === 50 && day2Geofenced) {
    console.log("✅ Day-specific checks PASSED.");
  } else {
    console.log("❌ Day-specific checks FAILED.");
  }
}

runNortheastTest().catch(console.error);