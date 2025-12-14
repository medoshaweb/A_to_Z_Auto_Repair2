import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { employeesAPI } from "../api";
import AdminSidebar from "../components/AdminSidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import toast from "react-hot-toast";
import "./EmployeesList.css";

const EditEmployee = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    role: "Employee",
    password: "",
    is_active: true,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    try {
      const response = await employeesAPI.getById(id);
      const employee = response.employee;
      setFormData({
        email: employee.email,
        first_name: employee.first_name,
        last_name: employee.last_name,
        phone: employee.phone || "",
        role: employee.role || "Employee",
        password: "", // Don't pre-fill password
        is_active: employee.is_active,
      });
    } catch (error) {
      console.error("Error fetching employee:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to load employee data";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // If password is empty, don't send it in the update
      const updateData = { ...formData };
      if (!updateData.password || updateData.password.trim() === "") {
        delete updateData.password;
      }

      await employeesAPI.update(id, updateData);
      toast.success("Employee updated successfully!");
      navigate("/admin/employees");
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to update employee. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="edit-employee-page">
        <Header />
        <div className="page-content">
          <AdminSidebar />
          <main className="main-admin-content">
            <div className="loading">Loading...</div>
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="edit-employee-page">
      <Header />
      <div className="page-content">
        <AdminSidebar />
        <main className="main-admin-content">
          <h1 className="page-title">
            Edit: {formData.first_name} {formData.last_name}
            <span className="title-underline"></span>
          </h1>

          <p className="employee-email">Employee email: {formData.email}</p>

          <div className="form-container">
            <form onSubmit={handleSubmit}>
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
                  type="tel"
                  name="phone"
                  placeholder="Phone"
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
                  placeholder="New password (leave blank to keep current)"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                  />
                  Is active employee
                </label>
              </div>

              <button
                type="submit"
                className="submit-button"
                disabled={loading}
              >
                {loading ? "UPDATING..." : "UPDATE"}
              </button>
            </form>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default EditEmployee;
