import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyBaJ3FG7NSNF0tiyhH1kck7gjtGkf3PAUA",
    authDomain: "team-phoenix-web.firebaseapp.com",
    projectId: "team-phoenix-web",
    storageBucket: "team-phoenix-web.firebasestorage.app",
    messagingSenderId: "685085247873",
    appId: "1:685085247873:web:445e7649f90005700b4080",
    measurementId: "G-PJ854NT1LS"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const provider = new GoogleAuthProvider();

let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    
    const sidebar = document.getElementById('sidebar');
    const sidebarTrigger = document.getElementById('sidebar-trigger');
    const closeSidebarBtn = document.getElementById('close-sidebar');
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    
    const authBtn = document.getElementById('auth-btn');
    const loginModal = document.getElementById('login-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    
    const profileSidebar = document.getElementById('profile-sidebar');
    const closeProfileBtn = document.getElementById('close-profile-btn');
    const psLogoutBtn = document.getElementById('ps-logout-btn');
    
    const emailInput = document.getElementById('email-input');
    const passwordInput = document.getElementById('password-input');
    const emailLoginBtn = document.getElementById('email-login-btn');
    const emailSignupBtn = document.getElementById('email-signup-btn');
    const googleLoginBtn = document.getElementById('google-login-btn');
    const loginErrorMsg = document.getElementById('login-error-msg');
    
    const pages = document.querySelectorAll('.page');
    const links = document.querySelectorAll('[data-page], [data-nav]');

    const linkAccountSettings = document.getElementById('link-account-settings');
    const settingsDisplayName = document.getElementById('settings-display-name');
    const settingsRiotId = document.getElementById('settings-riot-id');
    const settingsSaveBtn = document.getElementById('settings-save-btn');
    const settingsMsg = document.getElementById('settings-msg');
    
    const settingsFileInput = document.getElementById('settings-file-input');
    const settingsFileName = document.getElementById('settings-file-name');
    const settingsPreviewImg = document.getElementById('settings-preview-img');
    let selectedImageFile = null;

    function openSidebar() { 
        if (window.innerWidth > 768) return; 
        if (sidebar) sidebar.classList.add('open'); 
        if (sidebarOverlay) sidebarOverlay.classList.add('open');
    }
    
    function closeSidebar() { 
        if (sidebar) sidebar.classList.remove('open'); 
        if (sidebarOverlay) sidebarOverlay.classList.remove('open');
    }

    function openLoginModal() {
        if (loginModal) loginModal.classList.add('active');
        if (loginErrorMsg) loginErrorMsg.style.display = 'none';
    }

    function closeLoginModal() {
        if (loginModal) loginModal.classList.remove('active');
    }
    
    let savedScrollY = 0;

    function openProfileSidebar() {
        const wrapper = document.getElementById('app-wrapper');
        const nav = document.getElementById('main-nav');
        savedScrollY = window.scrollY;

        document.documentElement.style.setProperty('--scroll-y', `${savedScrollY}px`);

        if (wrapper) {
            const viewportCenterY = savedScrollY + (window.innerHeight / 2);
            wrapper.style.transformOrigin = `center ${viewportCenterY}px`;
        }
        if (nav) {
            nav.style.top = `${savedScrollY}px`;
        }
        document.body.classList.add('profile-open');
    }

    function closeProfileSidebar() {
        const nav = document.getElementById('main-nav');
        if (nav) {
            nav.style.top = '0px';
        }
        document.body.classList.remove('profile-open');
        setTimeout(() => {
            if(!document.body.classList.contains('profile-open')) {
                document.documentElement.style.removeProperty('--scroll-y');
            }
        }, 400);
    }

    function showError(msg) {
        if (loginErrorMsg) {
            loginErrorMsg.textContent = msg;
            loginErrorMsg.style.display = 'block';
        }
    }

    function navigateTo(pageId) {
        if (!pageId) return;
        pages.forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.nav-link, .nav-link-dt').forEach(l => l.classList.remove('active'));

        const target = document.getElementById(pageId);

        if (target) {
            target.classList.add('active');
            window.scrollTo(0, 0); 
        }

        document.querySelectorAll(`[data-page="${pageId}"]`).forEach(l => l.classList.add('active'));
        closeSidebar();
    }

    if (sidebarTrigger) sidebarTrigger.addEventListener('mouseenter', openSidebar);
    if (sidebar) sidebar.addEventListener('mouseleave', closeSidebar);
    if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', closeSidebar);
    if (mobileBtn) mobileBtn.addEventListener('click', openSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeLoginModal);
    if (loginModal) loginModal.addEventListener('click', (e) => { if (e.target === loginModal) closeLoginModal(); });
    
    if (closeProfileBtn) closeProfileBtn.addEventListener('click', closeProfileSidebar);

    if (linkAccountSettings) {
        linkAccountSettings.addEventListener('click', () => {
            closeProfileSidebar();
            window.location.hash = 'settings';
            navigateTo('settings');
        });
    }

    if (settingsFileInput) {
        settingsFileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                selectedImageFile = e.target.files[0];
                if (settingsFileName) settingsFileName.textContent = selectedImageFile.name;
                
                const reader = new FileReader();
                reader.onload = (ev) => {
                    if (settingsPreviewImg) settingsPreviewImg.src = ev.target.result;
                };
                reader.readAsDataURL(selectedImageFile);
            }
        });
    }

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const page = link.dataset.page || link.dataset.nav;
            if (page) {
                e.preventDefault();
                window.location.hash = page;
                navigateTo(page);
            }
        });
    });

    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.replace('#', '') || 'home';
        navigateTo(hash);
    });

    let touchStartX = 0, touchEndX = 0, touchStartY = 0, touchEndY = 0;
    document.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, {passive: true});

    document.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        const xDiff = touchEndX - touchStartX;
        const yDiff = Math.abs(touchEndY - touchStartY);
        if (Math.abs(xDiff) > yDiff && Math.abs(xDiff) > 40) {
            if (xDiff > 0 && touchStartX < 50) openSidebar();
            else if (xDiff < 0 && sidebar && sidebar.classList.contains('open')) closeSidebar();
            else if (xDiff > 0 && document.body.classList.contains('profile-open')) closeProfileSidebar();
        }
    }, {passive: true});

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = user;
            
            const avatarUrl = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=111&color=fff`;
            const displayNm = user.displayName || user.email.split('@')[0];
            
            if (authBtn) {
                authBtn.innerHTML = `
                    <img src="${avatarUrl}" alt="User" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover; flex-shrink: 0;">
                    <span id="auth-text" style="max-width: 80px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 600; display: inline-block; vertical-align: middle;">${displayNm}</span>
                `;
                authBtn.style.padding = "4px 14px 4px 4px";
            }
            
            document.getElementById('ps-avatar').src = avatarUrl;
            document.getElementById('ps-name').textContent = displayNm;
            document.getElementById('ps-email').textContent = user.email;

            document.getElementById('settings-avatar').src = avatarUrl;
            if (settingsPreviewImg) settingsPreviewImg.src = avatarUrl;
            document.getElementById('settings-name').textContent = displayNm;
            document.getElementById('settings-email').textContent = user.email;

            if (settingsDisplayName) settingsDisplayName.value = user.displayName || '';

            const userRef = doc(db, "users", user.uid);
            getDoc(userRef).then(docSnap => {
                if (docSnap.exists() && docSnap.data().riotId) {
                    if(settingsRiotId) settingsRiotId.value = docSnap.data().riotId;
                } else {
                    if(settingsRiotId) settingsRiotId.value = '';
                }
            });

            await syncHistoryFromCloud();
        } else {
            currentUser = null;
            if (authBtn) {
                authBtn.innerHTML = `<span id="auth-text">Login</span>`;
                authBtn.style.padding = "10px 20px"; 
            }
            closeProfileSidebar();
            renderHistory(); 
        }
    });

    if (settingsSaveBtn) {
        settingsSaveBtn.addEventListener('click', async () => {
            if (!currentUser) return;
            
            const riotId = settingsRiotId.value.trim();
            const newName = settingsDisplayName.value.trim();
            
            try {
                settingsSaveBtn.textContent = 'Saving...';
                settingsSaveBtn.disabled = true;

                let newPhotoUrl = currentUser.photoURL;

                if (selectedImageFile) {
                    settingsMsg.style.color = 'var(--text-main)';
                    settingsMsg.textContent = 'Uploading image...';
                    
                    const fileRef = storageRef(storage, `profile_pictures/${currentUser.uid}_${Date.now()}`);
                    await uploadBytes(fileRef, selectedImageFile);
                    newPhotoUrl = await getDownloadURL(fileRef);
                }
                
                settingsMsg.textContent = 'Updating profile...';

                await updateProfile(currentUser, {
                    displayName: newName || currentUser.displayName,
                    photoURL: newPhotoUrl
                });

                const uRef = doc(db, "users", currentUser.uid);
                await setDoc(uRef, { riotId: riotId }, { merge: true });
                
                settingsMsg.style.color = '#34d399';
                settingsMsg.textContent = 'Settings saved successfully!';
                
                selectedImageFile = null;
                if(settingsFileName) settingsFileName.textContent = 'No file chosen';
                
                const avatarUrl = newPhotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(newName || currentUser.email)}&background=111&color=fff`;
                const displayNm = newName || currentUser.email.split('@')[0];
                
                if (authBtn) {
                    authBtn.innerHTML = `
                        <img src="${avatarUrl}" alt="User" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover; flex-shrink: 0;">
                        <span id="auth-text" style="max-width: 80px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 600; display: inline-block; vertical-align: middle;">${displayNm}</span>
                    `;
                }
                
                document.getElementById('ps-avatar').src = avatarUrl;
                document.getElementById('ps-name').textContent = displayNm;
                document.getElementById('settings-avatar').src = avatarUrl;
                document.getElementById('settings-name').textContent = displayNm;

            } catch (e) {
                settingsMsg.style.color = '#f87171';
                settingsMsg.textContent = 'Error saving settings: ' + e.message;
            } finally {
                settingsSaveBtn.textContent = 'Save Changes';
                settingsSaveBtn.disabled = false;
                setTimeout(() => settingsMsg.textContent = '', 3000);
            }
        });
    }

    if (authBtn) {
        authBtn.addEventListener('click', () => {
            if (currentUser) {
                openProfileSidebar(); 
            } else {
                openLoginModal();
            }
        });
    }
    
    if (psLogoutBtn) {
        psLogoutBtn.addEventListener('click', () => {
            signOut(auth).then(() => {
                closeProfileSidebar();
                navigateTo('home');
            });
        });
    }

    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', () => {
            signInWithPopup(auth, provider).then(() => closeLoginModal()).catch(err => showError(err.message));
        });
    }

    if (emailLoginBtn) {
        emailLoginBtn.addEventListener('click', () => {
            signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value)
                .then(() => closeLoginModal())
                .catch(err => showError(err.message));
        });
    }

    if (emailSignupBtn) {
        emailSignupBtn.addEventListener('click', () => {
            createUserWithEmailAndPassword(auth, emailInput.value, passwordInput.value)
                .then(() => closeLoginModal())
                .catch(err => showError(err.message));
        });
    }

    const HDEV_BASE = 'https://api.henrikdev.xyz';
    const HDEV_API_KEY = 'HDEV-67ef927d-d7f2-47f4-bb92-bf8919370782';

    function getRankIconUrl(tierId) {
        if (!tierId || tierId <= 0) return '';
        return `https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/${tierId}/largeicon.png`;
    }

    function showTrackerError(msg) {
        const el = document.getElementById('tracker-error');
        if (el) { el.textContent = msg; el.classList.add('active'); }
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
        const res = await fetch(`${HDEV_BASE}${path}`, { headers: { Authorization: HDEV_API_KEY } });
        if (res.status === 401 || res.status === 403) throw new Error('Invalid API key.');
        if (res.status === 404) throw new Error('Player not found.');
        if (res.status === 429) throw new Error('Rate limit reached.');
        if (!res.ok) throw new Error(`API error (${res.status}).`);
        return res.json();
    }

    function renderPlayerCard(d) {
        document.getElementById('tracker-player-name').textContent = d.name || '—';
        document.getElementById('tracker-player-tag').textContent = `#${d.tag || ''}`;
        document.getElementById('tracker-player-level').textContent = `LEVEL ${d.account_level || '?'}`;
        if (d.card) {
            document.getElementById('tracker-player-avatar').src = typeof d.card === 'object' ? d.card.small : d.card;
            if (typeof d.card === 'object' && d.card.wide) {
                document.getElementById('tracker-player-banner').style.backgroundImage = `url(${d.card.wide})`;
            }
        }
    }

    function renderRankCard(mmr) {
        const setUI = (icon, name, rr, pIcon, pName) => {
            document.getElementById('tracker-rank-icon').src = icon;
            document.getElementById('tracker-rank-name').textContent = name;
            document.getElementById('tracker-rank-rr').textContent = rr;
            document.getElementById('tracker-rank-peak-icon').src = pIcon;
            document.getElementById('tracker-rank-peak-name').textContent = pName;
        };
        if (mmr.current) {
            setUI(getRankIconUrl(mmr.current.tier.id), mmr.current.tier.name, `${mmr.current.rr} RR`, 
                  getRankIconUrl(mmr.peak?.tier?.id), mmr.peak?.tier?.name || 'N/A');
        } else if (mmr.current_data) {
            setUI(getRankIconUrl(mmr.current_data.currenttier), mmr.current_data.currenttier_patched, 
                  `${mmr.current_data.ranking_in_tier} RR`, getRankIconUrl(mmr.highest_rank?.tier), 
                  mmr.highest_rank?.patched_tier || 'N/A');
        }
    }

    function renderStats(matches, puuid) {
        const grid = document.getElementById('tracker-stats-grid');
        grid.innerHTML = '';
        if (!matches || !matches.length) return;
        let k = 0, d = 0, a = 0, shots = 0, hs = 0, dmg = 0, wins = 0;
        const agents = {};
        
        matches.forEach(m => {
            const md = m.data || m;
            const p = (md.players?.all_players || md.players || []).find(x => x.puuid === puuid);
            if (!p) return;
            const s = p.stats || {};
            k += s.kills || 0; d += s.deaths || 0; a += s.assists || 0;
            hs += s.headshots || 0; shots += (s.headshots || 0) + (s.bodyshots || 0) + (s.legshots || 0);
            dmg += s.damage?.dealt || p.damage_made || 0;
            const ag = p.agent?.name || p.character;
            if (ag) agents[ag] = (agents[ag] || 0) + 1;
            
            const teamId = p.team_id || p.team;
            if (Array.isArray(md.teams)) {
                if (md.teams.find(t => t.team_id === teamId)?.won) wins++;
            } else if (md.teams) {
                if (md.teams[teamId?.toLowerCase()]?.has_won) wins++;
            }
        });
        
        const topA = Object.entries(agents).sort((a,b) => b[1] - a[1])[0] || ['-', 0];
        const stats = [
            { l: 'WIN RATE', v: `${Math.round(wins/matches.length*100)}%`, s: `${wins}W ${matches.length-wins}L` },
            { l: 'K/D', v: d ? (k/d).toFixed(2) : k, s: `${k}K ${d}D` },
            { l: 'HS %', v: shots ? ((hs/shots)*100).toFixed(1)+'%' : '0%', s: `${hs} headshots` },
            { l: 'AVG DMG', v: Math.round(dmg/matches.length), s: 'per match' },
            { l: 'TOP AGENT', v: topA[0], s: `${topA[1]} games` }
        ];
        
        stats.forEach(st => {
            const c = document.createElement('div'); c.className = 'tracker-stat-card';
            c.innerHTML = `<span class="tracker-stat-label">${st.l}</span><span class="tracker-stat-value">${st.v}</span><span class="tracker-stat-sub">${st.s}</span>`;
            grid.appendChild(c);
        });
    }

    function renderMatches(matches, puuid) {
        const list = document.getElementById('tracker-matches-list');
        list.innerHTML = '';
        if (!matches.length) return list.innerHTML = '<p style="text-align:center;padding:30px;color:var(--text-muted)">NO RECENT MATCHES</p>';
        
        matches.forEach(m => {
            const md = m.data || m;
            const p = (md.players?.all_players || md.players || []).find(x => x.puuid === puuid);
            if (!p) return;
            
            const teamId = p.team_id || p.team;
            let won = false, rw = 0, rl = 0;
            if (Array.isArray(md.teams)) {
                const mt = md.teams.find(t => t.team_id === teamId);
                if (mt) { won = mt.won; rw = mt.rounds?.won||0; rl = mt.rounds?.lost||0; }
            } else if (md.teams) {
                const tk = teamId?.toLowerCase();
                if (md.teams[tk]) { won = md.teams[tk].has_won; rw = md.teams[tk].rounds_won||0; rl = md.teams[tk].rounds_lost||0; }
            }
            
            const rc = (rw === rl && rw>0) ? 'draw' : won ? 'win' : 'loss';
            const s = p.stats || {};
            const k = s.kills||0, d = s.deaths||0, a = s.assists||0;
            const shots = (s.headshots||0)+(s.bodyshots||0)+(s.legshots||0);
            const hs = shots ? Math.round(s.headshots/shots*100)+'%' : '0%';
            
            const row = document.createElement('div');
            row.className = `tracker-match-row ${rc}`;
            row.innerHTML = `
                <div class="tracker-mr-map"><span class="tracker-mr-map-name">${md.metadata?.map?.name || md.metadata?.map || 'Map'}</span><span class="tracker-mr-map-time">Recent</span></div>
                <div class="tracker-mr-agent"><img src="${p.assets?.agent?.small || ''}"><span>${p.agent?.name || p.character}</span></div>
                <span class="tracker-mr-score ${rc}">${rw}:${rl}</span>
                <span class="tracker-mr-kda">${k}/${d}/${a}</span>
                <span class="tracker-mr-wl ${rc}">${rc.charAt(0).toUpperCase()}</span>
                <span class="tracker-mr-acs">${Math.round((s.score||0)/(rw+rl||1))}</span>
                <span class="tracker-mr-kd ${k/Math.max(d,1)>=1?'good':'bad'}">${d?(k/d).toFixed(2):k}</span>
                <span class="tracker-mr-dd">--</span>
                <span class="tracker-mr-hs">${hs}</span>
            `;
            list.appendChild(row);
        });
    }

    async function handleTrackerSearch() {
        const input = document.getElementById('tracker-search-input');
        const region = document.getElementById('tracker-region-select');
        const rid = parseRiotId(input.value);
        if (!rid) { showTrackerError('Invalid Riot ID.'); return; }
        
        hideTrackerError(); showTrackerResults(false); showTrackerLoading(true);
        document.getElementById('tracker-history').style.display = 'none';
        
        try {
            const acct = await hdevFetch(`/valorant/v1/account/${encodeURIComponent(rid.name)}/${encodeURIComponent(rid.tag)}`);
            renderPlayerCard(acct.data);
            
            let mmr;
            try { mmr = await hdevFetch(`/valorant/v3/mmr/${region.value}/pc/${encodeURIComponent(rid.name)}/${encodeURIComponent(rid.tag)}`); }
            catch(e) { mmr = await hdevFetch(`/valorant/v2/mmr/${region.value}/${encodeURIComponent(rid.name)}/${encodeURIComponent(rid.tag)}`); }
            renderRankCard(mmr.data);
            
            let matches = [];
            try { 
                const ml = await hdevFetch(`/valorant/v3/matches/${region.value}/${encodeURIComponent(rid.name)}/${encodeURIComponent(rid.tag)}?mode=competitive&size=5`); 
                matches = ml.data || []; 
            } catch(e) {}
            
            renderStats(matches, acct.data.puuid);
            renderMatches(matches, acct.data.puuid);
            
            showTrackerLoading(false); showTrackerResults(true);
            saveToHistory({ name: acct.data.name, tag: acct.data.tag, region: region.value.toUpperCase(), avatar: acct.data.card?.small || acct.data.card });
        } catch (err) { 
            showTrackerLoading(false); showTrackerError(err.message); 
            document.getElementById('tracker-history').style.display = '';
        }
    }

    const HISTORY_KEY = 'phoenix_tracker_history';
    
    function loadHistory() { 
        try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; } 
        catch(e) { return []; } 
    }

    async function saveToHistory(entry) {
        let history = loadHistory();
        history = history.filter(h => !(h.name.toLowerCase() === entry.name.toLowerCase() && h.tag.toLowerCase() === entry.tag.toLowerCase()));
        history.unshift(entry);
        history = history.slice(0, 5);
        
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        renderHistory();

        if (currentUser) {
            const userRef = doc(db, "users", currentUser.uid);
            await setDoc(userRef, { trackerHistory: history }, { merge: true });
        }
    }

    async function syncHistoryFromCloud() {
        if (!currentUser) return;
        const userRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(userRef);
        
        if (docSnap.exists()) {
            const cloudData = docSnap.data();
            if (cloudData.trackerHistory) {
                localStorage.setItem(HISTORY_KEY, JSON.stringify(cloudData.trackerHistory));
                renderHistory();
            }
        }
    }

    async function clearHistory() {
        localStorage.removeItem(HISTORY_KEY);
        if (currentUser) {
            const userRef = doc(db, "users", currentUser.uid);
            await setDoc(userRef, { trackerHistory: [] }, { merge: true });
        }
        renderHistory();
    }

    function renderHistory() {
        const h = loadHistory();
        const list = document.getElementById('tracker-history-list');
        if (!list) return;
        
        list.innerHTML = '';
        document.getElementById('tracker-history-empty').style.display = h.length ? 'none' : 'flex';
        
        h.forEach(item => {
            const div = document.createElement('div'); div.className = 'tracker-history-item';
            div.innerHTML = `<img src="${item.avatar}" class="tracker-history-avatar"><div style="flex:1"><div style="font-weight:600">${item.name} <span style="color:var(--text-muted)">#${item.tag}</span></div><div style="font-size:10px">${item.region}</div></div>`;
            div.onclick = () => { document.getElementById('tracker-search-input').value = `${item.name}#${item.tag}`; handleTrackerSearch(); };
            list.appendChild(div);
        });
    }

    const trackerSearchBtn = document.getElementById('tracker-search-btn');
    const trackerSearchInput = document.getElementById('tracker-search-input');
    const trackerClearBtn = document.getElementById('tracker-history-clear'); 
    
    if (trackerSearchBtn) trackerSearchBtn.addEventListener('click', handleTrackerSearch);
    if (trackerSearchInput) trackerSearchInput.addEventListener('keydown', e => { if(e.key === 'Enter') handleTrackerSearch(); });
    
    if (trackerClearBtn) trackerClearBtn.addEventListener('click', clearHistory);
    
    renderHistory();

    const initial = window.location.hash.replace('#', '') || 'home';
    navigateTo(initial);
});