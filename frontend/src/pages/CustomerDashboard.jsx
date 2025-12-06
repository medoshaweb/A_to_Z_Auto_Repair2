import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { customersAPI, recommendationsAPI } from "../api";
import { useSocket } from "../contexts/SocketContext";
import toast from "react-hot-toast";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./CustomerDashboard.css";

const CustomerDashboard = () => {
  const navigate = useNavigate();
  let socketContext;
  try {
    socketContext = useSocket();
  } catch (error) {
    // Socket context not available, continue without it
    socketContext = { joinOrderRoom: () => {} };
  }
  const { joinOrderRoom } = socketContext;
  const [customer, setCustomer] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [orders, setOrders] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const fetchCustomerData = async () => {
    try {
      const token = localStorage.getItem("customerToken");
      const customerData = JSON.parse(
        localStorage.getItem("customer") || "null"
      );

      if (!token || !customerData) {
        navigate("/customer/login");
        return;
      }

      setCustomer(customerData);

      // Fetch vehicles and orders
      const [vehiclesRes, ordersRes] = await Promise.all([
        customersAPI.getVehicles(customerData.id),
        customersAPI.getOrders(customerData.id),
      ]);

      setVehicles(vehiclesRes.vehicles);
      setOrders(ordersRes.orders);

      // Join socket rooms for real-time updates
      ordersRes.orders.forEach((order) => {
        joinOrderRoom(order.id);
      });

      // Fetch recommendations for first vehicle if available
      if (vehiclesRes.vehicles.length > 0) {
        try {
          const recRes = await recommendationsAPI.getByVehicle(
            vehiclesRes.vehicles[0].id
          );
          setRecommendations(recRes.recommendations || []);
        } catch (error) {
          console.error("Error fetching recommendations:", error);
        }
      }
    } catch (error) {
      console.error("Error fetching customer data:", error);
      toast.error("Failed to load dashboard data");
      if (error.status === 401) {
        navigate("/customer/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("customerToken");
    localStorage.removeItem("customer");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="customer-dashboard-page">
        <Header />
        <main className="main-content">
          <div className="loading">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="customer-dashboard-page">
      <Header />
      <main className="main-content">
        <div className="customer-container">
          <div className="customer-header">
            <h1>
              Welcome, {customer?.first_name} {customer?.last_name}
            </h1>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>

          <div className="customer-sections">
            {/* Vehicles Section */}
            <section className="customer-section">
              <div className="section-header-with-button">
                <h2>My Vehicles</h2>
                <button
                  className="add-btn"
                  onClick={() => navigate("/customer/vehicles/add")}
                >
                  + Add Vehicle
                </button>
              </div>
              {vehicles.length === 0 ? (
                <p className="empty-message">No vehicles registered yet.</p>
              ) : (
                <div className="vehicles-grid">
                  {vehicles.map((vehicle) => (
                    <div key={vehicle.id} className="vehicle-card">
                      <h3>
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </h3>
                      <p>
                        <strong>VIN:</strong> {vehicle.vin || "N/A"}
                      </p>
                      <p>
                        <strong>License:</strong>{" "}
                        {vehicle.license_plate || "N/A"}
                      </p>
                      <p>
                        <strong>Color:</strong> {vehicle.color || "N/A"}
                      </p>
                      {vehicle.mileage && (
                        <p>
                          <strong>Mileage:</strong>{" "}
                          {vehicle.mileage.toLocaleString()} miles
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Service Recommendations Section */}
            {recommendations.length > 0 && (
              <section className="customer-section recommendations-section">
                <h2>💡 Recommended Services</h2>
                <p className="recommendations-intro">
                  Based on your vehicle's mileage and service history, we recommend:
                </p>
                <div className="recommendations-grid">
                  {recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className={`recommendation-card priority-${rec.priority}`}
                    >
                      <div className="recommendation-header">
                        <h3>{rec.service}</h3>
                        <span className={`priority-badge ${rec.priority}`}>
                          {rec.priority === "high" ? "🔴 High" : "🟡 Medium"}
                        </span>
                      </div>
                      <p className="recommendation-reason">{rec.reason}</p>
                      <p className="recommendation-cost">
                        <strong>Est. Cost:</strong> {rec.estimatedCost}
                      </p>
                      <button
                        className="recommendation-btn"
                        onClick={() => navigate("/customer/orders/new")}
                      >
                        Request This Service
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Orders Section */}
            <section className="customer-section">
              <div className="section-header-with-button">
                <h2>My Service Orders</h2>
                <button
                  className="add-btn"
                  onClick={() => navigate("/customer/orders/new")}
                >
                  + Request Service
                </button>
              </div>
              {orders.length === 0 ? (
                <p className="empty-message">No service orders yet.</p>
              ) : (
                <div className="orders-list">
                  {orders.map((order) => (
                    <div key={order.id} className="order-card">
                      <div className="order-header">
                        <h3>Order #{order.id}</h3>
                        <span
                          className={`status-badge status-${order.status.toLowerCase()}`}
                        >
                          {order.status}
                        </span>
                      </div>
                      {order.make && order.model && (
                        <p>
                          <strong>Vehicle:</strong> {order.year} {order.make}{" "}
                          {order.model}
                        </p>
                      )}
                      <p>
                        <strong>Total:</strong> ${order.total_amount || "0.00"}
                      </p>
                      <p>
                        <strong>Date:</strong>{" "}
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                      {order.description && (
                        <p>
                          <strong>Description:</strong> {order.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CustomerDashboard;
