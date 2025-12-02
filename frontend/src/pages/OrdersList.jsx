import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from '../components/AdminSidebar';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './OrdersList.css';

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/orders');
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
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
                    <th>Received by</th>
                    <th>Order status</th>
                    <th>View/Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="no-data">No orders found</td>
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
                        <td>{order.received_by || 'Admin'}</td>
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
    </div>
  );
};

export default OrdersList;

