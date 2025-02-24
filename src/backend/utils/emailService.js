const axios = require("axios");

const sendEmailOTP = async (email, otp) => {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { email: "your-email@domain.com" },
        to: [{ email }],
        subject: "Your OTP Code",
        htmlContent: `<html><body><h3>Your OTP code is ${otp}</h3></body></html>`,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
        },
      }
    );
    console.log("OTP sent:", response.data);
  } catch (error) {
    console.error("Error sending OTP:", error);
  }
};

module.exports = { sendEmailOTP };
