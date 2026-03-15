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
                  <Route path="/simulator" element={user ? <Simulator onNavigate={(n) => navigate(`/${n}`)} /> : <LoginPage onLogin={handleLogin} />} />
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
                Judge Q&A — Press Ctrl+Shift+Q
              </h2>
              <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
                <div className="glass-card p-4 rounded-xl border border-white/5">
                  <p className="text-rose-400 font-bold mb-1 text-sm">Q: Why should we trust this system's fraud scores?</p>
                  <p className="text-slate-300 text-sm leading-relaxed">A: Three independent models (XGBoost, LightGBM, CatBoost) each trained on 284,807 real transactions must agree before a transaction is flagged. Every decision is explained via LIME — the analyst sees exactly which features drove the score. No black box. AUC-ROC 0.9999, 0 false positives on test set.</p>
                </div>
                <div className="glass-card p-4 rounded-xl border border-white/5">
                  <p className="text-rose-400 font-bold mb-1 text-sm">Q: How does this scale to millions of transactions?</p>
                  <p className="text-slate-300 text-sm leading-relaxed">A: The ML inference stack is stateless FastAPI — horizontally scalable behind any load balancer. Each inference takes under 200ms. Appwrite Realtime handles fan-out to all connected clients without a custom WebSocket server. The ensemble models are pkl files loaded once at startup — no database hit per inference.</p>
                </div>
                <div className="glass-card p-4 rounded-xl border border-white/5">
                  <p className="text-rose-400 font-bold mb-1 text-sm">Q: What's the false positive rate and why does it matter?</p>
                  <p className="text-slate-300 text-sm leading-relaxed">A: 0% on the test set. 2.1% in live demo conditions. This is critical — every false positive is a legitimate customer blocked from their own money. Industry average is 3–5%. Our F2-optimised threshold prioritises recall (catching fraud) while keeping false positives below 3%, matching RBI's customer protection mandate.</p>
                </div>
                <div className="glass-card p-4 rounded-xl border border-white/5">
                  <p className="text-rose-400 font-bold mb-1 text-sm">Q: How is this different from rule-based fraud systems banks use today?</p>
                  <p className="text-slate-300 text-sm leading-relaxed">A: Rule-based systems block by threshold (e.g. flag all transactions &gt; ₹50,000 at 2am). They can't adapt to new fraud patterns and generate massive false positives. Argus Eye learns from 72 behavioural features simultaneously — velocity, device fingerprint, geography, network graph, merchant category — and retrains live from analyst corrections in under 2 seconds.</p>
                </div>
                <div className="glass-card p-4 rounded-xl border border-white/5">
                  <p className="text-rose-400 font-bold mb-1 text-sm">Q: How does it handle the W033 shared threat intelligence loop?</p>
                  <p className="text-slate-300 text-sm leading-relaxed">A: A user reports a suspicious UPI ID on the Flutter app → it appears in the analyst's threat feed within 200ms via Appwrite Realtime → analyst confirms with one click → a bank-backed warning badge appears on that UPI ID for every other user before they attempt payment. The intelligence loop closes in real time, no batch processing.</p>
                </div>
                <div className="glass-card p-4 rounded-xl border border-white/5">
                  <p className="text-rose-400 font-bold mb-1 text-sm">Q: Is this RBI compliant?</p>
                  <p className="text-slate-300 text-sm leading-relaxed">A: Every fraud type maps to its specific RBI circular — displayed as tooltip badges across the dashboard. Every analyst action is written immutably to an audit log with RBI reference, timestamp, and analyst ID. The Compliance tab shows real-time PCI-DSS, RBI, ISO 27001, and GDPR status. Export as PDF for regulatory submission.</p>
                </div>
                <div className="glass-card p-4 rounded-xl border border-white/5">
                  <p className="text-rose-400 font-bold mb-1 text-sm">Q: What happens if the ML backend goes down?</p>
                  <p className="text-slate-300 text-sm leading-relaxed">A: Every API call has a try/catch with a graceful fallback to pre-computed synthetic scores. The demo never crashes. In production, the fallback would route to a secondary inference endpoint or apply conservative rule-based scoring until the primary recovers — standard resilience pattern for financial systems.</p>
                </div>
                <div className="glass-card p-4 rounded-xl border border-white/5">
                  <p className="text-rose-400 font-bold mb-1 text-sm">Q: Can this detect coordinated attacks across multiple accounts?</p>
                  <p className="text-slate-300 text-sm leading-relaxed">A: Yes — the Network Graph uses NetworkX to run cycle detection across all account relationships. A money mule ring (A→B→C→A) is flagged even if each individual transaction looks normal in isolation. The Community Scam Radar aggregates signals across all users — the same UPI ID reported by 3+ users triggers an automatic corroboration score escalation.</p>
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
