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

// Register controller - ADMIN ONLY
// Creates both a user (for authentication) and an employee (for role management)
const register = async (req, res) => {
  try {
    const { email, password, name, role, first_name, last_name, phone } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Parse name into first_name and last_name if name is provided but first_name/last_name are not
    let firstName = first_name;
    let lastName = last_name;
    if (name && !first_name && !last_name) {
      const nameParts = name.trim().split(/\s+/);
      firstName = nameParts[0] || "";
      lastName = nameParts.slice(1).join(" ") || "";
    }

    // If still no first/last name, use name or require it
    if (!firstName && !lastName) {
      if (name) {
        const nameParts = name.trim().split(/\s+/);
        firstName = nameParts[0] || "";
        lastName = nameParts.slice(1).join(" ") || "";
      }
    }

    if (!firstName || !lastName) {
      return res
        .status(400)
        .json({ message: "First name and last name are required" });
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

    // Check if employee already exists
    const [existingEmployees] = await pool.execute(
      "SELECT * FROM employees WHERE email = ?",
      [email]
    );

    if (existingEmployees.length > 0) {
      return res
        .status(400)
        .json({ message: "Employee with this email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Default role to "Employee" if not specified (Admin can specify Admin, Manager, or Employee)
    const assignedRole = role || "Employee";
    
    // Validate role
    const validRoles = ["Admin", "Manager", "Employee"];
    if (!validRoles.includes(assignedRole)) {
      return res
        .status(400)
        .json({ message: "Invalid role. Must be Admin, Manager, or Employee" });
    }

    // Use transaction to ensure both inserts succeed or both fail
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Insert new user (for authentication)
      const [userResult] = await connection.execute(
        "INSERT INTO users (email, password, name) VALUES (?, ?, ?)",
        [email, hashedPassword, name || `${firstName} ${lastName}`.trim()]
      );

      // Insert new employee (for role management)
      const [employeeResult] = await connection.execute(
        "INSERT INTO employees (email, password, first_name, last_name, phone, role, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          email,
          hashedPassword,
          firstName,
          lastName,
          phone || null,
          assignedRole,
          true, // is_active defaults to true
        ]
      );

      // Commit transaction if both inserts succeed
      await connection.commit();

      res.status(201).json({
        message: "Account created successfully",
        user: {
          id: userResult.insertId,
          email: email,
          name: name || `${firstName} ${lastName}`.trim(),
        },
        employee: {
          id: employeeResult.insertId,
          email: email,
          first_name: firstName,
          last_name: lastName,
          phone: phone || null,
          role: assignedRole,
          is_active: true,
        },
      });
    } catch (dbError) {
      // Rollback transaction if any insert fails
      await connection.rollback();
      console.error("Database error during registration:", dbError);
      throw dbError; // Re-throw to be caught by outer catch
    } finally {
      // Always release the connection
      connection.release();
    }
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
