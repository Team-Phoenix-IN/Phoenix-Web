import { useState, useEffect } from 'react';
import { IconDiscord } from './icons/SvgIcons';

const DISCORD_SERVER_ID = '1359130053341876404'; // From app.js
const DISCORD_INVITE_URL = 'https://discord.gg/9yPMDEsARR';

export default function DiscordWidget() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWidget() {
      if (!DISCORD_SERVER_ID) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`https://discord.com/api/guilds/${DISCORD_SERVER_ID}/widget.json`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.warn('Discord widget fetch failed:', err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchWidget();
    const interval = setInterval(fetchWidget, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="discord-widget-card discord-widget-skeleton">
        {/* Skeleton animation handles this via CSS */}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="discord-widget-card">
        <div className="discord-widget-fallback" style={{ textAlign: 'center' }}>
          <img src="/assets/images/phoenix-logo.png" alt="Server Logo" className="discord-server-icon" style={{ margin: '0 auto 16px', backgroundColor: 'var(--bg-glass)', display: 'block' }} />
          <p>Join our Discord community to connect with the team and other fans!</p>
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <a href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer" className="discord-join-btn">
              <IconDiscord style={{ width: '20px', height: '20px' }} />
              JOIN DISCORD
            </a>
          </div>
        </div>
      </div>
    );
  }

  const voiceChannels = data.channels || [];
  const members = data.members || [];
  const onlineCount = data.presence_count || members.length;
  const serverName = data.name || "Discord Server";

  const maxBubbles = 12;
  const membersToShow = members.slice(0, maxBubbles);
  const overflow = Math.max(0, members.length - maxBubbles);

  return (
    <div className="discord-widget-card">
      <div className="discord-widget-bg"></div>
      <div className="discord-widget-glow"></div>
      <div className="discord-widget-content">
        <div className="discord-server-row">
          <img src="/assets/images/phoenix-logo.png" alt="Server Logo" className="discord-server-icon" style={{ backgroundColor: 'var(--bg-glass)' }} />
          <div className="discord-server-info">
            <div className="discord-server-name">{serverName}</div>
            <div className="discord-server-online">
              <span className="discord-online-dot"></span>
              {onlineCount} Online
            </div>
          </div>
        </div>

        <div className="discord-voice-section">
          <div className="discord-voice-label">VOICE CHANNELS</div>
          <div className="discord-voice-list">
            {voiceChannels.length > 0 ? voiceChannels.map(ch => {
              const count = members.filter(m => m.channel_id === ch.id).length;
              return (
                <div key={ch.id} className="discord-voice-channel">
                  <svg className="discord-voice-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 2v20M17 5v14M7 5v14M22 9v6M2 9v6"/>
                  </svg>
                  <span className="discord-voice-name">{ch.name}</span>
                  <span className="discord-voice-count">{count}</span>
                </div>
              );
            }) : (
              <div className="discord-voice-empty">No active voice channels</div>
            )}
          </div>
        </div>

        <div className="discord-members-section">
          <div className="discord-members-label">ONLINE MEMBERS</div>
          <div className="discord-members-grid">
            {membersToShow.map((m, idx) => {
              const avatarUrl = m.avatar_url || `https://cdn.discordapp.com/embed/avatars/${parseInt(m.discriminator || '0') % 5}.png`;
              return (
                <div key={m.id || idx} className="discord-member-bubble">
                  <img src={avatarUrl} alt={m.username} loading="lazy" onError={(e) => { e.target.src='https://cdn.discordapp.com/embed/avatars/0.png' }} />
                  <div className={`discord-member-status-ring ${m.status}`}></div>
                  <div className="discord-member-name-tooltip">{m.username}</div>
                </div>
              );
            })}
            {overflow > 0 && <div className="discord-members-overflow">+{overflow}</div>}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <a href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer" className="discord-join-btn">
            <IconDiscord style={{ width: '20px', height: '20px' }} />
            JOIN DISCORD
          </a>
        </div>
      </div>
      <div className="discord-widget-border"></div>
    </div>
  );
}
