import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiCall, getToken, setToken, clearToken } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [profileSidebarOpen, setProfileSidebarOpen] = useState(false);

    // Check for existing JWT session on mount
    useEffect(() => {
        async function checkAuth() {
            const token = getToken();
            if (token) {
                try {
                    const data = await apiCall('GET', '/api/auth/me');
                    setCurrentUser(data.user);
                } catch (e) {
                    clearToken();
                    setCurrentUser(null);
                }
            }
            setLoading(false);
        }
        checkAuth();
    }, []);

    // Control body overflow for profile sidebar
    useEffect(() => {
        if (profileSidebarOpen) {
            document.body.classList.add('profile-open');
        } else {
            document.body.classList.remove('profile-open');
        }
        return () => document.body.classList.remove('profile-open');
    }, [profileSidebarOpen]);

    const loginWithEmail = useCallback(async (email, password) => {
        const data = await apiCall('POST', '/api/auth/login', { email, password });
        setToken(data.token);
        setCurrentUser(data.user);
        return data.user;
    }, []);

    const registerWithEmail = useCallback(async (email, password) => {
        const data = await apiCall('POST', '/api/auth/register', { email, password });
        setToken(data.token);
        setCurrentUser(data.user);
        return data.user;
    }, []);

    const loginWithGoogle = useCallback(async (tokenResponse) => {
        // Use the access token to get user info
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        });
        const userInfo = await userInfoRes.json();

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
        setCurrentUser(data.user);
        return data.user;
    }, []);

    const loginWithDiscord = useCallback(async (code, redirectUri) => {
        const data = await apiCall('POST', '/api/auth/discord', { code, redirectUri });
        setToken(data.token);
        setCurrentUser(data.user);
        return data.user;
    }, []);

    const linkGoogle = useCallback(async (tokenResponse) => {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        });
        const userInfo = await userInfoRes.json();

        const data = await apiCall('POST', '/api/user/link/google', {
            googleUser: { sub: userInfo.sub }
        });
        setCurrentUser(data.user);
        return data.user;
    }, []);

    const linkDiscord = useCallback(async (code, redirectUri) => {
        const data = await apiCall('POST', '/api/user/link/discord', { code, redirectUri });
        setCurrentUser(data.user);
        return data.user;
    }, []);

    const unlinkGoogle = useCallback(async () => {
        const data = await apiCall('DELETE', '/api/user/link/google');
        setCurrentUser(data.user);
        return data.user;
    }, []);

    const unlinkDiscord = useCallback(async () => {
        const data = await apiCall('DELETE', '/api/user/link/discord');
        setCurrentUser(data.user);
        return data.user;
    }, []);

    const logout = useCallback(() => {
        clearToken();
        setCurrentUser(null);
        setProfileSidebarOpen(false);
    }, []);

    const updateUser = useCallback((user) => {
        setCurrentUser(user);
    }, []);

    const openProfileSidebar = useCallback(() => setProfileSidebarOpen(true), []);
    const closeProfileSidebar = useCallback(() => setProfileSidebarOpen(false), []);

    return (
        <AuthContext.Provider value={{
            currentUser, loading,
            loginWithEmail, registerWithEmail, loginWithGoogle, loginWithDiscord,
            linkGoogle, linkDiscord, unlinkGoogle, unlinkDiscord, logout, updateUser,
            profileSidebarOpen, openProfileSidebar, closeProfileSidebar
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
}
