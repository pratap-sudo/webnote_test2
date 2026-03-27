import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import Navbar from './Navbar';
import { API_BASE_URL } from '../config/api';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    totalFiles: 0,
    users: []
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [auditLogs, setAuditLogs] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');

  const fetchStats = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (err) {
      alert('Error fetching stats');
      navigate('/admin-login');
    }
  };

  const fetchAuditLogs = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/audit-logs?limit=25`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAuditLogs(res.data.logs || []);
    } catch (err) {
      // keep silent for now
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    const token = localStorage.getItem('adminToken');
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/users/${userId}`, {
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
        `${API_BASE_URL}/api/admin/users/${userId}/toggle-admin`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Admin status updated');
      fetchStats();
      fetchAuditLogs();
    } catch (err) {
      alert('Error updating admin status');
    }
  };

  const handleToggleDisable = async (userId) => {
    const token = localStorage.getItem('adminToken');
    try {
      await axios.patch(
        `${API_BASE_URL}/api/admin/users/${userId}/toggle-disable`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('User status updated');
      fetchStats();
      fetchAuditLogs();
    } catch (err) {
      alert('Error updating user status');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin-login');
  };

  useEffect(() => {
    fetchStats();
    fetchAuditLogs();
  }, []);

  const filteredUsers = useMemo(() => {
    const term = query.trim().toLowerCase();
    let next = stats.users.filter((user) => {
      const matchesQuery = !term
        || String(user.name || '').toLowerCase().includes(term)
        || String(user.email || '').toLowerCase().includes(term);

      const matchesRole = roleFilter === 'all'
        || (roleFilter === 'admin' && user.isAdmin)
        || (roleFilter === 'user' && !user.isAdmin);

      return matchesQuery && matchesRole;
    });

    const dir = sortDir === 'asc' ? 1 : -1;
    next = [...next].sort((a, b) => {
      if (sortKey === 'name') {
        return dir * String(a.name || '').localeCompare(String(b.name || ''));
      }
      if (sortKey === 'fileCount') {
        return dir * ((a.fileCount || 0) - (b.fileCount || 0));
      }
      const aDate = new Date(a.createdAt || 0).getTime();
      const bDate = new Date(b.createdAt || 0).getTime();
      return dir * (aDate - bDate);
    });

    return next;
  }, [query, roleFilter, sortKey, sortDir, stats.users]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * pageSize;
  const pagedUsers = filteredUsers.slice(pageStart, pageStart + pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, roleFilter, sortKey, sortDir, pageSize]);

  const openUserDetails = async (user) => {
    const token = localStorage.getItem('adminToken');
    setSelectedUser(user);
    setDetailsLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/users/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedUser(res.data.user);
      fetchAuditLogs();
    } catch (err) {
      alert('Error fetching user details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeUserDetails = () => {
    setSelectedUser(null);
  };

  const handleExportCsv = () => {
    const rows = filteredUsers.map((user) => ({
      name: user.name || '',
      email: user.email || '',
      role: user.isAdmin ? 'Admin' : 'User',
      files: user.fileCount || 0,
      joined: user.createdAt ? new Date(user.createdAt).toISOString() : '',
    }));

    const header = ['name', 'email', 'role', 'files', 'joined'];
    const body = rows.map((row) =>
      header.map((key) => `"${String(row[key]).replace(/"/g, '""')}"`).join(',')
    );

    const csv = [header.join(','), ...body].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `users-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  if (loading) return <div className="loading">Loading admin dashboard...</div>;

  return (
    <div className="admin-container">
      <Navbar />
      
      <div className="admin-header">
        <div>
          <p className="admin-eyebrow">Operations</p>
          <h1>Admin Dashboard</h1>
          <p className="admin-subtitle">
            Monitor users, manage access, and keep the platform clean.
          </p>
        </div>
        <div className="admin-header-actions">
          <button onClick={fetchStats} className="refresh-btn">
            Refresh
          </button>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
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
        <div className="stat-card subtle">
          <h3>Visible Users</h3>
          <p className="stat-number">{filteredUsers.length}</p>
          <p className="stat-caption">
            {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Not synced yet'}
          </p>
        </div>
        <div className="stat-card">
          <h3>Disabled Users</h3>
          <p className="stat-number">
            {stats.users.filter((user) => user.isDisabled).length}
          </p>
        </div>
      </div>

      <div className="users-section">
        <div className="users-header">
          <div>
            <h2>All Users</h2>
            <p className="users-subtitle">Search, filter, and manage access in one place.</p>
          </div>
          <div className="users-actions">
            <button onClick={handleExportCsv} className="export-btn">
              Export CSV
            </button>
          </div>
        </div>

        <div className="users-controls">
          <div className="search-field">
            <input
              type="text"
              placeholder="Search by name or email"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label>
              Role
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="all">All</option>
                <option value="admin">Admins</option>
                <option value="user">Users</option>
              </select>
            </label>
            <label>
              Sort
              <select value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
                <option value="createdAt">Joined Date</option>
                <option value="name">Name</option>
                <option value="fileCount">File Count</option>
              </select>
            </label>
            <label>
              Page Size
              <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </label>
            <button
              type="button"
              className="sort-dir"
              onClick={() => setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
            >
              {sortDir === 'asc' ? 'Asc' : 'Desc'}
            </button>
          </div>
        </div>

        <div className="table-wrapper">
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
              {pagedUsers.map((user) => (
                <tr key={user.id} className={user.isDisabled ? 'row-disabled' : ''}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.fileCount}</td>
                  <td>
                    <div className="status-stack">
                      <span className={`status-badge ${user.isAdmin ? 'admin' : 'user'}`}>
                        {user.isAdmin ? 'Admin' : 'User'}
                      </span>
                      {user.isDisabled && (
                        <span className="status-badge disabled">Disabled</span>
                      )}
                    </div>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="action-buttons">
                    <button
                      onClick={() => openUserDetails(user)}
                      className="view-btn"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleToggleAdmin(user.id)}
                      className={`toggle-btn ${user.isAdmin ? 'revoke' : 'grant'}`}
                    >
                      {user.isAdmin ? 'Revoke Admin' : 'Make Admin'}
                    </button>
                    <button
                      onClick={() => handleToggleDisable(user.id)}
                      className={`toggle-btn ${user.isDisabled ? 'enable' : 'disable'}`}
                    >
                      {user.isDisabled ? 'Enable' : 'Disable'}
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
        </div>

        <div className="pagination">
          <button
            type="button"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={safePage === 1}
          >
            Previous
          </button>
          <span>
            Page {safePage} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={safePage === totalPages}
          >
            Next
          </button>
        </div>
        {filteredUsers.length === 0 && (
          <div className="empty-state">
            <p>No users match your filters.</p>
            <button className="reset-btn" onClick={() => { setQuery(''); setRoleFilter('all'); }}>
              Reset Filters
            </button>
          </div>
        )}
      </div>

      <div className="audit-section">
        <div className="audit-header">
          <h2>Audit Log</h2>
          <p>Recent admin actions</p>
        </div>
        <div className="audit-list">
          {auditLogs.map((log) => (
            <div key={log._id} className="audit-item">
              <div>
                <p className="audit-action">{log.action.replace('user.', '').toUpperCase()}</p>
                <p className="audit-meta">
                  {log.actorEmail || 'Admin'} {log.targetEmail ? `→ ${log.targetEmail}` : ''}
                </p>
              </div>
              <span className="audit-time">
                {new Date(log.createdAt).toLocaleString()}
              </span>
            </div>
          ))}
          {auditLogs.length === 0 && <p className="audit-empty">No activity yet.</p>}
        </div>
      </div>

      {selectedUser && (
        <div className="drawer-overlay" onClick={closeUserDetails}>
          <aside className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div>
                <h3>{selectedUser.name}</h3>
                <p>{selectedUser.email}</p>
              </div>
              <button className="drawer-close" onClick={closeUserDetails}>Close</button>
            </div>
            {detailsLoading ? (
              <p>Loading details...</p>
            ) : (
              <div className="drawer-body">
                <div className="drawer-meta">
                  <span>{selectedUser.isAdmin ? 'Admin' : 'User'}</span>
                  {selectedUser.isDisabled && <span className="drawer-badge">Disabled</span>}
                  <span>Joined {new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                </div>
                <h4>Files</h4>
                <ul className="drawer-files">
                  {(selectedUser.files || []).slice(0, 10).map((file, idx) => (
                    <li key={idx}>
                      <span className="file-url">{file.url || 'Unknown file'}</span>
                      <span className={`file-visibility ${file.visibility === 'public' ? 'public' : 'private'}`}>
                        {file.visibility || 'private'}
                      </span>
                    </li>
                  ))}
                </ul>
                {(selectedUser.files || []).length > 10 && (
                  <p className="drawer-note">Showing first 10 files.</p>
                )}
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
