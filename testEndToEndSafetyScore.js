// testEndToEndSafetyScore.js
// Educational test: End-to-end safety score workflow
// This teaches: DB insertion -> Fetching -> Itinerary matching -> Scoring

const { Sequelize } = require('sequelize');
const db = require('./models/index.js');
const { Zone, Tourist } = db;
const { calculateSafetyScore } = require('./services/locationService.js');

// Step 1: Connect to DB and insert dummy zones (simulating police creation)
async function insertDummyZones() {
  console.log("Step 1: Inserting dummy zones into DB (like police would do)...");
  // These are the same dummy zones from before
  const dummyZones = [
    { name: 'Boston Harbor Zone', lat: 42.3601, lng: -71.0589, radius: 1.0, type: 'highRisk', penalty_bonus: -50 },
    { name: 'Philadelphia Downtown', lat: 39.9526, lng: -75.1652, radius: 0.8, type: 'lowRisk', penalty_bonus: -15 },
    { name: 'Manhattan Military Base', lat: 40.7589, lng: -73.9851, radius: 2.5, type: 'geofenced', penalty_bonus: 0 },
    { name: 'Albany Safe Area', lat: 42.6526, lng: -73.7562, radius: 1.2, type: 'lowRisk', penalty_bonus: -5 },
  ];

  for (const zone of dummyZones) {
    await Zone.create(zone); // Inserts into DB
    console.log(`Inserted zone: ${zone.name} (${zone.type})`);
  }
  console.log("Dummy zones inserted successfully!\n");
}

// Step 2: Simulate user itinerary with locations that match zones
function createMatchingItinerary() {
  console.log("Step 2: Creating user itinerary with locations that match dummy zones...");
  const itinerary = {
    days: [
      { day: 1, location: 'Boston, MA', latitude: 42.3601, longitude: -71.0589 }, // Matches Boston Harbor (highRisk)
            { day: 2, location: 'New York City, NY', latitude: 40.7500, longitude: -73.9900 }, // Matches Manhattan Military Base (geofenced)
      { day: 3, location: 'Philadelphia, PA', latitude: 39.9526, longitude: -75.1652 }, // Matches Philadelphia Downtown (lowRisk)
      { day: 4, location: 'Albany, NY', latitude: 42.6526, longitude: -73.7562 }, // Matches Albany Safe (lowRisk)
      { day: 5, location: 'Safe Town', latitude: 45.0, longitude: -90.0 }, // No match - safe
    ],
  };
  console.log("Itinerary created with 4/5 days matching zones (Day 2 now matches geofenced).\n");
  return itinerary;
}

// Step 3: Fetch zones from DB and calculate score
async function calculateAndVerify(itinerary) {
  console.log("Step 3: Fetching zones from DB and calculating safety score...");

  // Fetch all zones (simulates what the service does)
  const zones = await Zone.findAll();
  console.log(`Fetched ${zones.length} zones from DB.`);

  // Calculate score
  const result = await calculateSafetyScore(itinerary);
  console.log(`Calculated total score: ${result.totalScore}`);
  console.log("Breakdown:");
  result.breakdown.forEach(day => {
    console.log(`  Day ${day.day} (${day.location}): Score ${day.dayScore}`);
    if (day.triggeredZones.length > 0) {
      day.triggeredZones.forEach(z => console.log(`    - Triggered: ${z.zoneName} (${z.effect})`));
    } else {
      console.log("    - No zones triggered");
    }
  });
  console.log("\n");

  return result;
}

// Step 4: Verify matches (educational assertions)
function verifyResults(result) {
  console.log("Step 4: Verifying that itinerary locations matched zones correctly...");

  const expectations = [
    { day: 1, expectedScore: 50, reason: "Boston Harbor highRisk (-50)" },
    { day: 2, expectedScore: 0, reason: "NYC geofenced (overrides to 0)" },
    { day: 3, expectedScore: 85, reason: "Philadelphia lowRisk (-15)" },
    { day: 4, expectedScore: 95, reason: "Albany lowRisk (-5)" },
    { day: 5, expectedScore: 100, reason: "No zones" },
  ];

  let allCorrect = true;
  result.breakdown.forEach((day, index) => {
    const exp = expectations[index];
    if (day.dayScore === exp.expectedScore) {
      console.log(`✅ Day ${day.day}: Correct (${exp.reason})`);
    } else {
      console.log(`❌ Day ${day.day}: Expected ${exp.expectedScore}, got ${day.dayScore}`);
      allCorrect = false;
    }
  });

  if (allCorrect) {
    console.log("\n🎉 All matches verified! Data flows correctly: DB -> Fetch -> Match -> Score.");
  } else {
    console.log("\n⚠️ Some mismatches – check zone data or calculations.");
  }

  return allCorrect;
}

// Step 5: Cleanup (optional)
async function cleanup() {
  console.log("Step 5: Cleaning up dummy zones...");
  await Zone.destroy({ where: { name: ['Boston Harbor Zone', 'Philadelphia Downtown', 'Manhattan Military Base', 'Albany Safe Area'] } });
  console.log("Dummy zones removed.\n");
}

// Main test runner
async function runEndToEndTest() {
  try {
    console.log("=== End-to-End Safety Score Test: Learning the Workflow ===\n");

    await insertDummyZones();
    const itinerary = createMatchingItinerary();
    const result = await calculateAndVerify(itinerary);
    const success = verifyResults(result);
    await cleanup();

    console.log("=== Test Complete ===");
    if (success) {
      console.log("✅ Workflow works: Police add zones -> User adds itinerary -> System matches & scores.");
    } else {
      console.log("❌ Issues found – review DB or logic.");
    }
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    await db.sequelize.close(); // Close DB connection
  }
}

// Run the test
runEndToEndTest();