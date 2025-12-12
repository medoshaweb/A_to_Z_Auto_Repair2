import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./AdminSidebar.css";

const AdminSidebar = () => {
  const location = useLocation();
  const rawUser = localStorage.getItem("user");
  const role = rawUser ? JSON.parse(rawUser).role || "Admin" : "Admin";

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

  return (
    <aside className="admin-sidebar">
      <h2 className="sidebar-title">ADMIN MENU</h2>
      <nav className="sidebar-nav">
        {menuItems
          .filter((item) => item.roles.includes(role))
          .map((item) => (
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
