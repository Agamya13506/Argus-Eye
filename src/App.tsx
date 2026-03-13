import { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth, UserRole } from './context/AuthContext';
import Loader from './components/Loader';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ThreatIntel from './components/ThreatIntel';
import Investigation from './components/Investigation';
import LandingPage from './components/LandingPage';
import NetworkGraph from './components/NetworkGraph';
import Analytics from './components/Analytics';
import Compliance from './components/Compliance';
import Simulator from './components/Simulator';
import LoginPage from './components/LoginPage';
import Settings from './components/Settings';

function AppContent() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('landing');
  const { user, login, logout } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  /* When user becomes null (logout), reset to login page */
  useEffect(() => {
    if (!user && activeTab !== 'landing' && activeTab !== 'login') {
      setActiveTab('login');
    }
  }, [user]);

  const handleLogin = (role: UserRole) => {
    login(role);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    logout();
    setActiveTab('login');
  };

  return (
    <>
      <div className="glass-bg" />

      <AnimatePresence mode="wait">
        {loading ? (
          <Loader key="loader" onComplete={() => { }} />
        ) : (
          <div key="app" className="relative z-10 flex min-h-screen">
            {activeTab !== 'landing' && user && (
              <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
            )}

            <main className={`flex-1 w-full ${activeTab !== 'landing' && user ? 'ml-64' : ''}`}>
              <AnimatePresence mode="wait">
                {activeTab === 'landing' && !user && (
                  <LandingPage key="landing" onEnterApp={() => setActiveTab('login')} />
                )}
                {activeTab === 'login' && !user && (
                  <LoginPage key="login" onLogin={handleLogin} />
                )}
                {user && activeTab === 'dashboard' && <Dashboard key="dashboard" />}
                {user && activeTab === 'threat-intel' && (
                  <div key="threat-intel" className="p-8 min-h-screen">
                    <ThreatIntel />
                  </div>
                )}
                {user && activeTab === 'investigation' && <Investigation key="investigation" />}
                {user && activeTab === 'network' && <NetworkGraph key="network" />}
                {user && activeTab === 'analytics' && <Analytics key="analytics" />}
                {user && activeTab === 'compliance' && <Compliance key="compliance" />}
                {user && activeTab === 'simulator' && <Simulator key="simulator" />}
                {user && activeTab === 'settings' && <Settings key="settings" />}
              </AnimatePresence>
            </main>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
