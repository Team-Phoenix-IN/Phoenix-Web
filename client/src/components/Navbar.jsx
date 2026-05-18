import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconMenu, IconDiscord, IconUser } from './icons/SvgIcons';
import ThemeToggle from './ThemeToggle';

function AvatarFallback({ name }) {
    const initials = (name || '??').substring(0, 2).toUpperCase();
    return <div className="avatar-fallback">{initials}</div>;
}

export default function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { currentUser, openLoginModal, openProfileSidebar } = useAuth();
    const [navHidden, setNavHidden] = useState(false);

    // Nav hide/show on scroll
    useEffect(() => {
        let lastScrollY = window.scrollY;
        function handleScroll() {
            const currentScrollY = window.scrollY;
            const delta = currentScrollY - lastScrollY;
            if (Math.abs(delta) > 5) {
                if (currentScrollY > lastScrollY && currentScrollY > 80) {
                    setNavHidden(true);
                } else {
                    setNavHidden(false);
                }
                lastScrollY = currentScrollY;
            }
        }
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Show navbar on navigation
    useEffect(() => {
        setNavHidden(false);
    }, [location.pathname]);

    const handleNavClick = (e, path) => {
        e.preventDefault();
        navigate(path);
    };

    const handleAuthClick = () => {
        if (currentUser) openProfileSidebar();
        else openLoginModal();
    };

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    const displayName = currentUser ? (currentUser.displayName || currentUser.email.split('@')[0]) : '';
    const hasPhoto = currentUser?.photoURL && currentUser.photoURL !== '';

    const navLinks = [
        { path: '/rosters', label: 'Rosters' },
        { path: '/creators', label: 'Creators' },
        { path: '/tracker', label: 'Tracker', beta: true },
        { path: '/shop', label: 'Shop' },
        { path: '/about', label: 'About' },
    ];

    return (
        <nav id="main-nav" className={navHidden ? 'nav-hidden' : ''}>

            <button id="mobile-menu-btn" onClick={() => window.__sidebarOpen?.()}>
                <IconMenu />
            </button>

            <a href="#home" className="nav-logo" onClick={(e) => handleNavClick(e, '/')}>
                <img src="/assets/images/phoenix-logo.png" alt="Team Phoenix Logo" className="nav-logo-img" />
                <span className="nav-brand-name">Team Phoenix</span>
            </a>

            <div className="nav-links-desktop" id="nav-links">
                {navLinks.map(link => (
                    <a
                        key={link.path}
                        href={`#${link.path.slice(1)}`}
                        className={`nav-link-dt ${isActive(link.path) ? 'active' : ''}`}
                        data-page={link.path.slice(1)}
                        onClick={(e) => handleNavClick(e, link.path)}
                    >
                        {link.label}
                        {link.beta && (
                            <span className="nav-beta-capsule">
                                <span className="tracker-beta-dot"></span>BETA
                            </span>
                        )}
                    </a>
                ))}
            </div>

            <div className="nav-right">
                <ThemeToggle id="theme-toggle-desktop" className="dt-only" />
                <button id="auth-btn" style={{ cursor: 'pointer' }} onClick={handleAuthClick}>
                    {currentUser ? (
                        <>
                            {hasPhoto ? (
                                <img src={currentUser.photoURL} alt="" style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                            ) : (
                                <div style={{ width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0, overflow: 'hidden' }}>
                                    <AvatarFallback name={displayName} />
                                </div>
                            )}
                            <span id="auth-text">{displayName}</span>
                        </>
                    ) : (
                        <>
                            <IconUser />
                            <span id="auth-text">Login</span>
                        </>
                    )}
                </button>
                <a href="https://discord.gg/9yPMDEsARR" target="_blank" rel="noopener"
                    className="btn-nav-action btn-discord dt-only">
                    <IconDiscord />
                    Join Us
                </a>
            </div>
        </nav>
    );
}
