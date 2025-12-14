const pool = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Login controller
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Find user by email
    const [users] = await pool.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Try to look up matching employee to capture role (default to Admin)
    let role = "Admin";
    try {
      const [employeeRows] = await pool.execute(
        "SELECT id, role FROM employees WHERE email = ? LIMIT 1",
        [email]
      );
      if (employeeRows.length > 0) {
        role = employeeRows[0].role || "Admin";
      }
    } catch (lookupError) {
      console.warn("Employee role lookup failed, defaulting to Admin", lookupError);
    }

    // Normalize role: capitalize first letter, lowercase the rest
    if (typeof role === "string" && role.trim()) {
      const trimmedRole = role.trim();
      role = trimmedRole.charAt(0).toUpperCase() + trimmedRole.slice(1).toLowerCase();
    } else {
      role = "Admin"; // Default to Admin if role is invalid
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role },
      process.env.JWT_SECRET || "your_jwt_secret_key_here",
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// Register controller
const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const [result] = await pool.execute(
      "INSERT INTO users (email, password, name) VALUES (?, ?, ?)",
      [email, hashedPassword, name || null]
    );

    const role = "Admin"; // default role for new admin users

    // Generate JWT token
    const token = jwt.sign(
      { userId: result.insertId, email: email, role },
      process.env.JWT_SECRET || "your_jwt_secret_key_here",
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: result.insertId,
        email: email,
        name: name || null,
        role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// Forgot password controller
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find user by email
    const [users] = await pool.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (users.length === 0) {
      // Don't reveal if email exists for security
      return res.json({
        message:
          "If an account exists with this email, a password reset token has been generated.",
        token: null,
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token to database
    await pool.execute(
      "UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?",
      [resetToken, resetTokenExpires, email]
    );

    // In production, send email with reset token
    // For now, return token to display (remove in production!)
    res.json({
      message: "Password reset token generated. Please check your email.",
      resetToken: resetToken, // REMOVE THIS IN PRODUCTION - send via email instead
      expiresIn: "1 hour",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Reset password controller
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        message: "Reset token and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    // Find user with valid reset token
    const [users] = await pool.execute(
      "SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()",
      [token]
    );

    if (users.length === 0) {
      return res.status(400).json({
        message: "Invalid or expired reset token",
      });
    }

    const user = users[0];

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await pool.execute(
      "UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?",
      [hashedPassword, user.id]
    );

    res.json({
      message:
        "Password reset successfully. You can now login with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Forgot username controller
const forgotUsername = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if user exists
    const [users] = await pool.execute(
      "SELECT email FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      // Don't reveal if email exists
      return res.json({
        message:
          "If an account exists with this email, your username (email) has been sent.",
        email: null,
      });
    }

    res.json({
      message: "Your username (email) is:",
      email: users[0].email,
    });
  } catch (error) {
    console.error("Forgot username error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get current user controller
const getMe = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Access token required" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret_key_here"
    );

    const [users] = await pool.execute(
      "SELECT id, email, name, created_at FROM users WHERE id = ?",
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        ...users[0],
        role: decoded.role || "Admin",
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  login,
  register,
  forgotPassword,
  resetPassword,
  forgotUsername,
  getMe,
};
