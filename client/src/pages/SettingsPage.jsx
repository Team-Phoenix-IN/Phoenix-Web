import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiCall } from '../services/api';
import { IconGoogle, IconDiscord } from '../components/icons/SvgIcons';

function AvatarFallback({ name }) {
    const initials = (name || '??').substring(0, 2).toUpperCase();
    return <div className="avatar-fallback">{initials}</div>;
}

// Inline SVGs for tab navigation icons to make the component self-contained and visually appealing
const IconUser = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const IconConnection = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
);

const IconSocial = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
);

const IconGear = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);

const IconPalette = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
    </svg>
);

const IconCamera = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export default function SettingsPage() {
    const { currentUser, updateUser, linkGoogle, linkDiscord, unlinkGoogle, unlinkDiscord } = useAuth();
    
    // Tab Controller state
    const [activeTab, setActiveTab] = useState('profile');

    // Tab 1: Profile Details state
    const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
    const [riotId, setRiotId] = useState(currentUser?.riotId || '');
    
    // Tab 3: Social Links state
    const [youtube, setYoutube] = useState(currentUser?.socialLinks?.youtube || '');
    const [twitch, setTwitch] = useState(currentUser?.socialLinks?.twitch || '');
    const [twitter, setTwitter] = useState(currentUser?.socialLinks?.twitter || '');
    const [instagram, setInstagram] = useState(currentUser?.socialLinks?.instagram || '');

    // Tab 4: Gaming Setup state
    const [mouseModel, setMouseModel] = useState(currentUser?.gamingGear?.mouseModel || '');
    const [keyboardModel, setKeyboardModel] = useState(currentUser?.gamingGear?.keyboardModel || '');
    const [monitorModel, setMonitorModel] = useState(currentUser?.gamingGear?.monitorModel || '');
    const [headsetModel, setHeadsetModel] = useState(currentUser?.gamingGear?.headsetModel || '');
    const [dpi, setDpi] = useState(currentUser?.gamingGear?.dpi || '');
    const [sensitivity, setSensitivity] = useState(currentUser?.gamingGear?.sensitivity || '');
    const [resolution, setResolution] = useState(currentUser?.gamingGear?.resolution || '');
    const [refreshRate, setRefreshRate] = useState(currentUser?.gamingGear?.refreshRate || '');

    // Tab 5: Site Preferences state
    const [particles, setParticles] = useState(currentUser?.preferences?.particles !== false);

    // Global Action feedback messaging
    const [msg, setMsg] = useState('');
    const [msgColor, setMsgColor] = useState('');
    const [saving, setSaving] = useState(false);
    const [linking, setLinking] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(currentUser?.photoURL || '');
    const [fileName, setFileName] = useState('No file chosen');
    const fileInputRef = useRef(null);

    // Sync state properties if currentUser updates asynchronously
    useEffect(() => {
        if (currentUser) {
            setDisplayName(currentUser.displayName || '');
            setRiotId(currentUser.riotId || '');
            setPreviewUrl(currentUser.photoURL || '');
            
            setYoutube(currentUser.socialLinks?.youtube || '');
            setTwitch(currentUser.socialLinks?.twitch || '');
            setTwitter(currentUser.socialLinks?.twitter || '');
            setInstagram(currentUser.socialLinks?.instagram || '');

            setMouseModel(currentUser.gamingGear?.mouseModel || '');
            setKeyboardModel(currentUser.gamingGear?.keyboardModel || '');
            setMonitorModel(currentUser.gamingGear?.monitorModel || '');
            setHeadsetModel(currentUser.gamingGear?.headsetModel || '');
            setDpi(currentUser.gamingGear?.dpi || '');
            setSensitivity(currentUser.gamingGear?.sensitivity || '');
            setResolution(currentUser.gamingGear?.resolution || '');
            setRefreshRate(currentUser.gamingGear?.refreshRate || '');

            setParticles(currentUser.preferences?.particles !== false);
        }
    }, [currentUser]);

    // Handle Discord Linking Callback
    useEffect(() => {
        const search = window.location.search;
        const urlParams = new URLSearchParams(search);
        const code = urlParams.get('code');

        if (code && currentUser && !linking) {
            if (window.location.hash.includes('/settings')) {
                window.history.replaceState({}, document.title, window.location.pathname + window.location.hash.split('?')[0]);

                setLinking(true);
                setMsg('Linking Discord account...');
                setMsgColor('var(--text-primary)');

                const redirectUri = `${window.location.origin}/#/settings`;
                linkDiscord(code, redirectUri)
                    .then(() => {
                        setMsg('Discord account linked successfully!');
                        setMsgColor('#34d399');
                    })
                    .catch(err => {
                        setMsg('Failed to link Discord: ' + (err.message || 'Unknown error'));
                        setMsgColor('#f87171');
                    })
                    .finally(() => {
                        setLinking(false);
                        setTimeout(() => setMsg(''), 3000);
                    });
            }
        }
    }, [currentUser, linkDiscord, linking]);

    const handleGoogleLink = () => {
        if (currentUser?.hasGoogle) return;
        const gcid = 'YOUR_GOOGLE_CLIENT_ID';
        if (typeof google === 'undefined' || !google.accounts) {
            setMsg('Google API not available.');
            setMsgColor('#f87171');
            return;
        }

        setLinking(true);
        const client = google.accounts.oauth2.initTokenClient({
            client_id: gcid,
            scope: 'email profile',
            callback: async (tokenResponse) => {
                if (tokenResponse.error) {
                    setMsg('Google linking was cancelled.');
                    setMsgColor('#f87171');
                    setLinking(false);
                    return;
                }
                try {
                    setMsg('Linking Google account...');
                    setMsgColor('var(--text-primary)');
                    await linkGoogle(tokenResponse);
                    setMsg('Google account linked successfully!');
                    setMsgColor('#34d399');
                } catch (err) {
                    setMsg('Failed to link Google: ' + err.message);
                    setMsgColor('#f87171');
                } finally {
                    setLinking(false);
                    setTimeout(() => setMsg(''), 3000);
                }
            }
        });
        client.requestAccessToken();
    };

    const handleDiscordLink = () => {
        if (currentUser?.hasDiscord) return;
        const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID;
        if (!clientId) {
            setMsg('Discord Client ID is not configured.');
            setMsgColor('#f87171');
            return;
        }
        const redirectUri = encodeURIComponent(`${window.location.origin}/#/settings`);
        const oauthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=identify%20email`;
        window.location.href = oauthUrl;
    };

    const handleGoogleDisconnect = async () => {
        setLinking(true);
        setMsg('Disconnecting Google account...');
        setMsgColor('var(--text-primary)');
        try {
            await unlinkGoogle();
            setMsg('Google account disconnected successfully.');
            setMsgColor('#34d399');
        } catch (err) {
            setMsg(err.message || 'Failed to disconnect Google account.');
            setMsgColor('#f87171');
        } finally {
            setLinking(false);
            setTimeout(() => setMsg(''), 5000);
        }
    };

    const handleDiscordDisconnect = async () => {
        setLinking(true);
        setMsg('Disconnecting Discord account...');
        setMsgColor('var(--text-primary)');
        try {
            await unlinkDiscord();
            setMsg('Discord account disconnected successfully.');
            setMsgColor('#34d399');
        } catch (err) {
            setMsg(err.message || 'Failed to disconnect Discord account.');
            setMsgColor('#f87171');
        } finally {
            setLinking(false);
            setTimeout(() => setMsg(''), 5000);
        }
    };

    if (!currentUser) {
        return (
            <section id="settings" className="page active">
                <div className="settings-container">
                    <div className="settings-header">
                        <span className="roster-badge">ACCOUNT</span>
                        <h2 className="roster-game-title" style={{ fontSize: '36px' }}>SETTINGS</h2>
                        <div className="roster-divider"></div>
                    </div>
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', letterSpacing: '2px', fontSize: '13px', marginTop: '40px' }}>
                        Please log in to access settings.
                    </p>
                </div>
            </section>
        );
    }

    const name = currentUser.displayName || currentUser.email.split('@')[0];
    const hasPhoto = currentUser.photoURL && currentUser.photoURL !== '';

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setFileName(file.name);
            const reader = new FileReader();
            reader.onload = (ev) => setPreviewUrl(ev.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            let user = currentUser;

            if (selectedFile) {
                setMsg('Uploading image...');
                setMsgColor('var(--text-primary)');
                const formData = new FormData();
                formData.append('avatar', selectedFile);
                const uploadRes = await apiCall('POST', '/api/user/avatar', formData, true);
                user = uploadRes.user;
            }

            setMsg('Updating profile...');
            const profileRes = await apiCall('PUT', '/api/user/profile', {
                displayName: displayName || user.displayName,
                riotId: riotId,
                socialLinks: { youtube, twitch, twitter, instagram },
                gamingGear: { mouseModel, keyboardModel, monitorModel, headsetModel, dpi, sensitivity, resolution, refreshRate },
                preferences: { particles }
            });
            user = profileRes.user;

            setMsgColor('#34d399');
            setMsg('Settings saved successfully!');
            setSelectedFile(null);
            setFileName('No file chosen');
            updateUser(user);
        } catch (e) {
            setMsgColor('#f87171');
            setMsg('Error: ' + e.message);
        } finally {
            setSaving(false);
            setTimeout(() => setMsg(''), 3000);
        }
    };

    return (
        <section id="settings" className="page active">
            <div className="settings-container">
                <div className="settings-header">
                    <span className="roster-badge">ACCOUNT</span>
                    <h2 className="roster-game-title" style={{ fontSize: '36px' }}>SETTINGS</h2>
                    <div className="roster-divider"></div>
                </div>

                <div className="settings-grid-layout">
                    {/* Settings Sidebar Navigation */}
                    <div className="settings-sidebar-nav">
                        <div className="settings-sidebar-profile">
                            <div className="settings-sidebar-avatar" style={{ overflow: 'hidden', position: 'relative' }}>
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                                ) : (
                                    <AvatarFallback name={name} />
                                )}
                            </div>
                            <h3 className="settings-sidebar-name">{name}</h3>
                            <p className="settings-sidebar-email">{currentUser.email}</p>
                        </div>
                        <div className="settings-nav-buttons">
                            <button className={`settings-nav-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
                                <IconUser />
                                <span>Profile Details</span>
                            </button>
                            <button className={`settings-nav-btn ${activeTab === 'connected' ? 'active' : ''}`} onClick={() => setActiveTab('connected')}>
                                <IconConnection />
                                <span>Connected Accounts</span>
                            </button>
                            <button className={`settings-nav-btn ${activeTab === 'social' ? 'active' : ''}`} onClick={() => setActiveTab('social')}>
                                <IconSocial />
                                <span>Social Links</span>
                            </button>
                            <button className={`settings-nav-btn ${activeTab === 'setup' ? 'active' : ''}`} onClick={() => setActiveTab('setup')}>
                                <IconGear />
                                <span>Gaming Setup</span>
                            </button>
                            <button className={`settings-nav-btn ${activeTab === 'preferences' ? 'active' : ''}`} onClick={() => setActiveTab('preferences')}>
                                <IconPalette />
                                <span>Preferences</span>
                            </button>
                        </div>
                    </div>

                    {/* Active Settings Card View */}
                    <div className="settings-card">
                        
                        {/* Tab 1: Profile Details */}
                        {activeTab === 'profile' && (
                            <>
                                <div className="settings-card-header">
                                    <h3 className="settings-card-title">Profile Details</h3>
                                    <p className="settings-card-desc">Manage your identity and avatar settings</p>
                                </div>
                                <div className="settings-profile-row">
                                    <div className="settings-avatar-img" onClick={() => fileInputRef.current?.click()}>
                                        {previewUrl ? (
                                            <img src={previewUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                                        ) : (
                                            <AvatarFallback name={name} />
                                        )}
                                        <div className="settings-avatar-img-overlay">
                                            <IconCamera />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="settings-display-name">{name}</h3>
                                        <p className="settings-email-text">{currentUser.email}</p>
                                    </div>
                                </div>
                                <div className="settings-field">
                                    <label className="settings-label">Avatar Upload</label>
                                    <div className="settings-file-row">
                                        <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                                        <label className="btn-outline" style={{ display: 'inline-block', padding: '8px 16px', fontSize: '11px', cursor: 'pointer', letterSpacing: '2px' }} onClick={() => fileInputRef.current?.click()}>
                                            CHOOSE IMAGE
                                        </label>
                                        <span className="settings-file-name">{fileName}</span>
                                    </div>
                                </div>
                                <div className="settings-field">
                                    <label className="settings-label">Profile Display Name</label>
                                    <input type="text" className="tracker-search-input" placeholder="Your Display Name" style={{ paddingLeft: '16px' }} value={displayName} onChange={e => setDisplayName(e.target.value)} />
                                </div>
                                <div className="settings-field">
                                    <label className="settings-label">Linked Riot ID</label>
                                    <input type="text" className="tracker-search-input" placeholder="e.g. 0zen#cool" style={{ paddingLeft: '16px' }} value={riotId} onChange={e => setRiotId(e.target.value)} />
                                </div>
                            </>
                        )}

                        {/* Tab 2: Connected Accounts */}
                        {activeTab === 'connected' && (
                            <>
                                <div className="settings-card-header">
                                    <h3 className="settings-card-title">Connected Accounts</h3>
                                    <p className="settings-card-desc">Link your OAuth accounts for seamless sign-in</p>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div className="settings-field">
                                        <label className="settings-label">Discord account</label>
                                        {currentUser.hasDiscord ? (
                                            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                                                <div className="login-page-discord-btn" style={{ flex: 1, margin: 0, opacity: 0.7, cursor: 'default', pointerEvents: 'none' }}>
                                                    <IconDiscord style={{ width: '18px', height: '18px', flexShrink: 0 }} />
                                                    <span>Discord Connected</span>
                                                </div>
                                                <button className="btn-danger-outline" style={{ width: 'auto', padding: '13px 20px', margin: 0 }} onClick={handleDiscordDisconnect} disabled={linking} type="button">
                                                    DISCONNECT
                                                </button>
                                            </div>
                                        ) : (
                                            <button className="login-page-discord-btn" style={{ width: '100%', margin: 0 }} onClick={handleDiscordLink} disabled={linking} type="button">
                                                <IconDiscord style={{ width: '18px', height: '18px', flexShrink: 0 }} />
                                                <span>Connect Discord Account</span>
                                            </button>
                                        )}
                                    </div>

                                    <div className="settings-field">
                                        <label className="settings-label">Google account</label>
                                        {currentUser.hasGoogle ? (
                                            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                                                <div className="login-page-google-btn" style={{ flex: 1, margin: 0, opacity: 0.7, cursor: 'default', pointerEvents: 'none' }}>
                                                    <IconGoogle style={{ width: '18px', height: '18px', flexShrink: 0 }} />
                                                    <span>Google Connected</span>
                                                </div>
                                                <button className="btn-danger-outline" style={{ width: 'auto', padding: '13px 20px', margin: 0 }} onClick={handleGoogleDisconnect} disabled={linking} type="button">
                                                    DISCONNECT
                                                </button>
                                            </div>
                                        ) : (
                                            <button className="login-page-google-btn" style={{ width: '100%', margin: 0 }} onClick={handleGoogleLink} disabled={linking} type="button">
                                                <IconGoogle style={{ width: '18px', height: '18px', flexShrink: 0 }} />
                                                <span>Connect Google Account</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Tab 3: Social Links */}
                        {activeTab === 'social' && (
                            <>
                                <div className="settings-card-header">
                                    <h3 className="settings-card-title">Social Media Links</h3>
                                    <p className="settings-card-desc">Showcase your community profiles on your card</p>
                                </div>
                                <div className="settings-form-grid">
                                    <div className="settings-field">
                                        <label className="settings-label">Twitter / X URL</label>
                                        <input type="text" className="tracker-search-input" placeholder="https://x.com/username" style={{ paddingLeft: '16px' }} value={twitter} onChange={e => setTwitter(e.target.value)} />
                                    </div>
                                    <div className="settings-field">
                                        <label className="settings-label">Twitch Channel</label>
                                        <input type="text" className="tracker-search-input" placeholder="https://twitch.tv/username" style={{ paddingLeft: '16px' }} value={twitch} onChange={e => setTwitch(e.target.value)} />
                                    </div>
                                    <div className="settings-field">
                                        <label className="settings-label">YouTube Channel</label>
                                        <input type="text" className="tracker-search-input" placeholder="https://youtube.com/@channel" style={{ paddingLeft: '16px' }} value={youtube} onChange={e => setYoutube(e.target.value)} />
                                    </div>
                                    <div className="settings-field">
                                        <label className="settings-label">Instagram Profile</label>
                                        <input type="text" className="tracker-search-input" placeholder="https://instagram.com/username" style={{ paddingLeft: '16px' }} value={instagram} onChange={e => setInstagram(e.target.value)} />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Tab 4: Gaming Setup */}
                        {activeTab === 'setup' && (
                            <>
                                <div className="settings-card-header">
                                    <h3 className="settings-card-title">Gaming Setup & In-Game Specs</h3>
                                    <p className="settings-card-desc">List your pro gear and sensitivity configuration</p>
                                </div>
                                <div className="settings-form-grid">
                                    <div className="settings-field">
                                        <label className="settings-label">Mouse Model</label>
                                        <input type="text" className="tracker-search-input" placeholder="e.g. Logitech G Pro X" style={{ paddingLeft: '16px' }} value={mouseModel} onChange={e => setMouseModel(e.target.value)} />
                                    </div>
                                    <div className="settings-field">
                                        <label className="settings-label">Keyboard Model</label>
                                        <input type="text" className="tracker-search-input" placeholder="e.g. Wooting 60HE" style={{ paddingLeft: '16px' }} value={keyboardModel} onChange={e => setKeyboardModel(e.target.value)} />
                                    </div>
                                    <div className="settings-field">
                                        <label className="settings-label">Monitor Model</label>
                                        <input type="text" className="tracker-search-input" placeholder="e.g. Zowie XL2546K" style={{ paddingLeft: '16px' }} value={monitorModel} onChange={e => setMonitorModel(e.target.value)} />
                                    </div>
                                    <div className="settings-field">
                                        <label className="settings-label">Headset Model</label>
                                        <input type="text" className="tracker-search-input" placeholder="e.g. HyperX Cloud II" style={{ paddingLeft: '16px' }} value={headsetModel} onChange={e => setHeadsetModel(e.target.value)} />
                                    </div>
                                    <div className="settings-field">
                                        <label className="settings-label">Mouse DPI</label>
                                        <input type="number" className="tracker-search-input" placeholder="e.g. 800" style={{ paddingLeft: '16px' }} value={dpi} onChange={e => setDpi(e.target.value)} />
                                    </div>
                                    <div className="settings-field">
                                        <label className="settings-label">In-Game Sensitivity</label>
                                        <input type="number" step="0.001" className="tracker-search-input" placeholder="e.g. 0.35" style={{ paddingLeft: '16px' }} value={sensitivity} onChange={e => setSensitivity(e.target.value)} />
                                    </div>
                                    <div className="settings-field">
                                        <label className="settings-label">Screen Resolution</label>
                                        <input type="text" className="tracker-search-input" placeholder="e.g. 1920x1080" style={{ paddingLeft: '16px' }} value={resolution} onChange={e => setResolution(e.target.value)} />
                                    </div>
                                    <div className="settings-field">
                                        <label className="settings-label">Refresh Rate</label>
                                        <input type="text" className="tracker-search-input" placeholder="e.g. 240Hz" style={{ paddingLeft: '16px' }} value={refreshRate} onChange={e => setRefreshRate(e.target.value)} />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Tab 5: Site Preferences */}
                        {activeTab === 'preferences' && (
                            <>
                                <div className="settings-card-header">
                                    <h3 className="settings-card-title">Site Preferences</h3>
                                    <p className="settings-card-desc">Personalize your performance experience</p>
                                </div>

                                <div className="settings-toggle-row">
                                    <div className="settings-toggle-info">
                                        <span className="settings-toggle-title">Background Particles & Motion</span>
                                        <span className="settings-toggle-desc">Enable smooth animated ember canvas backgrounds</span>
                                    </div>
                                    <label className="settings-switch">
                                        <input type="checkbox" checked={particles} onChange={e => setParticles(e.target.checked)} />
                                        <span className="settings-switch-slider" />
                                    </label>
                                </div>
                            </>
                        )}

                        {/* Save Button & Feedback Message */}
                        <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                            <button className="btn-primary" style={{ width: '100%' }} onClick={handleSave} disabled={saving}>
                                {saving ? 'SAVING...' : 'SAVE CHANGES'}
                            </button>
                            {msg && <p className="settings-msg" style={{ color: msgColor }}>{msg}</p>}
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}
