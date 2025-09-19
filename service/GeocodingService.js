const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.GEOAPIFY_API_KEY;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function geocodeItineraryDetails(details) {
    if (!API_KEY) {
        console.error('Geoapify API key is missing. Skipping geocoding.');
        return details;
    }

    if (!details || !Array.isArray(details.days) || details.days.length === 0) {
        return details;
    }

    const locationsToGeocode = [...new Set(details.days.map(day => day.location).filter(Boolean))];

    if (locationsToGeocode.length === 0) {
        return details;
    }

    try {
        const jobResponse = await axios.post(
            `https://api.geoapify.com/v1/batch/geocode/search?apiKey=${API_KEY}`,
            locationsToGeocode
        );

        const statusUrl = jobResponse.data.url;
        if (!statusUrl) {
            throw new Error('Failed to initiate batch geocoding job.');
        }

        let results = null;
        const maxAttempts = 10;
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            await delay(1000);

            const statusResponse = await axios.get(statusUrl);

            if (statusResponse.status === 200) {
                results = statusResponse.data;
                break;
            }
        }

        if (!results) {
            throw new Error('Geocoding job timed out or failed to complete.');
        }

        const locationMap = new Map();
        results.forEach((result, index) => {
            const originalLocation = locationsToGeocode[index];
            if (result && result.lon && result.lat) {
                locationMap.set(originalLocation, {
                    longitude: result.lon,
                    latitude: result.lat,
                });
            } else {
                console.warn(`Geocoding could not find coordinates for: ${originalLocation}`);
            }
        });

        const geocodedDays = details.days.map(day => {
            if (locationMap.has(day.location)) {
                return { ...day, ...locationMap.get(day.location) };
            }
            return day;
        });

        return { ...details, days: geocodedDays };

    } catch (error) {
        const errorMessage = error.response ? JSON.stringify(error.response.data) : error.message;
        console.error(`Batch geocoding process failed. Reason: ${errorMessage}`);
        return details;
    }
}

module.exports = { geocodeItineraryDetails };
