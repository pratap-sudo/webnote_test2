import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('theme');
    if (stored) return stored;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  const handleLogout = () => {
    logout();
    setIsSidebarOpen(false);
    navigate('/login');
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleOptionClick = (option) => {
    setShowDropdown(false);
    setIsSidebarOpen(false);
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

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="navbar-title">WebNote</Link>

        <div className="navbar-links desktop-links">
          <Link to="/">Home</Link>
          <Link to="/public-data">Public Data</Link>
          <Link to="/channels">Channels</Link>
          {isLoggedIn && <Link to="/dashboard">Dashboard</Link>}
          {!isLoggedIn && <Link to="/register">Register</Link>}
          {!isLoggedIn && <Link to="/login">Login</Link>}
          <Link to="/admin-login" className="admin-link">Admin</Link>
          {isLoggedIn && <button onClick={handleLogout}>Logout</button>}

          <div className="more-options">
            <button className="more-btn" onClick={toggleDropdown}>More</button>
            {showDropdown && (
              <div className="dropdown-box">
                <p onClick={() => handleOptionClick('about')}>About Us</p>
                <p onClick={() => handleOptionClick('rate')}>Rate Us</p>
                <p onClick={() => handleOptionClick('feedback')}>Feedback</p>
              </div>
            )}
          </div>
        </div>

        <div className="navbar-actions">
          <button type="button" className="theme-toggle-btn" onClick={toggleTheme}>
            {theme === 'dark' ? 'Light Mode' : 'Night Mode'}
          </button>
          <button
            type="button"
            className="hamburger-btn"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open menu"
          >
            ?
          </button>
        </div>
      </nav>

      <div className={`mobile-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={closeSidebar} />
      <aside className={`mobile-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-head">
          <span>Menu</span>
          <button type="button" className="sidebar-close" onClick={closeSidebar}>x</button>
        </div>

        <div className="sidebar-links">
          <Link to="/" onClick={closeSidebar}>Home</Link>
          <Link to="/public-data" onClick={closeSidebar}>Public Data</Link>
          <Link to="/channels" onClick={closeSidebar}>Channels</Link>
          {isLoggedIn && <Link to="/dashboard" onClick={closeSidebar}>Dashboard</Link>}
          {!isLoggedIn && <Link to="/register" onClick={closeSidebar}>Register</Link>}
          {!isLoggedIn && <Link to="/login" onClick={closeSidebar}>Login</Link>}
          <Link to="/admin-login" onClick={closeSidebar}>Admin</Link>
          <button type="button" className="theme-toggle-btn" onClick={toggleTheme}>
            {theme === 'dark' ? 'Light Mode' : 'Night Mode'}
          </button>
          <button type="button" onClick={() => handleOptionClick('about')}>About Us</button>
          <button type="button" onClick={() => handleOptionClick('rate')}>Rate Us</button>
          <button type="button" onClick={() => handleOptionClick('feedback')}>Feedback</button>
          {isLoggedIn && <button type="button" onClick={handleLogout}>Logout</button>}
        </div>
      </aside>
    </>
  );
}

export default Navbar;
