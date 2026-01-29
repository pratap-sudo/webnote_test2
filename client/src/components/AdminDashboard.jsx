import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import Navbar from './Navbar';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    totalFiles: 0,
    users: []
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');

  const fetchStats = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await axios.get('http://localhost:5000/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
      setLoading(false);
    } catch (err) {
      alert('Error fetching stats');
      navigate('/admin-login');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    const token = localStorage.getItem('adminToken');
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('User deleted successfully');
      fetchStats();
    } catch (err) {
      alert('Error deleting user');
    }
  };

  const handleToggleAdmin = async (userId) => {
    const token = localStorage.getItem('adminToken');
    try {
      await axios.patch(
        `http://localhost:5000/api/admin/users/${userId}/toggle-admin`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Admin status updated');
      fetchStats();
    } catch (err) {
      alert('Error updating admin status');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin-login');
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <div className="loading">Loading admin dashboard...</div>;

  return (
    <div className="admin-container">
      <Navbar />
      
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-number">{stats.totalUsers}</p>
        </div>
        <div className="stat-card">
          <h3>Total Admins</h3>
          <p className="stat-number">{stats.totalAdmins}</p>
        </div>
        <div className="stat-card">
          <h3>Total Files</h3>
          <p className="stat-number">{stats.totalFiles}</p>
        </div>
      </div>

      <div className="users-section">
        <h2>All Users</h2>
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Files</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {stats.users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.fileCount}</td>
                <td>
                  <span className={`status-badge ${user.isAdmin ? 'admin' : 'user'}`}>
                    {user.isAdmin ? 'Admin' : 'User'}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="action-buttons">
                  <button
                    onClick={() => handleToggleAdmin(user.id)}
                    className={`toggle-btn ${user.isAdmin ? 'revoke' : 'grant'}`}
                  >
                    {user.isAdmin ? 'Revoke Admin' : 'Make Admin'}
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {stats.users.length === 0 && <p>No users found.</p>}
      </div>
    </div>
  );
}

export default AdminDashboard;
