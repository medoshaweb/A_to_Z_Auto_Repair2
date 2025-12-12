import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { employeesAPI } from "../api";
import AdminSidebar from "../components/AdminSidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import toast from "react-hot-toast";
import "./EmployeesList.css";

const EmployeesList = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeesAPI.getAll();
      console.log("Employees API response:", response);
      if (response && response.employees) {
        setEmployees(response.employees);
        if (response.employees.length === 0) {
          toast.success("No employees found");
        }
      } else if (Array.isArray(response)) {
        // Handle case where response is directly an array
        setEmployees(response);
        if (response.length === 0) {
          toast.success("No employees found");
        }
      } else {
        console.error("Unexpected response structure:", response);
        toast.error("Unexpected response format from server");
        setEmployees([]);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      console.error("Error details:", error.response || error.message);
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch employees";
      toast.error(errorMessage);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) {
      return;
    }

    try {
      await employeesAPI.delete(id);
      alert("Employee deleted successfully!");
      fetchEmployees();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete employee");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${month} - ${day} - ${year} | ${hours}:${minutes}`;
  };

  return (
    <div className="employees-list-page">
      <Header />
      <div className="page-content">
        <AdminSidebar />
        <main className="main-admin-content">
          <h1 className="page-title">
            Employees
            <span className="title-underline"></span>
          </h1>

          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <div className="table-container">
              <table className="employees-table">
                <thead>
                  <tr>
                    <th>Active</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Added Date</th>
                    <th>Role</th>
                    <th>Edit/Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="empty-message">
                        No employees found
                      </td>
                    </tr>
                  ) : (
                    employees.map((employee) => (
                      <tr key={employee.id}>
                        <td>{employee.is_active ? "Yes" : "No"}</td>
                        <td>{employee.first_name}</td>
                        <td>{employee.last_name}</td>
                        <td>{employee.email}</td>
                        <td>{employee.phone || "N/A"}</td>
                        <td>{formatDate(employee.created_at)}</td>
                        <td>{employee.role || "Employee"}</td>
                        <td>
                          <Link
                            to={`/admin/employees/${employee.id}/edit`}
                            className="edit-btn"
                          >
                            ✏️
                          </Link>
                          <button
                            onClick={() => handleDelete(employee.id)}
                            className="delete-btn"
                          >
                            🗑️
                          </button>
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

export default EmployeesList;
