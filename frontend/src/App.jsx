import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./App.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import LoginForm from "./components/LoginForm";
import SignupForm from "./components/SignupForm";
import HomePage from "./pages/HomePage";
import Dashboard from "./pages/Dashboard";
import CustomersList from "./pages/CustomersList";
import AddCustomer from "./pages/AddCustomer";
import EditCustomer from "./pages/EditCustomer";
import CustomerDetail from "./pages/CustomerDetail";
import AddVehicle from "./pages/AddVehicle";
import OrdersList from "./pages/OrdersList";
import NewOrder from "./pages/NewOrder";
import OrderDetail from "./pages/OrderDetail";
import AdminSidebar from "./components/AdminSidebar";
import CustomerLoginForm from "./components/CustomerLoginForm";
import CustomerSignupForm from "./components/CustomerSignupForm";
import CustomerDashboard from "./pages/CustomerDashboard";
import CustomerAddVehicle from "./pages/CustomerAddVehicle";
import CustomerNewOrder from "./pages/CustomerNewOrder";
import EmployeesList from "./pages/EmployeesList";
import AddEmployee from "./pages/AddEmployee";
import EditEmployee from "./pages/EditEmployee";
import ServicesList from "./pages/ServicesList";
import ForgotPassword from "./components/ForgotPassword";
import ForgotUsername from "./components/ForgotUsername";
import AIChatbot from "./components/AIChatbot";

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

function CustomerLoginPage() {
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
          {isLogin ? <CustomerLoginForm /> : <CustomerSignupForm />}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function AdminPrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  // Check for admin token (not customer token)
  if (!token || !user) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

function CustomerPrivateRoute({ children }) {
  const token = localStorage.getItem("customerToken");
  const customer = localStorage.getItem("customer");
  // Check for customer token (not admin token)
  if (!token || !customer) {
    return <Navigate to="/customer/login" replace />;
  }
  return children;
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
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "var(--bg-secondary)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-color)",
          },
          success: {
            iconTheme: {
              primary: "#4caf50",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#f44336",
              secondary: "#fff",
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<HomePage />} />

        {/* Customer Routes (Extranet) */}
        <Route path="/customer/login" element={<CustomerLoginPage />} />
        <Route
          path="/customer/dashboard"
          element={
            <CustomerPrivateRoute>
              <CustomerDashboard />
            </CustomerPrivateRoute>
          }
        />
        <Route
          path="/customer/vehicles/add"
          element={
            <CustomerPrivateRoute>
              <CustomerAddVehicle />
            </CustomerPrivateRoute>
          }
        />
        <Route
          path="/customer/orders/new"
          element={
            <CustomerPrivateRoute>
              <CustomerNewOrder />
            </CustomerPrivateRoute>
          }
        />

        {/* Admin Routes (Intranet) */}
        <Route path="/admin/login" element={<LoginPage />} />
        <Route
          path="/admin/dashboard"
          element={
            <AdminPrivateRoute>
              <Dashboard />
            </AdminPrivateRoute>
          }
        />
        <Route
          path="/admin/customers"
          element={
            <AdminPrivateRoute>
              <CustomersList />
            </AdminPrivateRoute>
          }
        />
        <Route
          path="/admin/customers/add"
          element={
            <AdminPrivateRoute>
              <AddCustomer />
            </AdminPrivateRoute>
          }
        />
        <Route
          path="/admin/customers/:id"
          element={
            <AdminPrivateRoute>
              <CustomerDetail />
            </AdminPrivateRoute>
          }
        />
        <Route
          path="/admin/customers/:id/edit"
          element={
            <AdminPrivateRoute>
              <EditCustomer />
            </AdminPrivateRoute>
          }
        />
        <Route
          path="/admin/customers/:id/vehicles/add"
          element={
            <AdminPrivateRoute>
              <AddVehicle />
            </AdminPrivateRoute>
          }
        />
        {/* Routes for Orders */}
        <Route
          path="/admin/orders"
          element={
            <AdminPrivateRoute>
              <OrdersList />
            </AdminPrivateRoute>
          }
        />
        <Route
          path="/admin/orders/new"
          element={
            <AdminPrivateRoute>
              <NewOrder />
            </AdminPrivateRoute>
          }
        />
        <Route
          path="/admin/orders/:id"
          element={
            <AdminPrivateRoute>
              <OrderDetail />
            </AdminPrivateRoute>
          }
        />
        <Route
          path="/admin/orders/:id/edit"
          element={
            <AdminPrivateRoute>
              <OrderDetail />
            </AdminPrivateRoute>
          }
        />
        {/* Routes for Employees */}
        <Route
          path="/admin/employees"
          element={
            <AdminPrivateRoute>
              <EmployeesList />
            </AdminPrivateRoute>
          }
        />
        <Route
          path="/admin/employees/add"
          element={
            <AdminPrivateRoute>
              <AddEmployee />
            </AdminPrivateRoute>
          }
        />
        <Route
          path="/admin/employees/:id/edit"
          element={
            <AdminPrivateRoute>
              <EditEmployee />
            </AdminPrivateRoute>
          }
        />
        {/* Route for Services */}
        <Route
          path="/admin/services"
          element={
            <AdminPrivateRoute>
              <ServicesList />
            </AdminPrivateRoute>
          }
        />

        {/* Admin Forgot Password/Username */}
        <Route
          path="/admin/forgot-password"
          element={<ForgotPassword userType="admin" />}
        />
        <Route
          path="/admin/forgot-username"
          element={<ForgotUsername userType="admin" />}
        />

        {/* Customer Forgot Password/Username */}
        <Route
          path="/customer/forgot-password"
          element={<ForgotPassword userType="customer" />}
        />
        <Route
          path="/customer/forgot-username"
          element={<ForgotUsername userType="customer" />}
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <AIChatbot />
    </Router>
  );
}

export default App;
