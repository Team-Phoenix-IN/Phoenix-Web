import RosterCard from '../components/RosterCard';
import { IconVlr } from '../components/icons/SvgIcons';

const activePlayers = [
    {
        initial: 'E', name: 'EAGLE', role: 'DUELIST',
        socials: [
            { type: 'twitter', url: 'https://x.com/E4gle_val' },
            { type: 'youtube', url: 'https://youtube.com/@Eagle_flyhigh' },
        ]
    },
    {
        initial: 'R', name: 'REVELK', role: 'IGL',
        socials: [
            { type: 'youtube', url: 'https://youtube.com/@revelkgg' },
            { type: 'twitter', url: 'https://x.com/revelkgg' },
            { type: 'instagram', url: 'https://instagram.com/revelkgg' },
            { type: 'twitch', url: 'https://twitch.tv/revelkgg' },
        ]
    },
    {
        initial: 'R', name: 'BITTEN BY HER', role: 'SEC DUELIST/FLEX',
        socials: [
            { type: 'instagram', url: 'https://instagram.com/rehann._.23' },
        ]
    },
    {
        initial: 'L', name: 'LyzaXen', role: 'Sentinel',
        socials: [
            { type: 'twitter', url: 'https://x.com/SkyIsBlue070' },
        ]
    },
    {
        initial: 'H', name: 'Hunt3R', role: 'FLEX',
        socials: [
            { type: 'instagram', url: 'https://instagram.com/__mananjain_' },
        ]
    },
    {
        initial: 'B', name: 'BABYMEOW', role: 'FLEX',
        socials: [
            { type: 'instagram', url: 'https://instagram.com/rajnishmaurya_vlr' },
            { type: 'twitter', url: 'https://x.com/BabyMeoW_vlr' },
        ]
    },
];

const inactivePlayers = [];

export default function RostersPage() {
    return (
        <section id="rosters" className="page active">
            <div className="rosters-container">
                <div className="roster-header">
                    <span className="roster-badge">COMPETITIVE TEAM</span>
                    <h2 className="roster-game-title">VALORANT</h2>
                    <div className="roster-divider"></div>
                    <a href="https://www.vlr.gg/team/21596/team-phoenix" target="_blank" rel="noopener" className="btn-vlr">
                        <IconVlr className="btn-icon" />
                        VIEW ON VLR.GG
                    </a>
                </div>

                <div className="roster-header" style={{ marginTop: '40px' }}>
                    <h2 className="roster-game-title" style={{ fontSize: '28px', display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
                        <span className="home-game-dot"></span>
                        ACTIVE PLAYERS
                        {/* Mirror spacer to visually balance the leading dot */}
                        <span style={{ width: '6px', height: '6px', display: 'inline-block', flexShrink: 0 }}></span>
                    </h2>
                    <div className="roster-divider"></div>
                </div>

                <RosterCard players={activePlayers} />

                {inactivePlayers.length > 0 && (
                    <>
                        <div className="roster-header" style={{ marginTop: '60px' }}>
                            <h2 className="roster-game-title" style={{ fontSize: '28px', opacity: 0.6, display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
                                <span className="home-game-dot" style={{ backgroundColor: '#666', boxShadow: 'none', animation: 'none' }}></span>INACTIVE PLAYERS
                            </h2>
                            <div className="roster-divider"></div>
                        </div>
                        <RosterCard players={inactivePlayers} inactive />
                    </>
                )}
            </div>
        </section>
    );
}
