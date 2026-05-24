import { useState, useRef, useEffect } from 'react';
import { useTracker } from '../hooks/useTracker';
import { useAuth } from '../context/AuthContext';
import MatchDetailModal from '../components/MatchDetailModal';

export default function TrackerPage() {
    const [searchInput, setSearchInput] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('ap');
    const [regionOpen, setRegionOpen] = useState(false);
    const regionRef = useRef(null);
    const { currentUser } = useAuth();

    const {
        loading, error, showResults, playerData, rankData, statsData, matchesData, puuid,
        history, matchDetail, setMatchDetail,
        search, clearHistory, removeFromHistory, syncHistoryFromCloud
    } = useTracker();

    const regions = [
        { value: 'ap', label: 'AP' },
        { value: 'eu', label: 'EU' },
        { value: 'na', label: 'NA' },
        { value: 'kr', label: 'KR' },
        { value: 'br', label: 'BR' },
        { value: 'latam', label: 'LATAM' },
    ];

    // Sync history from cloud when user logs in
    useEffect(() => {
        if (currentUser) syncHistoryFromCloud();
    }, [currentUser, syncHistoryFromCloud]);

    // Close region dropdown on outside click
    useEffect(() => {
        function handleClickOutside(e) {
            if (regionRef.current && !regionRef.current.contains(e.target)) {
                setRegionOpen(false);
            }
        }
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const handleSearch = () => search(searchInput, selectedRegion);
    const handleKeyDown = (e) => { if (e.key === 'Enter') handleSearch(); };

    const handleHistoryClick = (item) => {
        setSearchInput(`${item.name}#${item.tag}`);
        if (item.region) setSelectedRegion(item.region.toLowerCase());
        search(`${item.name}#${item.tag}`, item.region ? item.region.toLowerCase() : selectedRegion);
    };

    const selectedLabel = regions.find(r => r.value === selectedRegion)?.label || 'AP';

    const playerAvatar = playerData ? (typeof playerData.card === 'object' ? playerData.card.small : playerData.card) : '';
    const playerBanner = playerData && typeof playerData.card === 'object' && playerData.card.wide ? playerData.card.wide : '';

    return (
        <section id="tracker" className="page active">
            <div className="tracker-container">
                <div className="tracker-page-header">
                    <div className="tracker-page-title-row">
                        <h2 className="tracker-page-title">VALORANT <span className="accent">TRACKER</span></h2>
                        <span className="page-beta-capsule"><span className="tracker-beta-dot"></span> BETA</span>
                    </div>
                    <p className="tracker-page-subtitle">Search any Riot ID to view player stats, rank, and match history</p>
                    <div className="tracker-header-divider"></div>
                </div>

                {/* Search Bar */}
                <div className="tracker-search-bar">
                    <div className="tracker-search-input-wrap">
                        <svg className="tracker-search-icon" viewBox="0 0 24 24" fill="none">
                            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" />
                            <path d="m21 21-4.3-4.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <input type="text" className="tracker-search-input"
                            placeholder="Search Riot ID — e.g. TenZ#0505"
                            spellCheck="false" autoComplete="off"
                            value={searchInput}
                            onChange={e => setSearchInput(e.target.value)}
                            onKeyDown={handleKeyDown} />
                    </div>

                    <div className={`tracker-region-wrapper ${regionOpen ? 'open' : ''}`} ref={regionRef}>
                        <div className="tracker-region-selected" onClick={(e) => { e.stopPropagation(); setRegionOpen(!regionOpen); }}>
                            <span>{selectedLabel}</span>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="tracker-region-chevron">
                                <path d="M6 9l6 6 6-6" />
                            </svg>
                        </div>
                        <div className="tracker-region-dropdown">
                            {regions.map(r => (
                                <div key={r.value}
                                    className={`tracker-region-option ${selectedRegion === r.value ? 'active' : ''}`}
                                    onClick={() => { setSelectedRegion(r.value); setRegionOpen(false); }}>
                                    {r.label}
                                </div>
                            ))}
                        </div>
                    </div>

                    <button className="btn-primary tracker-search-btn" onClick={handleSearch}>SEARCH</button>
                </div>

                {/* History */}
                {!showResults && !loading && (
                    <div className="tracker-history">
                        <div className="tracker-panel">
                            <div className="tracker-panel-label tracker-history-header">
                                RECENT SEARCHES
                                <button className="tracker-history-clear" title="Clear all history" onClick={clearHistory}>
                                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                        <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m2 0v14a2 2 0 01-2 2H8a2 2 0 01-2-2V6h12z" />
                                    </svg>
                                </button>
                            </div>
                            {history.length === 0 ? (
                                <div className="tracker-history-empty active">
                                    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
                                        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                                    </svg>
                                    <span>No recent searches yet</span>
                                </div>
                            ) : (
                                <div className="tracker-history-list" style={{ display: 'flex' }}>
                                    {history.map((item, idx) => (
                                        <div key={idx} className="tracker-history-item" onClick={() => handleHistoryClick(item)}>
                                            {item.avatar ? (
                                                <img src={item.avatar} className="tracker-history-avatar" alt="" />
                                            ) : (
                                                <div className="tracker-history-avatar-placeholder">?</div>
                                            )}
                                            <div className="tracker-history-info">
                                                <div className="tracker-history-name">
                                                    {item.name} <span className="tracker-history-tag">#{item.tag}</span>
                                                </div>
                                                <div className="tracker-history-meta">
                                                    <span className="tracker-history-region">{item.region || 'AP'}</span>
                                                </div>
                                            </div>
                                            <button className="tracker-history-remove" title="Remove"
                                                onClick={(e) => { e.stopPropagation(); removeFromHistory(item.name, item.tag); }}>
                                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                                    <path d="M18 6L6 18M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Error */}
                {error && <div className="tracker-error active">{error}</div>}

                {/* Loading */}
                {loading && (
                    <div className="tracker-loading active">
                        <div className="tracker-spinner"></div>
                        <span>FETCHING STATS...</span>
                    </div>
                )}

                {/* Results */}
                {showResults && playerData && (
                    <div className="tracker-results active">
                        <aside className="tracker-sidebar">
                            {/* Player Identity */}
                            <div className="tracker-panel tracker-identity">
                                <div className="tracker-panel-label">PLAYER IDENTITY</div>
                                <div className="tracker-identity-body">
                                    <img className="tracker-avatar" src={playerAvatar} alt="" />
                                    <div className="tracker-identity-info">
                                        <span className="tracker-name">{playerData.name || '—'}</span>
                                        <span className="tracker-tag">#{playerData.tag || ''}</span>
                                        <span className="tracker-level">LEVEL {playerData.account_level || '?'}</span>
                                    </div>
                                </div>
                                {playerBanner && (
                                    <div className="tracker-player-banner" style={{ backgroundImage: `url(${playerBanner})` }}></div>
                                )}
                            </div>

                            {/* Rank */}
                            {rankData && (
                                <div className="tracker-panel tracker-rank-panel">
                                    <div className="tracker-panel-label">RANK STATUS</div>
                                    <div className="tracker-rank-row">
                                        <div className="tracker-rank-block">
                                            <span className="tracker-rank-sub">CURRENT</span>
                                            {rankData.current.icon && <img className="tracker-rank-icon" src={rankData.current.icon} alt="" />}
                                            <span className="tracker-rank-name">{rankData.current.name}</span>
                                            <span className="tracker-rank-rr">{rankData.current.rr}</span>
                                        </div>
                                        <div className="tracker-rank-block">
                                            <span className="tracker-rank-sub">PEAK</span>
                                            {rankData.peak.icon && <img className="tracker-rank-icon" src={rankData.peak.icon} alt="" />}
                                            <span className="tracker-rank-name">{rankData.peak.name}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Stats */}
                            {statsData && (
                                <div className="tracker-panel tracker-perf-panel">
                                    <div className="tracker-panel-label">PERFORMANCE OVERVIEW</div>
                                    <div className="tracker-perf-grid">
                                        {statsData.map((st, idx) => (
                                            <div key={idx} className="tracker-stat-card">
                                                <span className="tracker-stat-label">{st.l}</span>
                                                <span className="tracker-stat-value">{st.v}</span>
                                                <span className="tracker-stat-sub">{st.s}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </aside>

                        <main className="tracker-main">
                            <div className="tracker-panel tracker-matches-panel">
                                <div className="tracker-panel-label">MATCH HISTORY</div>
                                <div className="tracker-mh-header">
                                    <span className="tracker-mh-col">MAP</span>
                                    <span className="tracker-mh-col">AGENT</span>
                                    <span className="tracker-mh-col">SCORE</span>
                                    <span className="tracker-mh-col">K/D/A</span>
                                    <span className="tracker-mh-col">W/L</span>
                                    <span className="tracker-mh-col">ACS</span>
                                    <span className="tracker-mh-col">K/D</span>
                                    <span className="tracker-mh-col">DD</span>
                                    <span className="tracker-mh-col">HS%</span>
                                </div>
                                <div className="tracker-matches-list">
                                    {matchesData.length === 0 ? (
                                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', letterSpacing: '2px', fontSize: '12px', padding: '30px 0' }}>NO RECENT MATCHES FOUND</p>
                                    ) : (
                                        matchesData.map((m, idx) => (
                                            <div key={idx} className={`tracker-match-row ${m.rc}`} onClick={() => setMatchDetail(m.matchData)}>
                                                <div className="tracker-mr-map">
                                                    <span className="tracker-mr-map-name">{m.mapN}</span>
                                                    <span className="tracker-mr-map-time">{m.timeAgo}</span>
                                                </div>
                                                <div className="tracker-mr-agent">
                                                    {m.agIcon && <img src={m.agIcon} alt={m.agName} />}
                                                    <span className="tracker-mr-agent-name">{m.agName}</span>
                                                </div>
                                                <span className={`tracker-mr-score ${m.rc}`}>{m.rw}:{m.rl}</span>
                                                <span className="tracker-mr-kda">{m.kk}/{m.dd}/{m.aa}</span>
                                                <span className={`tracker-mr-wl ${m.rc}`}>{m.wlText}</span>
                                                <span className="tracker-mr-acs">{m.acs}</span>
                                                <span className={`tracker-mr-kd ${m.kdClass}`}>{m.kdRatio}</span>
                                                <span className={`tracker-mr-dd ${m.ddClass}`}>{m.ddStr}</span>
                                                <span className="tracker-mr-hs">{m.hsPct}%</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </main>
                    </div>
                )}
            </div>

            {matchDetail && (
                <MatchDetailModal matchData={matchDetail} puuid={puuid} onClose={() => setMatchDetail(null)} />
            )}
        </section>
    );
}
