import React from "react";
import { useNavigate, Link } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { GiFlatTire } from "react-icons/gi";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();

  const dashboardCards = [
    {
      category: "OPEN FOR ALL",
      title: "All Orders",
      link: "LIST OF ORDERS +",
      linkPath: "/admin/orders",
      icon: "⚙️",
    },
    {
      category: "OPEN FOR LEADS",
      title: "New Orders",
      link: "ADD ORDER +",
      linkPath: "/admin/orders/new",
      icon: "🔧",
    },
    {
      category: "OPEN FOR ADMINS",
      title: "Employees",
      link: "LIST OF EMPLOYEES +",
      linkPath: "/admin/employees",
      icon: "👤",
    },
    {
      category: "OPEN FOR ADMINS",
      title: "Add Employee",
      link: "ADD EMPLOYEE +",
      linkPath: "/admin/employees/add",
      icon: "➕",
    },
    {
      category: "SERVICE AND REPAIRS",
      title: "Engine Service & Repair",
      link: "READ MORE +",
      linkPath: "/admin/services",
      icon: "🛠",
    },
    {
      category: "SERVICE AND REPAIRS",
      title: "Tire & Wheels",
      link: "READ MORE +",
      linkPath: "/admin/services",
      icon: <GiFlatTire />,
    },
    {
      category: "SERVICE AND REPAIRS",
      title: "Engine Service & Repair",
      link: "READ MORE +",
      linkPath: "/admin/services",
      icon: "⚙️",
    },
    {
      category: "SERVICE AND REPAIRS",
      title: "Denting & Painting",
      link: "READ MORE +",
      linkPath: "/admin/services",
      icon: "🎨",
    },
  ];

  return (
    <div className="dashboard-page">
      <Header />
      <div className="page-content">
        <AdminSidebar />
        <main className="main-admin-content">
          <h1 className="page-title">
            Admin Dashboard
            <span className="title-underline"></span>
          </h1>
          <p className="dashboard-description">
            Welcome to your comprehensive auto repair management center. From
            this dashboard, you can efficiently manage all aspects of A to Z
            Auto Repair operations. Track and process service orders for our
            full range of automotive services including{" "}
            <strong>Engine Service & Repair</strong>,{" "}
            <strong>Brake Repair & Service</strong>,{" "}
            <strong>Transmission Service</strong>,{" "}
            <strong>Battery & Electrical Systems</strong>,{" "}
            <strong>Tire & Wheel Services</strong>,{" "}
            <strong>AC & Heating</strong>, <strong>Oil Changes</strong>,{" "}
            <strong>Spark Plug Replacement</strong>,{" "}
            <strong>Oxygen Sensor Services</strong>,{" "}
            <strong>Ignition System Repairs</strong>, and{" "}
            <strong>Camera Software Programming</strong>. Manage your team of
            certified technicians, monitor customer vehicles and service
            history, and ensure every order receives expert attention. This
            centralized hub empowers you to deliver "Services Beyond
            Expectation" with real-time order tracking, intelligent service
            recommendations, and seamless workflow management.
          </p>

          <div className="dashboard-cards-grid">
            {dashboardCards.map((card, index) => (
              <div key={index} className="dashboard-card">
                <div className="card-category">{card.category}</div>
                <div className="card-content">
                  <div className="card-text">
                    <h2 className="card-title">{card.title}</h2>
                    <Link to={card.linkPath} className="card-link">
                      {card.link}
                    </Link>
                  </div>
                  <div className="card-icon">{card.icon}</div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
