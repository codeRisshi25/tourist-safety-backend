// Express router for emergency activation

import express from "express";
import EmergencyController from "../controllers/emergencyController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/activate", auth, EmergencyController.activateEmergency);

export default router;
