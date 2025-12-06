const pool = require("../config/database");

// Helper function to emit order updates via Socket.io
const emitOrderUpdate = (req, orderId, status) => {
  const io = req.app.get("io");
  if (io) {
    io.to(`order:${orderId}`).emit("order:status", {
      orderId,
      status,
      timestamp: new Date().toISOString(),
    });
    io.emit("order:updated", { orderId, status });
  }
};

// Get all orders with customer and vehicle info
const getAllOrders = async (req, res) => {
  try {
    const [orders] = await pool.execute(`
      SELECT 
        o.id,
        o.customer_id,
        o.vehicle_id,
        o.description,
        o.status,
        o.total_amount,
        o.received_by,
        o.created_at,
        o.updated_at,
        c.first_name,
        c.last_name,
        c.email,
        c.phone,
        v.make,
        v.model,
        v.year,
        v.license_plate,
        v.vin,
        v.color,
        v.mileage
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      LEFT JOIN vehicles v ON o.vehicle_id = v.id
      ORDER BY o.created_at DESC
    `);

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
    console.error("Get orders error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single order by ID
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const [orders] = await pool.execute(
      `
      SELECT 
        o.*,
        c.first_name,
        c.last_name,
        c.email,
        c.phone,
        c.is_active,
        v.make,
        v.model,
        v.year,
        v.license_plate,
        v.vin,
        v.color,
        v.mileage
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      LEFT JOIN vehicles v ON o.vehicle_id = v.id
      WHERE o.id = ?
    `,
      [id]
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = orders[0];

    // Get services for this order
    const [services] = await pool.execute(
      `
      SELECT s.id, s.name, s.description
      FROM services s
      INNER JOIN order_services os ON s.id = os.service_id
      WHERE os.order_id = ?
    `,
      [id]
    );
    order.services = services;

    res.json({ order });
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create new order - NOW PROTECTED
const createOrder = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const {
      customer_id,
      vehicle_id,
      description,
      price,
      service_ids,
      received_by,
    } = req.body;

    // IMPORTANT: Verify customer_id matches authenticated customer
    if (req.customer.id !== parseInt(customer_id)) {
      await connection.rollback();
      return res
        .status(403)
        .json({ message: "You can only create orders for yourself" });
    }

    // Verify vehicle belongs to customer (if vehicle_id is provided)
    if (vehicle_id) {
      const [vehicleCheck] = await connection.execute(
        "SELECT customer_id FROM vehicles WHERE id = ?",
        [vehicle_id]
      );
      if (
        vehicleCheck.length === 0 ||
        vehicleCheck[0].customer_id !== req.customer.id
      ) {
        await connection.rollback();
        return res.status(403).json({
          message: "This vehicle does not belong to you",
        });
      }
    }

    // Create the order
    const [result] = await connection.execute(
      `INSERT INTO orders (customer_id, vehicle_id, description, total_amount, received_by, status)
       VALUES (?, ?, ?, ?, ?, 'Received')`,
      [
        req.customer.id, // Use authenticated customer ID
        vehicle_id || null,
        description || null,
        price || 0,
        received_by || "Customer",
      ]
    );

    const orderId = result.insertId;

    // Add services to order_services table
    if (service_ids && Array.isArray(service_ids) && service_ids.length > 0) {
      for (const serviceId of service_ids) {
        await connection.execute(
          "INSERT INTO order_services (order_id, service_id) VALUES (?, ?)",
          [orderId, serviceId]
        );
      }
    }

    await connection.commit();

    // Fetch the complete order
    const [newOrder] = await connection.execute(
      `
      SELECT 
        o.*,
        c.first_name,
        c.last_name,
        c.email,
        c.phone,
        v.make,
        v.model,
        v.year,
        v.license_plate,
        v.vin,
        v.color,
        v.mileage
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      LEFT JOIN vehicles v ON o.vehicle_id = v.id
      WHERE o.id = ?
    `,
      [orderId]
    );

    // Get services
    const [services] = await connection.execute(
      `
      SELECT s.id, s.name, s.description
      FROM services s
      INNER JOIN order_services os ON s.id = os.service_id
      WHERE os.order_id = ?
    `,
      [orderId]
    );
    newOrder[0].services = services;

    // Emit real-time update
    emitOrderUpdate(req, orderId, "Received");

    res.status(201).json({
      message: "Order created successfully",
      order: newOrder[0],
    });
  } catch (error) {
    await connection.rollback();
    console.error("Create order error:", error);
    res.status(500).json({ message: "Server error" });
  } finally {
    connection.release();
  }
};

// Update order
const updateOrder = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const {
      customer_id,
      vehicle_id,
      description,
      price,
      service_ids,
      status,
      received_by,
    } = req.body;

    // Check if order exists
    const [existing] = await connection.execute(
      "SELECT * FROM orders WHERE id = ?",
      [id]
    );
    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Order not found" });
    }

    // Update order
    await connection.execute(
      `UPDATE orders 
       SET customer_id = ?, vehicle_id = ?, description = ?, total_amount = ?, status = ?, received_by = ?
       WHERE id = ?`,
      [
        customer_id || existing[0].customer_id,
        vehicle_id !== undefined ? vehicle_id : existing[0].vehicle_id,
        description !== undefined ? description : existing[0].description,
        price !== undefined ? price : existing[0].total_amount,
        status || existing[0].status,
        received_by || existing[0].received_by,
        id,
      ]
    );

    // Update services if provided
    if (service_ids && Array.isArray(service_ids)) {
      // Delete existing services
      await connection.execute(
        "DELETE FROM order_services WHERE order_id = ?",
        [id]
      );

      // Add new services
      for (const serviceId of service_ids) {
        await connection.execute(
          "INSERT INTO order_services (order_id, service_id) VALUES (?, ?)",
          [id, serviceId]
        );
      }
    }

    await connection.commit();

    // Fetch updated order
    const [updated] = await connection.execute(
      `
      SELECT 
        o.*,
        c.first_name,
        c.last_name,
        c.email,
        c.phone,
        v.make,
        v.model,
        v.year,
        v.license_plate,
        v.vin,
        v.color,
        v.mileage
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      LEFT JOIN vehicles v ON o.vehicle_id = v.id
      WHERE o.id = ?
    `,
      [id]
    );

    // Get services
    const [services] = await connection.execute(
      `
      SELECT s.id, s.name, s.description
      FROM services s
      INNER JOIN order_services os ON s.id = os.service_id
      WHERE os.order_id = ?
    `,
      [id]
    );
    updated[0].services = services;

    // Emit real-time update if status changed
    if (status && status !== existing[0].status) {
      emitOrderUpdate(req, id, status);
    }

    res.json({
      message: "Order updated successfully",
      order: updated[0],
    });
  } catch (error) {
    await connection.rollback();
    console.error("Update order error:", error);
    res.status(500).json({ message: "Server error" });
  } finally {
    connection.release();
  }
};

// Add service to order - NOW PROTECTED
const addServiceToOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { service_id } = req.body;

    if (!service_id) {
      return res.status(400).json({ message: "Service ID is required" });
    }

    // Check if order exists AND belongs to customer
    const [orders] = await pool.execute(
      "SELECT * FROM orders WHERE id = ? AND customer_id = ?",
      [id, req.customer.id]
    );
    if (orders.length === 0) {
      return res
        .status(404)
        .json({ message: "Order not found or access denied" });
    }

    // Check if service exists
    const [services] = await pool.execute(
      "SELECT * FROM services WHERE id = ?",
      [service_id]
    );
    if (services.length === 0) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Add service to order
    try {
      await pool.execute(
        "INSERT INTO order_services (order_id, service_id) VALUES (?, ?)",
        [id, service_id]
      );
      res.json({ message: "Service added to order successfully" });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res
          .status(400)
          .json({ message: "Service already added to this order" });
      }
      throw error;
    }
  } catch (error) {
    console.error("Add service to order error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  addServiceToOrder,
};

