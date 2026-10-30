
import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-container">

        <div className="footer-brand">
          <h3>StudySphere</h3>
          <p>Your platform for smarter learning.</p>
        </div>

        <div className="footer-links">
          <h3>Quick Links</h3>
          <Link to="/">Home</Link>
          <Link to="/auth/login">Login</Link>
          <Link to="/auth/register">Register</Link>
        </div>

        <div className="footer-info">
          <h3>Our Platform</h3>
          <p>Online Courses</p>
          <p>Learning Resources</p>
          <p>Progress Tracking</p>
        </div>

      </div>

      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} StudySphere. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
