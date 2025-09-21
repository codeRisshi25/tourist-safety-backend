const twilio = require("twilio");
require("dotenv").config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

const sendWhatsAppMessage = async (to, body) => {
  try {
    const message = await client.messages.create({
      body: body,
      from: '+17175848119',
      to: `${to}`,
    });
    console.log(`Sms sent to ${to}: ${message.sid}`);
    return { success: true, sid: message.sid };
  } catch (error) {
    console.error("Error sending sms:", error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendWhatsAppMessage,
};
