import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PaymentModal from "../components/PaymentModal";
import toast from "react-hot-toast";
import { employeesAPI, ordersAPI, servicesAPI, customersAPI } from "../api";
import "./OrderDetail.css";

const OrderDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEditMode = location.pathname.includes("/edit");

  const [order, setOrder] = useState(null);
  const [services, setServices] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isCustomer, setIsCustomer] = useState(false);

  const [formData, setFormData] = useState({
    description: "",
    price: "",
    status: "Received",
    selectedServices: [],
    vehicle_id: null,
    assigned_employee_id: null,
    completion_note: "",
    received_by: "",
  });

  useEffect(() => {
    fetchOrderData();
    // Check if user is a customer
    const customerToken = localStorage.getItem("customerToken");
    setIsCustomer(!!customerToken);
  }, [id]);

  // Check role (admin/manager/employee)
  const isAdmin = !!localStorage.getItem("token");
  const userRole = (() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw).role || "Admin" : "Admin";
    } catch {
      return "Admin";
    }
  })();
  const isManager = userRole === "Manager";
  const isEmployee = userRole === "Employee";

  const fetchOrderData = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("Fetching order data for ID:", id);

      // Fetch order and services separately to handle errors better
      let orderRes, servicesRes;
      try {
        orderRes = await ordersAPI.getById(id);
      } catch (orderError) {
        console.error("Error fetching order:", orderError);
        // Re-throw to be caught by outer catch
        throw orderError;
      }

      try {
        servicesRes = await servicesAPI.getAll();
      } catch (servicesError) {
        console.error("Error fetching services:", servicesError);
        // Services are not critical, so we can continue with empty array
        servicesRes = { services: [] };
      }

      // Handle different response structures
      const orderData = orderRes?.order || orderRes;
      if (!orderData) {
        throw new Error("Order data not found in response");
      }

      setOrder(orderData);
      setServices(servicesRes?.services || servicesRes || []);

      // If customer has vehicles, fetch them
      if (orderData.customer_id) {
        try {
          const vehiclesRes = await customersAPI.getVehicles(
            orderData.customer_id
          );
          setVehicles(vehiclesRes?.vehicles || vehiclesRes || []);
        } catch (err) {
          console.error("Error fetching vehicles:", err);
          // Don't show error toast for vehicles, just log it
        }
      }

      // Set form data
      setFormData({
        description: orderData.description || "",
        price: orderData.total_amount || "",
        status: orderData.status || "Received",
        selectedServices: orderData.services
          ? orderData.services.map((s) => s.id)
          : [],
        vehicle_id: orderData.vehicle_id,
        assigned_employee_id: orderData.assigned_employee_id || "",
        completion_note: orderData.completion_note || "",
        received_by: orderData.received_by || "",
      });
    } catch (error) {
      console.error("Error fetching order data:", error);
      console.error("Error response:", error.response);
      console.error("Error details:", error.response?.data);

      let errorMessage = "Failed to load order data";
      let shouldRedirect = false;

      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = "Your session has expired. Please log in again.";
          shouldRedirect = true;
          // Clear tokens only when we're sure it's a 401 and we're handling the redirect
          // Use setTimeout to prevent race condition with AdminPrivateRoute
          setTimeout(() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
          }, 100);
        } else if (error.response.status === 403) {
          errorMessage =
            "Access denied. You don't have permission to view this order.";
        } else if (error.response.status === 404) {
          errorMessage = "Order not found.";
        } else {
          errorMessage =
            error.response.data?.message || error.message || errorMessage;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);

      // Only show toast and redirect for authentication errors
      if (shouldRedirect) {
        toast.error(errorMessage, { duration: 5000 });
        // Use navigate instead of window.location to avoid full page reload
        // This prevents AdminPrivateRoute from re-checking and causing double redirect
        setTimeout(() => {
          // Clear tokens before navigating
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/admin/login", { replace: true });
        }, 2000);
      } else {
        // For other errors, just show a shorter toast
        toast.error(errorMessage, { duration: 3000 });
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch employees for assignment (Admin/Manager only)
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await employeesAPI.getAll();
        setEmployees(res.employees || []);
      } catch (err) {
        console.error("Error fetching employees:", err);
      }
    };

    if ((isAdmin || isManager) && !isEmployee) {
      fetchEmployees();
    }
  }, [isAdmin, isManager, isEmployee]);

  const handleServiceToggle = (serviceId) => {
    setFormData((prev) => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(serviceId)
        ? prev.selectedServices.filter((id) => id !== serviceId)
        : [...prev.selectedServices, serviceId],
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      // For employees, only send status, price, and completion_note
      // For Admin/Manager, send all fields
      let updateData;

      if (isEmployee) {
        updateData = {
          status: formData.status,
          price: parseFloat(formData.price) || 0,
          completion_note: formData.completion_note || "",
        };
      } else {
        updateData = {
          description: formData.description,
          price: parseFloat(formData.price) || 0,
          status: formData.status,
          service_ids: formData.selectedServices,
          vehicle_id: formData.vehicle_id,
          assigned_employee_id:
            formData.assigned_employee_id === ""
              ? null
              : parseInt(formData.assigned_employee_id),
          completion_note: formData.completion_note || "",
          received_by: formData.received_by || "",
        };
      }

      await ordersAPI.update(id, updateData);
      toast.success("Order updated successfully!");
      navigate("/admin/orders");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Failed to update order. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  if (loading) {
    return (
      <div className="order-detail-page">
        <Header />
        <div className="page-content">
          <AdminSidebar />
          <main className="main-admin-content">
            <div className="loading">Loading...</div>
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-detail-page">
        <Header />
        <div className="page-content">
          <AdminSidebar />
          <main className="main-admin-content">
            <div className="error">Order not found</div>
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="order-detail-page">
      <Header />
      <div className="page-content">
        <AdminSidebar />
        <main className="main-admin-content">
          <h1 className="page-title">
            {isEditMode ? "Edit Order" : "Order Details"}
            <span className="title-underline"></span>
          </h1>

          {error && <div className="error-message">{error}</div>}

          {isEditMode ? (
            <form onSubmit={handleSubmit} className="order-form">
              {/* Customer Info (Read-only) */}
              <div className="form-section">
                <h3 className="section-title">Customer Information</h3>
                <div className="info-box">
                  <p>
                    <strong>Name:</strong> {order.first_name} {order.last_name}
                  </p>
                  <p>
                    <strong>Email:</strong> {order.email}
                  </p>
                  <p>
                    <strong>Phone:</strong> {order.phone || "N/A"}
                  </p>
                </div>
              </div>

              {/* Vehicle Selection - Admin/Manager only */}
              {!isEmployee && (
                <div className="form-section">
                  <h3 className="section-title">Vehicle</h3>
                  <select
                    name="vehicle_id"
                    value={formData.vehicle_id || ""}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="">Select a vehicle</option>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.year} {vehicle.make} {vehicle.model} -{" "}
                        {vehicle.license_plate || "N/A"}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Vehicle Info - Read-only for Employees */}
              {isEmployee && (
                <div className="form-section">
                  <h3 className="section-title">Vehicle</h3>
                  <div className="info-box">
                    {order.make && order.model ? (
                      <p>
                        <strong>Vehicle:</strong> {order.year} {order.make}{" "}
                        {order.model}
                      </p>
                    ) : (
                      <p>No vehicle information available</p>
                    )}
                  </div>
                </div>
              )}

              {/* Service Selection - Admin/Manager only */}
              {!isEmployee && (
                <div className="form-section">
                  <h3 className="section-title">Services</h3>
                  <div className="services-list">
                    {services.map((service) => (
                      <div key={service.id} className="service-item">
                        <label className="service-label">
                          <input
                            type="checkbox"
                            checked={formData.selectedServices.includes(
                              service.id
                            )}
                            onChange={() => handleServiceToggle(service.id)}
                            className="service-checkbox"
                          />
                          <div className="service-content">
                            <span className="service-name">
                              {service.name}:
                            </span>
                            <span className="service-description">
                              {service.description}
                            </span>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Services Info - Read-only for Employees */}
              {isEmployee && (
                <div className="form-section">
                  <h3 className="section-title">Services</h3>
                  <div className="services-list">
                    {order.services && order.services.length > 0 ? (
                      order.services.map((service) => (
                        <div key={service.id} className="service-item-view">
                          <strong>{service.name}</strong>
                          <p>{service.description}</p>
                        </div>
                      ))
                    ) : (
                      <p className="no-services">No services selected</p>
                    )}
                  </div>
                </div>
              )}

              {/* Additional Requests - Admin/Manager can edit description, Employees can only see */}
              <div className="form-section">
                <h3 className="section-title">
                  Additional requests
                  <span className="title-underline-small"></span>
                </h3>
                <div className="additional-requests">
                  {!isEmployee ? (
                    <div className="form-group">
                      <textarea
                        name="description"
                        placeholder="Service description"
                        value={formData.description}
                        onChange={handleChange}
                        className="description-textarea"
                        rows="5"
                      />
                    </div>
                  ) : (
                    <div className="info-box">
                      <p>
                        <strong>Description:</strong>{" "}
                        {order.description || "N/A"}
                      </p>
                    </div>
                  )}
                  {/* Price - All roles can edit */}
                  <div className="form-group">
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "600",
                      }}
                    >
                      Price / Total Amount *
                    </label>
                    <input
                      type="number"
                      name="price"
                      placeholder="Price"
                      value={formData.price}
                      onChange={handleChange}
                      className="price-input"
                      step="0.01"
                      min="0"
                      required
                    />
                    {isEmployee && (
                      <p
                        style={{
                          fontSize: "12px",
                          color: "var(--text-secondary)",
                          marginTop: "5px",
                        }}
                      >
                        You can update the order price here
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Assignment & Receiver */}
              {(isAdmin || isManager) && (
                <div className="form-section">
                  <h3 className="section-title">Assignment</h3>
                  <div className="assignment-grid">
                    <div className="form-group">
                      <label>Received By</label>
                      <input
                        type="text"
                        name="received_by"
                        value={formData.received_by}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="e.g. Customer Representative"
                      />
                    </div>
                    <div className="form-group">
                      <label>Assign Technician/Employee</label>
                      <select
                        name="assigned_employee_id"
                        value={formData.assigned_employee_id || ""}
                        onChange={handleChange}
                        className="form-select"
                      >
                        <option value="">Unassigned</option>
                        {employees.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.first_name} {emp.last_name} (
                            {emp.role || "Employee"})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Status & Price Section - All roles can edit */}
              <div className="form-section">
                <h3 className="section-title">Order Status & Price</h3>
                <div className="assignment-grid">
                  <div className="form-group">
                    <label style={{ fontSize: "16px", fontWeight: "600" }}>
                      Status *
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="form-select"
                      required
                      style={{
                        fontSize: "16px",
                        padding: "12px",
                        fontWeight: isEmployee ? "600" : "400",
                        border: "2px solid #1e3a8a",
                        borderRadius: "6px",
                      }}
                    >
                      <option value="Received">Received</option>
                      <option value="In progress">In progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                    {isEmployee && (
                      <p
                        style={{
                          fontSize: "13px",
                          color: "#1e3a8a",
                          marginTop: "8px",
                          fontWeight: "500",
                        }}
                      >
                        ✓ You can update the order status here
                      </p>
                    )}
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: "16px", fontWeight: "600" }}>
                      Price / Total Amount *
                    </label>
                    <input
                      type="number"
                      name="price"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={handleChange}
                      className="price-input"
                      step="0.01"
                      min="0"
                      required
                      style={{
                        fontSize: "16px",
                        padding: "12px",
                        border: "2px solid #1e3a8a",
                        borderRadius: "6px",
                      }}
                    />
                    {isEmployee && (
                      <p
                        style={{
                          fontSize: "13px",
                          color: "#1e3a8a",
                          marginTop: "8px",
                          fontWeight: "500",
                        }}
                      >
                        ✓ You can update the order price here
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Remarks Section - Prominent for Employees */}
              {isEmployee && (
                <div
                  className="form-section"
                  style={{
                    backgroundColor: "#f0f7ff",
                    padding: "20px",
                    borderRadius: "8px",
                    border: "2px solid #1e3a8a",
                    marginTop: "20px",
                  }}
                >
                  <h3 className="section-title" style={{ color: "#1e3a8a", marginBottom: "15px" }}>
                    Employee Remarks / Notes
                  </h3>
                  <div className="form-group">
                    <label
                      style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        marginBottom: "10px",
                        display: "block",
                        color: "#1e3a8a",
                      }}
                    >
                      Add Your Remarks / Notes *
                    </label>
                    <textarea
                      name="completion_note"
                      value={formData.completion_note}
                      onChange={handleChange}
                      className="form-textarea"
                      rows="6"
                      placeholder="Enter your remarks about the work done, parts used, issues found, recommendations, etc..."
                      required
                      style={{
                        fontSize: "15px",
                        padding: "12px",
                        minHeight: "150px",
                        border: "2px solid #1e3a8a",
                        borderRadius: "6px",
                        width: "100%",
                        fontFamily: "inherit",
                      }}
                    />
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#666",
                        marginTop: "10px",
                        fontStyle: "italic",
                      }}
                    >
                      💡 Tip: Include details about work performed, parts
                      replaced, any issues discovered, or recommendations for
                      the customer.
                    </p>
                  </div>
                </div>
              )}

              {/* Completion Note for Admin/Manager */}
              {!isEmployee && (
                <div className="form-section">
                  <h3 className="section-title">Completion Note</h3>
                  <div className="form-group">
                    <textarea
                      name="completion_note"
                      value={formData.completion_note}
                      onChange={handleChange}
                      className="form-textarea"
                      rows="4"
                      placeholder="What was done, parts used, etc."
                    />
                  </div>
                </div>
              )}

              <button type="submit" className="submit-button" disabled={saving}>
                {saving ? "UPDATING..." : "UPDATE ORDER"}
              </button>
            </form>
          ) : (
            <div className="order-details">
              {/* Customer Info */}
              <div className="detail-section">
                <h3 className="section-title">Customer Information</h3>
                <div className="info-box">
                  <p>
                    <strong>Name:</strong> {order.first_name} {order.last_name}
                  </p>
                  <p>
                    <strong>Email:</strong> {order.email}
                  </p>
                  <p>
                    <strong>Phone:</strong> {order.phone || "N/A"}
                  </p>
                </div>
              </div>

              {/* Vehicle Info */}
              <div className="detail-section">
                <h3 className="section-title">Vehicle Information</h3>
                <div className="info-box">
                  {order.make && order.model ? (
                    <>
                      <p>
                        <strong>Vehicle:</strong> {order.make} {order.model}
                      </p>
                      <p>
                        <strong>Year:</strong> {order.year || "N/A"}
                      </p>
                      <p>
                        <strong>License Plate:</strong>{" "}
                        {order.license_plate || "N/A"}
                      </p>
                      <p>
                        <strong>Color:</strong> {order.color || "N/A"}
                      </p>
                      <p>
                        <strong>Mileage:</strong> {order.mileage || "N/A"}
                      </p>
                      <p>
                        <strong>VIN:</strong> {order.vin || "N/A"}
                      </p>
                    </>
                  ) : (
                    <p>No vehicle information available</p>
                  )}
                </div>
              </div>

              {/* Services */}
              <div className="detail-section">
                <h3 className="section-title">Services</h3>
                <div className="services-list">
                  {order.services && order.services.length > 0 ? (
                    order.services.map((service) => (
                      <div key={service.id} className="service-item-view">
                        <strong>{service.name}</strong>
                        <p>{service.description}</p>
                      </div>
                    ))
                  ) : (
                    <p className="no-services">No services selected</p>
                  )}
                </div>
              </div>

              {/* Order Details */}
              <div className="detail-section">
                <h3 className="section-title">Order Details</h3>
                <div className="info-box">
                  <p>
                    <strong>Order ID:</strong> {order.id}
                  </p>
                  <p>
                    <strong>Status:</strong>
                    <span
                      className={`status-badge status-${
                        order.status?.toLowerCase().replace(" ", "-") ||
                        "received"
                      }`}
                    >
                      {order.status || "Received"}
                    </span>
                  </p>
                  <p>
                    <strong>Description:</strong> {order.description || "N/A"}
                  </p>
                  <p>
                    <strong>Total Amount:</strong>{" "}
                    <span style={{ 
                      fontSize: "18px", 
                      fontWeight: "700", 
                      color: "#1e3a8a" 
                    }}>
                      ${parseFloat(order.total_amount || 0).toFixed(2)}
                    </span>
                  </p>
                  <p>
                    <strong>Payment Status:</strong>
                    <span
                      className={`payment-badge payment-${
                        order.payment_status || "pending"
                      }`}
                    >
                      {order.payment_status === "paid" ? "Paid" : "Pending"}
                    </span>
                  </p>
                  <p>
                    <strong>Received by:</strong> {order.received_by || "Admin"}
                  </p>
                  <p>
                    <strong>Assigned To:</strong>{" "}
                    {order.assigned_first_name ? (
                      <>
                        {order.assigned_first_name}{" "}
                        {order.assigned_last_name || ""} (
                        {order.assigned_role || "Employee"})
                      </>
                    ) : (
                      "Unassigned"
                    )}
                  </p>
                  <p>
                    <strong>Completion Note:</strong>{" "}
                    {order.completion_note || "N/A"}
                  </p>
                  <p>
                    <strong>Completed At:</strong>{" "}
                    {order.completed_at
                      ? new Date(order.completed_at).toLocaleString()
                      : "N/A"}
                  </p>
                  <p>
                    <strong>Order Date:</strong> {formatDate(order.created_at)}
                  </p>
                </div>
              </div>

              {/* Payment Information Section (for admins) */}
              {isAdmin && (
                <div className="detail-section">
                  <h3 className="section-title">Payment Information</h3>
                  <div className="info-box">
                    <p>
                      <strong>Payment Status:</strong>
                      <span
                        className={`payment-badge payment-${
                          order.payment_status || "pending"
                        }`}
                      >
                        {order.payment_status === "paid" ? "Paid" : "Pending"}
                      </span>
                    </p>
                    <p>
                      <strong>Total Amount:</strong>{" "}
                      <span style={{ 
                        fontSize: "18px", 
                        fontWeight: "700", 
                        color: "#1e3a8a" 
                      }}>
                        ${parseFloat(order.total_amount || 0).toFixed(2)}
                      </span>
                    </p>
                    {order.payment_status === "paid" ? (
                      <p
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "14px",
                          marginTop: "10px",
                        }}
                      >
                        ✓ Payment completed for this order
                      </p>
                    ) : (
                      <p
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "14px",
                          marginTop: "10px",
                        }}
                      >
                        ⏳ Payment pending - Customer will be able to pay when
                        viewing this order
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Payment Button (for customers and admins) */}
              {order.payment_status !== "paid" && (
                <div className="payment-section">
                  <button
                    onClick={() => {
                      if (!order.total_amount || order.total_amount <= 0) {
                        toast.error(
                          "Order amount must be greater than $0.00 to process payment"
                        );
                        return;
                      }
                      setShowPaymentModal(true);
                    }}
                    className="pay-now-btn"
                    disabled={!order.total_amount || order.total_amount <= 0}
                    style={{
                      opacity:
                        !order.total_amount || order.total_amount <= 0
                          ? 0.6
                          : 1,
                      cursor:
                        !order.total_amount || order.total_amount <= 0
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    💳 Pay Now - $
                    {parseFloat(order.total_amount || 0).toFixed(2)}
                  </button>
                  {isCustomer && (
                    <p
                      style={{
                        marginTop: "10px",
                        fontSize: "14px",
                        color: "var(--text-secondary)",
                        textAlign: "center",
                      }}
                    >
                      Complete payment for this order
                    </p>
                  )}
                  {isAdmin && (
                    <p
                      style={{
                        marginTop: "10px",
                        fontSize: "14px",
                        color: "var(--text-secondary)",
                        textAlign: "center",
                      }}
                    >
                      Process payment on behalf of customer
                    </p>
                  )}
                  {(!order.total_amount || order.total_amount <= 0) && (
                    <p
                      style={{
                        marginTop: "10px",
                        fontSize: "14px",
                        color: "#ff9800",
                        textAlign: "center",
                        fontWeight: "600",
                      }}
                    >
                      ⚠️ Order amount is $0.00. Please update the order amount
                      before processing payment.
                    </p>
                  )}
                </div>
              )}

              {/* Show payment status if already paid */}
              {order.payment_status === "paid" && (
                <div
                  className="payment-section"
                  style={{
                    padding: "20px",
                    backgroundColor: "var(--bg-secondary)",
                    borderRadius: "8px",
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      color: "#4caf50",
                      fontSize: "16px",
                      fontWeight: "600",
                      marginBottom: "5px",
                    }}
                  >
                    ✓ Payment Completed
                  </p>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Amount: ${parseFloat(order.total_amount || 0).toFixed(2)}
                  </p>
                </div>
              )}

              <div className="action-buttons">
                <button
                  onClick={() => navigate(`/admin/orders/${id}/edit`)}
                  className="edit-btn"
                >
                  Edit Order
                </button>
                <button
                  onClick={() => navigate("/admin/orders")}
                  className="back-btn"
                >
                  Back to Orders
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
      <Footer />

      {/* Payment Modal */}
      {order && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          orderId={order.id}
          amount={order.total_amount || 0}
          onSuccess={() => {
            // Refresh order data
            fetchOrderData();
          }}
        />
      )}
    </div>
  );
};

export default OrderDetail;
