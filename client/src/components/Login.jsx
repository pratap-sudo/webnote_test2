// -------------------- components/Login.jsx --------------------
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';


function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://androidwebnote.onrender.com/api/login', formData);
      // update auth context so app re-renders immediately
      login(res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setMessage(err.response.data.message);
    }
  };

  return (
    <div className="login-shell">
      <Navbar />
      <main className="login-page">
        <div className="login-container">
          <h2>Login</h2>
          <form onSubmit={handleSubmit}>
            <input name="email" placeholder="Email" onChange={handleChange} />
            <input type="password" name="password" placeholder="Password" onChange={handleChange} />
            <button type="submit">Login</button>
          </form>
          {message && <p className="login-message">{message}</p>}
        </div>
      </main>
    </div>
  );

}

export default Login;
