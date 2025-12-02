const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all orders with customer and vehicle info
router.get('/', async (req, res) => {
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
      const [services] = await pool.execute(`
        SELECT s.id, s.name, s.description
        FROM services s
        INNER JOIN order_services os ON s.id = os.service_id
        WHERE os.order_id = ?
      `, [order.id]);
      order.services = services;
    }

    res.json({ orders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single order by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [orders] = await pool.execute(`
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
    `, [id]);

    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orders[0];

    // Get services for this order
    const [services] = await pool.execute(`
      SELECT s.id, s.name, s.description
      FROM services s
      INNER JOIN order_services os ON s.id = os.service_id
      WHERE os.order_id = ?
    `, [id]);
    order.services = services;

    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new order
router.post('/', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { customer_id, vehicle_id, description, price, service_ids, received_by } = req.body;

    if (!customer_id) {
      return res.status(400).json({ message: 'Customer ID is required' });
    }

    // Create the order
    const [result] = await connection.execute(
      `INSERT INTO orders (customer_id, vehicle_id, description, total_amount, received_by, status)
       VALUES (?, ?, ?, ?, ?, 'Received')`,
      [customer_id, vehicle_id || null, description || null, price || 0, received_by || 'Admin']
    );

    const orderId = result.insertId;

    // Add services to order_services table
    if (service_ids && Array.isArray(service_ids) && service_ids.length > 0) {
      for (const serviceId of service_ids) {
        await connection.execute(
          'INSERT INTO order_services (order_id, service_id) VALUES (?, ?)',
          [orderId, serviceId]
        );
      }
    }

    await connection.commit();

    // Fetch the complete order
    const [newOrder] = await connection.execute(`
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
    `, [orderId]);

    // Get services
    const [services] = await connection.execute(`
      SELECT s.id, s.name, s.description
      FROM services s
      INNER JOIN order_services os ON s.id = os.service_id
      WHERE os.order_id = ?
    `, [orderId]);
    newOrder[0].services = services;

    res.status(201).json({
      message: 'Order created successfully',
      order: newOrder[0]
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    connection.release();
  }
});

// Update order
router.put('/:id', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { customer_id, vehicle_id, description, price, service_ids, status, received_by } = req.body;

    // Check if order exists
    const [existing] = await connection.execute('SELECT * FROM orders WHERE id = ?', [id]);
    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Order not found' });
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
        id
      ]
    );

    // Update services if provided
    if (service_ids && Array.isArray(service_ids)) {
      // Delete existing services
      await connection.execute('DELETE FROM order_services WHERE order_id = ?', [id]);
      
      // Add new services
      for (const serviceId of service_ids) {
        await connection.execute(
          'INSERT INTO order_services (order_id, service_id) VALUES (?, ?)',
          [id, serviceId]
        );
      }
    }

    await connection.commit();

    // Fetch updated order
    const [updated] = await connection.execute(`
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
    `, [id]);

    // Get services
    const [services] = await connection.execute(`
      SELECT s.id, s.name, s.description
      FROM services s
      INNER JOIN order_services os ON s.id = os.service_id
      WHERE os.order_id = ?
    `, [id]);
    updated[0].services = services;

    res.json({
      message: 'Order updated successfully',
      order: updated[0]
    });
  } catch (error) {
    await connection.rollback();
    console.error('Update order error:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    connection.release();
  }
});

module.exports = router;

