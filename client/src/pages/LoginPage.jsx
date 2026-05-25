import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconGoogle, IconDiscord } from '../components/icons/SvgIcons';
import { animate, stagger } from 'animejs';
import { gsap } from 'gsap';

/* ═══════════════════════════════════════════════════════════════════════════
   Phoenix Fire Background — Rising Embers, Sparks & Feathers
   Creates an immersive mythical Phoenix atmosphere with:
   - Rising ember/spark particles (warm fire colors, staggered rise)
   - Drifting feather silhouettes (SVG, slow float)
   - A warm radial fire glow from the bottom
   ═══════════════════════════════════════════════════════════════════════════ */

// Fire color palette
const FIRE_COLORS = [
    'rgba(255, 70, 37, 0.9)',    // Phoenix red-orange
    'rgba(255, 106, 0, 0.85)',   // Deep orange
    'rgba(255, 170, 0, 0.8)',    // Amber gold
    'rgba(255, 200, 50, 0.75)',  // Bright gold
    'rgba(255, 140, 50, 0.8)',   // Warm orange
    'rgba(200, 40, 20, 0.7)',    // Deep crimson
];

function PhoenixFireBackground() {
    const containerRef = useRef(null);
    const embersRef = useRef([]);
    const feathersRef = useRef([]);
    const animationsRef = useRef([]);

    const buildScene = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;

        // Cleanup
        animationsRef.current.forEach(a => a && a.pause && a.pause());
        animationsRef.current = [];
        container.innerHTML = '';
        embersRef.current = [];
        feathersRef.current = [];

        const w = container.offsetWidth;
        const h = container.offsetHeight;

        // ── Rising Ember Particles ──
        const EMBER_COUNT = Math.min(120, Math.floor((w * h) / 8000));

        for (let i = 0; i < EMBER_COUNT; i++) {
            const ember = document.createElement('div');
            ember.className = 'login-ember';

            const size = 2 + Math.random() * 4;
            const color = FIRE_COLORS[Math.floor(Math.random() * FIRE_COLORS.length)];

            ember.style.width = `${size}px`;
            ember.style.height = `${size}px`;
            ember.style.background = `radial-gradient(circle, ${color}, transparent)`;
            ember.style.boxShadow = `0 0 ${size * 2}px ${color}`;
            ember.style.left = `${Math.random() * 100}%`;
            ember.style.bottom = `${-10 - Math.random() * 20}%`;

            container.appendChild(ember);
            embersRef.current.push(ember);
        }

        // Anime.js staggered rise animation for embers
        const emberAnim = animate(embersRef.current, {
            translateY: [
                { to: () => -(h * 0.6 + Math.random() * h * 0.5), duration: () => 5000 + Math.random() * 8000 }
            ],
            translateX: [
                { to: () => (Math.random() - 0.5) * 120, duration: () => 3000 + Math.random() * 5000 }
            ],
            opacity: [
                { to: 0.9, duration: 800 },
                { to: 0, duration: () => 2000 + Math.random() * 3000 }
            ],
            scale: [
                { to: () => 0.8 + Math.random() * 0.6, duration: 1500 },
                { to: 0, duration: () => 2000 + Math.random() * 2000 }
            ],
            delay: stagger(60, { from: 'center' }),
            ease: 'outCubic',
            loop: true,
        });
        animationsRef.current.push(emberAnim);

        // ── Drifting Feather Silhouettes ──
        const FEATHER_COUNT = Math.min(8, Math.floor(w / 160));

        for (let i = 0; i < FEATHER_COUNT; i++) {
            const feather = document.createElement('div');
            feather.className = 'login-feather';
            feather.innerHTML = `<svg viewBox="0 0 24 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0C12 0 4 15 4 30C4 45 12 60 12 60C12 60 20 45 20 30C20 15 12 0 12 0Z" 
                      fill="rgba(255, 106, 0, 0.06)" stroke="rgba(255, 106, 0, 0.1)" stroke-width="0.5"/>
                <path d="M12 8C12 8 8 20 8 30C8 40 12 52 12 52" 
                      stroke="rgba(255, 140, 50, 0.08)" stroke-width="0.3" fill="none"/>
            </svg>`;

            feather.style.left = `${10 + Math.random() * 80}%`;
            feather.style.top = `${20 + Math.random() * 60}%`;
            feather.style.setProperty('--feather-size', `${30 + Math.random() * 40}px`);

            container.appendChild(feather);
            feathersRef.current.push(feather);
        }

        // GSAP slow feather drift
        feathersRef.current.forEach((f, i) => {
            gsap.to(f, {
                y: () => -40 - Math.random() * 60,
                x: () => (Math.random() - 0.5) * 80,
                rotation: () => (Math.random() - 0.5) * 30,
                opacity: 0.4 + Math.random() * 0.3,
                duration: 8 + Math.random() * 6,
                delay: i * 0.8,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
            });
        });
    }, []);

    useEffect(() => {
        buildScene();

        let resizeTimer;
        const handleResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(buildScene, 400);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            animationsRef.current.forEach(a => a && a.pause && a.pause());
            gsap.killTweensOf(feathersRef.current);
        };
    }, [buildScene]);

    return <div className="login-fire-container" ref={containerRef}></div>;
}

/* ═══════════════════════════════════════════════════════════════════════════
   Login Page Component
   ═══════════════════════════════════════════════════════════════════════════ */

export default function LoginPage() {
    const navigate = useNavigate();
    const { currentUser, loading, loginWithEmail, registerWithEmail, loginWithGoogle, loginWithDiscord } = useAuth();

    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Refs for GSAP + parallax
    const pageRef = useRef(null);
    const cardRef = useRef(null);
    const gridWrapRef = useRef(null);

    // Redirect logged-in users
    useEffect(() => {
        if (!loading && currentUser) {
            navigate('/', { replace: true });
        }
    }, [currentUser, loading, navigate]);

    // ── GSAP Entrance Timeline ──
    useLayoutEffect(() => {
        if (loading || currentUser) return;

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

            tl.from('.login-glass-card', {
                duration: 1.2,
                opacity: 0,
                scale: 0.92,
                y: 40,
            })
            .from('.login-page-form-title', {
                duration: 0.8,
                opacity: 0,
                y: 20,
            }, '-=0.6')
            .from('.login-page-form-subtitle', {
                duration: 0.6,
                opacity: 0,
                y: 14,
            }, '-=0.5')
            .from('.login-entrance-stagger', {
                duration: 0.7,
                opacity: 0,
                y: 18,
                stagger: 0.08,
            }, '-=0.4')
            .from('.login-page-footer', {
                duration: 0.6,
                opacity: 0,
                y: 10,
            }, '-=0.3');
        }, pageRef);

        return () => ctx.revert();
    }, [loading, currentUser]);

    // ── 3D Reactive Parallax — embers react to mouse at varying depths ──
    useEffect(() => {
        if (loading || currentUser) return;

        const handleMouseMove = (e) => {
            const cx = (e.clientX / window.innerWidth - 0.5) * 2;  // -1 to 1
            const cy = (e.clientY / window.innerHeight - 0.5) * 2;

            // Shift entire fire background slightly
            if (gridWrapRef.current) {
                gridWrapRef.current.style.transform = `translate(${cx * -12}px, ${cy * -12}px)`;
            }

            // Move individual embers at varying depth layers for 3D effect
            const embers = document.querySelectorAll('.login-ember');
            embers.forEach((ember, i) => {
                const depth = 0.3 + (i % 5) * 0.35; // 5 depth layers: 0.3 to 1.7
                const ex = cx * depth * 20;
                const ey = cy * depth * 15;
                ember.style.setProperty('--rx', `${ex}px`);
                ember.style.setProperty('--ry', `${ey}px`);
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [loading, currentUser]);

    // ── Form Handlers ──
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setErrorMsg('');

        if (!email || !password) {
            setErrorMsg('Please fill in all fields.');
            return;
        }
        if (isSignUp && password !== confirmPassword) {
            setErrorMsg('Passwords do not match.');
            return;
        }
        if (isSignUp && password.length < 6) {
            setErrorMsg('Password must be at least 6 characters.');
            return;
        }

        setIsSubmitting(true);
        try {
            if (isSignUp) {
                await registerWithEmail(email, password);
            } else {
                await loginWithEmail(email, password);
            }
            navigate('/', { replace: true });
        } catch (err) {
            setErrorMsg(err.message);
        } finally {
            setIsSubmitting(false);
        }
    }, [email, password, confirmPassword, isSignUp, isSubmitting, loginWithEmail, registerWithEmail, navigate]);

    const handleGoogleLogin = useCallback(() => {
        const gcid = 'YOUR_GOOGLE_CLIENT_ID';
        if (typeof google === 'undefined' || !google.accounts) {
            setErrorMsg('Google Sign-In is not available. Please try again later.');
            return;
        }
        const client = google.accounts.oauth2.initTokenClient({
            client_id: gcid,
            scope: 'email profile',
            callback: async (tokenResponse) => {
                if (tokenResponse.error) {
                    setErrorMsg('Google login was cancelled.');
                    return;
                }
                setIsSubmitting(true);
                try {
                    await loginWithGoogle(tokenResponse);
                    navigate('/', { replace: true });
                } catch (err) {
                    setErrorMsg(err.message);
                } finally {
                    setIsSubmitting(false);
                }
            }
        });
        client.requestAccessToken();
    }, [loginWithGoogle, navigate]);

    const handleDiscordLogin = () => {
        const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID;
        if (!clientId) {
            setErrorMsg('Discord Client ID is not configured (VITE_DISCORD_CLIENT_ID missing).');
            return;
        }
        const redirectUri = encodeURIComponent(`${window.location.origin}/#/login`);
        const oauthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=identify%20email`;
        window.location.href = oauthUrl;
    };

    // Handle Discord OAuth Callback
    useEffect(() => {
        const search = window.location.search;
        const urlParams = new URLSearchParams(search);
        const code = urlParams.get('code');

        if (code && !loading && !currentUser) {
            window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
            setIsSubmitting(true);
            const redirectUri = `${window.location.origin}/#/login`;
            loginWithDiscord(code, redirectUri)
                .then(() => {
                    navigate('/', { replace: true });
                })
                .catch(err => {
                    setErrorMsg(err.message || 'Discord login failed.');
                    setIsSubmitting(false);
                });
        }
    }, [loading, currentUser, loginWithDiscord, navigate]);

    const toggleMode = () => {
        setIsSignUp(prev => !prev);
        setErrorMsg('');
        setConfirmPassword('');
    };

    // ── Loading State ──
    if (loading) {
        return (
            <div className="login-page">
                <div className="login-page-loading">
                    <div className="tracker-spinner"></div>
                </div>
            </div>
        );
    }

    if (currentUser) return null;

    // ── Render ──
    return (
        <div className="login-page" ref={pageRef}>
            {/* Phoenix Fire Background */}
            <div className="login-fire-wrap" ref={gridWrapRef}>
                <PhoenixFireBackground />
                {/* Bottom fire glow — simulates flames rising */}
                <div className="login-fire-glow"></div>
            </div>

            {/* Ambient fire orbs */}
            <div className="login-ambient-orb login-ambient-orb-1"></div>
            <div className="login-ambient-orb login-ambient-orb-2"></div>
            <div className="login-ambient-orb login-ambient-orb-3"></div>

            {/* Glassmorphism Login Card */}
            <div className="login-glass-card" ref={cardRef}>
                {/* Top accent bar */}
                <div className="login-page-card-accent"></div>

                <div className="login-card-content">
                    {/* Left Column: Branding Area */}
                    <div className="login-card-brand">
                        <a href="#/" className="login-card-logo-link" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
                            <img
                                src="/assets/images/phoenix-logo.png"
                                alt="Team Phoenix"
                                className="login-card-logo"
                            />
                        </a>
                        <h2 className="login-page-form-title">
                            {isSignUp ? 'Create Account' : 'Welcome Back'}
                        </h2>
                        <p className="login-page-form-subtitle">
                            {isSignUp
                                ? 'Sign up to join Team Phoenix'
                                : 'Sign in to your Phoenix account'
                            }
                        </p>
                    </div>

                    {/* Right Column: Form Area */}
                    <div className="login-card-form-area">
                        {/* Discord OAuth */}
                        <button
                            className="login-page-discord-btn login-entrance-stagger"
                            onClick={handleDiscordLogin}
                            disabled={isSubmitting}
                            id="login-page-discord-btn"
                            type="button"
                        >
                            <IconDiscord style={{ width: '18px', height: '18px', flexShrink: 0 }} />
                            <span>Continue with Discord</span>
                        </button>

                        {/* Google OAuth */}
                        <button
                            className="login-page-google-btn login-entrance-stagger"
                            onClick={handleGoogleLogin}
                            disabled={isSubmitting}
                            id="login-page-google-btn"
                            type="button"
                            style={{ marginTop: '12px' }}
                        >
                            <IconGoogle style={{ width: '18px', height: '18px', flexShrink: 0 }} />
                            <span>Continue with Google</span>
                        </button>

                        {/* Divider */}
                        <div className="login-page-divider login-entrance-stagger">
                            <div className="login-page-divider-line"></div>
                            <span className="login-page-divider-text">OR</span>
                            <div className="login-page-divider-line"></div>
                        </div>

                        {/* Email/Password Form */}
                        <form className="login-page-form" onSubmit={handleSubmit} autoComplete="on">
                            <div className="login-page-field login-entrance-stagger">
                                <label className="login-page-label" htmlFor="login-email">Email</label>
                                <div className="login-page-input-wrap">
                                    <svg className="login-page-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="2" y="4" width="20" height="16" rx="3" />
                                        <path d="m2 7 10 7 10-7" />
                                    </svg>
                                    <input
                                        type="email"
                                        id="login-email"
                                        className="login-page-input"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        autoComplete="email"
                                        spellCheck="false"
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>

                            <div className="login-page-field login-entrance-stagger">
                                <label className="login-page-label" htmlFor="login-password">Password</label>
                                <div className="login-page-input-wrap">
                                    <svg className="login-page-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="login-password"
                                        className="login-page-input"
                                        placeholder={isSignUp ? 'Min. 6 characters' : 'Enter password'}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        autoComplete={isSignUp ? 'new-password' : 'current-password'}
                                        disabled={isSubmitting}
                                    />
                                    <button
                                        type="button"
                                        className="login-page-eye-btn"
                                        onClick={() => setShowPassword(p => !p)}
                                        tabIndex={-1}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? (
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                                <line x1="1" y1="1" x2="23" y2="23" />
                                            </svg>
                                        ) : (
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {isSignUp && (
                                <div className="login-page-field login-page-field-confirm login-entrance-stagger">
                                    <label className="login-page-label" htmlFor="login-confirm-password">Confirm Password</label>
                                    <div className="login-page-input-wrap">
                                        <svg className="login-page-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                        </svg>
                                        <input
                                            type="password"
                                            id="login-confirm-password"
                                            className="login-page-input"
                                            placeholder="Re-enter password"
                                            value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)}
                                            autoComplete="new-password"
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>
                            )}

                            {errorMsg && (
                                <div className="login-page-error" id="login-page-error">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="15" y1="9" x2="9" y2="15" />
                                        <line x1="9" y1="9" x2="15" y2="15" />
                                    </svg>
                                    <span>{errorMsg}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                className="login-page-submit-btn login-entrance-stagger"
                                disabled={isSubmitting}
                                id="login-page-submit-btn"
                            >
                                {isSubmitting ? (
                                    <div className="login-page-btn-spinner"></div>
                                ) : (
                                    isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN'
                                )}
                            </button>
                        </form>

                        {/* Toggle Sign Up / Login */}
                        <div className="login-page-toggle login-entrance-stagger">
                            <span className="login-page-toggle-text">
                                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                            </span>
                            <button
                                type="button"
                                className="login-page-toggle-btn"
                                onClick={toggleMode}
                                id="login-page-toggle-btn"
                            >
                                {isSignUp ? 'Sign In' : 'Sign Up'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="login-page-footer">
                <span>© 2026 Team Phoenix. All rights reserved.</span>
            </div>
        </div>
    );
}
