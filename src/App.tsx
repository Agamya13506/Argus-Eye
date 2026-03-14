import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
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
import SplitScreen from './components/SplitScreen';
import LoginPage from './components/LoginPage';
import Settings from './components/Settings';
import AboutUs from './components/AboutUs';

function AppContent() {
  const [loading, setLoading] = useState(true);
  const [qaOpen, setQaOpen] = useState(false);
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'q') {
        e.preventDefault();
        setQaOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setQaOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!user && location.pathname !== '/' && location.pathname !== '/login') {
      navigate('/login', { replace: true });
    }
  }, [user, location.pathname, navigate]);

  const handleLogin = (role: UserRole) => {
    login(role);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAuthPage = location.pathname === '/' || location.pathname === '/login';

  return (
    <>
      <div className="glass-bg" />

      <AnimatePresence mode="wait">
        {loading ? (
          <Loader key="loader" onComplete={() => { }} />
        ) : (
          <div key="app" className="relative z-10 flex min-h-screen">
            {user && !isAuthPage && (
              <Sidebar activeTab="" setActiveTab={() => { }} onLogout={handleLogout} />
            )}

            <main className={`flex-1 w-full ${user && !isAuthPage ? 'ml-64' : ''}`}>
              <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                  <Route path="/" element={!user ? <LandingPage onEnterApp={() => navigate('/login')} /> : <Dashboard onNavigate={(n) => navigate(`/${n}`)} />} />
                  <Route path="/login" element={!user ? <LoginPage onLogin={handleLogin} /> : <Dashboard onNavigate={(n) => navigate(`/${n}`)} />} />
                  <Route path="/dashboard" element={user ? <Dashboard onNavigate={(n) => navigate(`/${n}`)} /> : <LoginPage onLogin={handleLogin} />} />
                  <Route path="/threat-intel" element={user ? <ThreatIntel /> : <LoginPage onLogin={handleLogin} />} />
                  <Route path="/investigation" element={user ? <Investigation /> : <LoginPage onLogin={handleLogin} />} />
                  <Route path="/network" element={user ? <NetworkGraph onNavigate={(n) => navigate(`/${n}`)} /> : <LoginPage onLogin={handleLogin} />} />
                  <Route path="/analytics" element={user ? <Analytics onNavigate={(n) => navigate(`/${n}`)} /> : <LoginPage onLogin={handleLogin} />} />
                  <Route path="/compliance" element={user ? <Compliance /> : <LoginPage onLogin={handleLogin} />} />
                  <Route path="/simulator" element={user ? <Simulator /> : <LoginPage onLogin={handleLogin} />} />
                  <Route path="/splitscreen" element={user ? <SplitScreen /> : <LoginPage onLogin={handleLogin} />} />
                  <Route path="/settings" element={user ? <Settings /> : <LoginPage onLogin={handleLogin} />} />
                  <Route path="/about" element={user ? <AboutUs /> : <LoginPage onLogin={handleLogin} />} />
                </Routes>
              </AnimatePresence>
            </main>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {qaOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setQaOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="p-8 rounded-2xl glass-panel relative max-w-2xl w-full mx-4 border border-rose-500/20 shadow-[0_0_80px_rgba(225,29,72,0.15)]"
              onClick={e => e.stopPropagation()}
            >
              <button className="absolute top-4 right-5 text-slate-400 hover:text-white" onClick={() => setQaOpen(false)}>✕</button>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
                <span className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-black">?</span>
                Argus Eye Q&A
              </h2>
              <div className="space-y-4">
                <div className="glass-card p-4 rounded-xl border border-white/5">
                  <p className="text-rose-400 font-bold mb-1">Q: How does the ML pipeline work?</p>
                  <p className="text-slate-300 text-sm leading-relaxed">A: The pipeline uses a stacked ensemble of XGBoost, LightGBM, and CatBoost with a Logistic Regression meta-learner. LIME adds explainability per transaction.</p>
                </div>
                <div className="glass-card p-4 rounded-xl border border-white/5">
                  <p className="text-rose-400 font-bold mb-1">Q: Is this a real live dashboard?</p>
                  <p className="text-slate-300 text-sm leading-relaxed">A: Yes! The system connects to a real FastAPI backend that serves inference via ML. The feed subscribes to an Appwrite Realtime DB stream.</p>
                </div>
                <div className="glass-card p-4 rounded-xl border border-white/5">
                  <p className="text-rose-400 font-bold mb-1">Q: Who built this?</p>
                  <p className="text-slate-300 text-sm leading-relaxed">A: Built by team XLNC for the Decipher Hackathon FinTech track, focusing on user-first, explainable fraud prevention.</p>
                </div>
              </div>
              <div className="mt-8 pt-4 border-t border-white/10 text-center">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Press ESC to close</p>
              </div>
            </motion.div>
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
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
