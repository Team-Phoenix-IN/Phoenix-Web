import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { IconGoogle } from './icons/SvgIcons';

export default function LoginModal() {
    const { loginModalOpen, closeLoginModal, loginWithEmail, registerWithEmail, loginWithGoogle } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    if (!loginModalOpen) return null;

    const handleEmailLogin = async () => {
        try {
            setErrorMsg('');
            await loginWithEmail(email, password);
            closeLoginModal();
            setEmail(''); setPassword('');
        } catch (err) { setErrorMsg(err.message); }
    };

    const handleEmailSignup = async () => {
        try {
            setErrorMsg('');
            await registerWithEmail(email, password);
            closeLoginModal();
            setEmail(''); setPassword('');
        } catch (err) { setErrorMsg(err.message); }
    };

    const handleGoogleLogin = () => {
        const gcid = 'YOUR_GOOGLE_CLIENT_ID';
        if (typeof google === 'undefined' || !google.accounts) {
            setErrorMsg('Google Sign-In is not available.');
            return;
        }
        const client = google.accounts.oauth2.initTokenClient({
            client_id: gcid,
            scope: 'email profile',
            callback: async (tokenResponse) => {
                if (tokenResponse.error) {
                    setErrorMsg('Google login cancelled.');
                    return;
                }
                try {
                    await loginWithGoogle(tokenResponse);
                    closeLoginModal();
                    setEmail(''); setPassword('');
                } catch (err) { setErrorMsg(err.message); }
            }
        });
        client.requestAccessToken();
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) closeLoginModal();
    };

    return (
        <div className="login-modal-overlay active" onClick={handleOverlayClick}>
            <div className="login-modal-content">
                <button className="profile-close" style={{ position: 'absolute', top: '15px', right: '15px' }}
                    onClick={closeLoginModal}>&times;</button>
                <h2 className="login-modal-title">Welcome Back</h2>
                <div className="login-form">
                    <input type="email" className="tracker-search-input" placeholder="Email Address"
                        style={{ paddingLeft: '16px', marginBottom: '10px' }}
                        value={email} onChange={e => setEmail(e.target.value)} />
                    <input type="password" className="tracker-search-input" placeholder="Password"
                        style={{ paddingLeft: '16px', marginBottom: '15px' }}
                        value={password} onChange={e => setPassword(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleEmailLogin(); }} />
                    <button className="btn-primary" style={{ width: '100%', marginBottom: '10px' }}
                        onClick={handleEmailLogin}>LOGIN WITH EMAIL</button>
                    <button className="btn-outline" style={{ width: '100%', marginBottom: '20px' }}
                        onClick={handleEmailSignup}>CREATE ACCOUNT</button>
                </div>
                <div className="login-divider-row">
                    <hr className="login-divider-line" />
                    <span className="login-divider-text">OR</span>
                    <hr className="login-divider-line" />
                </div>
                <button className="btn-nav-action" onClick={handleGoogleLogin}
                    style={{
                        width: '100%', maxWidth: 'none', justifyContent: 'center',
                        background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)', borderRadius: '50px', padding: '12px 28px',
                        fontWeight: 700, letterSpacing: '2px', fontSize: '11px'
                    }}>
                    <IconGoogle style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                    CONTINUE WITH GOOGLE
                </button>
                {errorMsg && <p className="login-error-msg" style={{ display: 'block' }}>{errorMsg}</p>}
            </div>
        </div>
    );
}
