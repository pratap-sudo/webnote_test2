import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import './PublicData.css';

function Channels() {
  const [channels, setChannels] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const res = await axios.get('https://androidwebnote.onrender.com/api/channels');
        setChannels(res.data.channels || []);
      } catch (err) {
        setChannels([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, []);

  const filteredChannels = channels.filter((channel) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;
    const name = (channel.name || '').toLowerCase();
    const handle = (channel.handle || '').toLowerCase();
    return name.includes(query) || handle.includes(query);
  });

  return (
    <div className="public-data-container">
      <Navbar />
      <div className="public-data-content">
        <h1>Channel</h1>
        <p>All available public channels.</p>
        <input
          type="text"
          className="public-search-input"
          placeholder="Search channel by name or handle..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {loading ? (
          <div className="public-empty">Loading channels...</div>
        ) : filteredChannels.length === 0 ? (
          <div className="public-empty">
            {channels.length === 0 ? 'No public channels available.' : 'No channels match your search.'}
          </div>
        ) : (
          <div className="public-grid">
            {filteredChannels.map((channel) => (
              <div className="public-card" key={channel.id}>
                <div className="public-info">
                  {channel.logoUrl ? (
                    <img className="channel-avatar" src={channel.logoUrl} alt={channel.name || 'Channel'} />
                  ) : (
                    <span className="channel-avatar channel-avatar-fallback">
                      {(channel.name || 'C').charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div className="public-text">
                    <p className="public-name">{channel.name || 'Unknown User'}</p>
                    {channel.handle && <p className="public-description">@{channel.handle}</p>}
                    <p className="public-description">{channel.publicFileCount} public files</p>
                  </div>
                  <Link to={channel.url || `/channel/${channel.id}`} className="public-open-link">
                    Open
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Channels;
