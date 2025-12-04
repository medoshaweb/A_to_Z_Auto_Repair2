const express = require("express");
const router = express.Router();
const pool = require("../config/database");
const authenticateCustomer = require("../middleware/customerAuth");

// Get all customers with search and pagination
router.get("/", async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = "SELECT * FROM customers";
    let countQuery = "SELECT COUNT(*) as total FROM customers";
    const params = [];

    if (search) {
      query += ` WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone LIKE ?`;
      countQuery += ` WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone LIKE ?`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;

    const [customers] = await pool.execute(query, [
      ...params,
      parseInt(limit),
      parseInt(offset),
    ]);
    const [countResult] = await pool.execute(countQuery, params);
    const total = countResult[0].total;

    res.json({
      customers,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get customers error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single customer by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [customers] = await pool.execute(
      "SELECT * FROM customers WHERE id = ?",
      [id]
    );

    if (customers.length === 0) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json({ customer: customers[0] });
  } catch (error) {
    console.error("Get customer error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create new customer
router.post("/", async (req, res) => {
  try {
    const { email, first_name, last_name, phone, is_active } = req.body;

    if (!email || !first_name || !last_name) {
      return res
        .status(400)
        .json({ message: "Email, first name, and last name are required" });
    }

    // Check if email already exists
    const [existing] = await pool.execute(
      "SELECT * FROM customers WHERE email = ?",
      [email]
    );
    if (existing.length > 0) {
      return res
        .status(400)
        .json({ message: "Customer with this email already exists" });
    }

    const [result] = await pool.execute(
      "INSERT INTO customers (email, first_name, last_name, phone, is_active) VALUES (?, ?, ?, ?, ?)",
      [
        email,
        first_name,
        last_name,
        phone || null,
        is_active !== undefined ? is_active : true,
      ]
    );

    const [newCustomer] = await pool.execute(
      "SELECT * FROM customers WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json({
      message: "Customer created successfully",
      customer: newCustomer[0],
    });
  } catch (error) {
    console.error("Create customer error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update customer
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { email, first_name, last_name, phone, is_active } = req.body;

    if (!email || !first_name || !last_name) {
      return res
        .status(400)
        .json({ message: "Email, first name, and last name are required" });
    }

    // Check if customer exists
    const [existing] = await pool.execute(
      "SELECT * FROM customers WHERE id = ?",
      [id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Check if email is being changed and if new email already exists
    if (email !== existing[0].email) {
      const [emailCheck] = await pool.execute(
        "SELECT * FROM customers WHERE email = ? AND id != ?",
        [email, id]
      );
      if (emailCheck.length > 0) {
        return res
          .status(400)
          .json({ message: "Customer with this email already exists" });
      }
    }

    await pool.execute(
      "UPDATE customers SET email = ?, first_name = ?, last_name = ?, phone = ?, is_active = ? WHERE id = ?",
      [
        email,
        first_name,
        last_name,
        phone || null,
        is_active !== undefined ? is_active : true,
        id,
      ]
    );

    const [updated] = await pool.execute(
      "SELECT * FROM customers WHERE id = ?",
      [id]
    );

    res.json({
      message: "Customer updated successfully",
      customer: updated[0],
    });
  } catch (error) {
    console.error("Update customer error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get customer vehicles - PROTECTED for customers
router.get("/:id/vehicles", authenticateCustomer, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify customer can only access their own vehicles
    if (req.customer.id !== parseInt(id)) {
      return res.status(403).json({
        message: "You can only access your own vehicles",
      });
    }

    const [vehicles] = await pool.execute(
      "SELECT * FROM vehicles WHERE customer_id = ?",
      [id]
    );
    res.json({ vehicles });
  } catch (error) {
    console.error("Get customer vehicles error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create new vehicle for customer - PROTECTED
router.post("/:id/vehicles", authenticateCustomer, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify customer can only add vehicles to their own account
    if (req.customer.id !== parseInt(id)) {
      return res.status(403).json({
        message: "You can only add vehicles to your own account",
      });
    }

    const {
      make,
      model,
      year,
      vehicle_type,
      vin,
      license_plate,
      color,
      mileage,
    } = req.body;

    // Validate customer exists
    const [customers] = await pool.execute(
      "SELECT * FROM customers WHERE id = ?",
      [id]
    );
    if (customers.length === 0) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Validate required fields
    if (!make || !model) {
      return res.status(400).json({ message: "Make and model are required" });
    }

    const [result] = await pool.execute(
      "INSERT INTO vehicles (customer_id, make, model, year, vehicle_type, vin, license_plate, color, mileage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        id,
        make,
        model,
        year || null,
        vehicle_type || null,
        vin || null,
        license_plate || null,
        color || null,
        mileage || null,
      ]
    );

    const [newVehicle] = await pool.execute(
      "SELECT * FROM vehicles WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json({
      message: "Vehicle created successfully",
      vehicle: newVehicle[0],
    });
  } catch (error) {
    console.error("Create vehicle error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get customer orders - PROTECTED
router.get("/:id/orders", authenticateCustomer, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify customer can only access their own orders
    if (req.customer.id !== parseInt(id)) {
      return res.status(403).json({
        message: "You can only access your own orders",
      });
    }

    const [orders] = await pool.execute(
      `SELECT o.*, v.make, v.model, v.year 
       FROM orders o 
       LEFT JOIN vehicles v ON o.vehicle_id = v.id 
       WHERE o.customer_id = ? 
       ORDER BY o.created_at DESC`,
      [id]
    );

    // Get services for each order
    for (const order of orders) {
      const [services] = await pool.execute(
        `
        SELECT s.id, s.name, s.description
        FROM services s
        INNER JOIN order_services os ON s.id = os.service_id
        WHERE os.order_id = ?
      `,
        [order.id]
      );
      order.services = services;
    }

    res.json({ orders });
  } catch (error) {
    console.error("Get customer orders error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
