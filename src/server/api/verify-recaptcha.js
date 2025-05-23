import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { recaptchaResponse } = req.body;


  if (!recaptchaResponse) {
    return res.status(400).json({ error: "reCAPTCHA response is required" });
  }

  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaResponse}`;

    const response = await axios.post(verificationUrl);
    const { success, "error-codes": errorCodes } = response.data;

    if (!success) {
      return res.status(400).json({
        error: "reCAPTCHA verification failed",
        errorCodes,
      });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error verifying reCAPTCHA:", error);
    return res.status(500).json({ error: "Error verifying reCAPTCHA" });
  }
}
