import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconMenu, IconDiscord, IconUser } from './icons/SvgIcons';

function AvatarFallback({ name }) {
    const initials = (name || '??').substring(0, 2).toUpperCase();
    return <div className="avatar-fallback">{initials}</div>;
}

export default function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { currentUser, openProfileSidebar } = useAuth();
    const [navHidden, setNavHidden] = useState(false);
    const navRef = useRef(null);

    // GSAP Landing Animation
    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

            tl.from(".nav-logo", {
                duration: 1.2,
                y: -50,               
                opacity: 0,           
                scale: 0.8,           
                ease: "back.out(1.5)" 
            })
            .from(".nav-link-dt", {
                duration: 0.6,
                y: -20,               
                opacity: 0,
                stagger: 0.1,         
            }, "-=0.6")             
            .from(["#mobile-menu-btn", ".nav-right > *"], {
                duration: 0.8,
                opacity: 0,
                y: -20,
                stagger: 0.15,         
                ease: "back.out(2)"   
            }, "-=0.3");            
        }, navRef);
        
        return () => ctx.revert();
    }, []);

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
        else navigate('/login');
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
        <nav ref={navRef} id="main-nav" className={navHidden ? 'nav-hidden' : ''}>
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
                <div>
                    <button id="auth-btn" style={{ cursor: 'pointer' }} onClick={handleAuthClick}>
                        {currentUser ? (
                            <>
                                {hasPhoto ? (
                                    <img src={currentUser.photoURL} alt="" />
                                ) : (
                                    <AvatarFallback name={displayName} />
                                )}
                            </>
                        ) : (
                            <IconUser />
                        )}
                    </button>
                </div>
                <a href="https://discord.gg/9yPMDEsARR" target="_blank" rel="noopener"
                    className="btn-nav-action btn-discord dt-only">
                    <IconDiscord />
                    Join Us
                </a>
            </div>
        </nav>
    );
}
