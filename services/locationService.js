const { readJson } = require("../utils/jsonDb.js");
const haversine = require("haversine-distance");

const ZONES_FILE = "zones.json";

// Calculate safety score based on circular zones
function calculateSafetyScore(geocodedDetails) {
  try {
    const zones = readJson(ZONES_FILE) || [];
    if (!Array.isArray(zones)) throw new Error("Invalid zones.json format");

    let totalScore = 0;
    let dayCount = 0;
    const days = geocodedDetails.days || [];

    for (const day of days) {
      if (!day.latitude || !day.longitude) continue; // Skip invalid geocodes
      let dayScore = 100;
      let hasGeofenced = false;

      for (const zone of zones) {
        const distance = haversine(
          { lat: day.latitude, lng: day.longitude },
          { lat: zone.lat, lng: zone.lng }
        );
        if (distance <= zone.radius * 1000) {
          // Convert km to meters
          if (zone.type === "geofenced") {
            hasGeofenced = true;
            break; // Immediate override
          } else if (zone.type === "highRisk") {
            dayScore += zone.penalty_bonus; // e.g., -40
          } else if (zone.type === "touristFriendly") {
            dayScore += zone.penalty_bonus; // e.g., +25
          }
        }
      }

      if (hasGeofenced) dayScore = 0;
      dayScore = Math.max(0, Math.min(100, dayScore)); // Clamp
      totalScore += dayScore;
      dayCount++;
    }

    const finalScore = dayCount > 0 ? Math.round(totalScore / dayCount) : 100;
    console.log(`Calculated safety score: ${finalScore}`);
    return finalScore;
  } catch (error) {
    console.error("Error calculating safety score:", error);
    return 100; // Fallback
  }
}

module.exports = {
  calculateSafetyScore,
};
