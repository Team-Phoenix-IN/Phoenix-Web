import { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Outlet } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ProfileSidebar from './components/ProfileSidebar';
import HomePage from './pages/HomePage';
import RostersPage from './pages/RostersPage';
import CreatorsPage from './pages/CreatorsPage';
import TrackerPage from './pages/TrackerPage';
import ShopPage from './pages/ShopPage';
import AboutPage from './pages/AboutPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import './style.css';

function ScrollToTopOnNav() {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
}

/** Main layout with navbar, sidebar, footer */
function MainLayout() {
    return (
        <>
            <div id="app-wrapper">
                <Sidebar />
                <Navbar />
                <Outlet />
                <Footer />
            </div>
            <ScrollToTop />
            <ProfileSidebar />
        </>
    );
}

function AppContent() {
    const { currentUser } = useAuth();

    useEffect(() => {
        // Remove loading state
        document.body.classList.remove('is-loading');
    }, []);

    // Dynamically inject background particle styling based on user preferences
    useEffect(() => {
        if (currentUser && currentUser.preferences) {
            const { particles } = currentUser.preferences;

            // Set particle background body class indicator
            if (particles === false) {
                document.body.classList.add('disable-bg-particles');
            } else {
                document.body.classList.remove('disable-bg-particles');
            }
        } else {
            // Default/Logged-out settings
            document.body.classList.remove('disable-bg-particles');
        }
    }, [currentUser]);

    return (
        <>
            <ScrollToTopOnNav />
            <Routes>
                {/* Standalone login page — no navbar/footer */}
                <Route path="/login" element={<LoginPage />} />

                {/* All other pages — wrapped with navbar, sidebar, footer */}
                <Route element={<MainLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/rosters" element={<RostersPage />} />
                    <Route path="/creators" element={<CreatorsPage />} />
                    <Route path="/tracker" element={<TrackerPage />} />
                    <Route path="/shop" element={<ShopPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                </Route>
            </Routes>
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
