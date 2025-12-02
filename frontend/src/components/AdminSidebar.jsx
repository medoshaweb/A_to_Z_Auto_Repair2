import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./AdminSidebar.css";

const AdminSidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: "/admin/dashboard", label: "Dashboard" },
    { path: "/admin/orders", label: "Orders" },
    { path: "/admin/orders/new", label: "New order" },
    { path: "/admin/employees/add", label: "Add employee" },
    { path: "/admin/employees", label: "Employees" },
    { path: "/admin/customers/add", label: "Add customer" },
    { path: "/admin/customers", label: "Customers" },
    { path: "/admin/services", label: "Services" },
  ];

  return (
    <aside className="admin-sidebar">
      <h2 className="sidebar-title">ADMIN MENU</h2>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
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
