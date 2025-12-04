const express = require("express");
const router = express.Router();
const pool = require("../config/database");

// Get all services
router.get("/", async (req, res) => {
  try {
    const [services] = await pool.execute(
      "SELECT * FROM services ORDER BY name"
    );
    res.json({ services });
  } catch (error) {
    console.error("Get services error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single service by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [services] = await pool.execute(
      "SELECT * FROM services WHERE id = ?",
      [id]
    );

    if (services.length === 0) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.json({ service: services[0] });
  } catch (error) {
    console.error("Get service error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create new service
router.post("/", async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Service name is required" });
    }

    const [result] = await pool.execute(
      "INSERT INTO services (name, description) VALUES (?, ?)",
      [name, description || null]
    );

    const [newService] = await pool.execute(
      "SELECT * FROM services WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json({
      message: "Service created successfully",
      service: newService[0],
    });
  } catch (error) {
    console.error("Create service error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update service
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Service name is required" });
    }

    // Check if service exists
    const [existing] = await pool.execute(
      "SELECT * FROM services WHERE id = ?",
      [id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ message: "Service not found" });
    }

    await pool.execute(
      "UPDATE services SET name = ?, description = ? WHERE id = ?",
      [name, description || null, id]
    );

    const [updated] = await pool.execute(
      "SELECT * FROM services WHERE id = ?",
      [id]
    );

    res.json({
      message: "Service updated successfully",
      service: updated[0],
    });
  } catch (error) {
    console.error("Update service error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete service
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.execute(
      "SELECT * FROM services WHERE id = ?",
      [id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ message: "Service not found" });
    }

    await pool.execute("DELETE FROM services WHERE id = ?", [id]);

    res.json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error("Delete service error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
