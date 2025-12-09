const express = require("express");
const router = express.Router();
const authenticateCustomer = require("../middleware/customerAuth");
const authenticateToken = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  getCustomerVehicles,
  createCustomerVehicle,
  getCustomerOrders,
  getAdminCustomerVehicles,
  getAdminCustomerOrders,
} = require("../controllers/customersController");

// Middleware to check if user is admin or customer
const authenticateAdminOrCustomer = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return authenticateCustomer(req, res, next);
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret_key_here"
    );
    // If token has userId, it's an admin token
    if (decoded.userId) {
      req.user = decoded;
      req.isAdmin = true;
      return next();
    }
  } catch (err) {
    // Not an admin token, try customer auth
  }

  // Fall back to customer authentication
  return authenticateCustomer(req, res, next);
};

// Get all customers with search and pagination
router.get("/", getAllCustomers);

// Get single customer by ID
router.get("/:id", getCustomerById);

// Create new customer
router.post("/", createCustomer);

// Update customer
router.put("/:id", updateCustomer);

// Get customer vehicles - Works for both admin and customer
router.get("/:id/vehicles", authenticateAdminOrCustomer, (req, res, next) => {
  if (req.isAdmin) {
    return getAdminCustomerVehicles(req, res, next);
  } else {
    return getCustomerVehicles(req, res, next);
  }
});

// Create new vehicle for customer - PROTECTED
router.post("/:id/vehicles", authenticateCustomer, createCustomerVehicle);

// Get customer orders - Works for both admin and customer
router.get("/:id/orders", authenticateAdminOrCustomer, (req, res, next) => {
  if (req.isAdmin) {
    return getAdminCustomerOrders(req, res, next);
  } else {
    return getCustomerOrders(req, res, next);
  }
});

module.exports = router;
