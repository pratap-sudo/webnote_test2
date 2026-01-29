// -------------------- components/Navbar.jsx --------------------
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleOptionClick = (option) => {
    setShowDropdown(false);
    switch (option) {
      case 'about':
        navigate('/about');
        break;
      case 'rate':
        window.open(
          'https://docs.google.com/forms/d/e/YOUR_RATE_FORM_ID/viewform',
          '_blank'
        );
        break;
      case 'feedback':
        window.open(
          'https://docs.google.com/forms/d/e/YOUR_FEEDBACK_FORM_ID/viewform',
          '_blank'
        );
        break;
      default:
        break;
    }
  };

  return (
    <>
      <nav className="navbar">
        <h1 className="navbar-title">WebNote</h1>
        <div className="navbar-links">
          <Link to="/">Home</Link>
          {!isLoggedIn && <Link to="/register">Register</Link>}
          {!isLoggedIn && <Link to="/login">Login</Link>}
          {isLoggedIn && <Link to="/dashboard">Dashboard</Link>}
          {isLoggedIn && <button onClick={handleLogout}>Logout</button>}
          <Link to="/admin-login" className="admin-link">Admin</Link>

          {/* More Button and Dropdown */}
          <div className="more-options">
            <button className="more-btn" onClick={toggleDropdown}>☰ More</button>
            {showDropdown && (
              <div className="dropdown-box">
                <p onClick={() => handleOptionClick('about')}>About Us</p>
                <p onClick={() => handleOptionClick('rate')}>Rate Us</p>
                <p onClick={() => handleOptionClick('feedback')}>Feedback</p>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;