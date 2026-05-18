import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconDiscord } from './icons/SvgIcons';
import ThemeToggle from './ThemeToggle';

function AvatarFallback({ name, fontSize }) {
    const initials = (name || '??').substring(0, 2).toUpperCase();
    return <div className="avatar-fallback" style={fontSize ? { fontSize } : {}}>{initials}</div>;
}

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const { currentUser, openLoginModal, openProfileSidebar } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const pages = [
        { id: 'home', label: 'Home', path: '/' },
        { id: 'rosters', label: 'Rosters', path: '/rosters' },
        { id: 'creators', label: 'Creators', path: '/creators' },
        { id: 'tracker', label: 'Tracker', path: '/tracker' },
        { id: 'shop', label: 'Shop', path: '/shop' },
        { id: 'about', label: 'About', path: '/about' },
    ];

    const open = useCallback(() => {
        if (window.innerWidth > 1024) return;
        setIsOpen(true);
        document.body.classList.add('sidebar-open');
    }, []);

    const close = useCallback(() => {
        setIsOpen(false);
        document.body.classList.remove('sidebar-open');
    }, []);

    // Expose open/close via window for Navbar to call
    useEffect(() => {
        window.__sidebarOpen = open;
        window.__sidebarClose = close;
        return () => { delete window.__sidebarOpen; delete window.__sidebarClose; };
    }, [open, close]);

    // Clean up on unmount
    useEffect(() => {
        return () => document.body.classList.remove('sidebar-open');
    }, []);

    const handleNavClick = (path) => {
        navigate(path);
        close();
    };

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    const displayName = currentUser ? (currentUser.displayName || currentUser.email.split('@')[0]) : '';
    const hasPhoto = currentUser?.photoURL && currentUser.photoURL !== '';

    const handleAuthClick = () => {
        if (currentUser) {
            close();
            navigate('/settings');
        } else {
            close();
            openLoginModal();
        }
    };

    return (
        <>
            <div
                id="sidebar-overlay"
                className={isOpen ? 'open' : ''}
                onClick={close}
            ></div>
            <aside id="sidebar" className={isOpen ? 'open' : ''}>
                <div className="sidebar-auth-header">
                    {currentUser ? (
                        <div className="sidebar-auth-card" onClick={handleAuthClick}>
                            {hasPhoto ? (
                                <img src={currentUser.photoURL} className="sidebar-auth-img" alt="" />
                            ) : (
                                <div className="sidebar-auth-img">
                                    <AvatarFallback name={displayName} fontSize="14px" />
                                </div>
                            )}
                            <div className="sidebar-auth-info">
                                <div className="sidebar-auth-name">{displayName}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>View Profile</div>
                            </div>
                        </div>
                    ) : (
                        <div className="btn-primary" style={{ textAlign: 'center', padding: '12px', borderRadius: '8px', display: 'block', cursor: 'pointer' }}
                            onClick={handleAuthClick}>
                            LOGIN / SIGN UP
                        </div>
                    )}
                </div>
                <div className="sidebar-links">
                    {pages.map(page => (
                        <a
                            key={page.id}
                            href={`#${page.id}`}
                            className={`nav-link ${isActive(page.path) ? 'active' : ''}`}
                            data-page={page.id}
                            onClick={(e) => { e.preventDefault(); handleNavClick(page.path); }}
                        >
                            <span>{page.label}</span>
                        </a>
                    ))}
                </div>
                <div className="sidebar-footer">
                    <div className="sidebar-theme-row">
                        <span className="theme-label">Theme:</span>
                        <ThemeToggle id="theme-toggle-mobile" />
                    </div>
                    <a href="https://discord.gg/9yPMDEsARR" target="_blank" rel="noopener"
                        className="nav-link sidebar-discord-btn btn-discord">
                        <IconDiscord className="social-icon"
                            style={{ width: '16px', height: '16px', marginRight: '8px', verticalAlign: 'middle', flexShrink: 0 }} />
                        <span>Join Discord</span>
                    </a>
                </div>
            </aside>
        </>
    );
}
