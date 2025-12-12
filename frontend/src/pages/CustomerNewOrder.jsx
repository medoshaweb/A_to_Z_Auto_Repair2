import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { customersAPI, servicesAPI, ordersAPI } from "../api";
import toast from "react-hot-toast";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./CustomerNewOrder.css";

const CustomerNewOrder = () => {
  const navigate = useNavigate();
  const customer = JSON.parse(localStorage.getItem("customer") || "null");
  const token = localStorage.getItem("customerToken");

  const [vehicles, setVehicles] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [selectedServices, setSelectedServices] = useState([]);
  const [description, setDescription] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!customer || !token) {
      navigate("/customer/login");
      return;
    }
    fetchData();
  }, [customer, token]);

  const fetchData = async () => {
    try {
      const [vehiclesRes, servicesRes] = await Promise.all([
        customersAPI.getVehicles(customer.id),
        servicesAPI.getAll(),
      ]);

      setVehicles(vehiclesRes.vehicles);
      setServices(servicesRes.services);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error.message || "Failed to load data. Please try again.");
      toast.error("Failed to load data. Please try again.");
    }
  };

  const handleServiceToggle = (serviceId) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    console.log("Form submitted:", {
      selectedVehicle,
      selectedServices,
      description,
      vehiclesCount: vehicles.length,
    });

    setError("");

    // Validate before setting loading
    if (!selectedVehicle) {
      setError("Please select a vehicle");
      return;
    }

    if (!preferredDate || !preferredTime) {
      setError("Please select your preferred service date and time");
      return;
    }

    if (selectedServices.length === 0 && !description.trim()) {
      setError("Please select at least one service or provide a description");
      return;
    }

    setLoading(true);

    try {
      // Convert service_ids to integers if they're strings
      const serviceIds = selectedServices.map((id) => parseInt(id));
      const scheduleNote = `Preferred service schedule: ${preferredDate} at ${preferredTime}`;
      const finalDescription = [description.trim(), scheduleNote]
        .filter(Boolean)
        .join("\n\n");

      console.log("Sending request with:", {
        customer_id: customer.id,
        vehicle_id: selectedVehicle ? parseInt(selectedVehicle) : null,
        description: finalDescription || null,
        service_ids: serviceIds.length > 0 ? serviceIds : null,
        preferred_date: preferredDate,
        preferred_time: preferredTime,
      });

      // Create the order - backend will use authenticated customer from token
      const orderResponse = await ordersAPI.create({
        customer_id: customer.id,
        vehicle_id: selectedVehicle ? parseInt(selectedVehicle) : null,
        description: finalDescription || null,
        service_ids: serviceIds.length > 0 ? serviceIds : null,
        preferred_date: preferredDate,
        preferred_time: preferredTime,
      });

      console.log("Order created successfully:", orderResponse);
      toast.success("Service request submitted successfully!");
      setTimeout(() => {
        navigate("/customer/dashboard");
      }, 500);
    } catch (err) {
      console.error("Order submission error:", err);
      console.error("Error details:", err.response?.data);
      setError(
        err.response?.data?.message ||
          "Failed to submit service request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="customer-new-order-page">
      <Header />
      <main className="main-content">
        <div className="customer-container">
          <h1 className="page-title">
            Request Service
            <span className="title-underline"></span>
          </h1>


          <div className="form-container">
            <form onSubmit={handleSubmit}>
              {error && <div className="error-message">{error}</div>}

              {/* Vehicle Selection */}
              <div className="form-section">
                <h3>Select Vehicle</h3>
                {vehicles.length === 0 ? (
                  <p className="info-message">
                    No vehicles registered. Please add a vehicle first.
                  </p>
                ) : (
                  <select
                    name="vehicle_id"
                    value={selectedVehicle}
                    onChange={(e) => setSelectedVehicle(e.target.value)}
                    className="form-input"
                    required
                  >
                    <option value="">Select a vehicle</option>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.year} {vehicle.make} {vehicle.model} -{" "}
                        {vehicle.license_plate || "N/A"}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Services Selection */}
              <div className="form-section">
                <h3>Select Services</h3>
                {services.length === 0 ? (
                  <p className="info-message">No services available.</p>
                ) : (
                  <div className="services-grid">
                    {services.map((service) => (
                      <div key={service.id} className="service-item">
                      <label className="service-label">
                        <input
                          type="checkbox"
                          checked={selectedServices.includes(service.id)}
                          onChange={() => handleServiceToggle(service.id)}
                        />
                        <div className="service-info">
                          <strong>{service.name}</strong>
                          {service.description && (
                            <p className="service-description">
                              {service.description}
                            </p>
                          )}
                        </div>
                      </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Preferred Schedule */}
              <div className="form-section">
                <h3>Schedule Your Visit</h3>
                <p className="helper-text">
                  Choose the date and time you want to bring your vehicle in.
                </p>
                <div className="schedule-grid">
                  <div className="form-group">
                    <label htmlFor="preferredDate">Preferred Date</label>
                    <input
                      id="preferredDate"
                      type="date"
                      className="form-input"
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      required
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="preferredTime">Preferred Time</label>
                    <input
                      id="preferredTime"
                      type="time"
                      className="form-input"
                      value={preferredTime}
                      onChange={(e) => setPreferredTime(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              {/* Description */}
              <div className="form-section">
                <h3>Additional Details</h3>
                <textarea
                  name="description"
                  placeholder="Describe any additional issues or requests..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-textarea"
                  rows="5"
                />
              </div>

              <div className="form-buttons">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => navigate("/customer/dashboard")}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-button"
                  disabled={loading}
                >
                  {loading ? "SUBMITTING..." : "SUBMIT REQUEST"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CustomerNewOrder;
