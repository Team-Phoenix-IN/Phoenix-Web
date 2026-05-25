import { useNavigate } from 'react-router-dom';
import BorderGlow from '../BorderGlow';

export default function UIOverlay() {
    const navigate = useNavigate();

    const handleNav = (e, path) => {
        e.preventDefault();
        navigate(path);
    };

    return (
        <div className="phoenix-hero-overlay" id="phoenix-hero-overlay">
            {/* Logo */}
            <div className="phoenix-hero-logo-wrap" id="phoenix-hero-logo-wrap">
                <img
                    src="/assets/images/phoenix-logo.png"
                    alt="Team Phoenix"
                    className="phoenix-hero-logo-img"
                    id="phoenix-hero-logo-img"
                />
                <div className="phoenix-hero-logo-glow"></div>
            </div>

            {/* Headline */}
            <h1 className="phoenix-hero-headline" id="phoenix-hero-headline">
                TEAM <span className="phoenix-hero-headline-accent">PHOENIX</span>
            </h1>

            <p className="phoenix-hero-sub" id="phoenix-hero-sub">
                RISEN FROM THE ASHES
            </p>

            {/* CTA Buttons */}
            <div className="hero-cta-row phoenix-hero-cta-row" id="phoenix-hero-cta-row">
                <BorderGlow
                    edgeSensitivity={0}
                    glowColor="20 90 65"
                    backgroundColor="transparent"
                    borderRadius={50}
                    glowRadius={20}
                    glowIntensity={1.5}
                    coneSpread={40}
                    animated={false}
                    colors={['#ff3d00', '#ff9100', '#ffc400']}
                    fillOpacity={0}
                    className="hero-btn-glow"
                >
                    <a href="#about" className="btn-primary" onClick={(e) => handleNav(e, '/about')}>ABOUT US</a>
                </BorderGlow>
                <BorderGlow
                    edgeSensitivity={0}
                    glowColor="20 90 65"
                    backgroundColor="transparent"
                    borderRadius={50}
                    glowRadius={20}
                    glowIntensity={1.5}
                    coneSpread={40}
                    animated={false}
                    colors={['#ff3d00', '#ff9100', '#ffc400']}
                    fillOpacity={0}
                    className="hero-btn-glow"
                >
                    <a href="#rosters" className="btn-outline" onClick={(e) => handleNav(e, '/rosters')}>VIEW ROSTER</a>
                </BorderGlow>
            </div>
        </div>
    );
}
