import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from '../components/AdminSidebar';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './OrderDetail.css';

const OrderDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEditMode = location.pathname.includes('/edit');
  
  const [order, setOrder] = useState(null);
  const [services, setServices] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    description: '',
    price: '',
    status: 'Received',
    selectedServices: [],
    vehicle_id: null
  });

  useEffect(() => {
    fetchOrderData();
  }, [id]);

  const fetchOrderData = async () => {
    try {
      setLoading(true);
      const [orderRes, servicesRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/orders/${id}`),
        axios.get('http://localhost:5000/api/services')
      ]);

      const orderData = orderRes.data.order;
      setOrder(orderData);
      setServices(servicesRes.data.services);

      // If customer has vehicles, fetch them
      if (orderData.customer_id) {
        try {
          const vehiclesRes = await axios.get(`http://localhost:5000/api/customers/${orderData.customer_id}/vehicles`);
          setVehicles(vehiclesRes.data.vehicles);
        } catch (err) {
          console.error('Error fetching vehicles:', err);
        }
      }

      // Set form data
      setFormData({
        description: orderData.description || '',
        price: orderData.total_amount || '',
        status: orderData.status || 'Received',
        selectedServices: orderData.services ? orderData.services.map(s => s.id) : [],
        vehicle_id: orderData.vehicle_id
      });
    } catch (error) {
      console.error('Error fetching order data:', error);
      setError('Failed to load order data');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceToggle = (serviceId) => {
    setFormData(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(serviceId)
        ? prev.selectedServices.filter(id => id !== serviceId)
        : [...prev.selectedServices, serviceId]
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const updateData = {
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        status: formData.status,
        service_ids: formData.selectedServices,
        vehicle_id: formData.vehicle_id
      };

      await axios.put(`http://localhost:5000/api/orders/${id}`, updateData);
      alert('Order updated successfully!');
      navigate('/admin/orders');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update order. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
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
            {isEditMode ? 'Edit Order' : 'Order Details'}
            <span className="title-underline"></span>
          </h1>

          {error && <div className="error-message">{error}</div>}

          {isEditMode ? (
            <form onSubmit={handleSubmit} className="order-form">
              {/* Customer Info (Read-only) */}
              <div className="form-section">
                <h3 className="section-title">Customer Information</h3>
                <div className="info-box">
                  <p><strong>Name:</strong> {order.first_name} {order.last_name}</p>
                  <p><strong>Email:</strong> {order.email}</p>
                  <p><strong>Phone:</strong> {order.phone || 'N/A'}</p>
                </div>
              </div>

              {/* Vehicle Selection */}
              <div className="form-section">
                <h3 className="section-title">Vehicle</h3>
                <select
                  name="vehicle_id"
                  value={formData.vehicle_id || ''}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">Select a vehicle</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.license_plate || 'N/A'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Service Selection */}
              <div className="form-section">
                <h3 className="section-title">Services</h3>
                <div className="services-list">
                  {services.map((service) => (
                    <div key={service.id} className="service-item">
                      <label className="service-label">
                        <input
                          type="checkbox"
                          checked={formData.selectedServices.includes(service.id)}
                          onChange={() => handleServiceToggle(service.id)}
                          className="service-checkbox"
                        />
                        <div className="service-content">
                          <span className="service-name">{service.name}:</span>
                          <span className="service-description">{service.description}</span>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Requests */}
              <div className="form-section">
                <h3 className="section-title">
                  Additional requests
                  <span className="title-underline-small"></span>
                </h3>
                <div className="additional-requests">
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
                  <div className="form-group">
                    <input
                      type="number"
                      name="price"
                      placeholder="Price"
                      value={formData.price}
                      onChange={handleChange}
                      className="price-input"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="form-section">
                <h3 className="section-title">Order Status</h3>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="Received">Received</option>
                  <option value="In progress">In progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <button type="submit" className="submit-button" disabled={saving}>
                {saving ? 'UPDATING...' : 'UPDATE ORDER'}
              </button>
            </form>
          ) : (
            <div className="order-details">
              {/* Customer Info */}
              <div className="detail-section">
                <h3 className="section-title">Customer Information</h3>
                <div className="info-box">
                  <p><strong>Name:</strong> {order.first_name} {order.last_name}</p>
                  <p><strong>Email:</strong> {order.email}</p>
                  <p><strong>Phone:</strong> {order.phone || 'N/A'}</p>
                </div>
              </div>

              {/* Vehicle Info */}
              <div className="detail-section">
                <h3 className="section-title">Vehicle Information</h3>
                <div className="info-box">
                  {order.make && order.model ? (
                    <>
                      <p><strong>Vehicle:</strong> {order.make} {order.model}</p>
                      <p><strong>Year:</strong> {order.year || 'N/A'}</p>
                      <p><strong>License Plate:</strong> {order.license_plate || 'N/A'}</p>
                      <p><strong>Color:</strong> {order.color || 'N/A'}</p>
                      <p><strong>Mileage:</strong> {order.mileage || 'N/A'}</p>
                      <p><strong>VIN:</strong> {order.vin || 'N/A'}</p>
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
                    order.services.map(service => (
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
                  <p><strong>Order ID:</strong> {order.id}</p>
                  <p><strong>Status:</strong> 
                    <span className={`status-badge status-${order.status?.toLowerCase().replace(' ', '-') || 'received'}`}>
                      {order.status || 'Received'}
                    </span>
                  </p>
                  <p><strong>Description:</strong> {order.description || 'N/A'}</p>
                  <p><strong>Total Amount:</strong> ${order.total_amount || '0.00'}</p>
                  <p><strong>Received by:</strong> {order.received_by || 'Admin'}</p>
                  <p><strong>Order Date:</strong> {formatDate(order.created_at)}</p>
                </div>
              </div>

              <div className="action-buttons">
                <button
                  onClick={() => navigate(`/admin/orders/${id}/edit`)}
                  className="edit-btn"
                >
                  Edit Order
                </button>
                <button
                  onClick={() => navigate('/admin/orders')}
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
    </div>
  );
};

export default OrderDetail;

