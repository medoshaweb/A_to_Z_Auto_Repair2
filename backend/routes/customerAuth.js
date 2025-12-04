const express = require("express");
const router = express.Router();
const customerAuthController = require("../controllers/customerAuthController");

// Customer registration
router.post("/register", customerAuthController.register);

// Customer login
router.post("/login", customerAuthController.login);

// Forgot password - Request reset
router.post("/forgot-password", customerAuthController.forgotPassword);

// Reset password with token
router.post("/reset-password", customerAuthController.resetPassword);

// Forgot username
router.post("/forgot-username", customerAuthController.forgotUsername);

// Get current customer (protected route)
router.get("/me", customerAuthController.getMe);

module.exports = router;
