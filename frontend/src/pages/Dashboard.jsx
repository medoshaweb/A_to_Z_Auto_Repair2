import React from 'react';
import AdminSidebar from '../components/AdminSidebar';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard-page">
      <Header />
      <div className="page-content">
        <AdminSidebar />
        <main className="main-admin-content">
          <h1 className="page-title">
            Dashboard
            <span className="title-underline"></span>
          </h1>
          <p>Welcome to the A_to_Z Auto Repair Admin Dashboard</p>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;

