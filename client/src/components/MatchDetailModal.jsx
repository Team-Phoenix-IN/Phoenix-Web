export default function MatchDetailModal({ matchData, puuid, onClose }) {
    if (!matchData) return null;

    const meta = matchData.metadata || {};
    const mapN = meta.map ? (typeof meta.map === 'object' ? meta.map.name : meta.map) : 'Unknown';
    const modeN = (meta.mode || 'Competitive').toUpperCase();
    const matchId = meta.match_id || meta.matchid || '';
    const startRaw = meta.started_at || meta.game_start || null;
    const startTime = startRaw ? new Date(startRaw).toLocaleString() : (meta.game_start_patched || '');
    const gameLengthMs = meta.game_length || meta.gamelength || 0;
    const runtime = gameLengthMs > 0 ? `${Math.floor(gameLengthMs / 60000)}m ${Math.floor((gameLengthMs % 60000) / 1000)}s` : '';
    const server = meta.cluster || meta.server || '';

    let allPlayers = [];
    const ps = matchData.players;
    if (Array.isArray(ps)) allPlayers = ps;
    else if (ps && ps.all_players) allPlayers = ps.all_players;
    const me = allPlayers.find(x => x.puuid === puuid);
    const myTeam = me ? (me.team_id || me.team) : null;
    const teams = matchData.teams;

    let teamAData = { name: myTeam || 'YOUR TEAM', won: false, rw: 0, rl: 0 };
    let teamBData = { name: '', won: false, rw: 0, rl: 0 };
    if (teams) {
        if (Array.isArray(teams)) {
            const mt = teams.find(t => t.team_id === myTeam);
            const ot = teams.find(t => t.team_id !== myTeam);
            if (mt) { teamAData.won = mt.won; teamAData.rw = mt.rounds ? mt.rounds.won : 0; teamAData.rl = mt.rounds ? mt.rounds.lost : 0; }
            if (ot) { teamBData.name = ot.team_id; teamBData.won = ot.won; teamBData.rw = ot.rounds ? ot.rounds.won : 0; teamBData.rl = ot.rounds ? ot.rounds.lost : 0; }
        } else {
            const tk = myTeam ? myTeam.toLowerCase() : '';
            const ok = tk === 'red' ? 'blue' : 'red';
            if (teams[tk]) { teamAData.won = teams[tk].has_won; teamAData.rw = teams[tk].rounds_won || 0; teamAData.rl = teams[tk].rounds_lost || 0; }
            if (teams[ok]) { teamBData.name = ok.toUpperCase(); teamBData.won = teams[ok].has_won; teamBData.rw = teams[ok].rounds_won || 0; teamBData.rl = teams[ok].rounds_lost || 0; }
        }
    }
    const draw = teamAData.rw === teamAData.rl;
    const rc = draw ? 'draw' : teamAData.won ? 'win' : 'loss';
    const resultText = draw ? 'DRAW' : teamAData.won ? 'VICTORY' : 'DEFEAT';
    const totalRounds = (teamAData.rw + teamAData.rl) || 1;
    const mapImg = meta.map && typeof meta.map === 'object' && meta.map.id ? `https://media.valorant-api.com/maps/${meta.map.id}/splash.png` : '';

    const teamA = allPlayers.filter(p => (p.team_id || p.team) === myTeam);
    const teamB = allPlayers.filter(p => (p.team_id || p.team) !== myTeam);
    const sortByACS = (a, b) => ((b.stats ? b.stats.score : 0) || 0) - ((a.stats ? a.stats.score : 0) || 0);
    teamA.sort(sortByACS);
    teamB.sort(sortByACS);

    function renderPlayerRow(p) {
        const s = p.stats || {};
        const k = s.kills || 0, d = s.deaths || 0, a = s.assists || 0;
        const kd = d > 0 ? (k / d).toFixed(1) : k.toFixed(0);
        const kdClass = (k / Math.max(d, 1)) >= 1 ? 'good' : 'bad';
        const shots = (s.headshots || 0) + (s.bodyshots || 0) + (s.legshots || 0);
        const hsPct = shots > 0 ? ((s.headshots / shots) * 100).toFixed(0) : '0';
        let dmgDealt = 0;
        if (s.damage && s.damage.dealt) dmgDealt = s.damage.dealt;
        else if (p.damage_made) dmgDealt = p.damage_made;
        const adr = Math.round(dmgDealt / totalRounds);
        const acs = Math.round((s.score || 0) / totalRounds);
        const agName = p.agent ? p.agent.name : (p.character || '?');
        let agIcon = '';
        if (p.agent && p.agent.id) agIcon = `https://media.valorant-api.com/agents/${p.agent.id}/displayicon.png`;
        else if (p.assets && p.assets.agent) agIcon = p.assets.agent.small;
        const isMe = p.puuid === puuid;
        const fk = p.stats ? (p.stats.first_kills || 0) : 0;
        const fd = p.stats ? (p.stats.first_deaths || 0) : 0;

        return (
            <div key={p.puuid || p.name} className={`md-player-row ${isMe ? 'is-me' : ''}`}>
                <div className="md-pr-player">
                    <div className="md-pr-agent">
                        {agIcon ? <img src={agIcon} alt={agName} /> : <div className="md-pr-agent-placeholder">?</div>}
                    </div>
                    <div className="md-pr-name-wrap">
                        <span className="md-pr-name">{p.name || agName}</span>
                        <span className="md-pr-tag">#{p.tag || ''}</span>
                    </div>
                </div>
                <span className="md-pr-stat">{acs}</span>
                <span className="md-pr-stat md-pr-kda">
                    <span className="md-kda-k">{k}</span> / <span className="md-kda-d">{d}</span> / <span className="md-kda-a">{a}</span>
                </span>
                <span className={`md-pr-stat ${kdClass}`}>{kd}</span>
                <span className="md-pr-stat">{hsPct}%</span>
                <span className="md-pr-stat">{adr}</span>
                <span className="md-pr-stat">{fk}</span>
                <span className="md-pr-stat">{fd}</span>
            </div>
        );
    }

    function renderTeamSection(players, teamInfo, colorClass) {
        const teamLabel = `TEAM ${(teamInfo.name || '').toUpperCase()}`;
        return (
            <div key={teamInfo.name}>
                <div className={`md-team-label ${colorClass}`}>
                    {teamLabel} <span className="md-team-rounds">{teamInfo.rw} ROUNDS</span>
                </div>
                {players.map(p => renderPlayerRow(p))}
            </div>
        );
    }

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className="match-detail-overlay active" onClick={handleOverlayClick}>
            <div className="match-detail-modal">
                <button className="match-detail-close" onClick={onClose}>&times;</button>
                <div className="match-detail-header">
                    <div className="md-header-top">
                        <span className="md-title-badge">MATCH DETAIL</span>
                        {matchId && <span className="md-match-id">{matchId}</span>}
                    </div>
                    <div className="md-map-banner" style={mapImg ? { backgroundImage: `url(${mapImg})` } : {}}>
                        <div className="md-map-overlay">
                            <div className="md-map-info">
                                <h2 className="md-map-name">{mapN}</h2>
                                <span className="md-mode">{modeN}</span>
                            </div>
                            <div className="md-result-block">
                                <span className={`md-result-text ${rc}`}>{resultText}</span>
                                <span className={`md-result-score ${rc}`}>{teamAData.rw}:{teamAData.rl}</span>
                            </div>
                        </div>
                    </div>
                    <div className="md-meta-row">
                        {startTime && <div className="md-meta-item"><span className="md-meta-label">START</span><span className="md-meta-value">{startTime}</span></div>}
                        {runtime && <div className="md-meta-item"><span className="md-meta-label">RUNTIME</span><span className="md-meta-value">{runtime}</span></div>}
                        {server && <div className="md-meta-item"><span className="md-meta-label">SERVER</span><span className="md-meta-value">{server}</span></div>}
                    </div>
                    <div className="md-tab-bar">
                        <span className="md-tab active">SCOREBOARD</span>
                    </div>
                    <div className="md-col-header">
                        <span className="md-ch md-ch-player">PLAYER</span>
                        <span className="md-ch">ACS</span>
                        <span className="md-ch md-ch-kda">K / D / A</span>
                        <span className="md-ch">K/D</span>
                        <span className="md-ch">HS%</span>
                        <span className="md-ch">ADR</span>
                        <span className="md-ch">FK</span>
                        <span className="md-ch">FD</span>
                    </div>
                </div>
                <div className="match-detail-scoreboard">
                    {renderTeamSection(teamA, teamAData, 'md-team-green')}
                    {renderTeamSection(teamB, teamBData, 'md-team-red')}
                </div>
            </div>
        </div>
    );
}
