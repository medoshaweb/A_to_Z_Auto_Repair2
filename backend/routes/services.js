const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all services
router.get('/', async (req, res) => {
  try {
    const [services] = await pool.execute('SELECT * FROM services ORDER BY name');
    res.json({ services });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single service by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [services] = await pool.execute('SELECT * FROM services WHERE id = ?', [id]);

    if (services.length === 0) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json({ service: services[0] });
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

