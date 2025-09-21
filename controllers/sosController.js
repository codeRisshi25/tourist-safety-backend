const { Tourist } = require("../models");
const { sendWhatsAppMessage } = require("../services/twilioService");

const sendSos = async (req, res) => {
  // It's better to get the touristId from the authenticated user session
  // to prevent users from triggering SOS for others.
  // Assuming auth middleware adds user to req.
  const touristId = req.user.id; 

  if (!touristId) {
    return res.status(400).json({ error: "Tourist ID is required." });
  }

  try {
    const tourist = await Tourist.findByPk(touristId);

    if (!tourist) {
      return res.status(404).json({ error: "Tourist not found." });
    }

    if (!tourist.emergencyContact) {
      return res
        .status(400)
        .json({ error: "Emergency contact not found for this tourist." });
    }

    // Update tourist status to 'distress'
    await tourist.update({ safetyStatus: 'distress' });

    const messageBody = `Emergency SOS from ${tourist.name}. View their details and last known location here: http://10.12.33.56:5173/?touristId=${tourist.id}`;

    // The emergency contact number must be in E.164 format (e.g., +14155238886)
    // And the user must have opted-in to receive messages from your Twilio number
    const result = await sendWhatsAppMessage(
      tourist.emergencyContact,
      messageBody
    );

    if (result.success) {
      res.status(200).json({ message: "SOS message sent successfully." });
    } else {
      res
        .status(500)
        .json({ error: "Failed to send SOS message.", details: result.error });
    }
  } catch (error) {
    console.error("Error in SOS controller:", error);
    res.status(500).json({ error: "An internal server error occurred." });
  }
};

module.exports = {
  sendSos,
};
