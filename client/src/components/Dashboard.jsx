import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';
import Navbar from './Navbar';

function normalizeFile(file) {
  if (!file) return null;
  if (typeof file === 'string') {
    return { url: file, visibility: 'private', description: '', category: '' };
  }
  return {
    url: file.url,
    visibility: file.visibility === 'public' ? 'public' : 'private',
    description: typeof file.description === 'string' ? file.description : '',
    category: typeof file.category === 'string' ? file.category : '',
  };
}

function Dashboard() {
  const [files, setFiles] = useState([]);
  const [myChannel, setMyChannel] = useState(null);
  const [channelHandleInput, setChannelHandleInput] = useState('');
  const [channelLogoFile, setChannelLogoFile] = useState(null);
  const [channelMessage, setChannelMessage] = useState('');
  const [file, setFile] = useState(null);
  const [visibility, setVisibility] = useState('private');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('study materials');
  const [convertFile, setConvertFile] = useState(null);
  const [convertFormat, setConvertFormat] = useState('pdf');
  const [isConverting, setIsConverting] = useState(false);
  const [convertedFileUrl, setConvertedFileUrl] = useState('');
  const [convertedFileName, setConvertedFileName] = useState('');
  const [convertMessage, setConvertMessage] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inputKey, setInputKey] = useState(0);
  const navigate = useNavigate();

  const fetchFiles = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get('https://androidwebnote.onrender.com/api/account', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const normalized = (res.data.files || []).map(normalizeFile).filter(Boolean);
    setFiles(normalized);
    setMyChannel(res.data.channel || null);
    setChannelHandleInput(res.data.channel?.handle || '');
  };

  const getFileType = (fileUrl) => {
    const extension = fileUrl.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return 'images';
    if (extension === 'pdf') return 'pdf';
    if (['doc', 'docx', 'txt'].includes(extension)) return 'documents';
    if (['xls', 'xlsx', 'csv'].includes(extension)) return 'spreadsheets';
    return 'others';
  };

  const getFilename = (fileUrl) => {
    const filename = fileUrl.split('/').pop() || fileUrl;
    return decodeURIComponent(filename);
  };

  const filteredFiles = files.filter((item) => {
    const filename = getFilename(item.url).toLowerCase();
    const fileDescription = (item.description || '').toLowerCase();
    const fileType = getFileType(item.url);
    const searchTerm = searchQuery.toLowerCase();
    const matchesSearch = filename.includes(searchTerm) || fileDescription.includes(searchTerm);
    const matchesFilter = filterType === 'all' || fileType === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleUpload = async () => {
    if (!file) return;
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('visibility', visibility);
    formData.append('description', description.trim());
    formData.append('category', category);

    await axios.post('https://androidwebnote.onrender.com/api/upload', formData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setFile(null);
    setDescription('');
    setInputKey((prev) => prev + 1);
    fetchFiles();
  };

  const handleConvert = async () => {
    if (!convertFile) return;
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', convertFile);
    formData.append('targetFormat', convertFormat);

    setIsConverting(true);
    setConvertMessage('');
    setConvertedFileUrl('');
    setConvertedFileName('');

    try {
      const res = await axios.post('https://androidwebnote.onrender.com/api/convert', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConvertedFileUrl(res.data?.convertedFile?.url || '');
      setConvertedFileName(res.data?.convertedFile?.filename || '');
      setConvertMessage('File converted successfully.');
    } catch (err) {
      setConvertMessage(err?.response?.data?.message || 'Conversion failed.');
    } finally {
      setIsConverting(false);
    }
  };

  const handleDelete = async (fileUrl) => {
    const token = localStorage.getItem('token');

    try {
      await axios.post(
        'https://androidwebnote.onrender.com/api/delete',
        { fileUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchFiles();
    } catch (err) {
      alert('Error deleting file');
    }
  };

  const handleSaveChannelHandle = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.patch(
        'https://androidwebnote.onrender.com/api/channel-handle',
        { channelHandle: channelHandleInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMyChannel(res.data.channel || null);
      setChannelHandleInput(res.data.channel?.handle || '');
      setChannelMessage('Channel handle updated.');
    } catch (err) {
      setChannelMessage(err?.response?.data?.message || 'Failed to update channel handle.');
    }
  };

  const handleSaveChannelLogo = async () => {
    if (!channelLogoFile) return;
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('logo', channelLogoFile);

    try {
      const res = await axios.patch('https://androidwebnote.onrender.com/api/channel-logo', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyChannel(res.data.channel || null);
      setChannelMessage('Channel logo updated.');
      setChannelLogoFile(null);
    } catch (err) {
      setChannelMessage(err?.response?.data?.message || 'Failed to update channel logo.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const renderFile = (item, index) => {
    const extension = item.url.split('.').pop().toLowerCase();
    const filename = getFilename(item.url);

    const getIcon = () => {
      if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return 'IMG';
      if (extension === 'pdf') return 'PDF';
      if (['doc', 'docx'].includes(extension)) return 'DOC';
      if (extension === 'txt') return 'TXT';
      if (['xls', 'xlsx', 'csv'].includes(extension)) return 'XLS';
      return 'FILE';
    };

    return (
      <div key={index} className="file-item">
        <div className="file-preview">
          {['jpg', 'jpeg', 'png', 'gif'].includes(extension) ? (
            <img src={item.url} alt={filename} />
          ) : (
            <div className="file-icon">{getIcon()}</div>
          )}
        </div>

        <div className="file-info">
          <p className="file-name" title={filename}>{filename}</p>
          <p className="file-type">{extension.toUpperCase()}</p>
          <p className={`file-visibility ${item.visibility}`}>{item.visibility}</p>
          {item.category && <p className="file-category">{item.category}</p>}
          {item.description && <p className="file-description">{item.description}</p>}
        </div>

        <div className="file-actions">
          <a href={item.url} target="_blank" rel="noreferrer" className="view-btn" title="View file">
            View
          </a>
          <button className="delete-btn" onClick={() => handleDelete(item.url)}>
            Delete
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <Navbar />

      <div className="dashboard-header">
        <h1>Your Files</h1>
        <p className="file-count">{filteredFiles.length} file{filteredFiles.length !== 1 ? 's' : ''}</p>
        {myChannel?.id && (
          <p className="channel-link-row">
            <Link className="channel-link" to={myChannel.url || `/channel/${myChannel.id}`}>
              Open My Channel
            </Link>
          </p>
        )}
      </div>

      <div className="upload-section">
        <div className="upload-box">
          <input
            key={inputKey}
            type="file"
            id="file-input"
            onChange={(e) => setFile(e.target.files[0])}
            className="file-input"
          />
          <label htmlFor="file-input" className="file-label">
            <span className="upload-icon">Upload</span>
            <span className="upload-text">Click to select a file</span>
            {file && <span className="selected-file">{file.name}</span>}
          </label>

          <div className="visibility-section">
            <p className="visibility-label">Who can see this file?</p>
            <div className="visibility-options">
              <label>
                <input
                  type="radio"
                  value="private"
                  checked={visibility === 'private'}
                  onChange={(e) => setVisibility(e.target.value)}
                />
                Private
              </label>
              <label>
                <input
                  type="radio"
                  value="public"
                  checked={visibility === 'public'}
                  onChange={(e) => setVisibility(e.target.value)}
                />
                Public
              </label>
            </div>
          </div>

          <div className="description-section">
            <label htmlFor="file-category" className="description-label">
              Category
            </label>
            <select
              id="file-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="description-input"
            >
              <option value="movies">Movies</option>
              <option value="books">Books</option>
              <option value="videos">Videos</option>
              <option value="study materials">Study Materials</option>
            </select>
          </div>

          <div className="description-section">
            <label htmlFor="file-description" className="description-label">
              Describe what this file is about
            </label>
            <textarea
              id="file-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="description-input"
              placeholder="Example: Notes about JavaScript arrays and objects"
              rows={3}
            />
          </div>
        </div>

        <div className="action-buttons">
          <button onClick={handleUpload} className="upload-btn" disabled={!file}>
            Upload File
          </button>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>

        <div className="convert-box">
          <h3 className="convert-title">Channel URL</h3>
          <p className="convert-subtitle">Set your shareable channel handle.</p>
          {myChannel?.logoUrl && (
            <img src={myChannel.logoUrl} alt="Channel logo" className="dashboard-channel-logo" />
          )}
          <div className="convert-controls">
            <input
              type="text"
              value={channelHandleInput}
              onChange={(e) => setChannelHandleInput(e.target.value)}
              className="convert-file-input"
              placeholder="your-handle"
            />
            <button
              onClick={handleSaveChannelHandle}
              className="convert-btn"
              disabled={!channelHandleInput.trim()}
            >
              Save Handle
            </button>
          </div>
          <div className="convert-controls">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setChannelLogoFile(e.target.files?.[0] || null)}
              className="convert-file-input"
            />
            <button
              onClick={handleSaveChannelLogo}
              className="convert-btn"
              disabled={!channelLogoFile}
            >
              Save Logo
            </button>
          </div>
          {myChannel?.url && (
            <p className="convert-message">
              Share: <a href={myChannel.url} className="convert-download-link">{myChannel.url}</a>
            </p>
          )}
          {channelMessage && <p className="convert-message">{channelMessage}</p>}

          <h3 className="convert-title">File Conversion (LibreOffice)</h3>
          <p className="convert-subtitle">Choose a file and convert it to another format.</p>

          <input
            type="file"
            onChange={(e) => setConvertFile(e.target.files[0] || null)}
            className="convert-file-input"
          />

          <div className="convert-controls">
            <select
              value={convertFormat}
              onChange={(e) => setConvertFormat(e.target.value)}
              className="convert-format-select"
            >
              <option value="pdf">PDF</option>
              <option value="docx">DOCX</option>
              <option value="txt">TXT</option>
              <option value="rtf">RTF</option>
              <option value="html">HTML</option>
              <option value="odt">ODT</option>
              <option value="xlsx">XLSX</option>
              <option value="csv">CSV</option>
              <option value="pptx">PPTX</option>
            </select>
            <button
              onClick={handleConvert}
              className="convert-btn"
              disabled={!convertFile || isConverting}
            >
              {isConverting ? 'Converting...' : 'Convert File'}
            </button>
          </div>

          {convertMessage && <p className="convert-message">{convertMessage}</p>}
          {convertedFileUrl && (
            <a href={convertedFileUrl} target="_blank" rel="noreferrer" className="convert-download-link">
              Download Converted File ({convertedFileName || 'file'})
            </a>
          )}
        </div>
      </div>

      <div className="filter-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search files by name or description..."
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
            All
          </button>
          <button
            className={`filter-btn ${filterType === 'images' ? 'active' : ''}`}
            onClick={() => setFilterType('images')}
          >
            Images
          </button>
          <button
            className={`filter-btn ${filterType === 'pdf' ? 'active' : ''}`}
            onClick={() => setFilterType('pdf')}
          >
            PDF
          </button>
          <button
            className={`filter-btn ${filterType === 'documents' ? 'active' : ''}`}
            onClick={() => setFilterType('documents')}
          >
            Documents
          </button>
          <button
            className={`filter-btn ${filterType === 'spreadsheets' ? 'active' : ''}`}
            onClick={() => setFilterType('spreadsheets')}
          >
            Spreadsheets
          </button>
          <button
            className={`filter-btn ${filterType === 'others' ? 'active' : ''}`}
            onClick={() => setFilterType('others')}
          >
            Others
          </button>
        </div>
      </div>

      <div className="files-section">
        {filteredFiles.length > 0 ? (
          <div className="files-grid">
            {filteredFiles.map((item, index) => renderFile(item, index))}
          </div>
        ) : (
          <div className="empty-state">
            <p className="empty-text">
              {files.length === 0 ? 'No files uploaded yet.' : 'No files match your filters.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
