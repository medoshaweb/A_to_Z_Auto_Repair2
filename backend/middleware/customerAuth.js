const jwt = require("jsonwebtoken");

const authenticateCustomer = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret_key_here"
    );

    // Verify it's a customer token, not an admin token
    if (decoded.role !== "customer") {
      return res
        .status(403)
        .json({ message: "Invalid token type. Customer token required." });
    }

    req.customer = {
      id: decoded.customerId,
      email: decoded.email,
    };
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

module.exports = authenticateCustomer;
