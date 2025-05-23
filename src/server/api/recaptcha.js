import axios from "axios";
import express from "express";

const router = express.Router();

// Route to verify reCAPTCHA
router.post("/verify-recaptcha", async (req, res) => {
  const { recaptchaResponse } = req.body;
  console.log("Received reCAPTCHA Token:", recaptchaResponse);

  // Check if the reCAPTCHA response is present
  if (!recaptchaResponse) {
    return res.status(400).json({ error: "reCAPTCHA response is required" });
  }

  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY; // Your secret key from Google

    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaResponse}`;

    // Send POST request to Google's API to verify the reCAPTCHA
    const response = await axios.post(verificationUrl);

    // Check if the verification was successful
    const { success, "error-codes": errorCodes } = response.data;

    if (!success) {
      return res.status(400).json({
        error: "reCAPTCHA verification failed",
        errorCodes,
      });
    }

    // If successful, continue with your business logic (e.g., booking, email confirmation)
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error verifying reCAPTCHA:", error);
    res.status(500).json({ error: "Error verifying reCAPTCHA" });
  }
});

export default router;
