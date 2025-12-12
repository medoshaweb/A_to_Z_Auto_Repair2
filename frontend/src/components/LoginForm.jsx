import React, { useState } from "react";
import { Link } from "react-router-dom";
import { adminAuthAPI } from "../api";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import toast from "react-hot-toast";
import "./LoginForm.css";

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await adminAuthAPI.login(
        formData.email,
        formData.password
      );

      // Store token in localStorage
      const role = response.user?.role || "Admin";
      localStorage.setItem("token", response.token);
      localStorage.setItem(
        "user",
        JSON.stringify({ ...response.user, role })
      );

      // Show success message
      toast.success("Login successful!");

      // Reset form
      setFormData({ email: "", password: "" });

      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = "/admin/dashboard";
      }, 500);
    } catch (err) {
      const errorMessage = err.message || "Login failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-wrapper">
        <h1 className="login-title">
          Login to your account
          <span className="title-underline"></span>
        </h1>
        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          <div className="form-group password-input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="form-input"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <div style={{ textAlign: "right", marginBottom: "15px" }}>
            <Link
              to="/admin/forgot-password"
              style={{
                fontSize: "14px",
                color: "#dc143c",
                textDecoration: "none",
              }}
            >
              Forgot Password?
            </Link>
            <span style={{ margin: "0 10px", color: "#ccc" }}>|</span>
            <Link
              to="/admin/forgot-username"
              style={{
                fontSize: "14px",
                color: "#dc143c",
                textDecoration: "none",
              }}
            >
              Forgot Username?
            </Link>
          </div>
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "LOGGING IN..." : "LOGIN"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
