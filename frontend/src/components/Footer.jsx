import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-container">
          <div className="footer-contact-item">
            <svg className="footer-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 0C6.48 0 3.5 2.98 3.5 6.5C3.5 11.28 10 20 10 20C10 20 16.5 11.28 16.5 6.5C16.5 2.98 13.52 0 10 0ZM10 8.75C8.76 8.75 7.75 7.74 7.75 6.5C7.75 5.26 8.76 4.25 10 4.25C11.24 4.25 12.25 5.26 12.25 6.5C12.25 7.74 11.24 8.75 10 8.75Z" fill="#DC143C"/>
            </svg>
            <span>54B, Tailstoi Town 5238 MT, La city, IA 522364</span>
          </div>
          <div className="footer-contact-item">
            <svg className="footer-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M18 2H2C0.9 2 0 2.9 0 4V16C0 17.1 0.9 18 2 18H18C19.1 18 20 17.1 20 16V4C20 2.9 19.1 2 18 2ZM18 6L10 11L2 6V4L10 9L18 4V6Z" fill="#DC143C"/>
            </svg>
            <span>Email us : contact@autorex.com</span>
          </div>
          <div className="footer-contact-item">
            <svg className="footer-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M17.5 13.5C16.4 13.5 15.4 13.3 14.5 12.9C14.3 12.8 14.1 12.7 13.8 12.7C13.5 12.7 13.2 12.8 13 13L11.2 14.8C8.4 13.5 6.5 11.6 5.2 8.8L7 7C7.2 6.8 7.3 6.5 7.3 6.2C7.3 5.9 7.2 5.7 7.1 5.5C6.7 4.6 6.5 3.6 6.5 2.5C6.5 1.9 6.1 1.5 5.5 1.5H2.5C1.9 1.5 1.5 1.9 1.5 2.5C1.5 11.3 8.7 18.5 17.5 18.5C18.1 18.5 18.5 18.1 18.5 17.5V14.5C18.5 13.9 18.1 13.5 17.5 13.5Z" fill="#DC143C"/>
            </svg>
            <span>Call us on : + 1800 456 7890</span>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="footer-container">
          <div className="footer-column">
            <p className="footer-description">
              Capitalize on low hanging fruit to identify a ballpark value added activity to beta test. Override the digital divide additional clickthroughs.
            </p>
          </div>
          <div className="footer-column">
            <h3 className="footer-column-title">Usefull Links</h3>
            <ul className="footer-links">
              <li><a href="#home">Home</a></li>
              <li><a href="#about">About Us</a></li>
              <li><a href="#appointment">Appointment</a></li>
              <li><a href="#testimonials">Testimonials</a></li>
              <li><a href="#contact">Contact Us</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h3 className="footer-column-title">Our Services</h3>
            <ul className="footer-links">
              <li><a href="#performance">Performance Upgrade</a></li>
              <li><a href="#transmission">Transmission Service</a></li>
              <li><a href="#brake">Break Repair & Service</a></li>
              <li><a href="#engine">Engine Service & Repair</a></li>
              <li><a href="#tire">Trye & Wheels</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h3 className="footer-column-title">Newsletter</h3>
            <p className="newsletter-text">Get latest updates and offers.</p>
            <div className="social-icons">
              <a href="#facebook" className="social-icon" aria-label="Facebook">
                <span>f</span>
              </a>
              <a href="#linkedin" className="social-icon" aria-label="LinkedIn">
                <span>in</span>
              </a>
              <a href="#twitter" className="social-icon" aria-label="Twitter">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M18.9 4.7C18.2 5 17.4 5.2 16.6 5.3C17.4 4.8 18 4 18.3 3C17.6 3.5 16.8 3.8 16 4C15.3 3.3 14.3 2.8 13.2 2.8C11.1 2.8 9.4 4.5 9.4 6.6C9.4 6.9 9.4 7.1 9.5 7.3C6.7 7.2 4.2 5.8 2.5 3.7C2.2 4.2 2 4.8 2 5.4C2 6.6 2.6 7.6 3.5 8.2C2.9 8.2 2.4 8 1.9 7.8V7.8C1.9 9.5 3.1 10.9 4.7 11.2C4.4 11.3 4.1 11.4 3.7 11.4C3.5 11.4 3.3 11.4 3.1 11.3C3.5 12.7 4.7 13.7 6.1 13.7C5 14.6 3.6 15.1 2.1 15.1C1.8 15.1 1.5 15.1 1.2 15.1C2.6 16 4.3 16.5 6.1 16.5C13.2 16.5 17.3 11.4 17.3 7C17.3 6.9 17.3 6.7 17.3 6.6C18.1 6.1 18.9 5.4 18.9 4.7Z" fill="currentColor"/>
                </svg>
              </a>
              <a href="#google" className="social-icon" aria-label="Google+">
                <span>G+</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

