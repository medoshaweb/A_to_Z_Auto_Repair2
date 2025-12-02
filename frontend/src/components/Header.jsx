import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isAdmin = user !== null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
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
                  src="/image/car_logo5.png"
                  alt="car_logo"
                  width="300"
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
            <span className="nav-separator">|</span>
            {isAdmin ? (
              <button className="logout-btn" onClick={handleLogout}>
                LOG OUT
              </button>
            ) : (
              <button className="sign-in-btn" onClick={() => navigate("/")}>
                SIGN IN
              </button>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;

