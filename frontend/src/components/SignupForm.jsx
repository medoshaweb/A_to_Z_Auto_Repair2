import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminAuthAPI } from "../api";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import toast from "react-hot-toast";
import "./SignupForm.css";

const SignupForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "Employee",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Check if user is admin on mount
  useEffect(() => {
    const rawUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    
    if (!token || !rawUser) {
      toast.error("You must be logged in as an Admin to create accounts");
      navigate("/admin/login");
      return;
    }

    try {
      const user = JSON.parse(rawUser);
      if (user?.role !== "Admin") {
        toast.error("Only Administrators can create new accounts");
        navigate("/admin/dashboard");
      }
    } catch (e) {
      toast.error("Invalid user session. Please log in again.");
      navigate("/admin/login");
    }
  }, [navigate]);

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

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      // Verify admin access before submitting
      const rawUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      
      if (!token || !rawUser) {
        setError("You must be logged in as an Admin to create accounts");
        toast.error("Authentication required");
        return;
      }

      const user = JSON.parse(rawUser);
      if (user?.role !== "Admin") {
        setError("Only Administrators can create new accounts");
        toast.error("Access denied: Admin role required");
        return;
      }

      // Use the API module which includes authentication token
      const response = await adminAuthAPI.register(
        formData.first_name,
        formData.last_name,
        formData.email,
        formData.password,
        formData.role,
        formData.phone
      );

      // Show success message
      toast.success(`Account created successfully! Role: ${formData.role}`);

      // Reset form
      setFormData({ 
        first_name: "", 
        last_name: "",
        email: "", 
        password: "", 
        confirmPassword: "",
        phone: "",
        role: "Employee"
      });

      // Redirect to employees list to see the new account
      navigate("/admin/employees");
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Signup failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-form-wrapper">
        <h1 className="signup-title">
          Create your account
          <span className="title-underline"></span>
        </h1>
        <form onSubmit={handleSubmit} className="signup-form">
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <input
              type="text"
              name="first_name"
              placeholder="First Name"
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
              placeholder="Last Name"
              value={formData.last_name}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
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
          <div className="form-group">
            <input
              type="tel"
              name="phone"
              placeholder="Phone (Optional)"
              value={formData.phone}
              onChange={handleChange}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="form-input"
            >
              <option value="Employee">Employee</option>
              <option value="Manager">Manager</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <div className="form-group password-input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
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
          <div className="form-group password-input-wrapper">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength="6"
              className="form-input"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <button type="submit" className="signup-button" disabled={loading}>
            {loading ? "SIGNING UP..." : "SIGN UP"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignupForm;
