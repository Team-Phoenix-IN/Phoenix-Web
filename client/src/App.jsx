import { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import LoginModal from './components/LoginModal';
import ProfileSidebar from './components/ProfileSidebar';
import HomePage from './pages/HomePage';
import RostersPage from './pages/RostersPage';
import CreatorsPage from './pages/CreatorsPage';
import TrackerPage from './pages/TrackerPage';
import ShopPage from './pages/ShopPage';
import AboutPage from './pages/AboutPage';
import SettingsPage from './pages/SettingsPage';
import './style.css';

function ScrollToTopOnNav() {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
}

function AppContent() {
    useEffect(() => {
        // Remove loading state
        document.body.classList.remove('is-loading');
    }, []);

    return (
        <>
            <ScrollToTopOnNav />
            <div id="app-wrapper">
                <Sidebar />
                <Navbar />
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/rosters" element={<RostersPage />} />
                    <Route path="/creators" element={<CreatorsPage />} />
                    <Route path="/tracker" element={<TrackerPage />} />
                    <Route path="/shop" element={<ShopPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                </Routes>
                <Footer />
            </div>
            <ScrollToTop />
            <ProfileSidebar />
            <LoginModal />
        </>
    );
}

export default function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Router>
                    <AppContent />
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}
