const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const initDatabase = require("./config/initDatabase");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());

// Stripe webhook needs raw body - register payment routes before body parser
const paymentRoutes = require("./routes/payments");
app.use("/api/payments", paymentRoutes);

// Body parser for other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database
initDatabase()
  .then(() => {
    console.log("✅ Database connection established");
  })
  .catch((error) => {
    console.error("\n⚠️  Warning: Database initialization failed");
    console.error(
      "   The server will continue to run, but database operations may fail."
    );
    console.error(
      "   Please fix the database connection and restart the server.\n"
    );
    // Don't exit - allow server to start even if DB init fails
  });

// Routes
const authRoutes = require("./routes/auth");
const customerAuthRoutes = require("./routes/customerAuth");
const customerRoutes = require("./routes/customers");
const employeeRoutes = require("./routes/employees");
const orderRoutes = require("./routes/orders");
const serviceRoutes = require("./routes/services");
const chatbotRoutes = require("./routes/chatbot");
const recommendationsRoutes = require("./routes/recommendations");

app.use("/api/auth", authRoutes);
app.use("/api/customer-auth", customerAuthRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/recommendations", recommendationsRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ message: "Server is running", status: "ok" });
});

// Socket.io for real-time updates
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Join order room for real-time updates
  socket.on("join:order", (orderId) => {
    socket.join(`order:${orderId}`);
    console.log(`Client ${socket.id} joined order:${orderId}`);
  });

  // Leave order room
  socket.on("leave:order", (orderId) => {
    socket.leave(`order:${orderId}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Make io available to routes
app.set("io", io);

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Socket.io is ready for real-time connections`);
});

// Handle server errors
server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`\n❌ Error: Port ${PORT} is already in use.`);
    console.error(`Please either:`);
    console.error(`  1. Stop the process using port ${PORT}`);
    console.error(`  2. Set a different PORT in your .env file`);
    console.error(`\nTo find and kill the process on Windows:`);
    console.error(`  netstat -ano | findstr :${PORT}`);
    console.error(`  taskkill //F //PID <PID_NUMBER>\n`);
    process.exit(1);
  } else {
    console.error("Server error:", error);
    process.exit(1);
  }
});
