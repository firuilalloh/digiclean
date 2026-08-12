const express = require("express");
const router = express.Router();
const {
  ClerkExpressRequireAuth,
  clerkClient,
} = require("@clerk/clerk-sdk-node");
const { scanUserServices } = require("../../utils/GmailScanner");

router.get("/scan-email", ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;

    // Ambil OAuth Token dari Clerk
    const response = await clerkClient.users.getUserOauthAccessToken(
      userId,
      "oauth_google",
    );

    // Ambil array datanya (Clerk Node SDK kadang me-return { data: [...] } atau array langsung)
    const tokens = Array.isArray(response) ? response : response?.data || [];

    if (!tokens || tokens.length === 0) {
      return res.status(400).json({
        success: false,
        error:
          "Akses Google Token tidak ditemukan. Coba logout dan login kembali via Google.",
      });
    }

    // Ambil token dari item pertama
    const googleToken = tokens[0]?.token;

    if (!googleToken) {
      return res.status(400).json({
        success: false,
        error: "Token OAuth Google kosong atau expired. Silakan login ulang.",
      });
    }

    // Jalankan Gmail Scanner
    const detectedServices = await scanUserServices(googleToken);

    return res.json({
      success: true,
      totalDetected: detectedServices.length,
      data: detectedServices,
    });
  } catch (error) {
    console.error("Scan Endpoint Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Internal Server Error",
    });
  }
});

module.exports = router;
