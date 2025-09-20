const { Router } = require("express");
const authController = require("../controllers/authController.js");
const authenticateToken = require("../middleware/auth.js");
const registerationController = require("../controllers/registrationController.js");

const router = Router();

router.post(
  "/register/tourist",
  authenticateToken,
  registerationController.registerTourist
);
router.post("/login", authController.login);
router.post("/reset-password", authController.resetPassword);
router.post("/logout", authController.logout);
router.get("/profile", authenticateToken, authController.getProfile);
router.get(
  "/safety-details/:touristId",
  authenticateToken,
  authController.getSafetyDetails
);

module.exports = router;
