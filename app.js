// ─── API Client (replaces Firebase SDK) ───
const API_BASE = window.location.origin;
const TOKEN_KEY = 'phoenix_auth_token';

function getToken() { return localStorage.getItem(TOKEN_KEY); }
function setToken(t) { localStorage.setItem(TOKEN_KEY, t); }
function clearToken() { localStorage.removeItem(TOKEN_KEY); }

async function apiCall(method, path, body, isFormData) {
  const opts = { method, headers: {} };
  const token = getToken();
  if (token) opts.headers['Authorization'] = `Bearer ${token}`;
  if (body && !isFormData) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  } else if (body && isFormData) {
    opts.body = body;
  }
  const res = await fetch(`${API_BASE}${path}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

let currentUser = null;

const YT_API_KEY = 'YOUR_GOOGLE_API_KEY';
const CREATOR_CHANNELS = [
  { channelId: 'UC6rMH3tbkLW5b8kBA-k6vWg', handle: 'ozen_gg', containerId: 'creator-ozen-videos' }
];
const VIDEOS_PER_CHANNEL = 3;

// ─── Discord Integration Config ───
const DISCORD_CONFIG = {
  serverId: '1359130053341876404',                       // Your Discord Server ID (numeric) — REQUIRED
  inviteUrl: 'https://discord.gg/9yPMDEsARR',
  widgetRefreshMs: 60000,             // Widget auto-refresh: 60 seconds
  presenceRefreshMs: 120000,          // Roster status auto-refresh: 2 minutes
  maxMemberBubbles: 12,               // Max avatar bubbles to show in widget
  // Map player names to Discord User IDs for roster status indicators
  // The custom Discord bot in server.js will fetch their presence.
  // Ensure the bot and the users share at least one Discord server.
  playerDiscordIds: {
    'EAGLE': '818733149294559262',
    'REVELK': '761476233472376863',
    'BITTEN BY HER': '859784977361141824',
    'LyzaXen': '738980461346553916',
    'Hunt3R': '1500887664587702474',
    'BABYMEOW': '1100284677287317534'
  }
};

(function () {
  'use strict';

  const EMBER_COUNT = 30;

  function initTheme() {
    const desktopToggle = document.getElementById('theme-toggle-desktop');
    const mobileToggle = document.getElementById('theme-toggle-mobile');

    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    if (savedTheme === 'light') {
      if (desktopToggle) desktopToggle.checked = true;
      if (mobileToggle) mobileToggle.checked = true;
    }

    function toggleTheme(e) {
      const isLight = e.target.checked;
      const theme = isLight ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);

      if (desktopToggle && e.target !== desktopToggle) desktopToggle.checked = isLight;
      if (mobileToggle && e.target !== mobileToggle) mobileToggle.checked = isLight;
    }

    if (desktopToggle) desktopToggle.addEventListener('change', toggleTheme);
    if (mobileToggle) mobileToggle.addEventListener('change', toggleTheme);
  }

  function initScrollToTop() {
    const scrollBtn = document.getElementById('scroll-to-top');
    const scrollProgress = document.getElementById('scroll-progress');

    if (scrollBtn && scrollProgress) {
      const radius = 45;
      const circumference = 2 * Math.PI * radius;
      scrollProgress.style.strokeDasharray = `${circumference} ${circumference}`;
      scrollProgress.style.strokeDashoffset = circumference;

      window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;

        if (scrollTop > 150) {
          scrollBtn.classList.add('visible');
        } else {
          scrollBtn.classList.remove('visible');
        }

        if (scrollHeight > 0) {
          const progress = scrollTop / scrollHeight;
          const offset = circumference - (progress * circumference);
          scrollProgress.style.strokeDashoffset = offset;
        }
      });

      scrollBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  function initNavScroll() {
    const nav = document.getElementById('main-nav');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY;

      if (Math.abs(delta) > 5) {
        if (currentScrollY > lastScrollY && currentScrollY > 80) {
          nav.classList.add('nav-hidden');
        } else {
          nav.classList.remove('nav-hidden');
        }
        lastScrollY = currentScrollY;
      }
    });
  }

  function initRouter() {
    const pages = document.querySelectorAll('.page');
    const links = document.querySelectorAll('.nav-link, .nav-link-dt');
    const ctaButtons = document.querySelectorAll('[data-nav]');

    function navigateTo(pageId) {
      if (!pageId) return;
      pages.forEach((p) => p.classList.remove('active'));
      links.forEach((l) => l.classList.remove('active'));

      // Always show navbar when navigating to a new page
      const nav = document.getElementById('main-nav');
      if (nav) nav.classList.remove('nav-hidden');

      const target = document.getElementById(pageId);
      if (target) {
        target.classList.add('active');
        window.scrollTo(0, 0);
      }

      document.querySelectorAll(`[data-page="${pageId}"]`).forEach((l) => l.classList.add('active'));

      const sidebar = document.getElementById('sidebar');
      const sidebarOverlay = document.getElementById('sidebar-overlay');
      if (sidebar) sidebar.classList.remove('open');
      if (sidebarOverlay) sidebarOverlay.classList.remove('open');
      document.body.classList.remove('sidebar-open');
    }

    const logoLink = document.getElementById('nav-logo-link');
    if (logoLink) {
      logoLink.addEventListener('click', (e) => {
        e.preventDefault();
        history.pushState(null, '', '#home');
        navigateTo('home');
      });
    }

    links.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.dataset.page;
        history.pushState(null, '', '#' + page);
        navigateTo(page);
      });
    });

    ctaButtons.forEach((btn) => {
      if (btn.getAttribute('target') === '_blank') return;
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const page = btn.dataset.nav;
        history.pushState(null, '', '#' + page);
        navigateTo(page);
      });
    });

    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '');
      if (hash.endsWith('/riot.txt')) { window.location.href = '/riot.txt'; return; }
      navigateTo(hash || 'home');
    });

    const initial = window.location.hash.replace('#', '');
    if (initial.endsWith('/riot.txt')) {
      window.location.href = '/riot.txt';
    } else if (initial !== 'home' && initial !== '') {
      navigateTo(initial);
    } else if (initial === '') {
      navigateTo('home');
    }
  }

  function createEmbers() {
    const emberContainer = document.getElementById('ember-container');
    if (!emberContainer) return;
    for (let i = 0; i < EMBER_COUNT; i++) {
      const ember = document.createElement('div');
      ember.classList.add('ember');
      const size = 2 + Math.random() * 4;
      const left = Math.random() * 100;
      const duration = 6 + Math.random() * 10;
      const delay = Math.random() * 12;
      ember.style.width = `${size}px`;
      ember.style.height = `${size}px`;
      ember.style.left = `${left}%`;
      ember.style.bottom = `-${size}px`;
      ember.style.animationDuration = `${duration}s`;
      ember.style.animationDelay = `${delay}s`;
      emberContainer.appendChild(ember);
    }
  }

  function initMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const mobileBtn = document.getElementById('mobile-menu-btn');

    function openSidebar() {
      if (window.innerWidth > 1024) return;
      if (sidebar) sidebar.classList.add('open');
      if (sidebarOverlay) sidebarOverlay.classList.add('open');
      document.body.classList.add('sidebar-open');
    }

    function closeSidebar() {
      if (sidebar) sidebar.classList.remove('open');
      if (sidebarOverlay) sidebarOverlay.classList.remove('open');
      document.body.classList.remove('sidebar-open');
    }

    if (mobileBtn) mobileBtn.addEventListener('click', openSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

    if (sidebar) {
      sidebar.querySelectorAll('.nav-link').forEach((link) => {
        link.addEventListener('click', closeSidebar);
      });
    }
  }

  const HDEV_BASE = 'https://api.henrikdev.xyz';
  const HDEV_API_KEY = 'HDEV-67ef927d-d7f2-47f4-bb92-bf8919370782';
  const HISTORY_KEY = 'phoenix_tracker_history';

  function getRankIconUrl(tierId) { return !tierId || tierId <= 0 ? '' : `https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/${tierId}/largeicon.png`; }
  function showTrackerError(msg) { const el = document.getElementById('tracker-error'); if (el) { el.textContent = msg; el.classList.add('active'); } }
  function hideTrackerError() { const el = document.getElementById('tracker-error'); if (el) el.classList.remove('active'); }
  function showTrackerLoading(show) { const el = document.getElementById('tracker-loading'); if (el) el.classList.toggle('active', show); }
  function showTrackerResults(show) { const el = document.getElementById('tracker-results'); if (el) el.classList.toggle('active', show); }
  function parseRiotId(input) { const trimmed = input.trim(); const idx = trimmed.lastIndexOf('#'); if (idx <= 0 || idx === trimmed.length - 1) return null; return { name: trimmed.substring(0, idx).trim(), tag: trimmed.substring(idx + 1).trim() }; }

  async function hdevFetch(path) {
    const res = await fetch(`${HDEV_BASE}${path}`, { headers: { Authorization: HDEV_API_KEY } });
    if (res.status === 401 || res.status === 403) throw new Error('Invalid API key.');
    if (res.status === 404) throw new Error('Player not found. Check the Riot ID and region.');
    if (res.status === 429) throw new Error('Rate limit reached.');
    if (!res.ok) throw new Error(`API error (${res.status}). Try again.`);
    return res.json();
  }

  function renderPlayerCard(d) {
    const nameEl = document.getElementById('tracker-player-name'); const tagEl = document.getElementById('tracker-player-tag'); const levelEl = document.getElementById('tracker-player-level'); const avatarEl = document.getElementById('tracker-player-avatar'); const bannerEl = document.getElementById('tracker-player-banner');
    if (nameEl) nameEl.textContent = d.name || '—'; if (tagEl) tagEl.textContent = `#${d.tag || ''}`; if (levelEl) levelEl.textContent = `LEVEL ${d.account_level || '?'}`;
    if (d.card) { if (avatarEl) avatarEl.src = typeof d.card === 'object' ? d.card.small : d.card; if (bannerEl && typeof d.card === 'object' && d.card.wide) bannerEl.style.backgroundImage = `url(${d.card.wide})`; }
  }

  function renderRankCard(mmr) {
    const rankIcon = document.getElementById('tracker-rank-icon'); const rankName = document.getElementById('tracker-rank-name'); const rankRR = document.getElementById('tracker-rank-rr'); const peakIcon = document.getElementById('tracker-rank-peak-icon'); const peakName = document.getElementById('tracker-rank-peak-name');
    if (mmr.current) {
      const t = mmr.current.tier || {}; if (rankIcon) rankIcon.src = getRankIconUrl(t.id); if (rankName) rankName.textContent = t.name || 'Unrated'; if (rankRR) rankRR.textContent = `${mmr.current.rr || 0} RR`;
      if (mmr.peak && mmr.peak.tier) { if (peakIcon) peakIcon.src = getRankIconUrl(mmr.peak.tier.id); if (peakName) peakName.textContent = mmr.peak.tier.name || 'N/A'; }
    } else if (mmr.current_data) {
      const cd = mmr.current_data; if (rankIcon) rankIcon.src = cd.images ? cd.images.large : getRankIconUrl(cd.currenttier); if (rankName) rankName.textContent = cd.currenttier_patched || 'Unrated'; if (rankRR) rankRR.textContent = `${cd.ranking_in_tier || 0} RR`;
      if (mmr.highest_rank) { if (peakIcon) peakIcon.src = getRankIconUrl(mmr.highest_rank.tier); if (peakName) peakName.textContent = mmr.highest_rank.patched_tier || 'N/A'; }
    }
  }

  function renderStats(matches, puuid) {
    const grid = document.getElementById('tracker-stats-grid'); if (!grid) return; grid.innerHTML = ''; if (!matches || !matches.length) return;
    let k = 0, d = 0, a = 0, hs = 0, bs = 0, ls = 0, dmg = 0, wins = 0; const agents = {};
    matches.forEach(m => {
      const md = m.data || m; const ps = md.players; let p = null;
      if (Array.isArray(ps)) p = ps.find(x => x.puuid === puuid); else if (ps && ps.all_players) p = ps.all_players.find(x => x.puuid === puuid);
      if (!p) return;
      const s = p.stats || {}; k += s.kills || 0; d += s.deaths || 0; a += s.assists || 0; hs += s.headshots || 0; bs += s.bodyshots || 0; ls += s.legshots || 0;
      if (s.damage && s.damage.dealt) dmg += s.damage.dealt; else if (p.damage_made) dmg += p.damage_made;
      const ag = p.agent ? p.agent.name : p.character; if (ag) agents[ag] = (agents[ag] || 0) + 1;
      const team = p.team_id || p.team; const teams = md.teams;
      if (teams) {
        if (Array.isArray(teams)) { const mt = teams.find(t => t.team_id === team); if (mt && mt.won) wins++; }
        else { const tk = team ? team.toLowerCase() : ''; if (teams[tk] && teams[tk].has_won) wins++; }
      }
    });
    const n = matches.length, shots = hs + bs + ls; let topA = '-', topC = 0; Object.entries(agents).forEach(([ag, c]) => { if (c > topC) { topA = ag; topC = c; } });
    [{ l: 'WIN RATE', v: `${n ? Math.round(wins / n * 100) : 0}%`, s: `${wins}W ${n - wins}L` }, { l: 'K/D', v: d > 0 ? (k / d).toFixed(2) : k.toFixed(0), s: `${k}K ${d}D` }, { l: 'HS %', v: `${shots ? ((hs / shots) * 100).toFixed(1) : 0}%`, s: `${hs} headshots` }, { l: 'AVG DMG', v: `${n ? Math.round(dmg / n) : 0}`, s: 'per match' }, { l: 'TOP AGENT', v: topA, s: `${topC} games` }].forEach(st => {
      const c = document.createElement('div'); c.className = 'tracker-stat-card'; c.innerHTML = `<span class="tracker-stat-label">${st.l}</span><span class="tracker-stat-value">${st.v}</span><span class="tracker-stat-sub">${st.s}</span>`; grid.appendChild(c);
    });
  }

  function renderMatches(matches, puuid) {
    const list = document.getElementById('tracker-matches-list'); if (!list) return; list.innerHTML = '';
    if (!matches || !matches.length) { list.innerHTML = '<p style="color:var(--text-muted);text-align:center;letter-spacing:2px;font-size:12px;padding:30px 0;">NO RECENT MATCHES FOUND</p>'; return; }
    matches.forEach(m => {
      const md = m.data || m, meta = md.metadata || {}; const ps = md.players; let p = null;
      if (Array.isArray(ps)) p = ps.find(x => x.puuid === puuid); else if (ps && ps.all_players) p = ps.all_players.find(x => x.puuid === puuid);
      if (!p) return;
      const team = p.team_id || p.team, teams = md.teams; let won = false, rw = 0, rl = 0;
      if (teams) {
        if (Array.isArray(teams)) { const mt = teams.find(t => t.team_id === team); if (mt) { won = mt.won; rw = mt.rounds ? mt.rounds.won : 0; rl = mt.rounds ? mt.rounds.lost : 0; } }
        else { const tk = team ? team.toLowerCase() : ''; if (teams[tk]) { won = teams[tk].has_won; rw = teams[tk].rounds_won || 0; rl = teams[tk].rounds_lost || 0; } }
      }
      const draw = rw === rl && rw > 0, rc = draw ? 'draw' : won ? 'win' : 'loss'; const s = p.stats || {}; const kk = s.kills || 0, dd = s.deaths || 0, aa = s.assists || 0; const shots = (s.headshots || 0) + (s.bodyshots || 0) + (s.legshots || 0); const hsPct = shots > 0 ? ((s.headshots / shots) * 100).toFixed(0) : '0';
      const agName = p.agent ? p.agent.name : (p.character || 'Agent'); let agIcon = ''; if (p.agent && p.agent.id) agIcon = `https://media.valorant-api.com/agents/${p.agent.id}/displayicon.png`; else if (p.assets && p.assets.agent) agIcon = p.assets.agent.small;
      const mapN = meta.map ? (typeof meta.map === 'object' ? meta.map.name : meta.map) : 'Unknown'; const rounds = meta.rounds_played || (rw + rl) || 1; const acs = Math.round((s.score || 0) / rounds); const kdRatio = dd > 0 ? (kk / dd).toFixed(2) : kk.toFixed(0); const kdClass = (kk / Math.max(dd, 1)) >= 1 ? 'good' : 'bad';
      let dmgDelta = 0; if (s.damage && s.damage.dealt && s.damage.received) dmgDelta = s.damage.dealt - s.damage.received; else if (p.damage_made && p.damage_received) dmgDelta = p.damage_made - p.damage_received; const ddClass = dmgDelta >= 0 ? 'positive' : 'negative'; const ddStr = dmgDelta >= 0 ? `+${dmgDelta}` : `${dmgDelta}`;
      const timeAgo = meta.started_at ? getTimeAgo(meta.started_at) : (meta.game_start_patched || ''); const wlText = draw ? 'D' : won ? 'W' : 'L';
      const row = document.createElement('div'); row.className = `tracker-match-row ${rc}`;
      row.innerHTML = `<div class="tracker-mr-map"><span class="tracker-mr-map-name">${mapN}</span><span class="tracker-mr-map-time">${timeAgo}</span></div><div class="tracker-mr-agent">${agIcon ? `<img src="${agIcon}" alt="${agName}">` : ''}<span class="tracker-mr-agent-name">${agName}</span></div><span class="tracker-mr-score ${rc}">${rw}:${rl}</span><span class="tracker-mr-kda">${kk}/${dd}/${aa}</span><span class="tracker-mr-wl ${rc}">${wlText}</span><span class="tracker-mr-acs">${acs}</span><span class="tracker-mr-kd ${kdClass}">${kdRatio}</span><span class="tracker-mr-dd ${ddClass}">${ddStr}</span><span class="tracker-mr-hs">${hsPct}%</span>`;
      row.addEventListener('click', () => showMatchDetail(md, puuid)); list.appendChild(row);
    });
  }

  function getTimeAgo(dateStr) { const d = new Date(dateStr); const now = new Date(); const diffMs = now - d; const mins = Math.floor(diffMs / 60000); if (mins < 60) return `${mins}M AGO`; const hrs = Math.floor(mins / 60); if (hrs < 24) return `${hrs}H AGO`; const days = Math.floor(hrs / 24); return `${days}D AGO`; }

  function showMatchDetail(matchData, puuid) {
    const overlay = document.getElementById('match-detail-overlay'); const header = document.getElementById('match-detail-header'); const scoreboard = document.getElementById('match-detail-scoreboard'); if (!overlay || !header || !scoreboard) return;
    const meta = matchData.metadata || {}; const mapN = meta.map ? (typeof meta.map === 'object' ? meta.map.name : meta.map) : 'Unknown'; const modeN = (meta.mode || 'Competitive').toUpperCase(); const matchId = meta.match_id || meta.matchid || ''; const startRaw = meta.started_at || meta.game_start || null; const startTime = startRaw ? new Date(startRaw).toLocaleString() : (meta.game_start_patched || ''); const gameLengthMs = meta.game_length || meta.gamelength || 0; const runtime = gameLengthMs > 0 ? `${Math.floor(gameLengthMs / 60000)}m ${Math.floor((gameLengthMs % 60000) / 1000)}s` : ''; const server = meta.cluster || meta.server || '';
    let allPlayers = []; const ps = matchData.players; if (Array.isArray(ps)) allPlayers = ps; else if (ps && ps.all_players) allPlayers = ps.all_players;
    const me = allPlayers.find(x => x.puuid === puuid); const myTeam = me ? (me.team_id || me.team) : null;
    const teams = matchData.teams; let teamAData = { name: myTeam || 'YOUR TEAM', won: false, rw: 0, rl: 0 }; let teamBData = { name: '', won: false, rw: 0, rl: 0 };
    if (teams) {
      if (Array.isArray(teams)) { const mt = teams.find(t => t.team_id === myTeam); const ot = teams.find(t => t.team_id !== myTeam); if (mt) { teamAData.won = mt.won; teamAData.rw = mt.rounds ? mt.rounds.won : 0; teamAData.rl = mt.rounds ? mt.rounds.lost : 0; } if (ot) { teamBData.name = ot.team_id; teamBData.won = ot.won; teamBData.rw = ot.rounds ? ot.rounds.won : 0; teamBData.rl = ot.rounds ? ot.rounds.lost : 0; } }
      else { const tk = myTeam ? myTeam.toLowerCase() : ''; const ok = tk === 'red' ? 'blue' : 'red'; if (teams[tk]) { teamAData.won = teams[tk].has_won; teamAData.rw = teams[tk].rounds_won || 0; teamAData.rl = teams[tk].rounds_lost || 0; } if (teams[ok]) { teamBData.name = ok.toUpperCase(); teamBData.won = teams[ok].has_won; teamBData.rw = teams[ok].rounds_won || 0; teamBData.rl = teams[ok].rounds_lost || 0; } }
    }
    const draw = teamAData.rw === teamAData.rl; const rc = draw ? 'draw' : teamAData.won ? 'win' : 'loss'; const resultText = draw ? 'DRAW' : teamAData.won ? 'VICTORY' : 'DEFEAT'; const totalRounds = (teamAData.rw + teamAData.rl) || 1; const mapImg = meta.map && typeof meta.map === 'object' && meta.map.id ? `https://media.valorant-api.com/maps/${meta.map.id}/splash.png` : '';
    header.innerHTML = `<div class="md-header-top"><span class="md-title-badge">MATCH DETAIL</span>${matchId ? `<span class="md-match-id">${matchId}</span>` : ''}</div><div class="md-map-banner" ${mapImg ? `style="background-image:url(${mapImg})"` : ''}><div class="md-map-overlay"><div class="md-map-info"><h2 class="md-map-name">${mapN}</h2><span class="md-mode">${modeN}</span></div><div class="md-result-block"><span class="md-result-text ${rc}">${resultText}</span><span class="md-result-score ${rc}">${teamAData.rw}:${teamAData.rl}</span></div></div></div><div class="md-meta-row">${startTime ? `<div class="md-meta-item"><span class="md-meta-label">START</span><span class="md-meta-value">${startTime}</span></div>` : ''}${runtime ? `<div class="md-meta-item"><span class="md-meta-label">RUNTIME</span><span class="md-meta-value">${runtime}</span></div>` : ''}${server ? `<div class="md-meta-item"><span class="md-meta-label">SERVER</span><span class="md-meta-value">${server}</span></div>` : ''}</div><div class="md-tab-bar"><span class="md-tab active">SCOREBOARD</span></div><div class="md-col-header"><span class="md-ch md-ch-player">PLAYER</span><span class="md-ch">ACS</span><span class="md-ch md-ch-kda">K / D / A</span><span class="md-ch">K/D</span><span class="md-ch">HS%</span><span class="md-ch">ADR</span><span class="md-ch">FK</span><span class="md-ch">FD</span></div>`;
    const teamA = allPlayers.filter(p => (p.team_id || p.team) === myTeam); const teamB = allPlayers.filter(p => (p.team_id || p.team) !== myTeam); const sortByACS = (a, b) => ((b.stats ? b.stats.score : 0) || 0) - ((a.stats ? a.stats.score : 0) || 0); teamA.sort(sortByACS); teamB.sort(sortByACS);
    function buildTeamSection(players, teamInfo, colorClass) {
      const teamLabel = `TEAM ${(teamInfo.name || '').toUpperCase()}`; let html = `<div class="md-team-label ${colorClass}">${teamLabel} <span class="md-team-rounds">${teamInfo.rw} ROUNDS</span></div>`;
      players.forEach(p => {
        const s = p.stats || {}; const k = s.kills || 0, d = s.deaths || 0, a = s.assists || 0; const kd = d > 0 ? (k / d).toFixed(1) : k.toFixed(0); const kdClass = (k / Math.max(d, 1)) >= 1 ? 'good' : 'bad'; const shots = (s.headshots || 0) + (s.bodyshots || 0) + (s.legshots || 0); const hsPct = shots > 0 ? ((s.headshots / shots) * 100).toFixed(0) : '0';
        let dmgDealt = 0; if (s.damage && s.damage.dealt) dmgDealt = s.damage.dealt; else if (p.damage_made) dmgDealt = p.damage_made; const adr = Math.round(dmgDealt / totalRounds); const acs = Math.round((s.score || 0) / totalRounds); const agName = p.agent ? p.agent.name : (p.character || '?'); let agIcon = ''; if (p.agent && p.agent.id) agIcon = `https://media.valorant-api.com/agents/${p.agent.id}/displayicon.png`; else if (p.assets && p.assets.agent) agIcon = p.assets.agent.small;
        const isMe = p.puuid === puuid; const fk = p.stats ? (p.stats.first_kills || 0) : 0; const fd = p.stats ? (p.stats.first_deaths || 0) : 0;
        html += `<div class="md-player-row ${isMe ? 'is-me' : ''}"><div class="md-pr-player"><div class="md-pr-agent">${agIcon ? `<img src="${agIcon}" alt="${agName}">` : '<div class="md-pr-agent-placeholder">?</div>'}</div><div class="md-pr-name-wrap"><span class="md-pr-name">${p.name || agName}</span><span class="md-pr-tag">#${p.tag || ''}</span></div></div><span class="md-pr-stat">${acs}</span><span class="md-pr-stat md-pr-kda"><span class="md-kda-k">${k}</span> / <span class="md-kda-d">${d}</span> / <span class="md-kda-a">${a}</span></span><span class="md-pr-stat ${kdClass}">${kd}</span><span class="md-pr-stat">${hsPct}%</span><span class="md-pr-stat">${adr}</span><span class="md-pr-stat">${fk}</span><span class="md-pr-stat">${fd}</span></div>`;
      });
      return html;
    }
    scoreboard.innerHTML = buildTeamSection(teamA, teamAData, 'md-team-green') + buildTeamSection(teamB, teamBData, 'md-team-red');
    overlay.classList.add('active'); document.body.style.overflow = 'hidden';
    const closeBtn = document.getElementById('match-detail-close'); const closeModal = () => { overlay.classList.remove('active'); document.body.style.overflow = ''; };
    if (closeBtn) closeBtn.onclick = closeModal; overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
  }

  async function handleTrackerSearch() {
    const input = document.getElementById('tracker-search-input');
    const activeRegionOpt = document.querySelector('.tracker-region-option.active');

    if (!input) return;
    const rid = parseRiotId(input.value);
    if (!rid) { showTrackerError('Invalid Riot ID. Use Name#Tag (e.g. TenZ#0505)'); return; }
    const { name, tag } = rid;
    const r = activeRegionOpt ? activeRegionOpt.dataset.value : 'ap';
    const en = encodeURIComponent(name), et = encodeURIComponent(tag);

    hideTrackerError(); showTrackerResults(false); showTrackerLoading(true); const historyEl = document.getElementById('tracker-history'); if (historyEl) historyEl.style.display = 'none';
    try {
      const acct = await hdevFetch(`/valorant/v1/account/${en}/${et}`); const puuid = acct.data.puuid; renderPlayerCard(acct.data);
      let mmr; try { mmr = await hdevFetch(`/valorant/v3/mmr/${r}/pc/${en}/${et}`); } catch (e) { mmr = await hdevFetch(`/valorant/v2/mmr/${r}/${en}/${et}`); } renderRankCard(mmr.data);
      let matches = []; try { const ml = await hdevFetch(`/valorant/v3/matches/${r}/${en}/${et}?mode=competitive&size=5`); matches = ml.data || []; } catch (e) { matches = []; } renderStats(matches, puuid); renderMatches(matches, puuid);
      showTrackerLoading(false); showTrackerResults(true); saveToHistory({ name: acct.data.name, tag: acct.data.tag, region: r.toUpperCase(), avatar: typeof acct.data.card === 'object' ? acct.data.card.small : acct.data.card, timestamp: Date.now() });
    } catch (err) { showTrackerLoading(false); showTrackerError(err.message); if (historyEl) historyEl.style.display = ''; }
  }

  function loadHistory() { try { const stored = localStorage.getItem(HISTORY_KEY); return stored ? JSON.parse(stored) : []; } catch (e) { return []; } }

  async function saveToHistory(entry) {
    let history = loadHistory(); history = history.filter(h => !(h.name.toLowerCase() === entry.name.toLowerCase() && h.tag.toLowerCase() === entry.tag.toLowerCase())); history.unshift(entry); history = history.slice(0, 5); localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); renderHistory();
    if (currentUser) { try { await apiCall('PUT', '/api/user/tracker-history', { trackerHistory: history }); } catch (e) { console.warn('Cloud sync failed:', e); } }
  }

  async function syncHistoryFromCloud() {
    if (!currentUser) return;
    try { const data = await apiCall('GET', '/api/user/tracker-history'); if (data.trackerHistory && data.trackerHistory.length) { localStorage.setItem(HISTORY_KEY, JSON.stringify(data.trackerHistory)); renderHistory(); } } catch (e) { console.warn('Cloud sync failed:', e); }
  }

  async function clearHistory() { localStorage.removeItem(HISTORY_KEY); renderHistory(); if (currentUser) { try { await apiCall('PUT', '/api/user/tracker-history', { trackerHistory: [] }); } catch (e) { } } }

  function removeFromHistory(name, tag) { let history = loadHistory(); history = history.filter(h => !(h.name.toLowerCase() === name.toLowerCase() && h.tag.toLowerCase() === tag.toLowerCase())); localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); renderHistory(); }

  function renderHistory() {
    const list = document.getElementById('tracker-history-list'); const empty = document.getElementById('tracker-history-empty'); const historyEl = document.getElementById('tracker-history'); if (!list || !empty || !historyEl) return;
    const history = loadHistory(); const resultsActive = document.getElementById('tracker-results')?.classList.contains('active'); const loadingActive = document.getElementById('tracker-loading')?.classList.contains('active');
    if (resultsActive || loadingActive) historyEl.style.display = 'none'; else historyEl.style.display = '';
    list.innerHTML = ''; if (history.length === 0) { list.style.display = 'none'; empty.classList.add('active'); return; }
    list.style.display = 'flex'; empty.classList.remove('active');
    history.forEach(item => {
      const row = document.createElement('div'); row.className = 'tracker-history-item';
      let avatarHtml = '<div class="tracker-history-avatar-placeholder">?</div>'; if (item.avatar) avatarHtml = `<img src="${item.avatar}" class="tracker-history-avatar" alt="">`;
      row.innerHTML = `${avatarHtml}<div class="tracker-history-info"><div class="tracker-history-name">${item.name} <span class="tracker-history-tag">#${item.tag}</span></div><div class="tracker-history-meta"><span class="tracker-history-region">${item.region || 'AP'}</span></div></div><button class="tracker-history-remove" title="Remove" data-name="${item.name}" data-tag="${item.tag}"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>`;
      row.addEventListener('click', (e) => {
        if (e.target.closest('.tracker-history-remove')) return;
        const input = document.getElementById('tracker-search-input');
        if (input) input.value = `${item.name}#${item.tag}`;

        if (item.region) {
          const regionOptions = document.querySelectorAll('.tracker-region-option');
          regionOptions.forEach(opt => {
            if (opt.dataset.value === item.region.toLowerCase()) {
              opt.click();
            }
          });
        }

        handleTrackerSearch();
      });
      const removeBtn = row.querySelector('.tracker-history-remove'); if (removeBtn) { removeBtn.addEventListener('click', (e) => { e.stopPropagation(); removeFromHistory(item.name, item.tag); }); }
      list.appendChild(row);
    });
  }

  function initTracker() {
    const btn = document.getElementById('tracker-search-btn'); const inp = document.getElementById('tracker-search-input'); const clearBtn = document.getElementById('tracker-history-clear');

    const regionWrapper = document.getElementById('tracker-region-wrapper');
    const regionSelected = document.getElementById('tracker-region-selected');
    const regionText = document.getElementById('tracker-region-text');
    const options = document.querySelectorAll('.tracker-region-option');

    if (regionSelected) {
      regionSelected.addEventListener('click', (e) => {
        e.stopPropagation();
        regionWrapper.classList.toggle('open');
      });
    }

    options.forEach(opt => {
      opt.addEventListener('click', () => {
        options.forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        regionText.textContent = opt.textContent;
        regionWrapper.classList.remove('open');
      });
    });

    document.addEventListener('click', (e) => {
      if (regionWrapper && !regionWrapper.contains(e.target)) {
        regionWrapper.classList.remove('open');
      }
    });

    if (btn) btn.addEventListener('click', handleTrackerSearch);
    if (inp) inp.addEventListener('keydown', e => { if (e.key === 'Enter') handleTrackerSearch(); });
    if (clearBtn) clearBtn.addEventListener('click', clearHistory);
    renderHistory();
  }

  function initCreatorVideos() {
    CREATOR_CHANNELS.forEach(ch => loadCreatorYouTube(ch.containerId, ch.channelId, ch.handle));
  }

  async function loadCreatorYouTube(containerId, channelId, handle) {
    const container = document.getElementById(containerId); if (!container) return;
    container.innerHTML = `<div class="creator-videos-loading"><div class="mini-spinner"></div>LOADING VIDEOS...</div>`;
    try {
      const apiUrl = `https://www.googleapis.com/youtube/v3/search?key=${YT_API_KEY}&channelId=${channelId}&part=snippet,id&order=date&maxResults=${VIDEOS_PER_CHANNEL}&type=video`;
      const res = await fetch(apiUrl); if (!res.ok) throw new Error('API fetch failed');
      const data = await res.json(); if (data.error) throw new Error(data.error.message); if (!data.items || !data.items.length) throw new Error('No videos found');
      container.innerHTML = '';
      data.items.forEach(item => {
        const videoId = item.id.videoId; const title = item.snippet.title; const published = item.snippet.publishedAt; const thumbUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`; const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        let dateStr = ''; if (published) { const d = new Date(published); const now = new Date(); const diffDays = Math.floor((now - d) / 86400000); if (diffDays < 1) dateStr = 'TODAY'; else if (diffDays < 7) dateStr = `${diffDays}D AGO`; else if (diffDays < 30) dateStr = `${Math.floor(diffDays / 7)}W AGO`; else if (diffDays < 365) dateStr = `${Math.floor(diffDays / 30)}MO AGO`; else dateStr = `${Math.floor(diffDays / 365)}Y AGO`; }
        const card = document.createElement('a'); card.className = 'creator-video-card'; card.href = videoUrl; card.target = '_blank'; card.rel = 'noopener';
        card.innerHTML = `<img class="creator-video-thumb" src="${thumbUrl}" alt="${title}" loading="lazy"><div class="creator-video-play"><div class="creator-video-play-icon"></div></div><div class="creator-video-title">${title}</div><div class="creator-video-meta">${dateStr}</div>`;
        container.appendChild(card);
      });
    } catch (err) {
      console.error('YouTube API Error:', err); container.innerHTML = '';
      for (let i = 0; i < 3; i++) {
        const card = document.createElement('a'); card.className = 'creator-video-card'; card.href = `https://youtube.com/@${handle}`; card.target = '_blank'; card.rel = 'noopener';
        card.innerHTML = `<div style="width:100%;aspect-ratio:16/9;background-color:var(--bg-glass);display:flex;align-items:center;justify-content:center;"><div class="creator-video-play-icon" style="opacity:0.3"></div></div><div class="creator-video-title" style="color:var(--text-muted)">Visit YouTube to watch</div><div class="creator-video-meta">@${handle}</div>`; container.appendChild(card);
      }
    }
  }

  function initAuth() {
    const authBtn = document.getElementById('auth-btn');
    const loginModal = document.getElementById('login-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const closeProfileBtn = document.getElementById('close-profile-btn');
    const profileOverlay = document.getElementById('profile-overlay');
    const psLogoutBtn = document.getElementById('ps-logout-btn');
    const emailInput = document.getElementById('email-input');
    const passwordInput = document.getElementById('password-input');
    const emailLoginBtn = document.getElementById('email-login-btn');
    const emailSignupBtn = document.getElementById('email-signup-btn');
    const loginErrorMsg = document.getElementById('login-error-msg');
    const linkAccountSettings = document.getElementById('link-account-settings');
    const settingsDisplayName = document.getElementById('settings-display-name');
    const settingsRiotId = document.getElementById('settings-riot-id');
    const settingsSaveBtn = document.getElementById('settings-save-btn');
    const settingsMsg = document.getElementById('settings-msg');
    const settingsFileInput = document.getElementById('settings-file-input');
    const settingsFileName = document.getElementById('settings-file-name');
    const settingsPreviewImg = document.getElementById('settings-preview-img');
    let selectedImageFile = null;

    function openLoginModal() {
      if (loginModal) loginModal.classList.add('active');
      if (loginErrorMsg) loginErrorMsg.style.display = 'none';

      const sidebar = document.getElementById('sidebar');
      const sidebarOverlay = document.getElementById('sidebar-overlay');
      if (sidebar) sidebar.classList.remove('open');
      if (sidebarOverlay) sidebarOverlay.classList.remove('open');
      document.body.classList.remove('sidebar-open');
    }

    function closeLoginModal() { if (loginModal) loginModal.classList.remove('active'); }
    function showError(msg) { if (loginErrorMsg) { loginErrorMsg.textContent = msg; loginErrorMsg.style.display = 'block'; } }

    function openProfileSidebar() {
      document.body.classList.add('profile-open');
    }
    function closeProfileSidebar() {
      document.body.classList.remove('profile-open');
    }

    if (authBtn) {
      authBtn.addEventListener('click', () => {
        if (currentUser) openProfileSidebar();
        else openLoginModal();
      });
    }

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeLoginModal);
    if (loginModal) loginModal.addEventListener('click', (e) => { if (e.target === loginModal) closeLoginModal(); });
    if (closeProfileBtn) closeProfileBtn.addEventListener('click', closeProfileSidebar);
    if (profileOverlay) profileOverlay.addEventListener('click', closeProfileSidebar);

    if (linkAccountSettings) {
      linkAccountSettings.addEventListener('click', () => {
        closeProfileSidebar();
        window.location.hash = 'settings';
        const pages = document.querySelectorAll('.page');
        const links = document.querySelectorAll('.nav-link, .nav-link-dt');
        pages.forEach(p => p.classList.remove('active'));
        links.forEach(l => l.classList.remove('active'));
        const t = document.getElementById('settings');
        if (t) { t.classList.add('active'); }
        window.scrollTo(0, 0);
      });
    }

    if (settingsFileInput) {
      settingsFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          selectedImageFile = e.target.files[0];
          if (settingsFileName) settingsFileName.textContent = selectedImageFile.name;
          const reader = new FileReader();
          reader.onload = (ev) => { if (settingsPreviewImg) settingsPreviewImg.src = ev.target.result; };
          reader.readAsDataURL(selectedImageFile);
        }
      });
    }

    // Check for existing JWT session on page load
    async function checkAuthSession() {
      const token = getToken();
      if (token) {
        try {
          const data = await apiCall('GET', '/api/auth/me');
          currentUser = data.user;
          updateAuthUI(currentUser);
          await syncHistoryFromCloud();
        } catch (e) {
          clearToken();
          currentUser = null;
          updateAuthUI(null);
          renderHistory();
        }
      } else {
        currentUser = null;
        updateAuthUI(null);
        renderHistory();
      }
    }
    checkAuthSession();

    if (emailLoginBtn) {
      emailLoginBtn.addEventListener('click', async () => {
        try {
          const data = await apiCall('POST', '/api/auth/login', { email: emailInput.value, password: passwordInput.value });
          setToken(data.token);
          currentUser = data.user;
          updateAuthUI(currentUser);
          await syncHistoryFromCloud();
          closeLoginModal();
        } catch (err) { showError(err.message); }
      });
    }

    if (emailSignupBtn) {
      emailSignupBtn.addEventListener('click', async () => {
        try {
          const data = await apiCall('POST', '/api/auth/register', { email: emailInput.value, password: passwordInput.value });
          setToken(data.token);
          currentUser = data.user;
          updateAuthUI(currentUser);
          closeLoginModal();
        } catch (err) { showError(err.message); }
      });
    }

    // ─── Google Sign-In Setup (OAuth2 popup flow) ───
    const googleLoginBtn = document.getElementById('google-login-btn');
    if (googleLoginBtn) {
      googleLoginBtn.addEventListener('click', () => {
        const googleClientMeta = document.querySelector('meta[name="google-client-id"]');
        const gcid = googleClientMeta ? googleClientMeta.content : '';
        if (!gcid || typeof google === 'undefined' || !google.accounts) {
          showError('Google Sign-In is not available.');
          return;
        }

        const client = google.accounts.oauth2.initTokenClient({
          client_id: gcid,
          scope: 'email profile',
          callback: async (tokenResponse) => {
            if (tokenResponse.error) {
              showError('Google login cancelled.');
              return;
            }
            try {
              // Use the access token to get user info, then send to our backend
              const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
              });
              const userInfo = await userInfoRes.json();

              // Send to our backend
              const data = await apiCall('POST', '/api/auth/google', {
                credential: tokenResponse.access_token,
                googleUser: {
                  sub: userInfo.sub,
                  email: userInfo.email,
                  name: userInfo.name,
                  picture: userInfo.picture
                }
              });
              setToken(data.token);
              currentUser = data.user;
              updateAuthUI(currentUser);
              await syncHistoryFromCloud();
              closeLoginModal();
            } catch (err) { showError(err.message); }
          }
        });
        client.requestAccessToken();
      });
    }

    if (psLogoutBtn) {
      psLogoutBtn.addEventListener('click', () => {
        clearToken();
        currentUser = null;
        updateAuthUI(null);
        closeProfileSidebar();
        renderHistory();
        history.pushState(null, '', '#home');
        const pages = document.querySelectorAll('.page');
        pages.forEach(p => p.classList.remove('active'));
        const t = document.getElementById('home');
        if (t) { t.classList.add('active'); }
        window.scrollTo(0, 0);
      });
    }

    if (settingsSaveBtn) {
      settingsSaveBtn.addEventListener('click', async () => {
        if (!currentUser) return;

        const riotId = settingsRiotId.value.trim();
        const newName = settingsDisplayName.value.trim();

        try {
          settingsSaveBtn.textContent = 'SAVING...';
          settingsSaveBtn.disabled = true;

          if (selectedImageFile) {
            if (settingsMsg) { settingsMsg.style.color = 'var(--text-primary)'; settingsMsg.textContent = 'Uploading image...'; }
            const formData = new FormData();
            formData.append('avatar', selectedImageFile);
            const uploadRes = await apiCall('POST', '/api/user/avatar', formData, true);
            currentUser = uploadRes.user;
          }

          if (settingsMsg) settingsMsg.textContent = 'Updating profile...';

          const profileRes = await apiCall('PUT', '/api/user/profile', {
            displayName: newName || currentUser.displayName,
            riotId: riotId
          });
          currentUser = profileRes.user;

          if (settingsMsg) { settingsMsg.style.color = '#34d399'; settingsMsg.textContent = 'Settings saved successfully!'; }

          selectedImageFile = null;
          if (settingsFileName) settingsFileName.textContent = 'No file chosen';
          updateAuthUI(currentUser);

        } catch (e) {
          if (settingsMsg) { settingsMsg.style.color = '#f87171'; settingsMsg.textContent = 'Error: ' + e.message; }
        } finally {
          settingsSaveBtn.textContent = 'SAVE CHANGES';
          settingsSaveBtn.disabled = false;
          setTimeout(() => { if (settingsMsg) settingsMsg.textContent = '' }, 3000);
        }
      });
    }

    function updateAuthUI(user) {
      const sidebarAuthHeader = document.getElementById('sidebar-auth-header');

      if (!user) {
        if (sidebarAuthHeader) {
          sidebarAuthHeader.innerHTML = `
                    <div id="sidebar-auth-login" class="btn-primary" style="text-align:center; padding:12px; border-radius:8px; display:block;">
                        LOGIN / SIGN UP
                    </div>
                `;
          const sidebarLoginBtn = document.getElementById('sidebar-auth-login');
          if (sidebarLoginBtn) {
            sidebarLoginBtn.addEventListener('click', openLoginModal);
          }
        }
        return;
      }

      const displayNm = user.displayName || user.email.split('@')[0];
      const fallbackInitials = displayNm.substring(0, 2).toUpperCase();
      const hasPhoto = user.photoURL && user.photoURL !== "";
      const fallbackHTML = `<div class="avatar-fallback">${fallbackInitials}</div>`;

      if (authBtn) {
        if (window.innerWidth <= 1024) {
          if (hasPhoto) {
            authBtn.innerHTML = `<img src="${user.photoURL}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%;"><span id="auth-text" style="display:none;">${displayNm}</span>`;
          } else {
            authBtn.innerHTML = `<div style="width:100%;height:100%;border-radius:50%;overflow:hidden;">${fallbackHTML}</div><span id="auth-text" style="display:none;">${displayNm}</span>`;
          }
        } else {
          const imgHtml = hasPhoto ? `<img src="${user.photoURL}" alt="" style="width:26px;height:26px;border-radius:50%;object-fit:cover;flex-shrink:0;">` : `<div style="width:26px;height:26px;border-radius:50%;flex-shrink:0;overflow:hidden;">${fallbackHTML}</div>`;
          authBtn.innerHTML = `${imgHtml}<span id="auth-text">${displayNm}</span>`;
        }
      }

      if (sidebarAuthHeader) {
        const imgHtml = hasPhoto ? `<img src="${user.photoURL}" class="sidebar-auth-img" alt="">` : `<div class="sidebar-auth-img">${fallbackHTML}</div>`;
        sidebarAuthHeader.innerHTML = `
              <div id="sidebar-auth-profile" class="sidebar-auth-card">
                  ${imgHtml}
                  <div class="sidebar-auth-info">
                      <div class="sidebar-auth-name">${displayNm}</div>
                      <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">View Profile</div>
                  </div>
              </div>
          `;
        const sidebarProfileBtn = document.getElementById('sidebar-auth-profile');
        if (sidebarProfileBtn) {
          sidebarProfileBtn.addEventListener('click', () => {
            const sidebar = document.getElementById('sidebar');
            const sidebarOverlay = document.getElementById('sidebar-overlay');
            if (sidebar) sidebar.classList.remove('open');
            if (sidebarOverlay) sidebarOverlay.classList.remove('open');
            document.body.classList.remove('sidebar-open');

            window.location.hash = 'settings';
            const pages = document.querySelectorAll('.page');
            const links = document.querySelectorAll('.nav-link, .nav-link-dt');
            pages.forEach(p => p.classList.remove('active'));
            links.forEach(l => l.classList.remove('active'));
            const t = document.getElementById('settings');
            if (t) { t.classList.add('active'); }
            window.scrollTo(0, 0);
          });
        }
      }

      const psAvatarContainer = document.getElementById('ps-avatar-container');
      if (psAvatarContainer) {
        if (hasPhoto) {
          psAvatarContainer.innerHTML = `<img src="${user.photoURL}" alt="Profile Image">`;
        } else {
          psAvatarContainer.innerHTML = `<div style="width:100%;height:100%;border-radius:50%;overflow:hidden;">${fallbackHTML}</div>`;
        }
      }

      const psName = document.getElementById('ps-name');
      const psEmail = document.getElementById('ps-email');
      if (psName) psName.textContent = displayNm;
      if (psEmail) psEmail.textContent = user.email;

      const sAvatar = document.getElementById('settings-avatar');
      const sName = document.getElementById('settings-name');
      const sEmail = document.getElementById('settings-email');

      if (sAvatar) {
        if (hasPhoto) {
          sAvatar.src = user.photoURL;
          sAvatar.style.display = 'block';

          let existingFallback = document.getElementById('settings-fallback-avatar');
          if (existingFallback) existingFallback.remove();
        } else {
          sAvatar.style.display = 'none';
          const parent = sAvatar.parentElement;
          let fallback = document.getElementById('settings-fallback-avatar');
          if (!fallback) {
            fallback = document.createElement('div');
            fallback.id = 'settings-fallback-avatar';
            fallback.className = 'settings-avatar-img';
            parent.insertBefore(fallback, sAvatar);
          }
          fallback.innerHTML = fallbackHTML;
        }
      }

      if (settingsPreviewImg) {
        if (hasPhoto) {
          settingsPreviewImg.src = user.photoURL;
          settingsPreviewImg.style.display = 'block';
        } else {
          settingsPreviewImg.style.display = 'none';
        }
      }

      if (sName) sName.textContent = displayNm;
      if (sEmail) sEmail.textContent = user.email;
      if (settingsDisplayName) settingsDisplayName.value = user.displayName || '';

      if (user.riotId) {
        if (settingsRiotId) settingsRiotId.value = user.riotId;
      } else {
        if (settingsRiotId) settingsRiotId.value = '';
      }
    }
  }

  function initCreatorVideos() {
    CREATOR_CHANNELS.forEach(async (creator) => {
      const container = document.getElementById(creator.containerId);
      if (!container) return;

      // Show loading state
      container.innerHTML = `<div class="creator-videos-loading"><div class="mini-spinner"></div>Loading videos...</div>`;

      try {
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/search?key=${YT_API_KEY}&channelId=${creator.channelId}&part=snippet&order=date&type=video&maxResults=${VIDEOS_PER_CHANNEL}`
        );
        const data = await res.json();

        if (!data.items || data.items.length === 0) {
          container.innerHTML = `<div class="creator-videos-loading">No videos found</div>`;
          return;
        }

        container.innerHTML = data.items.map(item => {
          const videoId = item.id.videoId;
          const title = item.snippet.title;
          const thumb = item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url;
          const publishedAt = new Date(item.snippet.publishedAt);
          const timeAgo = getTimeAgo(publishedAt);

          return `
                    <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank" rel="noopener" class="creator-video-card">
                        <img src="${thumb}" alt="${title}" class="creator-video-thumb" loading="lazy">
                        <div class="creator-video-play"><div class="creator-video-play-icon"></div></div>
                        <div class="creator-video-title">${title}</div>
                        <div class="creator-video-meta">${timeAgo}</div>
                    </a>
                `;
        }).join('');
      } catch (err) {
        console.error('YouTube API error:', err);
        container.innerHTML = `<div class="creator-videos-loading">Failed to load videos</div>`;
      }
    });
  }

  function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    const intervals = [
      { label: 'year', seconds: 31536000 },
      { label: 'month', seconds: 2592000 },
      { label: 'week', seconds: 604800 },
      { label: 'day', seconds: 86400 },
      { label: 'hour', seconds: 3600 },
      { label: 'minute', seconds: 60 }
    ];
    for (const i of intervals) {
      const count = Math.floor(seconds / i.seconds);
      if (count >= 1) return `${count} ${i.label}${count > 1 ? 's' : ''} ago`;
    }
    return 'Just now';
  }

  // ─── Discord Live Widget (Home Page) ───
  let discordWidgetInterval = null;

  async function fetchDiscordWidget() {
    if (!DISCORD_CONFIG.serverId) return null;
    try {
      const res = await fetch(`https://discord.com/api/guilds/${DISCORD_CONFIG.serverId}/widget.json`);
      if (!res.ok) throw new Error(`Widget API error (${res.status})`);
      return await res.json();
    } catch (err) {
      console.warn('Discord widget fetch failed:', err.message);
      return null;
    }
  }

  function renderDiscordWidget(data) {
    const container = document.getElementById('discord-widget-content');
    if (!container) return;
    container.classList.remove('discord-widget-skeleton');

    if (!data) {
      // Fallback: show static join card
      container.innerHTML = `
        <div class="discord-widget-fallback">
          <div class="discord-server-icon-placeholder" style="margin:0 auto 16px;">
            <svg><use href="#icon-discord"/></svg>
          </div>
          <p>Join our Discord community to connect with the team and other fans!</p>
          <a href="${DISCORD_CONFIG.inviteUrl}" target="_blank" rel="noopener" class="discord-join-btn">
            <svg><use href="#icon-discord"/></svg>
            JOIN DISCORD
          </a>
        </div>`;
      return;
    }

    const serverName = data.name || 'Team Phoenix';
    const onlineCount = data.presence_count || 0;
    const members = data.members || [];
    const channels = (data.channels || []).filter(ch => ch.position !== undefined);

    // Build voice channels by grouping members into channels
    const voiceChannels = channels.filter(ch => {
      // Widget only returns voice channels that have users in them (or are set as the invite channel)
      return true;
    });

    // Group members by channel_id for voice
    const membersByChannel = {};
    members.forEach(m => {
      if (m.channel_id) {
        if (!membersByChannel[m.channel_id]) membersByChannel[m.channel_id] = [];
        membersByChannel[m.channel_id].push(m);
      }
    });

    // Voice channels HTML
    let voiceHtml = '';
    const activeVoiceChannels = voiceChannels.filter(ch => membersByChannel[ch.id] && membersByChannel[ch.id].length > 0);
    if (activeVoiceChannels.length > 0) {
      voiceHtml = activeVoiceChannels.map(ch => {
        const count = membersByChannel[ch.id] ? membersByChannel[ch.id].length : 0;
        return `<div class="discord-voice-channel">
          <svg class="discord-voice-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
          <span class="discord-voice-name">${ch.name}</span>
          <span class="discord-voice-count">${count}</span>
        </div>`;
      }).join('');
    } else {
      voiceHtml = '<div class="discord-voice-empty">No active voice channels</div>';
    }

    // Members bubbles HTML (show up to maxMemberBubbles)
    const maxBubbles = DISCORD_CONFIG.maxMemberBubbles;
    const displayMembers = members.slice(0, maxBubbles);
    const overflow = members.length > maxBubbles ? members.length - maxBubbles : 0;

    const membersHtml = displayMembers.map(m => {
      const avatarUrl = m.avatar_url || `https://cdn.discordapp.com/embed/avatars/${parseInt(m.discriminator || '0') % 5}.png`;
      const name = m.username || 'Member';
      return `<div class="discord-member-bubble">
        <img src="${avatarUrl}" alt="${name}" loading="lazy" onerror="this.src='https://cdn.discordapp.com/embed/avatars/0.png'">
        <div class="discord-member-status-ring"></div>
        <div class="discord-member-name-tooltip">${name}</div>
      </div>`;
    }).join('');

    const overflowHtml = overflow > 0 ? `<div class="discord-members-overflow">+${overflow}</div>` : '';

    container.innerHTML = `
      <div class="discord-server-row">
        <div class="discord-server-icon-placeholder">
          <svg><use href="#icon-discord"/></svg>
        </div>
        <div class="discord-server-info">
          <div class="discord-server-name">${serverName}</div>
          <div class="discord-server-online">
            <span class="discord-online-dot"></span>
            <span>${onlineCount} Online</span>
          </div>
        </div>
      </div>
      <div class="discord-voice-section">
        <div class="discord-voice-label">VOICE CHANNELS</div>
        <div class="discord-voice-list">${voiceHtml}</div>
      </div>
      <div class="discord-members-section">
        <div class="discord-members-label">ONLINE MEMBERS</div>
        <div class="discord-members-grid">${membersHtml}${overflowHtml}</div>
        <a href="${DISCORD_CONFIG.inviteUrl}" target="_blank" rel="noopener" class="discord-join-btn">
          <svg><use href="#icon-discord"/></svg>
          JOIN DISCORD
        </a>
      </div>`;
  }

  async function initDiscordWidget() {
    const container = document.getElementById('discord-widget-content');
    if (!container) return;

    if (!DISCORD_CONFIG.serverId) {
      // No server ID configured — show static fallback immediately
      renderDiscordWidget(null);
      return;
    }

    // Fetch and render
    const data = await fetchDiscordWidget();
    renderDiscordWidget(data);

    // Set up auto-refresh
    if (discordWidgetInterval) clearInterval(discordWidgetInterval);
    discordWidgetInterval = setInterval(async () => {
      const freshData = await fetchDiscordWidget();
      if (freshData) renderDiscordWidget(freshData);
    }, DISCORD_CONFIG.widgetRefreshMs);
  }

  // ─── Discord Roster Presence (Lanyard API) ───
  let rosterPresenceInterval = null;

  async function fetchLanyardPresence(userIds) {
    if (!userIds.length) return null;
    try {
      // Lanyard supports multi-user: GET /v1/users/:id1,:id2,...
      const url = `https://api.lanyard.rest/v1/users/${userIds.join(',')}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Lanyard error (${res.status})`);
      const json = await res.json();
      if (!json.success) throw new Error('Lanyard returned unsuccessful');
      return json.data;
    } catch (err) {
      console.warn('Lanyard presence fetch failed:', err.message);
      return null;
    }
  }

  function applyPresenceToRoster(presenceData) {
    if (!presenceData) return;

    // Handle both single-user (object) and multi-user (object keyed by id) responses
    const entries = typeof presenceData === 'object' && !presenceData.discord_user
      ? Object.entries(presenceData)
      : [];

    // If single user response, wrap it
    if (presenceData.discord_user) {
      entries.push([presenceData.discord_user.id, presenceData]);
    }

    entries.forEach(([userId, data]) => {
      const card = document.querySelector(`.roster-card[data-discord-id="${userId}"]`);
      if (!card) return;

      const imageWrap = card.querySelector('.roster-card-image');
      if (!imageWrap) return;

      // Remove existing indicators
      const existing = imageWrap.querySelector('.roster-discord-status');
      if (existing) existing.remove();
      const existingTooltip = imageWrap.querySelector('.roster-activity-tooltip');
      if (existingTooltip) existingTooltip.remove();

      // Create status dot
      const status = data.discord_status || 'offline';
      const dot = document.createElement('div');
      dot.className = `roster-discord-status status-${status}`;
      imageWrap.appendChild(dot);

      // Create activity tooltip if playing something
      const activities = data.activities || [];
      const gameActivity = activities.find(a => a.type === 0); // Type 0 = Playing
      const customStatus = activities.find(a => a.type === 4); // Type 4 = Custom Status

      let tooltipText = '';
      if (gameActivity) {
        tooltipText = `Playing ${gameActivity.name}`;
      } else if (customStatus && customStatus.state) {
        tooltipText = customStatus.state;
      }

      if (tooltipText) {
        const tooltip = document.createElement('div');
        tooltip.className = 'roster-activity-tooltip';
        tooltip.textContent = tooltipText;
        imageWrap.appendChild(tooltip);
      }
    });
  }

  async function initRosterPresence() {
    // Gather all roster cards that have a non-empty discord-id
    const cards = document.querySelectorAll('.roster-card[data-discord-id]');
    const ids = [];

    // Also check the config map and apply IDs to cards by player name
    cards.forEach(card => {
      const playerName = card.dataset.player;
      const configId = DISCORD_CONFIG.playerDiscordIds[playerName];
      if (configId) {
        card.dataset.discordId = configId;
      }
      if (card.dataset.discordId) {
        ids.push(card.dataset.discordId);
      }
    });

    if (ids.length === 0) return; // No Discord IDs configured

    const data = await fetchLanyardPresence(ids);
    applyPresenceToRoster(data);

    // Auto-refresh
    if (rosterPresenceInterval) clearInterval(rosterPresenceInterval);
    rosterPresenceInterval = setInterval(async () => {
      const freshData = await fetchLanyardPresence(ids);
      applyPresenceToRoster(freshData);
    }, DISCORD_CONFIG.presenceRefreshMs);
  }

  function init() {
    document.body.classList.remove('is-loading');
    initTheme();
    initScrollToTop();
    initNavScroll();
    createEmbers();
    initRouter();
    initMobileMenu();
    initTracker();
    initCreatorVideos();
    initAuth();
    initDiscordWidget();
    initRosterPresence();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
