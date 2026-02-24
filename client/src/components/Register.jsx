// -------------------- components/Register.jsx --------------------
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Register.css'; // ✅ Import external CSS
import Navbar from './Navbar';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', channelHandle: '' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://androidwebnote.onrender.com/api/register', formData);
      navigate('/login');
    } catch (err) {
      setMessage(err.response.data.message);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="register-container">
        
        <div className="register-box">
          <h2 className="register-heading">Register</h2>
          <form onSubmit={handleSubmit} className="register-form">
            <input
              name="name"
              placeholder="Name"
              onChange={handleChange}
              className="register-input"
            />
            <input
              name="email"
              placeholder="Email"
              onChange={handleChange}
              className="register-input"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
              className="register-input"
            />
            <input
              name="channelHandle"
              placeholder="Channel Handle (optional, e.g. pratap)"
              onChange={handleChange}
              className="register-input"
            />
            <button type="submit" className="register-button">Register</button>
          </form>
          {message && <p className="register-message">{message}</p>}
        </div>
      </div>
    </div>
  );
}

export default Register;
