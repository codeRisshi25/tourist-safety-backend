const { Router } = require("express");
const { sendSos } = require("../controllers/sosController");
const authenticateToken = require("../middleware/auth");

const router = Router();

// POST /api/sos
// This route is protected and requires a valid token.
// The tourist ID is extracted from the token in the controller.
router.post("/", authenticateToken, sendSos);

module.exports = router;
