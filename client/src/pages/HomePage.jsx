import { useNavigate } from 'react-router-dom';
import EmberParticles from '../components/EmberParticles';
import Aurora from '../components/Aurora';

export default function HomePage() {
    const navigate = useNavigate();

    const handleNav = (e, path) => {
        e.preventDefault();
        navigate(path);
    };

    return (
        <section id="home" className="page active">
            <div className="hero">
                <Aurora
                    colorStops={["#f01d1d","#f0ca12","#F97316"]}
                    blend={0.64}
                    amplitude={1.0}
                    speed={0.6}
                />
                <EmberParticles />
                <div className="hero-center">
                    <div className="hero-logo-wrapper" id="hero-logo-wrapper">
                        <img src="/assets/images/phoenix-logo.png" alt="Team Phoenix" className="hero-logo" id="hero-logo" />
                        <div className="logo-glow" id="logo-glow"></div>
                    </div>

                    <h1 className="hero-title entry-anim-text1">TEAM <span className="hero-title-accent">PHOENIX</span></h1>
                    <p className="hero-subtitle entry-anim-text2">RISE FROM THE ASHES</p>
                    <div className="hero-cta-row entry-anim-text3">
                        <a href="#about" className="btn-primary" onClick={(e) => handleNav(e, '/about')}>ABOUT US</a>
                        <a href="#rosters" className="btn-outline" onClick={(e) => handleNav(e, '/rosters')}>VIEW ROSTER</a>
                    </div>
                </div>
            </div>

            <div className="home-games-section" id="home-games-section">
                <div className="home-games-inner">
                    <span className="home-games-badge">ACTIVE ROSTERS</span>
                    <h2 className="home-games-title">OUR <span className="accent">GAMES</span></h2>
                    <div className="home-games-divider"></div>

                    <div className="home-games-grid">
                        <a href="#rosters" className="home-game-card" onClick={(e) => handleNav(e, '/rosters')}>
                            <div className="home-game-card-bg"></div>
                            <div className="home-game-card-glow"></div>
                            <div className="home-game-card-content">
                                <div className="home-game-icon">
                                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="home-game-svg">
                                        <path d="M23.792 2.152a.252.252 0 0 0-.098.083c-3.384 4.23-6.769 8.46-10.15 12.69-.107.093-.025.288.119.265 2.439.003 4.877 0 7.316.001a.66.66 0 0 0 .552-.25c.774-.967 1.55-1.934 2.324-2.903a.72.72 0 0 0 .144-.49c-.002-3.077 0-6.153-.003-9.23.016-.11-.1-.206-.204-.167z" fill="url(#val-grad)" />
                                        <path d="M.077 2.166c-.077.038-.074.132-.076.205.002 3.074.001 6.15.001 9.225a.679.679 0 0 0 .158.463l7.64 9.55c.12.152.308.25.505.247 2.455 0 4.91.003 7.365 0 .142.02.222-.174.116-.265C10.661 15.176 5.526 8.766.4 2.35c-.08-.094-.174-.272-.322-.184z" fill="url(#val-grad)" />
                                        <defs>
                                            <linearGradient id="val-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#ff1a1a" />
                                                <stop offset="50%" stopColor="#ff6600" />
                                                <stop offset="100%" stopColor="#ffaa00" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                </div>
                                <h3 className="home-game-name">VALORANT</h3>
                                <span className="home-game-status">
                                    <span className="home-game-dot"></span>
                                    ACTIVE ROSTER
                                </span>
                                <span className="home-game-cta">VIEW ROSTER</span>
                            </div>
                            <div className="home-game-card-border"></div>
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
