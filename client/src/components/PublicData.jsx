import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import './PublicData.css';

function getFileType(fileUrl) {
  const extension = fileUrl.split('.').pop().toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return 'image';
  if (extension === 'pdf') return 'pdf';
  return 'file';
}

function getFilename(fileUrl) {
  const filename = fileUrl.split('/').pop() || fileUrl;
  return decodeURIComponent(filename);
}

function PublicData() {
  const [files, setFiles] = useState([]);
  const [channels, setChannels] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  const categories = ['all', 'movies', 'books', 'videos', 'study materials'];
  const allowedCategories = categories.filter((category) => category !== 'all');

  const normalizeText = (value) => (value || '').toString().toLowerCase();

  const getItemCategory = (item) => {
    const explicitCategory = normalizeText(item.category);
    return allowedCategories.includes(explicitCategory) ? explicitCategory : '';
  };

  const fetchPublicFiles = async () => {
    try {
      const [publicDataRes, channelsRes] = await Promise.all([
        axios.get('https://androidwebnote.onrender.com/api/public-data'),
        axios.get('https://androidwebnote.onrender.com/api/channels'),
      ]);
      setFiles(publicDataRes.data.files || []);
      setChannels(channelsRes.data.channels || []);
    } catch (err) {
      setFiles([]);
      setChannels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicFiles();
  }, []);

  const filteredFiles = files.filter((item) => {
    const query = searchTerm.trim().toLowerCase();
    const itemCategory = getItemCategory(item);
    const categoryMatches = activeCategory === 'all' || itemCategory === activeCategory;

    if (!categoryMatches) return false;
    if (!query) return true;

    const filename = getFilename(item.url).toLowerCase();
    const description = (item.description || '').toLowerCase();
    return filename.includes(query) || description.includes(query);
  });

  return (
    <div className="public-data-container">
      <Navbar />
      <div className="public-data-content">
        <h1>Public Data</h1>
        <p>Files marked as public are listed here.</p>

        <div className="public-channels-box">
          <h3>Browse Channels</h3>
          {channels.length === 0 ? (
            <p className="public-channel-empty">No public channels yet.</p>
          ) : (
            <div className="public-channel-list">
              {channels.map((channel) => (
                <Link key={channel.id} className="public-channel-item" to={channel.url || `/channel/${channel.id}`}>
                  {channel.logoUrl ? (
                    <img className="channel-avatar" src={channel.logoUrl} alt={channel.name || 'Channel'} />
                  ) : (
                    <span className="channel-avatar channel-avatar-fallback">
                      {(channel.name || 'C').charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span className="public-channel-meta">
                    <span>{channel.name} ({channel.publicFileCount})</span>
                    {channel.handle && <span className="public-channel-handle">@{channel.handle}</span>}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <input
          type="text"
          className="public-search-input"
          placeholder="Search public content by word..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="public-filter-row">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={`public-filter-btn ${activeCategory === category ? 'active' : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="public-empty">Loading...</div>
        ) : filteredFiles.length === 0 ? (
          <div className="public-empty">
            {files.length === 0 ? 'No public files available.' : 'No public content matches your search.'}
          </div>
        ) : (
          <div className="public-grid">
            {filteredFiles.map((item, index) => {
              const fileType = getFileType(item.url);
              const filename = getFilename(item.url);

              return (
                <div className="public-card" key={`${item.url}-${index}`}>
                  <div className="public-preview">
                    {fileType === 'image' ? (
                      <img src={item.url} alt={filename} />
                    ) : (
                      <span className="public-file-label">{fileType.toUpperCase()}</span>
                    )}
                  </div>
                  <div className="public-info">
                    <div className="public-text">
                      <p className="public-name" title={filename}>{filename}</p>
                      {(item.ownerChannelUrl || item.ownerId) && (
                        <Link className="public-owner-link" to={item.ownerChannelUrl || `/channel/${item.ownerId}`}>
                          {item.ownerLogoUrl ? (
                            <img className="channel-avatar small" src={item.ownerLogoUrl} alt={item.ownerName || 'Owner'} />
                          ) : (
                            <span className="channel-avatar channel-avatar-fallback small">
                              {(item.ownerName || 'C').charAt(0).toUpperCase()}
                            </span>
                          )}
                          by {item.ownerName || 'Unknown User'}
                        </Link>
                      )}
                      {item.description && <p className="public-description">{item.description}</p>}
                    </div>
                    <a href={item.url} target="_blank" rel="noreferrer" className="public-open-link">
                      Open
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default PublicData;
