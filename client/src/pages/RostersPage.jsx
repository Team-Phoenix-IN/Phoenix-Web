import { useState, useEffect } from 'react';
import RosterCard from '../components/RosterCard';
import { IconVlr } from '../components/icons/SvgIcons';

const activePlayers = [
    {
        initial: 'E', name: 'EAGLE', role: 'DUELIST', discordId: '818733149294559262',
        socials: [
            { type: 'twitter', url: 'https://x.com/E4gle_val' },
            { type: 'youtube', url: 'https://youtube.com/@Eagle_flyhigh' },
        ]
    },
    {
        initial: 'R', name: 'REVELK', role: 'IGL', discordId: '761476233472376863',
        socials: [
            { type: 'youtube', url: 'https://youtube.com/@revelkgg' },
            { type: 'twitter', url: 'https://x.com/revelkgg' },
            { type: 'instagram', url: 'https://instagram.com/revelkgg' },
            { type: 'twitch', url: 'https://twitch.tv/revelkgg' },
        ]
    },
    {
        initial: 'R', name: 'BITTEN BY HER', role: 'SEC DUELIST/FLEX', discordId: '859784977361141824',
        socials: [
            { type: 'instagram', url: 'https://instagram.com/rehann._.23' },
        ]
    },
    {
        initial: 'L', name: 'LyzaXen', role: 'Sentinel', discordId: '738980461346553916',
        socials: [
            { type: 'twitter', url: 'https://x.com/SkyIsBlue070' },
        ]
    },
    {
        initial: 'H', name: 'Hunt3R', role: 'FLEX', discordId: '1500887664587702474',
        socials: [
            { type: 'instagram', url: 'https://instagram.com/__mananjain_' },
        ]
    },
    {
        initial: 'B', name: 'BABYMEOW', role: 'FLEX', discordId: '1100284677287317534',
        socials: [
            { type: 'instagram', url: 'https://instagram.com/rajnishmaurya_vlr' },
            { type: 'twitter', url: 'https://x.com/BabyMeoW_vlr' },
        ]
    },
];

const inactivePlayers = [];

export default function RostersPage() {
    const [presenceData, setPresenceData] = useState({});

    useEffect(() => {
        const fetchPresence = async () => {
            const allPlayers = [...activePlayers, ...inactivePlayers];
            const discordIds = allPlayers.map(p => p.discordId).filter(Boolean);
            if (discordIds.length === 0) return;

            try {
                // Fetch from our local backend (running on port 3000 typically, but Vite proxies or handles it)
                // Actually, if backend is on 3000, we should point to http://localhost:3000 for development unless there's a proxy.
                // Assuming proxy is configured in vite.config.js
                const url = `/api/discord/presence?users=${discordIds.join(',')}`;
                const res = await fetch(url);
                if (res.ok) {
                    const json = await res.json();
                    if (json.success) {
                        setPresenceData(json.data || {});
                    }
                }
            } catch (err) {
                console.warn('Roster presence fetch failed:', err.message);
            }
        };

        fetchPresence();
        const interval = setInterval(fetchPresence, 120000); // 2 minutes
        return () => clearInterval(interval);
    }, []);

    return (
        <section id="rosters" className="page active">
            <div className="rosters-container">
                <div className="roster-header">
                    <span className="roster-badge">COMPETITIVE TEAM</span>
                    <h2 className="roster-game-title">VALORANT</h2>
                    <div className="roster-divider"></div>
                    <a href="https://www.vlr.gg/team/21596/team-phoenix" target="_blank" rel="noopener noreferrer" className="btn-vlr">
                        <IconVlr className="btn-icon" />
                        VIEW ON VLR.GG
                    </a>
                </div>

                <div className="roster-header" style={{ marginTop: '40px' }}>
                    <h2 className="roster-game-title" style={{ fontSize: '28px', display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
                        <span className="home-game-dot"></span>
                        ACTIVE PLAYERS
                        <span style={{ width: '6px', height: '6px', display: 'inline-block', flexShrink: 0 }}></span>
                    </h2>
                    <div className="roster-divider"></div>
                </div>

                <RosterCard players={activePlayers} presenceData={presenceData} />

                {inactivePlayers.length > 0 && (
                    <>
                        <div className="roster-header" style={{ marginTop: '60px' }}>
                            <h2 className="roster-game-title" style={{ fontSize: '28px', opacity: 0.6, display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
                                <span className="home-game-dot" style={{ backgroundColor: '#666', boxShadow: 'none', animation: 'none' }}></span>INACTIVE PLAYERS
                            </h2>
                            <div className="roster-divider"></div>
                        </div>
                        <RosterCard players={inactivePlayers} inactive presenceData={presenceData} />
                    </>
                )}
            </div>
        </section>
    );
}
