import { useEffect, useState } from 'react';
import { IconYouTube, IconTwitter, IconInstagram } from '../components/icons/SvgIcons';
import { YT_API_KEY, CREATOR_CHANNELS, VIDEOS_PER_CHANNEL, getTimeAgoLong } from '../services/api';

function CreatorVideoCard({ videoId, title, thumbUrl, dateStr, handle }) {
    const videoUrl = videoId
        ? `https://www.youtube.com/watch?v=${videoId}`
        : `https://youtube.com/@${handle}`;

    return (
        <a href={videoUrl} target="_blank" rel="noopener" className="creator-video-card">
            {thumbUrl ? (
                <img className="creator-video-thumb" src={thumbUrl} alt={title} loading="lazy" />
            ) : (
                <div style={{ width: '100%', aspectRatio: '16/9', backgroundColor: 'var(--bg-glass)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="creator-video-play-icon" style={{ opacity: 0.3 }}></div>
                </div>
            )}
            <div className="creator-video-play">
                <div className="creator-video-play-icon"></div>
            </div>
            <div className="creator-video-title">{title || `Visit YouTube to watch`}</div>
            <div className="creator-video-meta">{dateStr || `@${handle}`}</div>
        </a>
    );
}

export default function CreatorsPage() {
    const [videos, setVideos] = useState([]);
    const [loadingVideos, setLoadingVideos] = useState(true);

    useEffect(() => {
        async function loadVideos() {
            const creator = CREATOR_CHANNELS[0];
            try {
                const res = await fetch(
                    `https://www.googleapis.com/youtube/v3/search?key=${YT_API_KEY}&channelId=${creator.channelId}&part=snippet,id&order=date&maxResults=${VIDEOS_PER_CHANNEL}&type=video`
                );
                if (!res.ok) throw new Error('API fetch failed');
                const data = await res.json();
                if (data.error) throw new Error(data.error.message);
                if (!data.items || !data.items.length) throw new Error('No videos found');

                setVideos(data.items.map(item => {
                    const videoId = item.id.videoId;
                    const title = item.snippet.title;
                    const thumbUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
                    const published = item.snippet.publishedAt;
                    let dateStr = '';
                    if (published) {
                        const d = new Date(published);
                        const now = new Date();
                        const diffDays = Math.floor((now - d) / 86400000);
                        if (diffDays < 1) dateStr = 'TODAY';
                        else if (diffDays < 7) dateStr = `${diffDays}D AGO`;
                        else if (diffDays < 30) dateStr = `${Math.floor(diffDays / 7)}W AGO`;
                        else if (diffDays < 365) dateStr = `${Math.floor(diffDays / 30)}MO AGO`;
                        else dateStr = `${Math.floor(diffDays / 365)}Y AGO`;
                    }
                    return { videoId, title, thumbUrl, dateStr };
                }));
            } catch (err) {
                console.error('YouTube API Error:', err);
                // Fallback cards
                setVideos([1, 2, 3].map(() => ({ videoId: null, title: null, thumbUrl: null, dateStr: null })));
            }
            setLoadingVideos(false);
        }
        loadVideos();
    }, []);

    return (
        <section id="creators" className="page active">
            <div className="creators-container">
                <div className="creators-header">
                    <span className="creators-badge">CONTENT CREATORS</span>
                    <h2 className="creators-title">OUR <span className="accent">CREATORS</span></h2>
                    <div className="creators-divider"></div>
                </div>

                <div className="creators-grid">
                    <div className="creator-card-featured" id="creator-ozen">
                        <div className="creator-card-bg"></div>
                        <div className="creator-card-glow"></div>

                        <div className="creator-profile">
                            <img src="/assets/images/ozen-logo.jpg" alt="ozen" className="creator-avatar"
                                onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=ozen&background=111&color=fff'; }} />
                            <div className="creator-info">
                                <h3 className="creator-name">ozen</h3>
                                <span className="creator-role">CONTENT CREATOR · ORGANIZATION MANAGER</span>
                                <div className="creator-social-row">
                                    <a href="https://youtube.com/@ozen_gg" target="_blank" rel="noopener" className="creator-social-link" title="YouTube">
                                        <IconYouTube className="social-icon" />
                                    </a>
                                    <a href="https://x.com/ozen_gg" target="_blank" rel="noopener" className="creator-social-link" title="X / Twitter">
                                        <IconTwitter className="social-icon" />
                                    </a>
                                    <a href="https://www.instagram.com/ozen_gg" target="_blank" rel="noopener" className="creator-social-link" title="Instagram">
                                        <IconInstagram className="social-icon" />
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="creator-content-section">
                            <div className="creator-content-label">LATEST VIDEOS</div>
                            <div className="creator-videos">
                                {loadingVideos ? (
                                    <div className="creator-videos-loading">
                                        <div className="mini-spinner"></div>LOADING VIDEOS...
                                    </div>
                                ) : (
                                    videos.map((v, idx) => (
                                        <CreatorVideoCard key={idx} {...v} handle="ozen_gg" />
                                    ))
                                )}
                            </div>
                            <a href="https://youtube.com/@ozen_gg" target="_blank" rel="noopener" className="creator-view-all">
                                <IconYouTube className="social-icon" style={{ width: '14px', height: '14px' }} />
                                View All on YouTube
                            </a>
                        </div>
                        <div className="creator-card-border"></div>
                    </div>
                </div>
            </div>
        </section>
    );
}
