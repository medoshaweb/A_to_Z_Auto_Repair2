import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ordersAPI } from "../api";
import AdminSidebar from "../components/AdminSidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PaymentModal from "../components/PaymentModal";
import toast from "react-hot-toast";
import "./OrdersList.css";

const OrdersList = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getAll();
      console.log("Orders API response:", response);
      if (response && response.orders) {
        setOrders(response.orders);
        if (response.orders.length === 0) {
          toast.success("No orders found");
        }
      } else if (Array.isArray(response)) {
        // Handle case where response is directly an array
        setOrders(response);
        if (response.length === 0) {
          toast.success("No orders found");
        }
      } else {
        console.error("Unexpected response structure:", response);
        toast.error("Unexpected response format from server");
        setOrders([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      console.error("Error details:", error.response || error.message);
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch orders";
      toast.error(errorMessage);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getStatusClass = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower === 'completed') return 'status-completed';
    if (statusLower === 'in progress') return 'status-in-progress';
    return 'status-received';
  };

  const handlePaymentClick = (order) => {
    if (order.payment_status === 'paid') {
      toast.info('This order has already been paid');
      return;
    }
    if (!order.total_amount || order.total_amount <= 0) {
      toast.error('Order amount must be greater than $0.00');
      return;
    }
    setSelectedOrder(order);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    fetchOrders(); // Refresh the orders list
    setShowPaymentModal(false);
    setSelectedOrder(null);
  };

  return (
    <div className="orders-list-page">
      <Header />
      <div className="page-content">
        <AdminSidebar />
        <main className="main-admin-content">
          <h1 className="page-title">
            Orders
            <span className="title-underline"></span>
          </h1>

          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <div className="table-container">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order Id</th>
                    <th>Customer</th>
                    <th>Vehicle</th>
                    <th>Order Date</th>
                    <th>Amount</th>
                    <th>Payment Status</th>
                    <th>Received by</th>
                    <th>Assigned To</th>
                    <th>Order status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="no-data">No orders found</td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.id}>
                        <td>{order.id}</td>
                        <td>
                          <div className="customer-info">
                            <div className="customer-name">
                              {order.first_name} {order.last_name}
                            </div>
                            <div className="customer-details">
                              {order.email}
                            </div>
                            <div className="customer-details">
                              {order.phone || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td>
                          {order.make && order.model ? (
                            <div className="vehicle-info">
                              <div>{order.make} {order.model}</div>
                              <div className="vehicle-details">
                                {order.year}, {order.license_plate || 'N/A'}
                              </div>
                            </div>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td>{formatDate(order.created_at)}</td>
                        <td>
                          <strong>${parseFloat(order.total_amount || 0).toFixed(2)}</strong>
                        </td>
                        <td>
                          <span className={`payment-badge payment-${order.payment_status || 'pending'}`}>
                            {order.payment_status === 'paid' ? '✓ Paid' : '⏳ Pending'}
                          </span>
                        </td>
                        <td>{order.received_by || 'Admin'}</td>
                        <td>
                          {order.assigned_first_name
                            ? `${order.assigned_first_name} ${order.assigned_last_name || ""}`.trim()
                            : "Unassigned"}
                        </td>
                        <td>
                          <span className={`status-badge ${getStatusClass(order.status)}`}>
                            {order.status || 'Received'}
                          </span>
                        </td>
                        <td className="action-buttons">
                          <Link to={`/admin/orders/${order.id}`} className="view-icon" title="View">
                            ↗️
                          </Link>
                          <Link to={`/admin/orders/${order.id}/edit`} className="edit-icon" title="Edit">
                            ✏️
                          </Link>
                          {order.payment_status !== 'paid' && order.total_amount > 0 && (
                            <button
                              onClick={() => handlePaymentClick(order)}
                              className="payment-icon"
                              title="Process Payment"
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '18px',
                                padding: '5px',
                                marginLeft: '5px'
                              }}
                            >
                              💳
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
      <Footer />

      {/* Payment Modal */}
      {selectedOrder && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedOrder(null);
          }}
          orderId={selectedOrder.id}
          amount={selectedOrder.total_amount || 0}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default OrdersList;

