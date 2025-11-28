import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from '../components/AdminSidebar';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './CustomerDetail.css';

const CustomerDetail = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomerData();
  }, [id]);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      const [customerRes, vehiclesRes, ordersRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/customers/${id}`),
        axios.get(`http://localhost:5000/api/customers/${id}/vehicles`),
        axios.get(`http://localhost:5000/api/customers/${id}/orders`)
      ]);

      setCustomer(customerRes.data.customer);
      setVehicles(vehiclesRes.data.vehicles);
      setOrders(ordersRes.data.orders);
    } catch (error) {
      console.error('Error fetching customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="customer-detail-page">
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

  if (!customer) {
    return (
      <div className="customer-detail-page">
        <Header />
        <div className="page-content">
          <AdminSidebar />
          <main className="main-admin-content">
            <div className="error">Customer not found</div>
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="customer-detail-page">
      <Header />
      <div className="page-content">
        <AdminSidebar />
        <main className="main-admin-content">
          {/* Info Section */}
          <div className="detail-section">
            <div className="section-header">
              <div className="section-icon info-icon">Info</div>
              <div className="section-content">
                <h2 className="section-title">Customer: {customer.first_name} {customer.last_name}</h2>
                <div className="info-details">
                  <p><strong>Email:</strong> {customer.email}</p>
                  <p><strong>Phone Number:</strong> {customer.phone || 'N/A'}</p>
                  <p><strong>Active Customer:</strong> {customer.is_active ? 'Yes' : 'No'}</p>
                  <Link to={`/admin/customers/${id}/edit`} className="edit-link">
                    Edit customer info: <span className="edit-icon">↗️</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Cars Section */}
          <div className="detail-section">
            <div className="section-header">
              <div className="section-icon cars-icon">Cars</div>
              <div className="section-content">
                <h2 className="section-title">Vehicles of {customer.first_name}</h2>
                {vehicles.length === 0 ? (
                  <div className="empty-box">
                    <p>No vehicle found</p>
                  </div>
                ) : (
                  <div className="vehicles-list">
                    {vehicles.map((vehicle) => (
                      <div key={vehicle.id} className="vehicle-item">
                        <p><strong>{vehicle.year} {vehicle.make} {vehicle.model}</strong></p>
                        <p>VIN: {vehicle.vin || 'N/A'}</p>
                        <p>License: {vehicle.license_plate || 'N/A'}</p>
                        <p>Color: {vehicle.color || 'N/A'}</p>
                      </div>
                    ))}
                  </div>
                )}
                <button className="add-vehicle-btn">ADD NEW VEHICLE</button>
              </div>
            </div>
          </div>

          {/* Orders Section */}
          <div className="detail-section">
            <div className="section-header">
              <div className="section-icon orders-icon">Orders</div>
              <div className="section-content">
                <h2 className="section-title">Orders of {customer.first_name}</h2>
                {orders.length === 0 ? (
                  <p className="empty-orders">Orders will be displayed here</p>
                ) : (
                  <div className="orders-list">
                    {orders.map((order) => (
                      <div key={order.id} className="order-item">
                        <p><strong>Service:</strong> {order.service_type || 'N/A'}</p>
                        <p><strong>Status:</strong> {order.status}</p>
                        <p><strong>Amount:</strong> ${order.total_amount || '0.00'}</p>
                        <p><strong>Date:</strong> {new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default CustomerDetail;

