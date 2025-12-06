const pool = require("../config/database");

const getServiceRecommendations = async (req, res) => {
  try {
    const { vehicle_id } = req.params;

    if (!vehicle_id) {
      return res.status(400).json({ message: "Vehicle ID is required" });
    }

    // Get vehicle info
    const [vehicles] = await pool.execute(
      "SELECT * FROM vehicles WHERE id = ?",
      [vehicle_id]
    );

    if (vehicles.length === 0) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    const vehicle = vehicles[0];
    const mileage = vehicle.mileage || 0;
    const year = vehicle.year || new Date().getFullYear();
    const age = new Date().getFullYear() - year;

    // Get service history for this vehicle
    const [orders] = await pool.execute(
      `SELECT o.*, os.service_id, s.name as service_name
       FROM orders o
       LEFT JOIN order_services os ON o.id = os.order_id
       LEFT JOIN services s ON os.service_id = s.id
       WHERE o.vehicle_id = ? AND o.status = 'Completed'
       ORDER BY o.created_at DESC`,
      [vehicle_id]
    );

    const recommendations = [];
    const completedServices = new Set(
      orders.map((o) => o.service_name).filter(Boolean)
    );

    // Mileage-based recommendations
    if (mileage > 0) {
      // Oil change - every 5,000 miles
      if (mileage % 5000 < 500 || mileage % 5000 > 4500) {
        recommendations.push({
          service: "Oil change",
          reason: `Due every 5,000 miles. Your vehicle has ${mileage.toLocaleString()} miles.`,
          priority: "high",
          estimatedCost: "$29.99 - $49.99",
        });
      }

      // Tire rotation - every 15,000 miles
      if (mileage % 15000 < 1000 || mileage % 15000 > 14000) {
        recommendations.push({
          service: "Tire Rotation",
          reason: `Recommended every 15,000 miles. Current mileage: ${mileage.toLocaleString()}.`,
          priority: "medium",
          estimatedCost: "$19.99 - $39.99",
        });
      }

      // Major service - 30,000 miles
      if (mileage >= 30000 && mileage < 35000 && !completedServices.has("Major Service")) {
        recommendations.push({
          service: "30,000 Mile Service",
          reason: "Major service interval includes comprehensive inspection and maintenance.",
          priority: "high",
          estimatedCost: "$199.99 - $399.99",
        });
      }

      // 60,000 mile service
      if (mileage >= 60000 && mileage < 65000 && !completedServices.has("60,000 Mile Service")) {
        recommendations.push({
          service: "60,000 Mile Service",
          reason: "Major service milestone - includes transmission service and more.",
          priority: "high",
          estimatedCost: "$299.99 - $599.99",
        });
      }

      // Brake inspection - every 20,000 miles or if high mileage
      if (mileage % 20000 < 2000 || mileage > 50000) {
        if (!completedServices.has("Brake Repair & Service")) {
          recommendations.push({
            service: "Brake Inspection",
            reason: `Brake inspection recommended. Current mileage: ${mileage.toLocaleString()}.`,
            priority: mileage > 50000 ? "high" : "medium",
            estimatedCost: "Inspection: Free, Repair: $150 - $500",
          });
        }
      }
    }

    // Age-based recommendations
    if (age >= 5) {
      recommendations.push({
        service: "Battery Check",
        reason: `Your ${year} vehicle is ${age} years old. Batteries typically last 3-5 years.`,
        priority: "medium",
        estimatedCost: "$99.99 - $199.99",
      });
    }

    if (age >= 7) {
      recommendations.push({
        service: "Coolant System Flush",
        reason: "Recommended every 5-7 years to prevent overheating.",
        priority: "medium",
        estimatedCost: "$79.99 - $149.99",
      });
    }

    // Check last service date
    if (orders.length > 0) {
      const lastServiceDate = new Date(orders[0].created_at);
      const daysSince = Math.floor(
        (new Date() - lastServiceDate) / (1000 * 60 * 60 * 24)
      );

      if (daysSince > 180) {
        recommendations.push({
          service: "General Inspection",
          reason: `No service in ${Math.floor(daysSince / 30)} months. Regular maintenance keeps your vehicle running smoothly.`,
          priority: "medium",
          estimatedCost: "$49.99 - $99.99",
        });
      }
    } else {
      // No service history
      recommendations.push({
        service: "Initial Inspection",
        reason: "We don't have service records for this vehicle. An inspection will help us understand its condition.",
        priority: "high",
        estimatedCost: "$49.99 - $99.99",
      });
    }

    // Remove duplicates and sort by priority
    const uniqueRecommendations = recommendations.filter(
      (rec, index, self) =>
        index === self.findIndex((r) => r.service === rec.service)
    );

    // Sort: high priority first, then by service name
    uniqueRecommendations.sort((a, b) => {
      if (a.priority === "high" && b.priority !== "high") return -1;
      if (a.priority !== "high" && b.priority === "high") return 1;
      return a.service.localeCompare(b.service);
    });

    res.json({
      recommendations: uniqueRecommendations,
      vehicle: {
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        mileage: mileage,
      },
    });
  } catch (error) {
    console.error("Recommendations error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getServiceRecommendations };

