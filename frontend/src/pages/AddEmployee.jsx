import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { employeesAPI } from "../api";
import AdminSidebar from "../components/AdminSidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import toast from "react-hot-toast";
import "./AddEmployee.css";

const AddEmployee = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    role: "Employee",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

    if (
      !formData.email ||
      !formData.password ||
      !formData.first_name ||
      !formData.last_name
    ) {
      setError("Email, password, first name, and last name are required");
      setLoading(false);
      return;
    }

    try {
      await employeesAPI.create(formData);
      toast.success("Employee added successfully!");
      navigate("/admin/employees");
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to add employee. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-employee-page">
      <Header />
      <div className="page-content">
        <AdminSidebar />
        <main className="main-admin-content">
          <h1 className="page-title">
            Add a new employee
            <span className="title-underline"></span>
          </h1>

          <div className="form-container">
            <form onSubmit={handleSubmit}>
              {error && <div className="error-message">{error}</div>}

              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Employee email"
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
                  placeholder="Employee first name"
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
                  placeholder="Employee last name"
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
                  placeholder="Employee phone (555-555-5555)"
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
                  className="form-input"
                >
                  <option value="Employee">Employee</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div className="form-group">
                <input
                  type="password"
                  name="password"
                  placeholder="Employee password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>

              <button
                type="submit"
                className="submit-button"
                disabled={loading}
              >
                {loading ? "ADDING..." : "ADD EMPLOYEE"}
              </button>
            </form>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AddEmployee;
