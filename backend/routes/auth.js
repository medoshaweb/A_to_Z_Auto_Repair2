const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Login route
router.post("/login", authController.login);

// Register route
router.post("/register", authController.register);

// Forgot password - Request reset
router.post("/forgot-password", authController.forgotPassword);

// Reset password with token
router.post("/reset-password", authController.resetPassword);

// Forgot username
router.post("/forgot-username", authController.forgotUsername);

// Get current user (protected route)
router.get("/me", authController.getMe);

module.exports = router;
