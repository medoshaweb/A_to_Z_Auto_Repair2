import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";

const Header = () => {
  const navigate = useNavigate();
  const adminUser = JSON.parse(localStorage.getItem("user") || "null");
  const customer = JSON.parse(localStorage.getItem("customer") || "null");
  const isAdmin = adminUser !== null;
  const isCustomer = customer !== null;

  const handleAdminLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleCustomerLogout = () => {
    localStorage.removeItem("customerToken");
    localStorage.removeItem("customer");
    navigate("/");
  };

  return (
    <header className="header">
      <div className="top-bar">
        <div className="top-bar-left">
          <span>Services Beyond Expectation</span>
        </div>
        <div className="top-bar-right">
          <span>Monday - Saturday 7:00AM - 6:00PM</span>
          <span className="separator">|</span>
          <span>Call Abe: 1800 456 7890</span>
          {isAdmin && (
            <>
              <span className="separator">|</span>
              <span>Welcome Admin</span>
            </>
          )}
        </div>
      </div>
      <nav className="main-nav">
        <div className="nav-container">
          <div className="logo-section">
            <div className="logo-icon">
              <img
                src="/image/Red-and-Blue.png"
                alt="car_logo"
                width="150"
                height="70"
              />
            </div>
          </div>
          <div className="nav-links">
            <Link to="/" className="nav-link">
              HOME
            </Link>
            <a href="#about" className="nav-link">
              ABOUT US
            </a>
            <a href="#services" className="nav-link">
              SERVICES
            </a>
            <a href="#contact" className="nav-link">
              CONTACT US
            </a>
            {isAdmin && (
              <Link to="/admin/dashboard" className="nav-link">
                ADMIN
              </Link>
            )}
            {isCustomer && (
              <Link to="/customer/dashboard" className="nav-link">
                MY ACCOUNT
              </Link>
            )}
            <span className="nav-separator">|</span>
            {isAdmin ? (
              <button className="logout-btn" onClick={handleAdminLogout}>
                LOG OUT
              </button>
            ) : isCustomer ? (
              <button className="logout-btn" onClick={handleCustomerLogout}>
                LOG OUT
              </button>
            ) : (
              <>
                <button
                  className="sign-in-btn"
                  onClick={() => navigate("/customer/login")}
                >
                  CUSTOMER LOGIN
                </button>
                <button
                  className="sign-in-btn"
                  onClick={() => navigate("/admin/login")}
                  style={{ marginLeft: "10px" }}
                >
                  ADMIN LOGIN
                </button>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
