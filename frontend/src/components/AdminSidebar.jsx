import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./AdminSidebar.css";

const AdminSidebar = () => {
  const location = useLocation();
  
  // Get role with better error handling
  const getRole = () => {
    try {
      const rawUser = localStorage.getItem("user");
      if (!rawUser) {
        return "Admin";
      }
      const user = JSON.parse(rawUser);
      let role = user?.role || "Admin";
      
      // Normalize role (trim whitespace, capitalize first letter)
      if (typeof role === "string") {
        role = role.trim();
        // Fall back to "Admin" if role is empty after trimming
        if (!role) {
          return "Admin";
        }
        // Capitalize first letter, lowercase the rest (handle single char and empty)
        if (role.length > 0) {
          role = role.charAt(0).toUpperCase() + (role.length > 1 ? role.slice(1).toLowerCase() : "");
        } else {
          return "Admin";
        }
      } else {
        return "Admin";
      }
      
      return role;
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      return "Admin";
    }
  };
  
  const role = getRole();
  
  // Check if user has admin token (alternative way to verify admin access)
  const hasAdminToken = !!localStorage.getItem("token");
  
  // Determine if user is admin - if they have admin token and role is Admin (case-insensitive)
  // or if role is missing/empty (defaults to Admin)
  const isAdmin = hasAdminToken && role.toLowerCase() === "admin";

  const menuItems = [
    { path: "/admin/dashboard", label: "Dashboard", roles: ["Admin", "Manager", "Employee"] },
    { path: "/admin/orders", label: "Orders", roles: ["Admin", "Manager", "Employee"] },
    { path: "/admin/orders/new", label: "New order", roles: ["Admin", "Manager"] },
    { path: "/admin/employees/add", label: "Add employee", roles: ["Admin"] },
    { path: "/admin/employees", label: "Employees", roles: ["Admin"] },
    { path: "/admin/customers/add", label: "Add customer", roles: ["Admin", "Manager"] },
    { path: "/admin/customers", label: "Customers", roles: ["Admin", "Manager"] },
    { path: "/admin/services", label: "Services", roles: ["Admin", "Manager"] },
  ];
  
  // Filter menu items based on role (case-insensitive comparison)
  const filteredItems = menuItems.filter((item) => {
    // Check if role matches any of the allowed roles
    const hasAccess = item.roles.some(r => r.toLowerCase() === role.toLowerCase());
    
    // For Admin-only items, also check if user has admin token as fallback
    // This handles cases where role might not be stored correctly in localStorage
    if (!hasAccess && item.roles.length === 1 && item.roles[0] === "Admin") {
      return isAdmin;
    }
    
    return hasAccess;
  });

  return (
    <aside className="admin-sidebar">
      <h2 className="sidebar-title">ADMIN MENU</h2>
      <nav className="sidebar-nav">
        {filteredItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-link ${
              location.pathname === item.path ? "active" : ""
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
