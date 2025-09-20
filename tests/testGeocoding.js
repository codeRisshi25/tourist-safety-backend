// testGeocoding.js
const { geocodeItineraryDetails } = require('../service/GeocodingService.js');

async function runTest() {
  console.log('--- Starting Geocoding Test ---');

  const sampleItineraryDetails = {
    days: [
      { day: 1, location: 'Paris, France', notes: 'Eiffel Tower' },
      { day: 2, location: 'Tokyo, Japan', notes: 'Shibuya Crossing' },
      { day: 3, location: 'InvalidLocation12345', notes: 'This should fail gracefully' },
      { day: 4, location: 'Sydney, Australia', notes: 'Opera House' },
    ],
  };

  console.log('\nOriginal Itinerary Details:');
  console.log(JSON.stringify(sampleItineraryDetails, null, 2));

  const geocodedDetails = await geocodeItineraryDetails(sampleItineraryDetails);

  console.log('\n--- Geocoding Complete ---');
  console.log('\nGeocoded Itinerary Details:');
  console.log(JSON.stringify(geocodedDetails, null, 2));

  // Final check
  if (geocodedDetails.days.some(day => day.latitude)) {
    console.log('\n✅ Test Result: SUCCESS - Geocoding added latitude/longitude data.');
  } else {
    console.log('\n❌ Test Result: FAILED - No latitude/longitude data was added. Check API key and service logs.');
  }
}

runTest();
