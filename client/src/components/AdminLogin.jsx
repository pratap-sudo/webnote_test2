import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';
import Navbar from './Navbar';

function AdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/admin/login', formData);
      localStorage.setItem('adminToken', res.data.token);
      navigate('/admin-dashboard');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="admin-login-container">
        <div className="admin-login-box">
          <h2 className="admin-login-heading">Admin Login</h2>
          <p className="admin-login-subtitle">Access the admin panel</p>
          
          <form onSubmit={handleSubmit} className="admin-login-form">
            <input
              name="email"
              type="email"
              placeholder="Email"
              onChange={handleChange}
              className="admin-login-input"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
              className="admin-login-input"
              required
            />
            <button 
              type="submit" 
              className="admin-login-button"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login as Admin'}
            </button>
          </form>
          {message && <p className="admin-login-message error">{message}</p>}
          
          <p className="admin-login-footer">
            Not an admin? <a href="/">Go back home</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
