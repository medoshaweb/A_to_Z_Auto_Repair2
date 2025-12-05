import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { GiFlatTire } from "react-icons/gi";
import { FaCarBattery } from "react-icons/fa";
import "./HomePage.css";

const HomePage = () => {
  const navigate = useNavigate();

  // Check if customer is logged in
  const customer = JSON.parse(localStorage.getItem("customer") || "null");
  const customerToken = localStorage.getItem("customerToken");
  const isCustomerLoggedIn = customer && customerToken;

  const handleScheduleService = () => {
    if (isCustomerLoggedIn) {
      // If logged in, go directly to service request page
      navigate("/customer/orders/new");
    } else {
      // If not logged in, go to customer login
      navigate("/customer/login");
    }
  };

  return (
    <div className="home-page">
      <Header />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">A to Z Auto Repair</h1>
          <p className="hero-subtitle">Services Beyond Expectation</p>
          <p className="hero-description">
            Your trusted partner for all automotive repair and maintenance
            needs. We provide expert service with quality you can count on.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={handleScheduleService}>
              Schedule Service
            </button>
            <button
              className="btn-secondary"
              onClick={() =>
                document
                  .getElementById("services")
                  .scrollIntoView({ behavior: "smooth" })
              }
            >
              Our Services
            </button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="container">
          <h2 className="section-title">About Us</h2>
          <div className="about-content">
            <div className="about-text">
              <h3>Your Trusted Auto Repair Experts</h3>
              <p>
                At A to Z Auto Repair, we've been serving our community with
                dedication and expertise for years. Our team of certified
                technicians is committed to providing the highest quality
                automotive repair and maintenance services.
              </p>
              <p>
                We understand that your vehicle is more than just
                transportation—it's an essential part of your daily life. That's
                why we treat every vehicle with care and attention to detail,
                ensuring you get back on the road safely and efficiently.
              </p>
              <ul className="about-features">
                <li>✓ Certified Technicians</li>
                <li>✓ Quality Service Guarantee</li>
                <li>✓ Fair and Transparent Pricing</li>
                <li>✓ Fast and Reliable Service</li>
              </ul>
            </div>
            <div className="about-image">
              <div className="image-placeholder">
                <span>Auto Repair Image</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services-section">
        <div className="container">
          <h2 className="section-title">Our Services</h2>
          <p className="section-subtitle">
            Comprehensive automotive solutions for all your vehicle needs
          </p>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">🔧</div>
              <h3>Engine Service & Repair</h3>
              <p>
                Complete engine diagnostics, repairs, and maintenance to keep
                your vehicle running smoothly.
              </p>
            </div>
            <div className="service-card">
              <div className="service-icon">🛠</div>
              <h3>Brake Repair & Service</h3>
              <p>
                Expert brake inspection, repair, and replacement services for
                your safety on the road.
              </p>
            </div>
            <div className="service-card">
              <div className="service-icon">⚙️</div>
              <h3>Transmission Service</h3>
              <p>
                Professional transmission diagnostics, repairs, and fluid
                services to ensure optimal performance.
              </p>
            </div>
            <div className="service-card">
              <div className="service-icon"><FaCarBattery /></div>
              <h3>Battery & Electrical</h3>
              <p>
                Complete electrical system diagnostics, battery replacement, and
                wiring repairs.
              </p>
            </div>
            <div className="service-card">
              <div className="service-icon"><GiFlatTire />
              </div>
              <h3>Tire & Wheel Service</h3>
              <p>
                Tire installation, rotation, balancing, and wheel alignment
                services.
              </p>
            </div>
            <div className="service-card">
              <div className="service-icon">💨</div>
              <h3>AC & Heating</h3>
              <p>
                Air conditioning and heating system repairs to keep you
                comfortable year-round.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section">
        <div className="container">
          <h2 className="section-title">Contact Us</h2>
          <div className="contact-content">
            <div className="contact-info">
              <div className="contact-item">
                <div className="contact-icon">📍</div>
                <div>
                  <h3>Address</h3>
                  <p>
                    54B, Tailstoi Town 5238 MT
                    <br />
                    La city, IA 522364
                  </p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">📞</div>
                <div>
                  <h3>Phone</h3>
                  <p>Call Abe: 1800 456 7890</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">✉️</div>
                <div>
                  <h3>Email</h3>
                  <p>contact@autorex.com</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">🕐</div>
                <div>
                  <h3>Hours</h3>
                  <p>
                    Monday - Saturday
                    <br />
                    7:00 AM - 6:00 PM
                  </p>
                </div>
              </div>
            </div>
            <div className="contact-form-container">
              <h3>Get In Touch</h3>
              <form className="contact-form">
                <input type="text" placeholder="Your Name" required />
                <input type="email" placeholder="Your Email" required />
                <input type="tel" placeholder="Your Phone" />
                <textarea
                  placeholder="Your Message"
                  rows="5"
                  required
                ></textarea>
                <button type="submit" className="btn-primary">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
