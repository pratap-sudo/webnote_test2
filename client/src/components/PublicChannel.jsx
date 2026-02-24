import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
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

function PublicChannel() {
  const { channelRef } = useParams();
  const [channel, setChannel] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = ['all', 'movies', 'books', 'videos', 'study materials'];
  const allowedCategories = categories.filter((category) => category !== 'all');
  const normalizeText = (value) => (value || '').toString().toLowerCase();

  const getItemCategory = (item) => {
    const explicitCategory = normalizeText(item.category);
    return allowedCategories.includes(explicitCategory) ? explicitCategory : '';
  };

  useEffect(() => {
    const fetchChannel = async () => {
      try {
        const res = await axios.get(`https://androidwebnote.onrender.com/api/channels/${encodeURIComponent(channelRef || '')}`);
        setChannel(res.data.channel || null);
        setFiles(res.data.files || []);
      } catch (err) {
        setChannel(null);
        setFiles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChannel();
  }, [channelRef]);

  const filteredFiles = files.filter((item) => {
    const query = searchTerm.trim().toLowerCase();
    const categoryMatches = activeCategory === 'all' || getItemCategory(item) === activeCategory;
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
        {channel?.logoUrl ? (
          <img src={channel.logoUrl} alt={channel.name || 'Channel'} className="channel-avatar" />
        ) : (
          <span className="channel-avatar channel-avatar-fallback">
            {(channel?.name || 'C').charAt(0).toUpperCase()}
          </span>
        )}
        <h1>{channel?.name ? `${channel.name} Channel` : 'Channel'}</h1>
        <p>Public materials shared by this user.</p>
        <Link to="/public-data" className="public-back-link">Back to all public data</Link>
        <input
          type="text"
          className="public-search-input"
          placeholder="Search channel content..."
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
          <div className="public-empty">Loading channel...</div>
        ) : filteredFiles.length === 0 ? (
          <div className="public-empty">
            {files.length === 0 ? 'No public materials in this channel.' : 'No channel content matches your search.'}
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

export default PublicChannel;
