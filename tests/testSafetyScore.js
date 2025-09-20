// testSafetyScore.js
const { calculateSafetyScore } = require("../services/locationService.js");

async function runTest() {
  console.log("--- Starting Safety Score Test ---");

  // Sample geocoded itinerary details
  const sampleGeocodedDetails = {
    days: [
      {
        day: 1,
        location: "Paris, France",
        latitude: 48.8566,
        longitude: 2.3522,
        notes: "Near military base",
      }, // Within 2km of Military Base Alpha -> geofenced -> score 0
      {
        day: 2,
        location: "New York, USA",
        latitude: 40.7128,
        longitude: -74.006,
        notes: "Crime zone",
      }, // Within 1.5km of Downtown Crime Zone -> -40
      {
        day: 3,
        location: "Eiffel Tower, Paris",
        latitude: 48.8584,
        longitude: 2.2945,
        notes: "Low-risk area",
      }, // Within 0.5km of Eiffel Tower Area -> -10
      {
        day: 4,
        location: "Safe Place",
        latitude: 50.0,
        longitude: 10.0,
        notes: "No zones",
      }, // No overlap -> 100
    ],
  };

  console.log("\nSample Geocoded Details:");
  console.log(JSON.stringify(sampleGeocodedDetails, null, 2));

  const safetyScore = await calculateSafetyScore(sampleGeocodedDetails);

  console.log("\n--- Safety Score Calculation Complete ---");
  console.log(`Final Safety Score: ${safetyScore.totalScore}`);
  console.log("Breakdown:", JSON.stringify(safetyScore.breakdown, null, 2));
  console.log("Summary:", JSON.stringify(safetyScore.summary, null, 2));

  // Expected: Around 63 due to geofenced day averaging down.
  if (safetyScore.totalScore === 63) {
    console.log("\n✅ Test Result: SUCCESS - Score and breakdown correct.");
  } else {
    console.log("\n❌ Test Result: FAILED - Expected 63.");
  }
  const safeDetails = {
    days: [
      {
        day: 1,
        location: "Safe Place 1",
        latitude: 50.0,
        longitude: 10.0,
      }, // 100
      { day: 2, location: "Safe Place 2", latitude: 51.0, longitude: 11.0 }, // 100
    ],
  };

  const safeScore = await calculateSafetyScore(safeDetails);
  console.log(`Safe Itinerary Score: ${safeScore.totalScore}`); // Expected: 100

  // Test risk itinerary
  const riskDetails = {
    days: [
      { day: 1, location: "NYC Crime", latitude: 40.7128, longitude: -74.006 }, // -40 -> 60
    ],
  };

  const riskScore = await calculateSafetyScore(riskDetails);
  console.log(`Risk Itinerary Score: ${riskScore.totalScore}`); // Expected: 60

  // Test geofenced
  const geoDetails = {
    days: [
      { day: 1, location: "Military", latitude: 48.8566, longitude: 2.3522 }, // 0
    ],
  };

  const geoScore = await calculateSafetyScore(geoDetails);
  console.log(`Geofenced Itinerary Score: ${geoScore.totalScore}`); // Expected: 0
}

runTest();
