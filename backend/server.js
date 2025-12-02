const express = require("express");
const cors = require("cors");
const initDatabase = require("./config/initDatabase");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database
initDatabase().catch(console.error);

// Routes
<<<<<<< HEAD
const authRoutes = require('./routes/auth');
const customerRoutes = require('./routes/customers');
const orderRoutes = require('./routes/orders');
const serviceRoutes = require('./routes/services');
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/services', serviceRoutes);
=======
const authRoutes = require("./routes/auth");
const customerRoutes = require("./routes/customers");
app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
>>>>>>> 2f7ad10cf199033b9e09c76b0bdcbdfb1b4cf8aa

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ message: "Server is running", status: "ok" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
