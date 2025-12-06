const pool = require("../config/database");
const bcrypt = require("bcryptjs");

// Get all employees
const getAllEmployees = async (req, res) => {
  try {
    const [employees] = await pool.execute(
      "SELECT id, email, first_name, last_name, phone, role, is_active, created_at FROM employees ORDER BY created_at DESC"
    );
    res.json({ employees });
  } catch (error) {
    console.error("Get employees error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single employee by ID
const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const [employees] = await pool.execute(
      "SELECT id, email, first_name, last_name, phone, role, is_active, created_at FROM employees WHERE id = ?",
      [id]
    );

    if (employees.length === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json({ employee: employees[0] });
  } catch (error) {
    console.error("Get employee error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create new employee
const createEmployee = async (req, res) => {
  try {
    const { email, password, first_name, last_name, phone, role, is_active } =
      req.body;

    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({
        message: "Email, password, first name, and last name are required",
      });
    }

    // Check if email already exists
    const [existing] = await pool.execute(
      "SELECT * FROM employees WHERE email = ?",
      [email]
    );
    if (existing.length > 0) {
      return res
        .status(400)
        .json({ message: "Employee with this email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      "INSERT INTO employees (email, password, first_name, last_name, phone, role, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        email,
        hashedPassword,
        first_name,
        last_name,
        phone || null,
        role || "Employee",
        is_active !== undefined ? is_active : true,
      ]
    );

    const [newEmployee] = await pool.execute(
      "SELECT id, email, first_name, last_name, phone, role, is_active, created_at FROM employees WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json({
      message: "Employee created successfully",
      employee: newEmployee[0],
    });
  } catch (error) {
    console.error("Create employee error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update employee
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password, first_name, last_name, phone, role, is_active } =
      req.body;

    if (!email || !first_name || !last_name) {
      return res.status(400).json({
        message: "Email, first name, and last name are required",
      });
    }

    // Check if employee exists
    const [existing] = await pool.execute(
      "SELECT * FROM employees WHERE id = ?",
      [id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Check if email is being changed and if new email already exists
    if (email !== existing[0].email) {
      const [emailCheck] = await pool.execute(
        "SELECT * FROM employees WHERE email = ? AND id != ?",
        [email, id]
      );
      if (emailCheck.length > 0) {
        return res
          .status(400)
          .json({ message: "Employee with this email already exists" });
      }
    }

    // Update password only if provided
    let updateQuery;
    let updateParams;

    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery =
        "UPDATE employees SET email = ?, password = ?, first_name = ?, last_name = ?, phone = ?, role = ?, is_active = ? WHERE id = ?";
      updateParams = [
        email,
        hashedPassword,
        first_name,
        last_name,
        phone || null,
        role || existing[0].role,
        is_active !== undefined ? is_active : existing[0].is_active,
        id,
      ];
    } else {
      updateQuery =
        "UPDATE employees SET email = ?, first_name = ?, last_name = ?, phone = ?, role = ?, is_active = ? WHERE id = ?";
      updateParams = [
        email,
        first_name,
        last_name,
        phone || null,
        role || existing[0].role,
        is_active !== undefined ? is_active : existing[0].is_active,
        id,
      ];
    }

    await pool.execute(updateQuery, updateParams);

    const [updated] = await pool.execute(
      "SELECT id, email, first_name, last_name, phone, role, is_active, created_at FROM employees WHERE id = ?",
      [id]
    );

    res.json({
      message: "Employee updated successfully",
      employee: updated[0],
    });
  } catch (error) {
    console.error("Update employee error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete employee
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.execute(
      "SELECT * FROM employees WHERE id = ?",
      [id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    await pool.execute("DELETE FROM employees WHERE id = ?", [id]);

    res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.error("Delete employee error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};

