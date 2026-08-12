const { ClerkExpressRequireAuth } = require("@clerk/clerk-sdk-node");
const ApiResponse = require("../utils/apiResponse");

// Middleware untuk memvalidasi JWT token Clerk dari header request
const requireAuth = ClerkExpressRequireAuth({
  onError: (err, req, res) => {
    return ApiResponse.error(
      res,
      "Unauthorized: Anda harus login terlebih dahulu untuk mengakses fitur ini.",
      401,
    );
  },
});

module.exports = { requireAuth };
