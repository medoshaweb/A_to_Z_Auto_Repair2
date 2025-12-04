const pool = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Customer registration controller
const register = async (req, res) => {
  try {
    const { email, password, first_name, last_name, phone } = req.body;

    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({
        message: "Email, password, first name, and last name are required",
      });
    }

    // Check if customer already exists
    const [existing] = await pool.execute(
      "SELECT * FROM customers WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        message: "An account with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new customer
    const [result] = await pool.execute(
      "INSERT INTO customers (email, password, first_name, last_name, phone, is_active) VALUES (?, ?, ?, ?, ?, ?)",
      [email, hashedPassword, first_name, last_name, phone || null, true]
    );

    // Get the new customer
    const [newCustomer] = await pool.execute(
      "SELECT id, email, first_name, last_name, phone FROM customers WHERE id = ?",
      [result.insertId]
    );

    // Generate JWT token
    const token = jwt.sign(
      {
        customerId: newCustomer[0].id,
        email: email,
        role: "customer",
      },
      process.env.JWT_SECRET || "your_jwt_secret_key_here",
      { expiresIn: "30d" }
    );

    res.status(201).json({
      message: "Account created successfully",
      token,
      customer: newCustomer[0],
    });
  } catch (error) {
    console.error("Customer registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// Customer login controller
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Find customer by email
    const [customers] = await pool.execute(
      "SELECT * FROM customers WHERE email = ?",
      [email]
    );

    if (customers.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const customer = customers[0];

    // Check if customer has a password (account exists)
    if (!customer.password) {
      return res.status(401).json({
        message: "No account found. Please register first.",
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, customer.password);
    if (!isValidPassword) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Check if customer is active
    if (!customer.is_active) {
      return res.status(403).json({
        message: "Your account has been deactivated. Please contact support.",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        customerId: customer.id,
        email: customer.email,
        role: "customer",
      },
      process.env.JWT_SECRET || "your_jwt_secret_key_here",
      { expiresIn: "30d" }
    );

    res.json({
      message: "Login successful",
      token,
      customer: {
        id: customer.id,
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name,
        phone: customer.phone,
      },
    });
  } catch (error) {
    console.error("Customer login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// Forgot password controller
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find customer by email
    const [customers] = await pool.execute(
      "SELECT * FROM customers WHERE email = ?",
      [email]
    );

    if (customers.length === 0) {
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
      "UPDATE customers SET reset_token = ?, reset_token_expires = ? WHERE email = ?",
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

    // Find customer with valid reset token
    const [customers] = await pool.execute(
      "SELECT * FROM customers WHERE reset_token = ? AND reset_token_expires > NOW()",
      [token]
    );

    if (customers.length === 0) {
      return res.status(400).json({
        message: "Invalid or expired reset token",
      });
    }

    const customer = customers[0];

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await pool.execute(
      "UPDATE customers SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?",
      [hashedPassword, customer.id]
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

    // Check if customer exists
    const [customers] = await pool.execute(
      "SELECT email, first_name FROM customers WHERE email = ?",
      [email]
    );

    if (customers.length === 0) {
      // Don't reveal if email exists
      return res.json({
        message:
          "If an account exists with this email, your username (email) has been sent.",
        email: null,
      });
    }

    res.json({
      message: "Your username (email) is:",
      email: customers[0].email,
      firstName: customers[0].first_name,
    });
  } catch (error) {
    console.error("Forgot username error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get current customer controller
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

    if (decoded.role !== "customer") {
      return res.status(403).json({ message: "Invalid token type" });
    }

    const [customers] = await pool.execute(
      "SELECT id, email, first_name, last_name, phone, is_active, created_at FROM customers WHERE id = ?",
      [decoded.customerId]
    );

    if (customers.length === 0) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json({ customer: customers[0] });
  } catch (error) {
    console.error("Get customer error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  forgotUsername,
  getMe,
};
