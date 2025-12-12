const express = require("express");
const router = express.Router();
const {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require("../controllers/employeesController");
const authenticateToken = require("../middleware/auth");
const authorizeRoles = require("../middleware/authorizeRoles");

// Protect all employee routes with auth + Admin only
router.use(authenticateToken);
router.use(authorizeRoles("Admin"));

// Get all employees
router.get("/", getAllEmployees);

// Get single employee by ID
router.get("/:id", getEmployeeById);

// Create new employee
router.post("/", createEmployee);

// Update employee
router.put("/:id", updateEmployee);

// Delete employee
router.delete("/:id", deleteEmployee);

module.exports = router;
