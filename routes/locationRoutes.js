const { Router } = require("express");
const {
  addLocation,
  getLastLocation,
} = require("../controllers/locationController");

const router = Router();

// Route to add a new location for a tourist
router.post("/", addLocation);

// Route to get the last known location of a tourist
router.get("/:touristId", getLastLocation);

module.exports = router;