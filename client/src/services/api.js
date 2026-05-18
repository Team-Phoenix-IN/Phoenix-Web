// ─── API Client (replaces Firebase SDK) ───
const API_BASE = window.location.origin;
const TOKEN_KEY = 'phoenix_auth_token';

export function getToken() { return localStorage.getItem(TOKEN_KEY); }
export function setToken(t) { localStorage.setItem(TOKEN_KEY, t); }
export function clearToken() { localStorage.removeItem(TOKEN_KEY); }

export async function apiCall(method, path, body, isFormData) {
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

// ─── Valorant Tracker API ───
export const HDEV_BASE = 'https://api.henrikdev.xyz';
export const HDEV_API_KEY = 'HDEV-67ef927d-d7f2-47f4-bb92-bf8919370782';
export const YT_API_KEY = 'AIzaSyAeiq_e8lNlG4LJarTg1i8BHuv_wTEvlz8';
export const HISTORY_KEY = 'phoenix_tracker_history';

export const CREATOR_CHANNELS = [
    { channelId: 'UC6rMH3tbkLW5b8kBA-k6vWg', handle: 'ozen_gg', containerId: 'creator-ozen-videos' }
];
export const VIDEOS_PER_CHANNEL = 3;

export function getRankIconUrl(tierId) {
    return !tierId || tierId <= 0 ? '' : `https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/${tierId}/largeicon.png`;
}

export function parseRiotId(input) {
    const trimmed = input.trim();
    const idx = trimmed.lastIndexOf('#');
    if (idx <= 0 || idx === trimmed.length - 1) return null;
    return { name: trimmed.substring(0, idx).trim(), tag: trimmed.substring(idx + 1).trim() };
}

export async function hdevFetch(path) {
    const res = await fetch(`${HDEV_BASE}${path}`, { headers: { Authorization: HDEV_API_KEY } });
    if (res.status === 401 || res.status === 403) throw new Error('Invalid API key.');
    if (res.status === 404) throw new Error('Player not found. Check the Riot ID and region.');
    if (res.status === 429) throw new Error('Rate limit reached.');
    if (!res.ok) throw new Error(`API error (${res.status}). Try again.`);
    return res.json();
}

export function getTimeAgo(dateStr) {
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

export function getTimeAgoLong(date) {
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
