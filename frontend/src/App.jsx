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

function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="App">
      <Header />
      <main className="main-content">
        <div className="auth-container">
          <div className="auth-tabs">
            <button
              className={`auth-tab ${isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(true)}
            >
              LOGIN
            </button>
            <button
              className={`auth-tab ${!isLogin ? 'active' : ''}`}
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
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" replace />;
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

