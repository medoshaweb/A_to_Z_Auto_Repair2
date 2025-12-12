const express = require("express");
const router = express.Router();
const authenticateCustomer = require("../middleware/customerAuth");
const authenticateToken = require("../middleware/auth");
const authorizeRoles = require("../middleware/authorizeRoles");
const {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  addServiceToOrder,
} = require("../controllers/ordersController");

// Admin/staff routes (Admin, Manager, Employee)
router.get(
  "/",
  authenticateToken,
  authorizeRoles("Admin", "Manager", "Employee"),
  getAllOrders
);

router.get(
  "/:id",
  authenticateToken,
  authorizeRoles("Admin", "Manager", "Employee"),
  getOrderById
);

// Create new order (customer flow)
router.post("/", authenticateCustomer, createOrder);

// Update order (Admin, Manager, Employee - but employees limited in controller)
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("Admin", "Manager", "Employee"),
  updateOrder
);

// Add service to order - customer flow
router.post("/:id/services", authenticateCustomer, addServiceToOrder);

module.exports = router;
