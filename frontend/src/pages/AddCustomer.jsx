import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from '../components/AdminSidebar';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './AddCustomer.css';

const AddCustomer = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/customers', formData);
      alert('Customer added successfully!');
      navigate('/admin/customers');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add customer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-customer-page">
      <Header />
      <div className="page-content">
        <AdminSidebar />
        <main className="main-admin-content">
          <h1 className="page-title">
            Add a new customer
            <span className="title-underline"></span>
          </h1>

          <div className="form-container">
            <form onSubmit={handleSubmit} className="customer-form">
              {error && <div className="error-message">{error}</div>}
              
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Customer email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <input
                  type="text"
                  name="first_name"
                  placeholder="Customer first name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <input
                  type="text"
                  name="last_name"
                  placeholder="Customer last name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <input
                  type="tel"
                  name="phone"
                  placeholder="Customer phone (555-555-5555)"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? 'ADDING...' : 'ADD CUSTOMER'}
              </button>
            </form>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AddCustomer;

