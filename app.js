/* ================================================================
   TEAM PHOENIX — APP.JS
   Realistic phoenix wing SVGs, intro animation, routing, particles,
   Firebase Auth, Profile Sidebar, Settings
   ================================================================ */

const API_BASE = 'http://localhost:3000/api';
let currentUser = null;

(function () {
  'use strict';

  // ===== TIMING CONFIG =====
  const EMBER_COUNT = 30;
  const INTRO_DELAY = 500;
  const WING_STAGGER = 100;
  const TEXT_DELAY = 2000;
  const NAV_DELAY = 2400;
  const OVERLAY_FADE = 800;

  // ===== DOM REFS =====
  const introOverlay = document.getElementById('intro-overlay');
  const mainNav = document.getElementById('main-nav');
  const navLinks = document.getElementById('nav-links');
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const emberContainer = document.getElementById('ember-container');
  // ===== INTRO ANIMATION =====
  function playIntro() {
    // Fade overlay
    setTimeout(() => {
      introOverlay.classList.add('fade-out');
    }, OVERLAY_FADE);

    // Show hero text
    setTimeout(() => {
      const title = document.querySelector('.hero-title');
      const subtitle = document.querySelector('.hero-subtitle');
      const cta = document.querySelector('.hero-cta-row');
      if (title) title.classList.add('show');
      if (subtitle) subtitle.classList.add('show');
      if (cta) cta.classList.add('show');
    }, TEXT_DELAY);

    // Show nav
    setTimeout(() => {
      mainNav.classList.remove('nav-hidden');
    }, NAV_DELAY);

    // Remove overlay
    setTimeout(() => {
      introOverlay.style.display = 'none';
    }, OVERLAY_FADE + 1400);
  }

  // ===== ROUTER =====
  function initRouter() {
    const pages = document.querySelectorAll('.page');
    const links = document.querySelectorAll('.nav-link');
    const ctaButtons = document.querySelectorAll('[data-nav]');

    function navigateTo(pageId) {
      pages.forEach((p) => p.classList.remove('active'));
      links.forEach((l) => l.classList.remove('active'));

      const target = document.getElementById(pageId);
      if (target) {
        target.classList.add('active');
        window.scrollTo(0, 0);
      }

      links.forEach((l) => {
        if (l.dataset.page === pageId) l.classList.add('active');
      });

      // Close mobile menu
      const sidebar = document.getElementById('sidebar');
      const sidebarOverlay = document.getElementById('sidebar-overlay');
      if (sidebar) sidebar.classList.remove('open');
      if (sidebarOverlay) sidebarOverlay.classList.remove('open');
    }

    // Logo click -> home
    const logoLink = document.getElementById('nav-logo-link');
    if (logoLink) {
      logoLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash = 'home';
        navigateTo('home');
      });
    }

    // Nav links
    links.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.dataset.page;
        window.location.hash = page;
        navigateTo(page);
      });
    });

    // CTA buttons (only ones without target=_blank)
    ctaButtons.forEach((btn) => {
      if (btn.getAttribute('target') === '_blank') return;
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const page = btn.dataset.nav;
        window.location.hash = page;
        navigateTo(page);
      });
    });

    // Handle back/forward
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '') || 'home';
      navigateTo(hash);
    });

    // Initial route
    const initial = window.location.hash.replace('#', '') || 'home';
    if (initial !== 'home') {
      navigateTo(initial);
    }
  }

  // ===== EMBER PARTICLES =====
  function createEmbers() {
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

  // ===== MOBILE MENU =====
  const NAV_EMBER_COUNT = 20;
  const navEmberContainer = document.getElementById('nav-ember-container');

  function initMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const sidebarTrigger = document.getElementById('sidebar-trigger');
    const closeSidebarBtn = document.getElementById('close-sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    function openSidebar() {
      if (window.innerWidth > 1024) return;
      if (sidebar) sidebar.classList.add('open');
      if (sidebarOverlay) sidebarOverlay.classList.add('open');
    }

    function closeSidebar() {
      if (sidebar) sidebar.classList.remove('open');
      if (sidebarOverlay) sidebarOverlay.classList.remove('open');
    }

    if (sidebarTrigger) sidebarTrigger.addEventListener('mouseenter', openSidebar);
    if (sidebar) sidebar.addEventListener('mouseleave', closeSidebar);
    if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', closeSidebar);
    if (mobileBtn) mobileBtn.addEventListener('click', openSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

    let touchStartX = 0, touchEndX = 0, touchStartY = 0, touchEndY = 0;
    document.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    document.addEventListener('touchend', e => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      const xDiff = touchEndX - touchStartX;
      const yDiff = Math.abs(touchEndY - touchStartY);
      if (Math.abs(xDiff) > yDiff && Math.abs(xDiff) > 40) {
        if (xDiff > 0 && touchStartX < 50) openSidebar();
        else if (xDiff < 0 && sidebar && sidebar.classList.contains('open')) closeSidebar();
      }
    }, { passive: true });

    // Close sidebar on link click
    if (sidebar) {
      sidebar.querySelectorAll('.nav-link').forEach((link) => {
        link.addEventListener('click', closeSidebar);
      });
    }
  }

  // ===== SCROLL REVEAL =====
  function initScrollReveal() {
    const revealEls = document.querySelectorAll('.reveal');
    if (!revealEls.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    revealEls.forEach((el) => observer.observe(el));
  }

  // ===== ADD REVEAL CLASSES =====
  function addRevealClasses() {
    document.querySelectorAll('.roster-card').forEach((card, i) => {
      card.classList.add('reveal');
      card.style.transitionDelay = `${i * 0.08}s`;
    });

    document.querySelectorAll('.person-card').forEach((card, i) => {
      card.classList.add('reveal');
      card.style.transitionDelay = `${i * 0.12}s`;
    });

    const aboutOrg = document.querySelector('.about-org');
    if (aboutOrg) aboutOrg.classList.add('reveal');

    // Home games section reveal
    const gamesSection = document.querySelector('.home-games-inner');
    if (gamesSection) gamesSection.classList.add('reveal');

    document.querySelectorAll('.home-game-card').forEach((card, i) => {
      card.classList.add('reveal');
      card.style.transitionDelay = `${0.15 + i * 0.1}s`;
    });
  }

  // ===== VALORANT TRACKER =====
  const HDEV_BASE = 'https://api.henrikdev.xyz';
  const HDEV_API_KEY = 'HDEV-67ef927d-d7f2-47f4-bb92-bf8919370782'; // Get free key: https://api.henrikdev.xyz/dashboard/

  function getRankIconUrl(tierId) {
    if (!tierId || tierId <= 0) return '';
    return `https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/${tierId}/largeicon.png`;
  }

  function showTrackerError(msg) {
    const el = document.getElementById('tracker-error');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('active');
  }
  function hideTrackerError() {
    const el = document.getElementById('tracker-error');
    if (el) el.classList.remove('active');
  }
  function showTrackerLoading(show) {
    const el = document.getElementById('tracker-loading');
    if (el) el.classList.toggle('active', show);
  }
  function showTrackerResults(show) {
    const el = document.getElementById('tracker-results');
    if (el) el.classList.toggle('active', show);
  }

  function parseRiotId(input) {
    const trimmed = input.trim();
    const idx = trimmed.lastIndexOf('#');
    if (idx <= 0 || idx === trimmed.length - 1) return null;
    return { name: trimmed.substring(0, idx).trim(), tag: trimmed.substring(idx + 1).trim() };
  }

  async function hdevFetch(path) {
    const res = await fetch(`${HDEV_BASE}${path}`, {
      headers: { Authorization: HDEV_API_KEY },
    });
    if (res.status === 401 || res.status === 403) throw new Error('Invalid API key. Get one free at api.henrikdev.xyz/dashboard');
    if (res.status === 404) throw new Error('Player not found. Check the Riot ID and region.');
    if (res.status === 429) throw new Error('Rate limit reached. Wait a moment and try again.');
    if (!res.ok) throw new Error(`API error (${res.status}). Try again.`);
    return res.json();
  }

  function renderPlayerCard(d) {
    const nameEl = document.getElementById('tracker-player-name');
    const tagEl = document.getElementById('tracker-player-tag');
    const levelEl = document.getElementById('tracker-player-level');
    const avatarEl = document.getElementById('tracker-player-avatar');
    const bannerEl = document.getElementById('tracker-player-banner');
    if (nameEl) nameEl.textContent = d.name || 'â€”';
    if (tagEl) tagEl.textContent = `#${d.tag || ''}`;
    if (levelEl) levelEl.textContent = `LEVEL ${d.account_level || '?'}`;
    if (d.card) {
      if (avatarEl) avatarEl.src = typeof d.card === 'object' ? d.card.small : d.card;
      if (bannerEl && typeof d.card === 'object' && d.card.wide) {
        bannerEl.style.backgroundImage = `url(${d.card.wide})`;
      }
    }
  }

  function renderRankCard(mmr) {
    const rankIcon = document.getElementById('tracker-rank-icon');
    const rankName = document.getElementById('tracker-rank-name');
    const rankRR = document.getElementById('tracker-rank-rr');
    const peakIcon = document.getElementById('tracker-rank-peak-icon');
    const peakName = document.getElementById('tracker-rank-peak-name');
    if (mmr.current) {
      const t = mmr.current.tier || {};
      if (rankIcon) rankIcon.src = getRankIconUrl(t.id);
      if (rankName) rankName.textContent = t.name || 'Unrated';
      if (rankRR) rankRR.textContent = `${mmr.current.rr || 0} RR`;
      if (mmr.peak && mmr.peak.tier) {
        if (peakIcon) peakIcon.src = getRankIconUrl(mmr.peak.tier.id);
        if (peakName) peakName.textContent = mmr.peak.tier.name || 'N/A';
      }
    } else if (mmr.current_data) {
      const cd = mmr.current_data;
      if (rankIcon) rankIcon.src = cd.images ? cd.images.large : getRankIconUrl(cd.currenttier);
      if (rankName) rankName.textContent = cd.currenttier_patched || 'Unrated';
      if (rankRR) rankRR.textContent = `${cd.ranking_in_tier || 0} RR`;
      if (mmr.highest_rank) {
        if (peakIcon) peakIcon.src = getRankIconUrl(mmr.highest_rank.tier);
        if (peakName) peakName.textContent = mmr.highest_rank.patched_tier || 'N/A';
      }
    }
  }

  function renderStats(matches, puuid) {
    const grid = document.getElementById('tracker-stats-grid');
    if (!grid) return;
    grid.innerHTML = '';
    if (!matches || !matches.length) return;
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
        if (Array.isArray(teams)) { const mt = teams.find(t => t.team_id === team); if (mt && mt.won) wins++; }
        else { const tk = team ? team.toLowerCase() : ''; if (teams[tk] && teams[tk].has_won) wins++; }
      }
    });
    const n = matches.length, shots = hs + bs + ls;
    let topA = '-', topC = 0;
    Object.entries(agents).forEach(([ag, c]) => { if (c > topC) { topA = ag; topC = c; } });
    [
      { l: 'WIN RATE', v: `${n ? Math.round(wins / n * 100) : 0}%`, s: `${wins}W ${n - wins}L` },
      { l: 'K/D', v: d > 0 ? (k / d).toFixed(2) : k.toFixed(0), s: `${k}K ${d}D` },
      { l: 'HS %', v: `${shots ? ((hs / shots) * 100).toFixed(1) : 0}%`, s: `${hs} headshots` },
      { l: 'AVG DMG', v: `${n ? Math.round(dmg / n) : 0}`, s: 'per match' },
      { l: 'TOP AGENT', v: topA, s: `${topC} games` },
    ].forEach(st => {
      const c = document.createElement('div');
      c.className = 'tracker-stat-card';
      c.innerHTML = `<span class="tracker-stat-label">${st.l}</span><span class="tracker-stat-value">${st.v}</span><span class="tracker-stat-sub">${st.s}</span>`;
      grid.appendChild(c);
    });
  }

  function renderMatches(matches, puuid) {
    const list = document.getElementById('tracker-matches-list');
    if (!list) return;
    list.innerHTML = '';
    if (!matches || !matches.length) {
      list.innerHTML = '<p style="color:var(--text-muted);text-align:center;letter-spacing:2px;font-size:12px;padding:30px 0;">NO RECENT MATCHES FOUND</p>';
      return;
    }
    matches.forEach(m => {
      const md = m.data || m, meta = md.metadata || {};
      const ps = md.players;
      let p = null;
      if (Array.isArray(ps)) p = ps.find(x => x.puuid === puuid);
      else if (ps && ps.all_players) p = ps.all_players.find(x => x.puuid === puuid);
      if (!p) return;
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
      const draw = rw === rl && rw > 0, rc = draw ? 'draw' : won ? 'win' : 'loss';
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

      const row = document.createElement('div');
      row.className = `tracker-match-row ${rc}`;
      row.innerHTML = `
        <div class="tracker-mr-map"><span class="tracker-mr-map-name">${mapN}</span><span class="tracker-mr-map-time">${timeAgo}</span></div>
        <div class="tracker-mr-agent">${agIcon ? `<img src="${agIcon}" alt="${agName}">` : ''}<span class="tracker-mr-agent-name">${agName}</span></div>
        <span class="tracker-mr-score ${rc}">${rw}:${rl}</span>
        <span class="tracker-mr-kda">${kk}/${dd}/${aa}</span>
        <span class="tracker-mr-wl ${rc}">${wlText}</span>
        <span class="tracker-mr-acs">${acs}</span>
        <span class="tracker-mr-kd ${kdClass}">${kdRatio}</span>
        <span class="tracker-mr-dd ${ddClass}">${ddStr}</span>
        <span class="tracker-mr-hs">${hsPct}%</span>`;
      row.addEventListener('click', () => showMatchDetail(md, puuid));
      list.appendChild(row);
    });
  }

  // Utility: time ago
  function getTimeAgo(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) return `${mins}M AGO`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}H AGO`;
    const days = Math.floor(hrs / 24);
    return `${days}D AGO`;
  }

  // Show detailed match modal
  function showMatchDetail(matchData, puuid) {
    const overlay = document.getElementById('match-detail-overlay');
    const header = document.getElementById('match-detail-header');
    const scoreboard = document.getElementById('match-detail-scoreboard');
    if (!overlay || !header || !scoreboard) return;

    const meta = matchData.metadata || {};
    const mapN = meta.map ? (typeof meta.map === 'object' ? meta.map.name : meta.map) : 'Unknown';
    const modeN = (meta.mode || 'Competitive').toUpperCase();
    const matchId = meta.match_id || meta.matchid || '';
    const startRaw = meta.started_at || meta.game_start || null;
    const startTime = startRaw ? new Date(startRaw).toLocaleString() : (meta.game_start_patched || '');
    const gameLengthMs = meta.game_length || meta.gamelength || 0;
    const runtime = gameLengthMs > 0 ? `${Math.floor(gameLengthMs / 60000)}m ${Math.floor((gameLengthMs % 60000) / 1000)}s` : '';
    const server = meta.cluster || meta.server || '';

    // Get all players
    let allPlayers = [];
    const ps = matchData.players;
    if (Array.isArray(ps)) allPlayers = ps;
    else if (ps && ps.all_players) allPlayers = ps.all_players;

    // Find searched player and their team
    const me = allPlayers.find(x => x.puuid === puuid);
    const myTeam = me ? (me.team_id || me.team) : null;

    // Get both team data
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

    // Map image
    const mapImg = meta.map && typeof meta.map === 'object' && meta.map.id
      ? `https://media.valorant-api.com/maps/${meta.map.id}/splash.png` : '';

    // Header
    header.innerHTML = `
      <div class="md-header-top">
        <span class="md-title-badge">MATCH DETAIL</span>
        ${matchId ? `<span class="md-match-id">${matchId}</span>` : ''}
      </div>
      <div class="md-map-banner" ${mapImg ? `style="background-image:url(${mapImg})"` : ''}>
        <div class="md-map-overlay">
          <div class="md-map-info">
            <h2 class="md-map-name">${mapN}</h2>
            <span class="md-mode">${modeN}</span>
          </div>
          <div class="md-result-block">
            <span class="md-result-text ${rc}">${resultText}</span>
            <span class="md-result-score ${rc}">${teamAData.rw}:${teamAData.rl}</span>
          </div>
        </div>
      </div>
      <div class="md-meta-row">
        ${startTime ? `<div class="md-meta-item"><span class="md-meta-label">START</span><span class="md-meta-value">${startTime}</span></div>` : ''}
        ${runtime ? `<div class="md-meta-item"><span class="md-meta-label">RUNTIME</span><span class="md-meta-value">${runtime}</span></div>` : ''}
        ${server ? `<div class="md-meta-item"><span class="md-meta-label">SERVER</span><span class="md-meta-value">${server}</span></div>` : ''}
      </div>
      <div class="md-tab-bar"><span class="md-tab active">SCOREBOARD</span></div>
      <div class="md-col-header">
        <span class="md-ch md-ch-player">PLAYER</span>
        <span class="md-ch">ACS</span>
        <span class="md-ch md-ch-kda">K / D / A</span>
        <span class="md-ch">K/D</span>
        <span class="md-ch">HS%</span>
        <span class="md-ch">ADR</span>
        <span class="md-ch">FK</span>
        <span class="md-ch">FD</span>
      </div>
    `;

    // Split players by team
    const teamA = allPlayers.filter(p => (p.team_id || p.team) === myTeam);
    const teamB = allPlayers.filter(p => (p.team_id || p.team) !== myTeam);
    const sortByACS = (a, b) => ((b.stats ? b.stats.score : 0) || 0) - ((a.stats ? a.stats.score : 0) || 0);
    teamA.sort(sortByACS);
    teamB.sort(sortByACS);

    function buildTeamSection(players, teamInfo, colorClass) {
      const teamLabel = `TEAM ${(teamInfo.name || '').toUpperCase()}`;
      let html = `<div class="md-team-label ${colorClass}">${teamLabel} <span class="md-team-rounds">${teamInfo.rw} ROUNDS</span></div>`;
      players.forEach(p => {
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
        html += `
          <div class="md-player-row ${isMe ? 'is-me' : ''}">
            <div class="md-pr-player">
              <div class="md-pr-agent">${agIcon ? `<img src="${agIcon}" alt="${agName}">` : '<div class="md-pr-agent-placeholder">?</div>'}</div>
              <div class="md-pr-name-wrap">
                <span class="md-pr-name">${p.name || agName}</span>
                <span class="md-pr-tag">#${p.tag || ''}</span>
              </div>
            </div>
            <span class="md-pr-stat">${acs}</span>
            <span class="md-pr-stat md-pr-kda"><span class="md-kda-k">${k}</span> / <span class="md-kda-d">${d}</span> / <span class="md-kda-a">${a}</span></span>
            <span class="md-pr-stat ${kdClass}">${kd}</span>
            <span class="md-pr-stat">${hsPct}%</span>
            <span class="md-pr-stat">${adr}</span>
            <span class="md-pr-stat">${fk}</span>
            <span class="md-pr-stat">${fd}</span>
          </div>`;
      });
      return html;
    }

    scoreboard.innerHTML =
      buildTeamSection(teamA, teamAData, 'md-team-green') +
      buildTeamSection(teamB, teamBData, 'md-team-red');

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    const closeBtn = document.getElementById('match-detail-close');
    const closeModal = () => { overlay.classList.remove('active'); document.body.style.overflow = ''; };
    if (closeBtn) closeBtn.onclick = closeModal;
    overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
  }

  async function handleTrackerSearch() {
    const input = document.getElementById('tracker-search-input');
    const region = document.getElementById('tracker-region-select');
    if (!input) return;
    const rid = parseRiotId(input.value);
    if (!rid) { showTrackerError('Invalid Riot ID. Use Name#Tag (e.g. TenZ#0505)'); return; }
    const { name, tag } = rid, r = region ? region.value : 'ap';
    const en = encodeURIComponent(name), et = encodeURIComponent(tag);
    hideTrackerError(); showTrackerResults(false); showTrackerLoading(true);
    // Hide history when searching
    const historyEl = document.getElementById('tracker-history');
    if (historyEl) historyEl.style.display = 'none';
    try {
      const acct = await hdevFetch(`/valorant/v1/account/${en}/${et}`);
      const puuid = acct.data.puuid;
      renderPlayerCard(acct.data);
      let mmr;
      try { mmr = await hdevFetch(`/valorant/v3/mmr/${r}/pc/${en}/${et}`); }
      catch (e) { mmr = await hdevFetch(`/valorant/v2/mmr/${r}/${en}/${et}`); }
      renderRankCard(mmr.data);
      let matches = [];
      try { const ml = await hdevFetch(`/valorant/v3/matches/${r}/${en}/${et}?mode=competitive&size=5`); matches = ml.data || []; }
      catch (e) { matches = []; }
      renderStats(matches, puuid);
      renderMatches(matches, puuid);
      showTrackerLoading(false); showTrackerResults(true);

      // Save successful search to history
      saveToHistory({
        name: acct.data.name,
        tag: acct.data.tag,
        region: r.toUpperCase(),
        avatar: typeof acct.data.card === 'object' ? acct.data.card.small : acct.data.card,
        timestamp: Date.now()
      });

    } catch (err) {
      showTrackerLoading(false);
      showTrackerError(err.message);
      // Show history again on error if results aren't active
      if (historyEl) historyEl.style.display = '';
    }
  }

  // ===== SEARCH HISTORY =====
  const HISTORY_KEY = 'phoenix_tracker_history';
  const MAX_HISTORY = 5;

  function loadHistory() {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  function saveToHistory(entry) {
    let history = loadHistory();
    // Remove if exists
    history = history.filter(h => !(h.name.toLowerCase() === entry.name.toLowerCase() && h.tag.toLowerCase() === entry.tag.toLowerCase()));
    // Add to front
    history.unshift(entry);
    // Limit to max
    history = history.slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    renderHistory();
    // Cloud sync
    if (currentUser) {
      fetch(`${API_BASE}/tracker/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(entry)
      }).catch(console.error);
    }
  }

  function removeFromHistory(name, tag) {
    let history = loadHistory();
    history = history.filter(h => !(h.name.toLowerCase() === name.toLowerCase() && h.tag.toLowerCase() === tag.toLowerCase()));
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    renderHistory();
    // Cloud sync
    if (currentUser) {
      fetch(`${API_BASE}/tracker/history`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ name, tag })
      }).catch(console.error);
    }
  }

  function clearHistory() {
    localStorage.removeItem(HISTORY_KEY);
    renderHistory();
    // Cloud sync
    if (currentUser) {
      fetch(`${API_BASE}/tracker/history/all`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      }).catch(console.error);
    }
  }

  function renderHistory() {
    const list = document.getElementById('tracker-history-list');
    const empty = document.getElementById('tracker-history-empty');
    const historyEl = document.getElementById('tracker-history');
    if (!list || !empty || !historyEl) return;

    const history = loadHistory();

    // Don't modify display if results are shown or loading is active
    const resultsActive = document.getElementById('tracker-results')?.classList.contains('active');
    const loadingActive = document.getElementById('tracker-loading')?.classList.contains('active');
    if (resultsActive || loadingActive) {
      historyEl.style.display = 'none';
    } else {
      historyEl.style.display = '';
    }

    list.innerHTML = '';

    if (history.length === 0) {
      list.style.display = 'none';
      empty.classList.add('active');
      return;
    }

    list.style.display = 'flex';
    empty.classList.remove('active');

    history.forEach(item => {
      const row = document.createElement('div');
      row.className = 'tracker-history-item';

      let avatarHtml = '<div class="tracker-history-avatar-placeholder">?</div>';
      if (item.avatar) {
        avatarHtml = `<img src="${item.avatar}" class="tracker-history-avatar" alt="">`;
      }

      row.innerHTML = `
              ${avatarHtml}
              <div class="tracker-history-info">
                  <div class="tracker-history-name">${item.name} <span class="tracker-history-tag">#${item.tag}</span></div>
                  <div class="tracker-history-meta">
                      <span class="tracker-history-region">${item.region || 'AP'}</span>
                  </div>
              </div>
              <button class="tracker-history-remove" title="Remove" data-name="${item.name}" data-tag="${item.tag}">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                      <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
              </button>
          `;

      // Handle click to search
      row.addEventListener('click', (e) => {
        // Don't search if clicked remove button
        if (e.target.closest('.tracker-history-remove')) return;

        const input = document.getElementById('tracker-search-input');
        const regionSelect = document.getElementById('tracker-region-select');
        if (input) input.value = `${item.name}#${item.tag}`;
        if (regionSelect && item.region) {
          const val = item.region.toLowerCase();
          Array.from(regionSelect.options).forEach(opt => {
            if (opt.value === val) regionSelect.value = val;
          });
        }
        handleTrackerSearch();
      });

      // Handle remove button
      const removeBtn = row.querySelector('.tracker-history-remove');
      if (removeBtn) {
        removeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          removeFromHistory(item.name, item.tag);
        });
      }

      list.appendChild(row);
    });
  }

  function initTracker() {
    const btn = document.getElementById('tracker-search-btn');
    const inp = document.getElementById('tracker-search-input');
    const clearBtn = document.getElementById('tracker-history-clear');

    if (btn) btn.addEventListener('click', handleTrackerSearch);
    if (inp) inp.addEventListener('keydown', e => { if (e.key === 'Enter') handleTrackerSearch(); });
    if (clearBtn) clearBtn.addEventListener('click', clearHistory);

    // Initial render of history
    renderHistory();
  }

  // ===== INIT =====
  function init() {
    createEmbers();
    addRevealClasses();
    initRouter();
    initMobileMenu();
    initScrollReveal();
    initTracker();
    initCreatorVideos();
    initAuth();
    playIntro();
  }

  // ===== CREATOR VIDEOS (YouTube Data API v3) =====
  const YT_API_KEY = 'AIzaSyDLDEzNx6RWwXdnEiBc7il_oq8SPxNhekQ'; // Your YouTube Data API v3 Key
  const CREATOR_CHANNELS = [
    { channelId: 'UC6rMH3tbkLW5b8kBA-k6vWg', handle: 'ozen_gg', containerId: 'creator-ozen-videos' }
    // Add more creators here: { channelId: '...', handle: '...', containerId: '...' }
  ];
  const VIDEOS_PER_CHANNEL = 3;

  function initCreatorVideos() {
    CREATOR_CHANNELS.forEach(ch => {
      loadCreatorYouTube(ch.containerId, ch.channelId, ch.handle);
    });
  }

  async function loadCreatorYouTube(containerId, channelId, handle) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="creator-videos-loading">
        <div class="mini-spinner"></div>
        LOADING VIDEOS...
      </div>`;

    try {
      const apiUrl = `https://www.googleapis.com/youtube/v3/search?key=${YT_API_KEY}&channelId=${channelId}&part=snippet,id&order=date&maxResults=${VIDEOS_PER_CHANNEL}&type=video`;
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error('API fetch failed');
      const data = await res.json();

      if (data.error) throw new Error(data.error.message);
      if (!data.items || !data.items.length) throw new Error('No videos found');

      container.innerHTML = '';

      data.items.forEach(item => {
        const videoId = item.id.videoId;
        const title = item.snippet.title;
        const published = item.snippet.publishedAt;
        const thumbUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

        // Format date
        let dateStr = '';
        if (published) {
          const d = new Date(published);
          const now = new Date();
          const diffDays = Math.floor((now - d) / 86400000);
          if (diffDays < 1) dateStr = 'TODAY';
          else if (diffDays < 7) dateStr = `${diffDays}D AGO`;
          else if (diffDays < 30) dateStr = `${Math.floor(diffDays / 7)}W AGO`;
          else if (diffDays < 365) dateStr = `${Math.floor(diffDays / 30)}MO AGO`;
          else dateStr = `${Math.floor(diffDays / 365)}Y AGO`;
        }

        const card = document.createElement('a');
        card.className = 'creator-video-card';
        card.href = videoUrl;
        card.target = '_blank';
        card.rel = 'noopener';
        card.innerHTML = `
          <img class="creator-video-thumb" src="${thumbUrl}" alt="${title}" loading="lazy">
          <div class="creator-video-play">
            <div class="creator-video-play-icon"></div>
          </div>
          <div class="creator-video-title">${title}</div>
          <div class="creator-video-meta">${dateStr}</div>`;
        container.appendChild(card);
      });
    } catch (err) {
      console.error('YouTube API Error:', err);
      container.innerHTML = '';
      for (let i = 0; i < 3; i++) {
        const card = document.createElement('a');
        card.className = 'creator-video-card';
        card.href = `https://youtube.com/@${handle}`;
        card.target = '_blank';
        card.rel = 'noopener';
        card.innerHTML = `
          <div style="width:100%;aspect-ratio:16/9;background:rgba(255,255,255,0.03);display:flex;align-items:center;justify-content:center;">
            <div class="creator-video-play-icon" style="opacity:0.3"></div>
          </div>
          <div class="creator-video-title" style="color:var(--text-muted)">Visit YouTube to watch</div>
          <div class="creator-video-meta">@${handle}</div>`;
        container.appendChild(card);
      }
    }
  }

  // ===== FIREBASE AUTH & PROFILE =====
  function initAuth() {
    const authBtn = document.getElementById('auth-btn');
    const loginModal = document.getElementById('login-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const closeProfileBtn = document.getElementById('close-profile-btn');
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
      if (loginModal) { loginModal.classList.add('active'); }
      if (loginErrorMsg) loginErrorMsg.style.display = 'none';
    }
    function closeLoginModal() {
      if (loginModal) loginModal.classList.remove('active');
    }
    function showError(msg) {
      if (loginErrorMsg) { loginErrorMsg.textContent = msg; loginErrorMsg.style.display = 'block'; }
    }

    let savedScrollY = 0;
    function openProfileSidebar() {
      savedScrollY = window.scrollY;
      document.documentElement.style.setProperty('--scroll-y', `${savedScrollY}px`);
      document.body.classList.add('profile-open');
    }
    function closeProfileSidebar() {
      document.body.classList.remove('profile-open');
    }

    // Auth button
    if (authBtn) {
      authBtn.addEventListener('click', () => {
        if (currentUser) openProfileSidebar();
        else openLoginModal();
      });
    }

    // Close handlers
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeLoginModal);
    if (loginModal) loginModal.addEventListener('click', (e) => { if (e.target === loginModal) closeLoginModal(); });
    if (closeProfileBtn) closeProfileBtn.addEventListener('click', closeProfileSidebar);

    // Settings link in profile
    if (linkAccountSettings) {
      linkAccountSettings.addEventListener('click', () => {
        closeProfileSidebar();
        window.location.hash = 'settings';
        // Use existing router
        const pages = document.querySelectorAll('.page');
        const links = document.querySelectorAll('.nav-link');
        pages.forEach(p => p.classList.remove('active'));
        links.forEach(l => l.classList.remove('active'));
        const t = document.getElementById('settings');
        if (t) { t.classList.add('active'); window.scrollTo(0, 0); }
      });
    }

    // File input preview
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

    // Google GIS Login Handler
    window.handleGoogleCredentialResponse = async (response) => {
      try {
        const res = await fetch(`${API_BASE}/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential: response.credential })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Google Login failed');

        localStorage.setItem('token', data.token);
        currentUser = data.user;
        updateAuthUI(currentUser);
        closeLoginModal();
        fetchUserHistory();
      } catch (err) {
        showError(err.message);
      }
    };

    // Render Google Button
    const renderGoogleButton = () => {
      const wrapper = document.getElementById('google-btn-wrapper');
      if (wrapper && window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          // Replace this with your actual Google Client ID
          client_id: "740576636689-nk89bk64e21gbtu7te6htn4nkmb84482.apps.googleusercontent.com",
          callback: handleGoogleCredentialResponse
        });
        window.google.accounts.id.renderButton(
          wrapper,
          { theme: "outline", size: "large", width: 250 }
        );
      } else {
        setTimeout(renderGoogleButton, 100);
      }
    };
    renderGoogleButton();

    if (emailLoginBtn) {
      emailLoginBtn.addEventListener('click', async () => {
        try {
          const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailInput.value, password: passwordInput.value })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Login failed');

          localStorage.setItem('token', data.token);
          currentUser = data.user;
          updateAuthUI(currentUser);
          closeLoginModal();
          fetchUserHistory();
        } catch (err) {
          showError(err.message);
        }
      });
    }

    if (emailSignupBtn) {
      emailSignupBtn.addEventListener('click', async () => {
        try {
          const res = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailInput.value, password: passwordInput.value })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Signup failed');

          localStorage.setItem('token', data.token);
          currentUser = data.user;
          updateAuthUI(currentUser);
          closeLoginModal();
        } catch (err) {
          showError(err.message);
        }
      });
    }

    // Logout
    if (psLogoutBtn) {
      psLogoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        currentUser = null;
        if (authBtn) { authBtn.innerHTML = '<span id="auth-text">Login</span>'; authBtn.style.padding = '8px 20px'; }
        closeProfileSidebar();
        renderHistory();
        window.location.hash = 'home';
      });
    }

    // Save settings
    if (settingsSaveBtn) {
      settingsSaveBtn.addEventListener('click', async () => {
        if (!currentUser) return;
        try {
          settingsSaveBtn.textContent = 'SAVING...';
          settingsSaveBtn.disabled = true;

          const formData = new FormData();
          if (settingsDisplayName) formData.append('displayName', settingsDisplayName.value.trim());
          if (settingsRiotId) formData.append('riotId', settingsRiotId.value.trim());
          if (selectedImageFile) formData.append('avatar', selectedImageFile);

          if (settingsMsg) { settingsMsg.style.color = '#fff'; settingsMsg.textContent = 'Saving changes...'; }

          const res = await fetch(`${API_BASE}/user/settings`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: formData
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to save');

          if (settingsMsg) { settingsMsg.style.color = '#34d399'; settingsMsg.textContent = 'Settings saved!'; }

          // Update local user object
          if (settingsDisplayName) currentUser.displayName = settingsDisplayName.value.trim();
          if (settingsRiotId) currentUser.riotId = settingsRiotId.value.trim();
          if (data.avatarUrl) currentUser.avatarUrl = data.avatarUrl;

          selectedImageFile = null;
          if (settingsFileName) settingsFileName.textContent = 'No file chosen';
          updateAuthUI(currentUser);
        } catch (e) {
          if (settingsMsg) { settingsMsg.style.color = '#f87171'; settingsMsg.textContent = 'Error: ' + e.message; }
        } finally {
          settingsSaveBtn.textContent = 'SAVE CHANGES';
          settingsSaveBtn.disabled = false;
          setTimeout(() => { if (settingsMsg) settingsMsg.textContent = ''; }, 3000);
        }
      });
    }

    function updateAuthUI(user) {
      const avatarUrl = user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=111&color=fff`;
      const displayNm = user.displayName || user.email.split('@')[0];
      if (authBtn) {
        authBtn.innerHTML = `<img src="${avatarUrl}" alt="" style="width:24px;height:24px;border-radius:50%;object-fit:cover;flex-shrink:0;"><span id="auth-text" style="max-width:80px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:600;">${displayNm}</span>`;
        authBtn.style.padding = '4px 14px 4px 4px';
      }
      const psAvatar = document.getElementById('ps-avatar');
      const psName = document.getElementById('ps-name');
      const psEmail = document.getElementById('ps-email');
      if (psAvatar) psAvatar.src = avatarUrl;
      if (psName) psName.textContent = displayNm;
      if (psEmail) psEmail.textContent = user.email;
      const sAvatar = document.getElementById('settings-avatar');
      const sName = document.getElementById('settings-name');
      const sEmail = document.getElementById('settings-email');
      if (sAvatar) sAvatar.src = avatarUrl;
      if (settingsPreviewImg) settingsPreviewImg.src = avatarUrl;
      if (sName) sName.textContent = displayNm;
      if (sEmail) sEmail.textContent = user.email;
      if (settingsDisplayName) settingsDisplayName.value = user.displayName || '';
      if (settingsRiotId) settingsRiotId.value = user.riotId || '';
    }

    async function fetchUserHistory() {
      try {
        const res = await fetch(`${API_BASE}/tracker/history`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          const data = await res.json();
          localStorage.setItem(HISTORY_KEY, JSON.stringify(data.history || []));
          renderHistory();
        }
      } catch (e) { }
    }

    // Check if user is logged in on load
    async function checkAuth() {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await fetch(`${API_BASE}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            currentUser = data.user;
            updateAuthUI(currentUser);
            fetchUserHistory();
          } else {
            localStorage.removeItem('token');
          }
        } catch (e) {
          console.error(e);
        }
      }
    }

    checkAuth();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
