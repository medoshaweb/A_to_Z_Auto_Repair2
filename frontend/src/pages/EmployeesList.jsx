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
      console.log("Fetching employees...");
      const response = await employeesAPI.getAll();
      console.log(
        "Employees API response (full):",
        JSON.stringify(response, null, 2)
      );
      console.log("Response type:", typeof response);
      console.log("Is array?", Array.isArray(response));
      console.log("Has employees property?", response?.employees);
      console.log("Employees value:", response?.employees);

      // Handle different response structures
      if (response && response.employees !== undefined) {
        // Standard response: { employees: [...] }
        const employeesList = Array.isArray(response.employees)
          ? response.employees
          : [];
        console.log(`Setting ${employeesList.length} employees`);
        setEmployees(employeesList);
        if (employeesList.length === 0) {
          toast.info("No employees found in database");
        } else {
          toast.success(`Loaded ${employeesList.length} employee(s)`);
        }
      } else if (Array.isArray(response)) {
        // Response is directly an array
        console.log(`Setting ${response.length} employees from array`);
        setEmployees(response);
        if (response.length === 0) {
          toast.info("No employees found in database");
        } else {
          toast.success(`Loaded ${response.length} employee(s)`);
        }
      } else if (response && typeof response === "object") {
        // Check if response has data property
        if (response.data && Array.isArray(response.data)) {
          console.log(
            `Setting ${response.data.length} employees from data property`
          );
          setEmployees(response.data);
        } else {
          console.error("Unexpected response structure:", response);
          console.error("Response keys:", Object.keys(response || {}));
          toast.error("Unexpected response format from server");
          setEmployees([]);
        }
      } else {
        console.error("Unexpected response structure:", response);
        toast.error("Unexpected response format from server");
        setEmployees([]);
      }
    } catch (error) {
      // Safe error logging
      try {
        console.error("Error fetching employees:", error);
        if (error.response) {
          console.error("Error response status:", error.response.status);
          console.error("Error response data:", error.response.data);
        }
        if (error.message) {
          console.error("Error message:", error.message);
        }
      } catch (logError) {
        console.error("Error logging failed:", logError);
      }

      // More detailed error handling
      let errorMessage = "Failed to fetch employees";
      let showLogoutPrompt = false;

      if (error.response) {
        // Declare responseData outside conditional blocks to avoid ReferenceError
        const responseData = error.response.data || {};

        if (error.response.status === 401) {
          errorMessage = "Unauthorized. Please log out and log back in.";
          showLogoutPrompt = true;
        } else if (error.response.status === 403) {
          const details = responseData.details || "";
          const debug = responseData.debug || {};
          const userInfo = JSON.parse(localStorage.getItem("user") || "{}");

          errorMessage = `Access denied. Admin role required. ${details}`;
          showLogoutPrompt = true;

          console.error("403 Forbidden Details:");
          console.error("  - Your role in localStorage:", userInfo.role);
          console.error(
            "  - Your role in token:",
            debug.roleFromToken || "unknown"
          );
          console.error("  - Required roles:", debug.allowedRoles || ["Admin"]);
          console.error("  - Full debug info:", JSON.stringify(debug, null, 2));
          console.error("  - Full user object:", localStorage.getItem("user"));
          console.error(
            "\n⚠️ SOLUTION: Please log out and log back in to refresh your token with the correct role."
          );
        } else if (error.response.status === 500) {
          errorMessage = "Server error. Please try again later.";
        } else {
          errorMessage =
            responseData.message || responseData.error || errorMessage;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      if (showLogoutPrompt) {
        errorMessage +=
          "\n\nPlease log out and log back in to refresh your authentication token.";
      }

      toast.error(errorMessage, { duration: 7000 });
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
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h1 className="page-title" style={{ margin: 0 }}>
              Employees
              <span className="title-underline"></span>
            </h1>
            <button
              onClick={fetchEmployees}
              disabled={loading}
              style={{
                padding: "10px 20px",
                backgroundColor: "#1e3a8a",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "14px",
              }}
            >
              {loading ? "Refreshing..." : "🔄 Refresh"}
            </button>
          </div>

          {loading ? (
            <div
              className="loading"
              style={{ textAlign: "center", padding: "40px", fontSize: "18px" }}
            >
              Loading employees...
            </div>
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
                      <td
                        colSpan="8"
                        className="empty-message"
                        style={{
                          textAlign: "center",
                          padding: "40px",
                          fontSize: "16px",
                          color: "#666",
                        }}
                      >
                        <div>
                          <p style={{ marginBottom: "10px" }}>
                            No employees found in the database.
                          </p>
                          <p style={{ fontSize: "14px", color: "#999" }}>
                            Click "Add employee" in the sidebar to add your
                            first employee.
                          </p>
                        </div>
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
