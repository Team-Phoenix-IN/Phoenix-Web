/* ================================================================
   TEAM PHOENIX â€” APP.JS
   Realistic phoenix wing SVGs, intro animation, routing, particles
   ================================================================ */

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
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const wingLeftEl = document.getElementById('wing-left');
  const wingRightEl = document.getElementById('wing-right');
  const emberContainer = document.getElementById('ember-container');

  // ===== PHOENIX WING SVG â€” Realistic multi-layered feathers =====
  // Inspired by a phoenix with outstretched wings: multiple overlapping
  // feather shapes with varying lengths, creating a realistic wing silhouette

  function createPhoenixWingSVG(side) {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 350 400');
    svg.style.overflow = 'visible';

    const defs = document.createElementNS(ns, 'defs');

    // Main gradient (red to orange to yellow)
    const grad = document.createElementNS(ns, 'linearGradient');
    grad.setAttribute('id', `phoenix-grad-${side}`);
    grad.setAttribute('x1', '0%');
    grad.setAttribute('y1', '100%');
    grad.setAttribute('x2', '100%');
    grad.setAttribute('y2', '0%');
    [
      { offset: '0%', color: '#ffaa00' },
      { offset: '35%', color: '#ff6600' },
      { offset: '65%', color: '#ff2200' },
      { offset: '100%', color: '#cc0000' },
    ].forEach(({ offset, color }) => {
      const stop = document.createElementNS(ns, 'stop');
      stop.setAttribute('offset', offset);
      stop.setAttribute('stop-color', color);
      grad.appendChild(stop);
    });

    // Dark gradient for depth layer
    const darkGrad = document.createElementNS(ns, 'linearGradient');
    darkGrad.setAttribute('id', `phoenix-dark-${side}`);
    darkGrad.setAttribute('x1', '0%');
    darkGrad.setAttribute('y1', '100%');
    darkGrad.setAttribute('x2', '100%');
    darkGrad.setAttribute('y2', '0%');
    [
      { offset: '0%', color: '#cc7700' },
      { offset: '50%', color: '#aa2200' },
      { offset: '100%', color: '#880000' },
    ].forEach(({ offset, color }) => {
      const stop = document.createElementNS(ns, 'stop');
      stop.setAttribute('offset', offset);
      stop.setAttribute('stop-color', color);
      darkGrad.appendChild(stop);
    });

    // Glow filter
    const filter = document.createElementNS(ns, 'filter');
    filter.setAttribute('id', `wing-glow-${side}`);
    filter.setAttribute('x', '-30%');
    filter.setAttribute('y', '-30%');
    filter.setAttribute('width', '160%');
    filter.setAttribute('height', '160%');
    const blur = document.createElementNS(ns, 'feGaussianBlur');
    blur.setAttribute('in', 'SourceGraphic');
    blur.setAttribute('stdDeviation', '6');
    filter.appendChild(blur);

    defs.appendChild(grad);
    defs.appendChild(darkGrad);
    defs.appendChild(filter);
    svg.appendChild(defs);

    // Wing origin point (where wing connects to body)
    // For right wing: origin is at left-center, feathers fan outward to the right and up
    const originX = 10;
    const originY = 330;

    // Define feather shapes â€” each is a realistic curved feather
    // [tipX, tipY, cp1X, cp1Y, cp2X, cp2Y, width, layer]
    // layer: 'back' for dark underside, 'front' for main feathers
    const featherData = [
      // --- Back layer (darker, wider, provides depth) ---
      // Primary flight feathers â€” long, at the wing tips
      { tx: 340, ty: 30, c1x: 200, c1y: 280, c2x: 310, c2y: 100, w: 28, layer: 'back' },
      { tx: 320, ty: 60, c1x: 180, c1y: 280, c2x: 290, c2y: 130, w: 26, layer: 'back' },
      { tx: 300, ty: 15, c1x: 160, c1y: 250, c2x: 270, c2y: 80, w: 24, layer: 'back' },
      { tx: 280, ty: 50, c1x: 140, c1y: 260, c2x: 250, c2y: 110, w: 22, layer: 'back' },

      // --- Front layer (bright, main feathers) ---
      // Upper primaries (longest â€” wing tips pointing up)
      { tx: 330, ty: 20, c1x: 180, c1y: 260, c2x: 300, c2y: 90, w: 22, layer: 'front' },
      { tx: 310, ty: 45, c1x: 170, c1y: 270, c2x: 280, c2y: 100, w: 20, layer: 'front' },
      { tx: 290, ty: 25, c1x: 150, c1y: 240, c2x: 260, c2y: 80, w: 20, layer: 'front' },

      // Mid primaries
      { tx: 270, ty: 55, c1x: 130, c1y: 250, c2x: 240, c2y: 110, w: 20, layer: 'front' },
      { tx: 250, ty: 40, c1x: 110, c1y: 230, c2x: 220, c2y: 90, w: 18, layer: 'front' },
      { tx: 240, ty: 70, c1x: 100, c1y: 240, c2x: 210, c2y: 130, w: 18, layer: 'front' },

      // Secondary feathers (medium)
      { tx: 220, ty: 85, c1x: 90, c1y: 240, c2x: 190, c2y: 140, w: 18, layer: 'front' },
      { tx: 200, ty: 100, c1x: 80, c1y: 230, c2x: 170, c2y: 150, w: 16, layer: 'front' },
      { tx: 180, ty: 115, c1x: 70, c1y: 230, c2x: 150, c2y: 160, w: 16, layer: 'front' },

      // Tertiary / covert feathers (shorter, inner wing)
      { tx: 155, ty: 140, c1x: 60, c1y: 230, c2x: 120, c2y: 180, w: 14, layer: 'front' },
      { tx: 130, ty: 160, c1x: 50, c1y: 230, c2x: 100, c2y: 200, w: 14, layer: 'front' },
      { tx: 105, ty: 185, c1x: 40, c1y: 240, c2x: 80, c2y: 220, w: 12, layer: 'front' },
      { tx: 80, ty: 210, c1x: 30, c1y: 260, c2x: 60, c2y: 240, w: 10, layer: 'front' },
    ];

    const featherEls = [];

    featherData.forEach((f, i) => {
      const group = document.createElementNS(ns, 'g');
      if (side === 'left') {
        group.setAttribute('transform', `translate(350, 0) scale(-1, 1)`);
      }

      // Build feather path using cubic beziers for organic curved shape
      // Each feather: start at origin, curve out to tip, curve back with slight width
      const perpAngle = Math.atan2(f.ty - originY, f.tx - originX) + Math.PI / 2;
      const wx = Math.cos(perpAngle) * f.w;
      const wy = Math.sin(perpAngle) * f.w;

      const d = `
        M ${originX},${originY}
        C ${f.c1x},${f.c1y} ${f.c2x},${f.c2y} ${f.tx},${f.ty}
        C ${f.c2x + wx * 0.3},${f.c2y + wy * 0.3} ${f.c1x + wx * 0.5},${f.c1y + wy * 0.5} ${originX + wx * 0.2},${originY + wy * 0.2}
        Z
      `;

      // Glow layer
      if (f.layer === 'front') {
        const glowPath = document.createElementNS(ns, 'path');
        glowPath.setAttribute('d', d);
        glowPath.setAttribute('fill', `url(#phoenix-grad-${side})`);
        glowPath.setAttribute('opacity', '0.2');
        glowPath.setAttribute('filter', `url(#wing-glow-${side})`);
        glowPath.classList.add('wing-feather');
        group.appendChild(glowPath);
      }

      // Main feather path
      const path = document.createElementNS(ns, 'path');
      path.setAttribute('d', d);
      path.setAttribute('fill', f.layer === 'back'
        ? `url(#phoenix-dark-${side})`
        : `url(#phoenix-grad-${side})`
      );
      path.setAttribute('opacity', f.layer === 'back' ? '0.7' : '0.9');
      path.classList.add('wing-feather');
      group.appendChild(path);

      svg.appendChild(group);
      featherEls.push({ el: path, index: i, layer: f.layer });
    });

    return { svg, featherEls };
  }

  // ===== BUILD WINGS =====
  let leftWingData, rightWingData;

  function buildWings() {
    rightWingData = createPhoenixWingSVG('right');
    leftWingData = createPhoenixWingSVG('left');

    wingRightEl.appendChild(rightWingData.svg);
    wingLeftEl.appendChild(leftWingData.svg);
  }

  // ===== INTRO ANIMATION =====
  function playIntro() {
    // Fade overlay
    setTimeout(() => {
      introOverlay.classList.add('fade-out');
    }, OVERLAY_FADE);

    // Animate wing feathers with stagger
    setTimeout(() => {
      const allFeathers = [
        ...rightWingData.featherEls,
        ...leftWingData.featherEls,
      ];

      allFeathers.forEach((f) => {
        const delay = f.index * WING_STAGGER;
        setTimeout(() => {
          f.el.classList.add('animate');
          f.el.style.animationDelay = `${f.index * 0.04}s`;
        }, delay);
      });

      // Settle wings after animation completes
      const totalTime = allFeathers.length * WING_STAGGER + 1400;
      setTimeout(() => {
        wingLeftEl.classList.add('settled');
        wingRightEl.classList.add('settled');

        // Assign random burn animation delays for natural fire flicker
        allFeathers.forEach((f) => {
          const burnDelay = (Math.random() * 2).toFixed(2);
          const burnDuration = (2 + Math.random() * 1.5).toFixed(2);
          f.el.style.animationDelay = `${burnDelay}s`;
          f.el.style.animationDuration = `${burnDuration}s`;
        });
      }, totalTime);
    }, INTRO_DELAY);

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
      if (navLinks) navLinks.classList.remove('open');
      if (hamburgerBtn) hamburgerBtn.classList.remove('open');
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

  function createNavEmbers() {
    if (!navEmberContainer) return;
    // Clear existing
    navEmberContainer.innerHTML = '';

    for (let i = 0; i < NAV_EMBER_COUNT; i++) {
      const ember = document.createElement('div');
      ember.classList.add('ember');

      const size = 2 + Math.random() * 5;
      const left = Math.random() * 100;
      const duration = 5 + Math.random() * 8;
      const delay = Math.random() * 4;

      ember.style.width = `${size}px`;
      ember.style.height = `${size}px`;
      ember.style.left = `${left}%`;
      ember.style.bottom = `-${size}px`;
      ember.style.animationDuration = `${duration}s`;
      ember.style.animationDelay = `${delay}s`;

      navEmberContainer.appendChild(ember);
    }
  }

  function clearNavEmbers() {
    if (navEmberContainer) navEmberContainer.innerHTML = '';
  }

  function initMobileMenu() {
    if (!hamburgerBtn || !navLinks) return;

    hamburgerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpening = !hamburgerBtn.classList.contains('open');
      hamburgerBtn.classList.toggle('open');
      navLinks.classList.toggle('open');

      if (isOpening) {
        createNavEmbers();
      } else {
        clearNavEmbers();
      }
    });

    // Close menu when clicking a link inside mobile menu
    navLinks.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        hamburgerBtn.classList.remove('open');
        navLinks.classList.remove('open');
        clearNavEmbers();
      });
    });

    // Close menu when tapping outside
    document.addEventListener('click', (e) => {
      if (navLinks.classList.contains('open') &&
        !navLinks.contains(e.target) &&
        !hamburgerBtn.contains(e.target)) {
        hamburgerBtn.classList.remove('open');
        navLinks.classList.remove('open');
        clearNavEmbers();
      }
    });
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
  }

  function removeFromHistory(name, tag) {
      let history = loadHistory();
      history = history.filter(h => !(h.name.toLowerCase() === name.toLowerCase() && h.tag.toLowerCase() === tag.toLowerCase()));
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
      renderHistory();
  }

  function clearHistory() {
      localStorage.removeItem(HISTORY_KEY);
      renderHistory();
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
    buildWings();
    createEmbers();
    addRevealClasses();
    initRouter();
    initMobileMenu();
    initScrollReveal();
    initTracker();
    playIntro();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
