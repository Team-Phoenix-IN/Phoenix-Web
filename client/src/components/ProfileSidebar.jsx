import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconLogout } from './icons/SvgIcons';

function AvatarFallback({ name }) {
    const initials = (name || '??').substring(0, 2).toUpperCase();
    return <div className="avatar-fallback">{initials}</div>;
}

export default function ProfileSidebar() {
    const { currentUser, profileSidebarOpen, closeProfileSidebar, logout } = useAuth();
    const navigate = useNavigate();

    if (!currentUser) return null;

    const displayName = currentUser.displayName || currentUser.email.split('@')[0];
    const hasPhoto = currentUser.photoURL && currentUser.photoURL !== '';

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleSettings = () => {
        closeProfileSidebar();
        navigate('/settings');
    };

    return (
        <>
            <div
                className="profile-overlay"
                style={profileSidebarOpen ? { opacity: 1, visibility: 'visible' } : {}}
                onClick={closeProfileSidebar}
            ></div>
            <aside id="profile-sidebar" style={profileSidebarOpen ? { transform: 'translateX(0)', boxShadow: '-10px 0 40px rgba(0,0,0,0.3)' } : {}}>
                <div className="profile-sidebar-inner">
                    <button className="profile-close" onClick={closeProfileSidebar}>&times;</button>
                    <div className="profile-header">
                        <div className="profile-avatar">
                            {hasPhoto ? (
                                <img src={currentUser.photoURL} alt="Profile" />
                            ) : (
                                <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden' }}>
                                    <AvatarFallback name={displayName} />
                                </div>
                            )}
                        </div>
                        <h3 className="profile-name">{displayName}</h3>
                        <p className="profile-email">{currentUser.email}</p>
                    </div>
                    <div className="profile-body">
                        <div className="profile-link-card" onClick={handleSettings}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="20" strokeWidth="1.5">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                            Account Settings
                        </div>
                    </div>
                    <button className="btn-outline profile-logout-btn" onClick={handleLogout}>
                        <IconLogout style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                        Sign Out
                    </button>
                </div>
            </aside>
        </>
    );
}
