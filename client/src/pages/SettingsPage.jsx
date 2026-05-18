import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiCall } from '../services/api';

function AvatarFallback({ name }) {
    const initials = (name || '??').substring(0, 2).toUpperCase();
    return <div className="avatar-fallback">{initials}</div>;
}

export default function SettingsPage() {
    const { currentUser, updateUser } = useAuth();
    const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
    const [riotId, setRiotId] = useState(currentUser?.riotId || '');
    const [msg, setMsg] = useState('');
    const [msgColor, setMsgColor] = useState('');
    const [saving, setSaving] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(currentUser?.photoURL || '');
    const [fileName, setFileName] = useState('No file chosen');
    const fileInputRef = useRef(null);

    if (!currentUser) {
        return (
            <section id="settings" className="page active">
                <div className="settings-container">
                    <div className="settings-header">
                        <span className="roster-badge">ACCOUNT</span>
                        <h2 className="roster-game-title" style={{ fontSize: '36px' }}>SETTINGS</h2>
                        <div className="roster-divider"></div>
                    </div>
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', letterSpacing: '2px', fontSize: '13px' }}>
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
                riotId: riotId
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
                <div className="settings-card">
                    <div className="settings-profile-row">
                        <div className="settings-avatar-img" style={{ overflow: 'hidden' }}>
                            {hasPhoto ? (
                                <img src={currentUser.photoURL} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                            ) : (
                                <AvatarFallback name={name} />
                            )}
                        </div>
                        <div>
                            <h3 className="settings-display-name">{name}</h3>
                            <p className="settings-email-text">{currentUser.email}</p>
                        </div>
                    </div>
                    <div className="settings-field">
                        <label className="settings-label">Profile Picture</label>
                        <div className="settings-file-row">
                            <div className="settings-preview-wrap">
                                {previewUrl ? (
                                    <img src={previewUrl} className="settings-preview-img" alt="" />
                                ) : null}
                            </div>
                            <div style={{ flex: 1 }}>
                                <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }}
                                    onChange={handleFileChange} />
                                <label className="btn-outline"
                                    style={{ display: 'inline-block', padding: '8px 16px', fontSize: '11px', cursor: 'pointer', letterSpacing: '2px' }}
                                    onClick={() => fileInputRef.current?.click()}>
                                    CHOOSE IMAGE
                                </label>
                                <span className="settings-file-name">{fileName}</span>
                            </div>
                        </div>
                    </div>
                    <div className="settings-field">
                        <label className="settings-label">Profile Name</label>
                        <input type="text" className="tracker-search-input" placeholder="Your Name"
                            style={{ paddingLeft: '16px' }}
                            value={displayName} onChange={e => setDisplayName(e.target.value)} />
                    </div>
                    <div className="settings-field">
                        <label className="settings-label">Linked Riot ID</label>
                        <input type="text" className="tracker-search-input" placeholder="e.g. 0zen#cool"
                            style={{ paddingLeft: '16px' }}
                            value={riotId} onChange={e => setRiotId(e.target.value)} />
                    </div>
                    <button className="btn-primary" style={{ width: '100%', marginTop: '10px' }}
                        onClick={handleSave} disabled={saving}>
                        {saving ? 'SAVING...' : 'SAVE CHANGES'}
                    </button>
                    {msg && <p className="settings-msg" style={{ color: msgColor }}>{msg}</p>}
                </div>
            </div>
        </section>
    );
}
