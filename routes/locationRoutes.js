// Express router for location pings

import express from "express";
import LocationController from "../controllers/locationController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/ping", auth, LocationController.handleLocationPing);

export default router;
