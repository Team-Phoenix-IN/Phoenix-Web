import { useState, useCallback } from 'react';
import { hdevFetch, parseRiotId, getRankIconUrl, getTimeAgo, HISTORY_KEY, apiCall, getToken } from '../services/api';

export function useTracker() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [playerData, setPlayerData] = useState(null);
    const [rankData, setRankData] = useState(null);
    const [statsData, setStatsData] = useState(null);
    const [matchesData, setMatchesData] = useState([]);
    const [puuid, setPuuid] = useState('');
    const [history, setHistory] = useState(() => {
        try {
            const stored = localStorage.getItem(HISTORY_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) { return []; }
    });
    const [matchDetail, setMatchDetail] = useState(null);

    const refreshHistory = useCallback(() => {
        try {
            const stored = localStorage.getItem(HISTORY_KEY);
            setHistory(stored ? JSON.parse(stored) : []);
        } catch (e) { setHistory([]); }
    }, []);

    const saveToHistory = useCallback(async (entry) => {
        let hist = [];
        try {
            const stored = localStorage.getItem(HISTORY_KEY);
            hist = stored ? JSON.parse(stored) : [];
        } catch (e) { hist = []; }
        hist = hist.filter(h => !(h.name.toLowerCase() === entry.name.toLowerCase() && h.tag.toLowerCase() === entry.tag.toLowerCase()));
        hist.unshift(entry);
        hist = hist.slice(0, 5);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(hist));
        setHistory(hist);
        if (getToken()) {
            try { await apiCall('PUT', '/api/user/tracker-history', { trackerHistory: hist }); } catch (e) { }
        }
    }, []);

    const clearHistory = useCallback(async () => {
        localStorage.removeItem(HISTORY_KEY);
        setHistory([]);
        if (getToken()) {
            try { await apiCall('PUT', '/api/user/tracker-history', { trackerHistory: [] }); } catch (e) { }
        }
    }, []);

    const removeFromHistory = useCallback((name, tag) => {
        let hist = [];
        try {
            const stored = localStorage.getItem(HISTORY_KEY);
            hist = stored ? JSON.parse(stored) : [];
        } catch (e) { hist = []; }
        hist = hist.filter(h => !(h.name.toLowerCase() === name.toLowerCase() && h.tag.toLowerCase() === tag.toLowerCase()));
        localStorage.setItem(HISTORY_KEY, JSON.stringify(hist));
        setHistory(hist);
    }, []);

    const syncHistoryFromCloud = useCallback(async () => {
        if (!getToken()) return;
        try {
            const data = await apiCall('GET', '/api/user/tracker-history');
            if (data.trackerHistory && data.trackerHistory.length) {
                localStorage.setItem(HISTORY_KEY, JSON.stringify(data.trackerHistory));
                setHistory(data.trackerHistory);
            }
        } catch (e) { }
    }, []);

    const computeStats = useCallback((matches, puuid) => {
        if (!matches || !matches.length) return null;
        let k = 0, d = 0, a = 0, hs = 0, bs = 0, ls = 0, dmg = 0, wins = 0;
        const agents = {};
        matches.forEach(m => {
            const md = m.data || m;
            const ps = md.players;
            let p = null;
            if (Array.isArray(ps)) p = ps.find(x => x.puuid === puuid);
            else if (ps && ps.all_players) p = ps.all_players.find(x => x.puuid === puuid);
            if (!p) return;
            const s = p.stats || {};
            k += s.kills || 0; d += s.deaths || 0; a += s.assists || 0;
            hs += s.headshots || 0; bs += s.bodyshots || 0; ls += s.legshots || 0;
            if (s.damage && s.damage.dealt) dmg += s.damage.dealt;
            else if (p.damage_made) dmg += p.damage_made;
            const ag = p.agent ? p.agent.name : p.character;
            if (ag) agents[ag] = (agents[ag] || 0) + 1;
            const team = p.team_id || p.team;
            const teams = md.teams;
            if (teams) {
                if (Array.isArray(teams)) {
                    const mt = teams.find(t => t.team_id === team);
                    if (mt && mt.won) wins++;
                } else {
                    const tk = team ? team.toLowerCase() : '';
                    if (teams[tk] && teams[tk].has_won) wins++;
                }
            }
        });
        const n = matches.length, shots = hs + bs + ls;
        let topA = '-', topC = 0;
        Object.entries(agents).forEach(([ag, c]) => { if (c > topC) { topA = ag; topC = c; } });
        return [
            { l: 'WIN RATE', v: `${n ? Math.round(wins / n * 100) : 0}%`, s: `${wins}W ${n - wins}L` },
            { l: 'K/D', v: d > 0 ? (k / d).toFixed(2) : k.toFixed(0), s: `${k}K ${d}D` },
            { l: 'HS %', v: `${shots ? ((hs / shots) * 100).toFixed(1) : 0}%`, s: `${hs} headshots` },
            { l: 'AVG DMG', v: `${n ? Math.round(dmg / n) : 0}`, s: 'per match' },
            { l: 'TOP AGENT', v: topA, s: `${topC} games` }
        ];
    }, []);

    const processMatches = useCallback((matches, puuid) => {
        if (!matches || !matches.length) return [];
        return matches.map(m => {
            const md = m.data || m, meta = md.metadata || {};
            const ps = md.players;
            let p = null;
            if (Array.isArray(ps)) p = ps.find(x => x.puuid === puuid);
            else if (ps && ps.all_players) p = ps.all_players.find(x => x.puuid === puuid);
            if (!p) return null;
            const team = p.team_id || p.team, teams = md.teams;
            let won = false, rw = 0, rl = 0;
            if (teams) {
                if (Array.isArray(teams)) {
                    const mt = teams.find(t => t.team_id === team);
                    if (mt) { won = mt.won; rw = mt.rounds ? mt.rounds.won : 0; rl = mt.rounds ? mt.rounds.lost : 0; }
                } else {
                    const tk = team ? team.toLowerCase() : '';
                    if (teams[tk]) { won = teams[tk].has_won; rw = teams[tk].rounds_won || 0; rl = teams[tk].rounds_lost || 0; }
                }
            }
            const draw = rw === rl && rw > 0;
            const rc = draw ? 'draw' : won ? 'win' : 'loss';
            const s = p.stats || {};
            const kk = s.kills || 0, dd = s.deaths || 0, aa = s.assists || 0;
            const shots = (s.headshots || 0) + (s.bodyshots || 0) + (s.legshots || 0);
            const hsPct = shots > 0 ? ((s.headshots / shots) * 100).toFixed(0) : '0';
            const agName = p.agent ? p.agent.name : (p.character || 'Agent');
            let agIcon = '';
            if (p.agent && p.agent.id) agIcon = `https://media.valorant-api.com/agents/${p.agent.id}/displayicon.png`;
            else if (p.assets && p.assets.agent) agIcon = p.assets.agent.small;
            const mapN = meta.map ? (typeof meta.map === 'object' ? meta.map.name : meta.map) : 'Unknown';
            const rounds = meta.rounds_played || (rw + rl) || 1;
            const acs = Math.round((s.score || 0) / rounds);
            const kdRatio = dd > 0 ? (kk / dd).toFixed(2) : kk.toFixed(0);
            const kdClass = (kk / Math.max(dd, 1)) >= 1 ? 'good' : 'bad';
            let dmgDelta = 0;
            if (s.damage && s.damage.dealt && s.damage.received) dmgDelta = s.damage.dealt - s.damage.received;
            else if (p.damage_made && p.damage_received) dmgDelta = p.damage_made - p.damage_received;
            const ddClass = dmgDelta >= 0 ? 'positive' : 'negative';
            const ddStr = dmgDelta >= 0 ? `+${dmgDelta}` : `${dmgDelta}`;
            const timeAgo = meta.started_at ? getTimeAgo(meta.started_at) : (meta.game_start_patched || '');
            const wlText = draw ? 'D' : won ? 'W' : 'L';
            return {
                matchData: md, rc, mapN, timeAgo, agName, agIcon, rw, rl, kk, dd, aa, wlText, acs, kdRatio, kdClass, dmgDelta, ddClass, ddStr, hsPct
            };
        }).filter(Boolean);
    }, []);

    const search = useCallback(async (inputValue, region) => {
        const rid = parseRiotId(inputValue);
        if (!rid) { setError('Invalid Riot ID. Use Name#Tag (e.g. TenZ#0505)'); return; }
        const { name, tag } = rid;
        const r = region || 'ap';
        const en = encodeURIComponent(name), et = encodeURIComponent(tag);

        setError('');
        setShowResults(false);
        setLoading(true);

        try {
            const acct = await hdevFetch(`/valorant/v1/account/${en}/${et}`);
            const currentPuuid = acct.data.puuid;
            setPuuid(currentPuuid);
            setPlayerData(acct.data);

            let mmr;
            try { mmr = await hdevFetch(`/valorant/v3/mmr/${r}/pc/${en}/${et}`); }
            catch (e) { mmr = await hdevFetch(`/valorant/v2/mmr/${r}/${en}/${et}`); }

            // Process rank data
            const rd = mmr.data;
            let currentRank = {}, peakRank = {};
            if (rd.current) {
                const t = rd.current.tier || {};
                currentRank = { icon: getRankIconUrl(t.id), name: t.name || 'Unrated', rr: `${rd.current.rr || 0} RR` };
                if (rd.peak && rd.peak.tier) {
                    peakRank = { icon: getRankIconUrl(rd.peak.tier.id), name: rd.peak.tier.name || 'N/A' };
                }
            } else if (rd.current_data) {
                const cd = rd.current_data;
                currentRank = { icon: cd.images ? cd.images.large : getRankIconUrl(cd.currenttier), name: cd.currenttier_patched || 'Unrated', rr: `${cd.ranking_in_tier || 0} RR` };
                if (rd.highest_rank) {
                    peakRank = { icon: getRankIconUrl(rd.highest_rank.tier), name: rd.highest_rank.patched_tier || 'N/A' };
                }
            }
            setRankData({ current: currentRank, peak: peakRank });

            let matches = [];
            try {
                const ml = await hdevFetch(`/valorant/v3/matches/${r}/${en}/${et}?mode=competitive&size=5`);
                matches = ml.data || [];
            } catch (e) { matches = []; }

            setStatsData(computeStats(matches, currentPuuid));
            setMatchesData(processMatches(matches, currentPuuid));
            setLoading(false);
            setShowResults(true);

            saveToHistory({
                name: acct.data.name, tag: acct.data.tag,
                region: r.toUpperCase(),
                avatar: typeof acct.data.card === 'object' ? acct.data.card.small : acct.data.card,
                timestamp: Date.now()
            });
        } catch (err) {
            setLoading(false);
            setError(err.message);
        }
    }, [computeStats, processMatches, saveToHistory]);

    return {
        loading, error, showResults, playerData, rankData, statsData, matchesData, puuid,
        history, matchDetail, setMatchDetail,
        search, clearHistory, removeFromHistory, syncHistoryFromCloud, refreshHistory,
        setError, setShowResults
    };
}
