import { IconYouTube, IconTwitter, IconInstagram } from '../components/icons/SvgIcons';

export default function AboutPage() {
    return (
        <section id="about" className="page active">
            <div className="about-container">
                <div className="about-org">
                    <img src="/assets/images/phoenix-logo.png" alt="Team Phoenix" className="about-org-logo" />
                    <h2 className="about-org-name">TEAM <span className="accent">PHOENIX</span></h2>
                    <p className="about-org-tagline">Indian Esports Organization</p>
                    <p className="about-org-desc">
                        Born from the fire, Team Phoenix is an Indian esports organization dedicated to
                        competitive excellence. We compete in Valorant and are committed to nurturing
                        the best talent India has to offer. Rise from the ashes — every setback is a setup for a
                        comeback.
                    </p>
                    <div className="social-links">
                        <a href="https://youtube.com/@Phoenix_IN" target="_blank" rel="noopener" className="social-link" title="YouTube">
                            <IconYouTube className="social-icon" />
                        </a>
                        <a href="https://x.com/@teamphoenixin" target="_blank" rel="noopener" className="social-link" title="X / Twitter">
                            <IconTwitter className="social-icon" />
                        </a>
                        <a href="https://instagram.com/@teamphoenixin" target="_blank" rel="noopener" className="social-link" title="Instagram">
                            <IconInstagram className="social-icon" />
                        </a>
                    </div>
                </div>
                <div className="about-divider"></div>
                <h3 className="about-section-title">THE TEAM</h3>
                <div className="about-people">
                    <div className="person-card">
                        <div className="person-card-glow"></div>
                        <img src="/assets/images/revelk-logo.jpg" alt="RevelK" className="person-logo"
                            onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=RevelK&background=111&color=fff'; }} />
                        <h3 className="person-name">RevelK</h3>
                        <span className="person-role">OWNER</span>
                    </div>
                    <div className="person-card">
                        <div className="person-card-glow"></div>
                        <img src="/assets/images/ozen-logo.jpg" alt="ozen" className="person-logo"
                            onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=ozen&background=111&color=fff'; }} />
                        <h3 className="person-name">ozen</h3>
                        <span className="person-role">ORGANIZATION MANAGER</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
