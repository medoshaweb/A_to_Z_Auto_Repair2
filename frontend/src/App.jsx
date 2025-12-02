<<<<<<< HEAD
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import Dashboard from './pages/Dashboard';
import CustomersList from './pages/CustomersList';
import AddCustomer from './pages/AddCustomer';
import EditCustomer from './pages/EditCustomer';
import CustomerDetail from './pages/CustomerDetail';
import OrdersList from './pages/OrdersList';
import NewOrder from './pages/NewOrder';
import OrderDetail from './pages/OrderDetail';
=======
import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import LoginForm from "./components/LoginForm";
import SignupForm from "./components/SignupForm";
import Dashboard from "./pages/Dashboard";
import CustomersList from "./pages/CustomersList";
import AddCustomer from "./pages/AddCustomer";
import EditCustomer from "./pages/EditCustomer";
import CustomerDetail from "./pages/CustomerDetail";
import AdminSidebar from "./components/AdminSidebar";
>>>>>>> 2f7ad10cf199033b9e09c76b0bdcbdfb1b4cf8aa

function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="App">
      <Header />
      <main className="main-content">
        <div className="auth-container">
          <div className="auth-tabs">
            <button
              className={`auth-tab ${isLogin ? "active" : ""}`}
              onClick={() => setIsLogin(true)}
            >
              LOGIN
            </button>
            <button
              className={`auth-tab ${!isLogin ? "active" : ""}`}
              onClick={() => setIsLogin(false)}
            >
              SIGN UP
            </button>
          </div>
          {isLogin ? <LoginForm /> : <SignupForm />}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" replace />;
}

// Placeholder component for routes that don't have pages yet
function PlaceholderPage({ title }) {
  return (
    <div className="dashboard-page">
      <Header />
      <div className="page-content">
        <AdminSidebar />
        <main className="main-admin-content">
          <h1 className="page-title">
            {title}
            <span className="title-underline"></span>
          </h1>
          <div style={{ padding: "20px", textAlign: "center" }}>
            <p style={{ fontSize: "18px", color: "#666", marginTop: "20px" }}>
              This page is under construction and will be available soon.
            </p>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/customers"
          element={
            <PrivateRoute>
              <CustomersList />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/customers/add"
          element={
            <PrivateRoute>
              <AddCustomer />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/customers/:id"
          element={
            <PrivateRoute>
              <CustomerDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/customers/:id/edit"
          element={
            <PrivateRoute>
              <EditCustomer />
            </PrivateRoute>
          }
        />
<<<<<<< HEAD
=======
        {/* Add missing routes for Orders */}
>>>>>>> 2f7ad10cf199033b9e09c76b0bdcbdfb1b4cf8aa
        <Route
          path="/admin/orders"
          element={
            <PrivateRoute>
<<<<<<< HEAD
              <OrdersList />
=======
              <PlaceholderPage title="Orders" />
>>>>>>> 2f7ad10cf199033b9e09c76b0bdcbdfb1b4cf8aa
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/orders/new"
          element={
            <PrivateRoute>
<<<<<<< HEAD
              <NewOrder />
=======
              <PlaceholderPage title="New Order" />
            </PrivateRoute>
          }
        />
        {/* Add missing routes for Employees */}
        <Route
          path="/admin/employees"
          element={
            <PrivateRoute>
              <PlaceholderPage title="Employees" />
>>>>>>> 2f7ad10cf199033b9e09c76b0bdcbdfb1b4cf8aa
            </PrivateRoute>
          }
        />
        <Route
<<<<<<< HEAD
          path="/admin/orders/:id"
          element={
            <PrivateRoute>
              <OrderDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/orders/:id/edit"
          element={
            <PrivateRoute>
              <OrderDetail />
=======
          path="/admin/employees/add"
          element={
            <PrivateRoute>
              <PlaceholderPage title="Add Employee" />
            </PrivateRoute>
          }
        />
        {/* Add missing route for Services */}
        <Route
          path="/admin/services"
          element={
            <PrivateRoute>
              <PlaceholderPage title="Services" />
>>>>>>> 2f7ad10cf199033b9e09c76b0bdcbdfb1b4cf8aa
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
