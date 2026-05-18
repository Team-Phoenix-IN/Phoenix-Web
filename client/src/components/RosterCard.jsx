import ProfileCard from './ProfileCard';
import PixelCard from './PixelCard';
import BorderGlow from './BorderGlow';
import { IconTwitter, IconYouTube, IconInstagram, IconTwitch } from './icons/SvgIcons';

const socialIcons = { twitter: IconTwitter, youtube: IconYouTube, instagram: IconInstagram, twitch: IconTwitch };

// ─── Per-player theme colors ────────────────────────────────────────────────
const FIRE_PIXELS = '#ff3d00,#ff9100,#ffc400';

const playerThemes = {
    'EAGLE':         {
        behindGlowColor: 'rgba(255,61,0,0.7)',
        innerGradient:   'linear-gradient(145deg,#ff3d0044 0%,#ff3d0008 100%)',
        pixelColors:     FIRE_PIXELS,
    },
    'REVELK':        {
        behindGlowColor: 'rgba(255,145,0,0.7)',
        innerGradient:   'linear-gradient(145deg,#ff910044 0%,#ff910008 100%)',
        pixelColors:     FIRE_PIXELS,
    },
    'BITTEN BY HER': {
        behindGlowColor: 'rgba(255,214,0,0.7)',
        innerGradient:   'linear-gradient(145deg,#ffd60044 0%,#ffd60008 100%)',
        pixelColors:     FIRE_PIXELS,
    },
    'LyzaXen':       {
        behindGlowColor: 'rgba(170,0,255,0.7)',
        innerGradient:   'linear-gradient(145deg,#aa00ff44 0%,#aa00ff08 100%)',
        pixelColors:     FIRE_PIXELS,
    },
    'Hunt3R':        {
        behindGlowColor: 'rgba(0,229,255,0.7)',
        innerGradient:   'linear-gradient(145deg,#00e5ff44 0%,#00e5ff08 100%)',
        pixelColors:     FIRE_PIXELS,
    },
    'BABYMEOW':      {
        behindGlowColor: 'rgba(0,230,118,0.7)',
        innerGradient:   'linear-gradient(145deg,#00e67644 0%,#00e67608 100%)',
        pixelColors:     FIRE_PIXELS,
    },
};

const DEFAULT_THEME = {
    behindGlowColor: 'rgba(125,190,255,0.67)',
    innerGradient:   'linear-gradient(145deg,#60496e8c 0%,#71C4FF44 100%)',
    pixelColors:     '#f8fafc,#f1f5f9,#cbd5e1',
};

const getTheme = name => playerThemes[name] ?? DEFAULT_THEME;

// ─── Roster section: renders a grid of ProfileCards ─────────────────────────
export default function RosterCard({ players, inactive }) {
    if (!players) return null;
    const list = Array.isArray(players) ? players : [players];

    return (
        <div className="profile-card-grid">
            {list.map((player, idx) => {
                const theme = getTheme(player.name);
                return (
                    <div key={idx} style={{ position: 'relative', width: '100%', height: '100%' }}>
                        <BorderGlow
                            edgeSensitivity={30}
                            glowColor="40 80 80"
                            backgroundColor="#0a0a0c"
                            borderRadius={24}
                            glowRadius={40}
                            glowIntensity={1}
                            coneSpread={25}
                            animated={false}
                            colors={theme.pixelColors.split(',')}
                        >
                            <PixelCard colors={theme.pixelColors} speed={80} gap={6}>
                                <div style={{ position: 'relative', zIndex: 2, width: '100%', height: '100%' }}>
                                    <ProfileCard
                                    name={player.name}
                                    title={player.role}
                                    handle={player.name.toLowerCase().replace(/\s+/g, '')}
                                    status={inactive ? 'Inactive' : 'Active'}
                                    showUserInfo={true}
                                    enableTilt={true}
                                    enableMobileTilt={false}
                                    behindGlowEnabled={true}
                                    behindGlowColor={theme.behindGlowColor}
                                    innerGradient={theme.innerGradient}
                                    socials={(player.socials || []).map(s => ({
                                        ...s,
                                        Icon: socialIcons[s.type] || null,
                                    }))}
                                    className={inactive ? 'pc-inactive' : ''}
                                />
                                </div>
                            </PixelCard>
                        </BorderGlow>
                    </div>
                );
            })}
        </div>
    );
}
