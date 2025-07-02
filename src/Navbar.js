import React, { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [darkMode, setDarkMode] = useState(false);

  const handleToggle = () => setDarkMode(!darkMode);

  return (
    <nav className={`navbar${darkMode ? " dark" : ""}`}>
      <div className="navbar-left">
        <img src="/logo.png" alt="Salon Logo" className="navbar-logo" />
        <span className="navbar-title">Lavish Ladies Beauty Salon & Spa</span>
      </div>
      <div className="navbar-links">
        <ul>
          <li><Link to="/services">Services</Link></li>
          <li><Link to="/gallery">Gallery</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/contact-us">Contact Us</Link></li>
        </ul>
      </div>
      <div className="navbar-right">
        <button className="login-btn">Login</button>
        <button className="toggle-btn" onClick={handleToggle}>
          {darkMode ? "🌙" : "☀️"}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;