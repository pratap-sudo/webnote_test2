// -------------------- components/Dashboard.jsx --------------------
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import Navbar from './Navbar';


function Dashboard() {
  const [files, setFiles] = useState([]);
  const [file, setFile] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const fetchFiles = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get('http://localhost:5000/api/account', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setFiles(res.data.files);
  };

  const getFileType = (filePath) => {
    const extension = filePath.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return 'images';
    if (extension === 'pdf') return 'pdf';
    if (['doc', 'docx', 'txt'].includes(extension)) return 'documents';
    if (['xls', 'xlsx', 'csv'].includes(extension)) return 'spreadsheets';
    return 'others';
  };

  const filteredFiles = files.filter(filePath => {
    const filename = filePath.split('/').pop().toLowerCase();
    const fileType = getFileType(filePath);
    
    const matchesSearch = filename.includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || fileType === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const handleUpload = async () => {
    if (!file) return;
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    await axios.post('http://localhost:5000/api/upload', formData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchFiles();
  };

  const handleDelete = async (fileUrl) => {
  const token = localStorage.getItem('token');

  try {
    await axios.post(
      'http://localhost:5000/api/delete',
      { fileUrl },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchFiles();
  } catch (err) {
    alert('Error deleting file');
  }
};


  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const renderFile = (filePath, index) => {
    const extension = filePath.split('.').pop().toLowerCase();
    const fullPath = filePath;
    const filename = filePath.split('/').pop();

    const getIcon = () => {
      if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return '🖼️';
      if (extension === 'pdf') return '📄';
      if (['doc', 'docx'].includes(extension)) return '📝';
      if (extension === 'txt') return '📋';
      if (['xls', 'xlsx', 'csv'].includes(extension)) return '📊';
      return '📁';
    };

    return (
      <div key={index} className="file-item">
        <div className="file-preview">
          {['jpg', 'jpeg', 'png', 'gif'].includes(extension) ? (
            <img src={fullPath} alt={filename} />
          ) : (
            <div className="file-icon">{getIcon()}</div>
          )}
        </div>

        <div className="file-info">
          <p className="file-name" title={filename}>{filename}</p>
          <p className="file-type">{extension.toUpperCase()}</p>
        </div>

        <div className="file-actions">
          <a href={fullPath} target="_blank" rel="noreferrer" className="view-btn" title="View file">
            👁️ View
          </a>
          <button className="delete-btn" onClick={() => handleDelete(filePath)}>
            🗑️ Delete
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <Navbar />
      
      <div className="dashboard-header">
        <h1>📁 Your Files</h1>
        <p className="file-count">{filteredFiles.length} file{filteredFiles.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="upload-section">
        <div className="upload-box">
          <input 
            type="file" 
            id="file-input"
            onChange={(e) => setFile(e.target.files[0])} 
            className="file-input"
          />
          <label htmlFor="file-input" className="file-label">
            <span className="upload-icon">📤</span>
            <span className="upload-text">Click to select a file or drag and drop</span>
            {file && <span className="selected-file">{file.name}</span>}
          </label>
        </div>
        
        <div className="action-buttons">
          <button onClick={handleUpload} className="upload-btn" disabled={!file}>
            ⬆️ Upload File
          </button>
          <button onClick={handleLogout} className="logout-btn">
            🚪 Logout
          </button>
        </div>
      </div>

      <div className="filter-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            📦 All
          </button>
          <button 
            className={`filter-btn ${filterType === 'images' ? 'active' : ''}`}
            onClick={() => setFilterType('images')}
          >
            🖼️ Images
          </button>
          <button 
            className={`filter-btn ${filterType === 'pdf' ? 'active' : ''}`}
            onClick={() => setFilterType('pdf')}
          >
            📄 PDF
          </button>
          <button 
            className={`filter-btn ${filterType === 'documents' ? 'active' : ''}`}
            onClick={() => setFilterType('documents')}
          >
            📝 Documents
          </button>
          <button 
            className={`filter-btn ${filterType === 'spreadsheets' ? 'active' : ''}`}
            onClick={() => setFilterType('spreadsheets')}
          >
            📊 Spreadsheets
          </button>
          <button 
            className={`filter-btn ${filterType === 'others' ? 'active' : ''}`}
            onClick={() => setFilterType('others')}
          >
            📁 Others
          </button>
        </div>
      </div>

      <div className="files-section">
        {filteredFiles.length > 0 ? (
          <div className="files-grid">
            {filteredFiles.map((file, index) => renderFile(file, index))}
          </div>
        ) : (
          <div className="empty-state">
            <p className="empty-icon">📭</p>
            <p className="empty-text">
              {files.length === 0 ? 'No files uploaded yet. Start by uploading your first file!' : 'No files match your filters.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
