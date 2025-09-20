const { Zone } = require("../models");
const haversine = require("haversine-distance");

// Calculate safety score based on circular zones
async function calculateSafetyScore(geocodedDetails) {
  try {
    const zones = await Zone.findAll();
    if (!Array.isArray(zones))
      throw new Error("Invalid zones data from database");

    let totalScore = 0;
    let dayCount = 0;
    const days = geocodedDetails.days || [];
    const breakdown = [];
    const geofencedDays = [];
    const highRiskRegions = [];
    const lowRiskRegions = [];

    for (const day of days) {
      if (!day.latitude || !day.longitude) continue; // Skip invalid geocodes
      let dayScore = 100;
      let hasGeofenced = false;
      const triggeredZones = [];

      for (const zone of zones) {
        const distance = haversine(
          { lat: day.latitude, lng: day.longitude },
          { lat: zone.lat, lng: zone.lng }
        );
        if (distance <= zone.radius * 1000) {
          // Convert km to meters
          if (zone.type === "geofenced") {
            hasGeofenced = true;
            triggeredZones.push({
              zoneName: zone.name,
              type: zone.type,
              effect: "Score set to 0 (geofenced area)",
            });
            geofencedDays.push({
              day: day.day,
              location: day.location,
              zone: zone.name,
            });
            break; // Immediate override
          } else if (zone.type === "highRisk") {
            dayScore += zone.penalty_bonus; // e.g., -40
            triggeredZones.push({
              zoneName: zone.name,
              type: zone.type,
              effect: `Penalty ${zone.penalty_bonus} (high-risk area)`,
            });
            highRiskRegions.push({
              day: day.day,
              location: day.location,
              zone: zone.name,
            });
          } else if (zone.type === "lowRisk") {
            dayScore += zone.penalty_bonus; // e.g., -10
            triggeredZones.push({
              zoneName: zone.name,
              type: zone.type,
              effect: `Penalty ${zone.penalty_bonus} (low-risk area)`,
            });
            lowRiskRegions.push({
              day: day.day,
              location: day.location,
              zone: zone.name,
            });
          }
        }
      }

      if (hasGeofenced) dayScore = 0;
      dayScore = Math.max(0, Math.min(100, dayScore)); // Clamp
      totalScore += dayScore;
      dayCount++;

      breakdown.push({
        day: day.day,
        location: day.location,
        latitude: day.latitude,
        longitude: day.longitude,
        triggeredZones,
        dayScore,
        isGeofenced: hasGeofenced,
      });
    }

    const finalScore = dayCount > 0 ? Math.round(totalScore / dayCount) : 100;
    console.log(`Calculated safety score: ${finalScore}`);

    return {
      totalScore: finalScore,
      breakdown,
      summary: {
        geofencedDays,
        highRiskRegions,
        lowRiskRegions,
      },
    };
  } catch (error) {
    console.error("Error calculating safety score:", error);
    return {
      totalScore: 100,
      breakdown: [],
      summary: { geofencedDays: [], highRiskRegions: [], lowRiskRegions: [] },
    }; // Fallback
  }
}

module.exports = {
  calculateSafetyScore,
};
