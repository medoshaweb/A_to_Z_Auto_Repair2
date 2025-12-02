import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from '../components/AdminSidebar';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './NewOrder.css';

const NewOrder = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (searchTerm.length > 0) {
      searchCustomers();
    } else {
      setCustomers([]);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (selectedCustomer) {
      fetchVehicles();
    }
  }, [selectedCustomer]);

  const fetchServices = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/services');
      setServices(response.data.services);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const searchCustomers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/customers', {
        params: { search: searchTerm, limit: 10 }
      });
      setCustomers(response.data.customers);
    } catch (error) {
      console.error('Error searching customers:', error);
    }
  };

  const fetchVehicles = async () => {
    if (!selectedCustomer) return;
    try {
      const response = await axios.get(`http://localhost:5000/api/customers/${selectedCustomer.id}/vehicles`);
      setVehicles(response.data.vehicles);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setSearchTerm('');
    setCustomers([]);
    setSelectedVehicle(null);
  };

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const handleServiceToggle = (serviceId) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceId)) {
        return prev.filter(id => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
  };

  const handleRemoveCustomer = () => {
    setSelectedCustomer(null);
    setVehicles([]);
    setSelectedVehicle(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedCustomer) {
      setError('Please select a customer');
      return;
    }

    if (!selectedVehicle) {
      setError('Please select a vehicle');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        customer_id: selectedCustomer.id,
        vehicle_id: selectedVehicle.id,
        description: description,
        price: parseFloat(price) || 0,
        service_ids: selectedServices,
        received_by: 'Admin Bekele'
      };

      await axios.post('http://localhost:5000/api/orders', orderData);
      alert('Order created successfully!');
      navigate('/admin/orders');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-order-page">
      <Header />
      <div className="page-content">
        <AdminSidebar />
        <main className="main-admin-content">
          <h1 className="page-title">
            Create a new order
            <span className="title-underline"></span>
          </h1>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="order-form">
            {/* Customer Search Section */}
            {!selectedCustomer ? (
              <div className="form-section">
                <div className="search-container">
                  <input
                    type="text"
                    placeholder="Search for a customer using first name, last name, email address of phone number"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                  <span className="search-icon">🔍</span>
                </div>

                {searchTerm && customers.length > 0 && (
                  <div className="customer-results">
                    <table className="customer-table">
                      <thead>
                        <tr>
                          <th>First Name</th>
                          <th>Last Name</th>
                          <th>Email</th>
                          <th>Phone Number</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customers.map((customer) => (
                          <tr key={customer.id} onClick={() => handleCustomerSelect(customer)}>
                            <td>{customer.first_name}</td>
                            <td>{customer.last_name}</td>
                            <td>{customer.email}</td>
                            <td>{customer.phone || 'N/A'}</td>
                            <td>
                              <span className="select-hand">👆</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <button
                  type="button"
                  className="add-customer-btn"
                  onClick={() => navigate('/admin/customers/add')}
                >
                  ADD NEW CUSTOMER
                </button>
              </div>
            ) : (
              <div className="form-section">
                <div className="customer-info-box">
                  <button
                    type="button"
                    className="close-btn"
                    onClick={handleRemoveCustomer}
                  >
                    ✕
                  </button>
                  <h2 className="customer-name">{selectedCustomer.first_name} {selectedCustomer.last_name}</h2>
                  <div className="customer-details">
                    <p><strong>Email:</strong> {selectedCustomer.email}</p>
                    <p><strong>Phone Number:</strong> {selectedCustomer.phone || 'N/A'}</p>
                    <p><strong>Active Customer:</strong> {selectedCustomer.is_active ? 'Yes' : 'No'}</p>
                    <p>
                      <strong>Edit customer info:</strong>{' '}
                      <span className="edit-icon" onClick={() => navigate(`/admin/customers/${selectedCustomer.id}/edit`)}>
                        ↗️
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Vehicle Selection Section */}
            {selectedCustomer && (
              <div className="form-section">
                <h3 className="section-title">Choose a vehicle</h3>
                {vehicles.length === 0 ? (
                  <p className="no-vehicles">No vehicles found for this customer</p>
                ) : (
                  <div className="vehicle-table-container">
                    <table className="vehicle-table">
                      <thead>
                        <tr>
                          <th>Year</th>
                          <th>Make</th>
                          <th>Model</th>
                          <th>Tag</th>
                          <th>Serial</th>
                          <th>Color</th>
                          <th>Mileage</th>
                          <th>Choose</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vehicles.map((vehicle) => (
                          <tr
                            key={vehicle.id}
                            className={selectedVehicle?.id === vehicle.id ? 'selected' : ''}
                            onClick={() => handleVehicleSelect(vehicle)}
                          >
                            <td>{vehicle.year || 'N/A'}</td>
                            <td>{vehicle.make || 'N/A'}</td>
                            <td>{vehicle.model || 'N/A'}</td>
                            <td>{vehicle.license_plate || 'N/A'}</td>
                            <td>{vehicle.vin || 'N/A'}</td>
                            <td>{vehicle.color || 'N/A'}</td>
                            <td>{vehicle.mileage || 'N/A'}</td>
                            <td>
                              <span className="select-hand">👆</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {selectedVehicle && (
                  <div className="vehicle-info-box">
                    <h3 className="vehicle-name">{selectedVehicle.make} {selectedVehicle.model}</h3>
                    <div className="vehicle-details">
                      <p><strong>Vehicle color:</strong> {selectedVehicle.color || 'N/A'}</p>
                      <p><strong>Vehicle tag:</strong> {selectedVehicle.license_plate || 'N/A'}</p>
                      <p><strong>Vehicle year:</strong> {selectedVehicle.year || 'N/A'}</p>
                      <p><strong>Vehicle mileage:</strong> {selectedVehicle.mileage || 'N/A'}</p>
                      <p><strong>Vehicle serial:</strong> {selectedVehicle.vin || 'N/A'}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Service Selection Section */}
            {selectedVehicle && (
              <div className="form-section">
                <h3 className="section-title">Choose service</h3>
                <div className="services-list">
                  {services.map((service) => (
                    <div key={service.id} className="service-item">
                      <label className="service-label">
                        <input
                          type="checkbox"
                          checked={selectedServices.includes(service.id)}
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
            )}

            {/* Additional Requests Section */}
            {selectedVehicle && (
              <div className="form-section">
                <h3 className="section-title">
                  Additional requests
                  <span className="title-underline-small"></span>
                </h3>
                <div className="additional-requests">
                  <div className="form-group">
                    <textarea
                      placeholder="Service description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="description-textarea"
                      rows="5"
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="number"
                      placeholder="Price"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="price-input"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            {selectedVehicle && (
              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? 'SUBMITTING...' : 'SUBMIT ORDER'}
              </button>
            )}
          </form>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default NewOrder;

