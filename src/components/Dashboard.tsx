import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import CountUp from 'react-countup';
import {
  Activity, AlertTriangle, Shield, TrendingUp, TrendingDown,
  ArrowUpRight, DollarSign, Eye, Clock, Server, Cpu, Database, Wifi, Play, Square
} from 'lucide-react';
import api, { appwriteClient } from '../services/api';

const mockStats = {
  totalTransactions: 1245600,
  fraudDetected: 4231,
  fraudPrevented: 847000000,
  threatsIdentified: 156,
  confirmedThreats: 89,
  openCases: 24,
  totalCases: 312,
};

const mockTransactions = [
  { sender: 'user_492', receiver: 'merch_88', amount: 45000, score: 85, type: 'SIM Swap', status: 'flagged' },
  { sender: 'user_112', receiver: 'user_99', amount: 1200, score: 12, type: 'None', status: 'clear' },
  { sender: 'user_77', receiver: 'merch_12', amount: 8500, score: 65, type: 'Suspicious', status: 'review' },
  { sender: 'user_44', receiver: 'user_8', amount: 120000, score: 92, type: 'Account Takeover', status: 'blocked' },
  { sender: 'user_321', receiver: 'merch_55', amount: 75000, score: 78, type: 'Card Testing', status: 'flagged' },
  { sender: 'user_89', receiver: 'merch_33', amount: 56000, score: 88, type: 'Phishing', status: 'blocked' },
];

function formatUptime(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

interface Alert {
  id: string;
  type: 'velocity' | 'geo' | 'sim' | 'circular' | 'social';
  title: string;
  description: string;
  timestamp: number;
}

interface DashboardProps {
  onNavigate?: (tab: string) => void;
}
export default function Dashboard({ onNavigate }: DashboardProps) {
  const [stats, setStats] = useState(mockStats);
  const [transactions, setTransactions] = useState(mockTransactions);
  const [health, setHealth] = useState({
    api_latency_ms: null as number | null,
    tps: null as number | null,
    uptime_seconds: null as number | null,
    false_positive_rate: null as number | null,
  });
  const [demoMode, setDemoMode] = useState(false);
  const [demoAlerts, setDemoAlerts] = useState<Alert[]>([]);
  const [manualFire, setManualFire] = useState(false);
  const [fraudSaved, setFraudSaved] = useState(0);
  const [recentBlock, setRecentBlock] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, txRes] = await Promise.all([api.getStats(), api.getTransactions()]);
        if (statsRes?.totalTransactions) setStats(statsRes);
        if (Array.isArray(txRes) && txRes.length > 0) setTransactions(txRes);
      } catch (e) { }
    }
    fetchData();
  }, []);

  useEffect(() => {
    const poll = async () => {
      const t0 = Date.now();
      try {
        const data = await api.health();
        setHealth({ ...data, api_latency_ms: Date.now() - t0 });
      } catch (e) { }
    };
    poll();
    const interval = setInterval(poll, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let unsubscribe: () => void;
    try {
      unsubscribe = appwriteClient.subscribe(
        'databases/argus_eye_db/collections/transactions/documents',
        (response: any) => {
          if (response.events.includes('databases.*.collections.*.documents.*.create')) {
            setTransactions((prev: any[]) => [response.payload, ...prev].slice(0, 50));
            if (response.payload.status === 'blocked') {
              const amount = response.payload.amount || 0;
              setStats((prev: any) => ({
                ...prev,
                fraudDetected: prev.fraudDetected + 1,
                fraudPrevented: prev.fraudPrevented + amount
              }));
              setFraudSaved(prev => prev + amount);
              setRecentBlock(amount);
              setTimeout(() => setRecentBlock(null), 2000);
            }
            setStats((prev: any) => ({
              ...prev,
              totalTransactions: prev.totalTransactions + 1
            }));
          }
        }
      );
      console.log('Appwrite Realtime: subscribed to transactions');
    } catch (e: any) {
      console.error('Appwrite Realtime failed:', e.message);
    }
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  const runDemoScenario = (scenario: string) => {
    const alertId = `alert-${Date.now()}`;
    let newAlert: Alert;
    
    switch (scenario) {
      case 'velocity':
        newAlert = {
          id: alertId,
          type: 'velocity',
          title: 'VELOCITY ATTACK',
          description: '23 micro-transactions in 58 seconds from sim_user_001. Auto-blocked.',
          timestamp: Date.now()
        };
        api.createTransaction({
          sender: 'sim_user_001',
          receiver: 'sim_merch_crypto',
          amount: 2500,
          score: 91,
          type: 'Card Testing',
          status: 'blocked'
        });
        break;
      case 'geo':
        newAlert = {
          id: alertId,
          type: 'geo',
          title: 'GEOGRAPHIC IMPOSSIBILITY',
          description: 'Mumbai → Delhi: 1,156 km in 8 minutes (8,670 km/h). Account takeover probable.',
          timestamp: Date.now()
        };
        api.createTransaction({
          sender: 'user_geo_001',
          receiver: 'merch_delhi_44',
          amount: 84000,
          score: 95,
          type: 'Account Takeover',
          status: 'flagged'
        });
        break;
      case 'sim':
        newAlert = {
          id: alertId,
          type: 'sim',
          title: 'SIM SWAP WARNING',
          description: 'New device detected. ₹84,000 transfer attempted at 3:14am.',
          timestamp: Date.now()
        };
        api.createTransaction({
          sender: 'user_sim_99',
          receiver: 'merch_finance_7',
          amount: 84000,
          score: 88,
          type: 'SIM Swap',
          status: 'flagged'
        });
        break;
      case 'circular':
        newAlert = {
          id: alertId,
          type: 'circular',
          title: 'CIRCULAR FLOW CONFIRMED',
          description: 'user_44 → user_8 → user_89 → user_44. Total: ₹1,77,000. Money laundering pattern detected.',
          timestamp: Date.now()
        };
        window.dispatchEvent(new CustomEvent('highlightCycle', {
          detail: { nodes: ['user_44', 'user_8', 'user_89'] }
        }));
        break;
      case 'social':
        newAlert = {
          id: alertId,
          type: 'social',
          title: 'SOCIAL ENGINEERING',
          description: 'Round number, new recipient, 11pm. High manipulation probability.',
          timestamp: Date.now()
        };
        api.createTransaction({
          sender: 'user_social_12',
          receiver: 'new_recipient_888',
          amount: 50000,
          score: 76,
          type: 'Phishing',
          status: 'flagged'
        });
        break;
      default:
        return;
    }
    
    setDemoAlerts(prev => [newAlert, ...prev].slice(0, 3));
    setTimeout(() => {
      setDemoAlerts(prev => prev.filter(a => a.id !== alertId));
    }, 8000);
  };

  const startDemo = () => {
    setDemoMode(true);
    setDemoAlerts([]);
    
    setTimeout(() => runDemoScenario('velocity'), 5000);
    setTimeout(() => runDemoScenario('geo'), 15000);
    setTimeout(() => runDemoScenario('sim'), 28000);
    setTimeout(() => runDemoScenario('circular'), 45000);
    setTimeout(() => runDemoScenario('social'), 60000);
  };

  const stopDemo = () => {
    setDemoMode(false);
    setDemoAlerts([]);
    window.dispatchEvent(new CustomEvent('highlightCycle', { detail: { nodes: [] } }));
  };

  const statCards = [
    { label: 'TOTAL TRANSACTIONS', value: stats.totalTransactions, icon: Activity, change: '+12%', up: true, color: '#fb7185' },
    { label: 'FRAUD DETECTED', value: stats.fraudDetected, icon: AlertTriangle, change: '-5%', up: false, color: '#f43f5e' },
    { label: 'FRAUD PREVENTED', value: stats.fraudPrevented + fraudSaved, prefix: '₹', icon: DollarSign, change: '+8%', up: true, color: '#e11d48', recentBlock },
    { label: 'ACTIVE THREATS', value: stats.threatsIdentified, icon: Shield, change: '+3', up: true, color: '#be123c' },
  ];

  const statusColors: Record<string, { bg: string; text: string }> = {
    blocked: { bg: 'rgba(225,29,72,0.12)', text: '#fb7185' },
    flagged: { bg: 'rgba(245,158,11,0.12)', text: '#fbbf24' },
    review: { bg: 'rgba(168,85,247,0.12)', text: '#c084fc' },
    clear: { bg: 'rgba(34,197,94,0.12)', text: '#4ade80' },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="p-8 min-h-screen"
    >
      {/* System Health Bar */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring' }}
        className="glass-card rounded-2xl p-3 mb-8 flex items-center justify-between overflow-hidden"
      >
        <div className="flex items-center gap-8 px-4">
          {[
            { icon: Server, label: 'API:', val: health.api_latency_ms ? `${health.api_latency_ms}ms` : '...', ok: health.api_latency_ms !== null && health.api_latency_ms < 150 },
            { icon: Cpu, label: 'TPS:', val: health.tps ? health.tps.toLocaleString() : '...', ok: true },
            { icon: Activity, label: 'False Pos Rate:', val: health.false_positive_rate ? `${health.false_positive_rate}%` : '...', ok: true },
            { icon: Wifi, label: 'Uptime:', val: health.uptime_seconds ? formatUptime(health.uptime_seconds) : '...', ok: true },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="flex items-center gap-2 text-xs"
            >
              <item.icon className="w-3.5 h-3.5" style={{ color: 'var(--muted)' }} />
              <span style={{ color: 'var(--muted)' }}>{item.label}</span>
              <span className="font-bold" style={{ 
                color: item.label.includes('API:') 
                  ? (item.ok ? '#4ade80' : health.api_latency_ms && health.api_latency_ms > 150 ? '#fb7185' : '#fbbf24')
                  : '#4ade80' 
              }}>{item.val}</span>
            </motion.div>
          ))}
        </div>
        <div className="flex items-center gap-2 px-4">
          <div className="w-2 h-2 rounded-full bg-emerald-400 pulse-glow" />
          <span className="text-xs font-bold text-emerald-400">System Active</span>
        </div>
      </motion.div>

      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-1 flex items-center gap-3" style={{ color: 'var(--text)' }}>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5, delay: 0.3 }}
              >
                <Activity className="w-8 h-8" style={{ color: 'var(--accent)' }} />
              </motion.span>
              Overview
            </h2>
            <p style={{ color: 'var(--muted)' }}>Real-time fraud monitoring and analytics.</p>
          </div>
          <div className="flex items-center gap-3">
            {demoMode && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30"
              >
                DEMO MODE ACTIVE
              </motion.span>
            )}
            {!demoMode ? (
              <button
                onClick={startDemo}
                className="px-4 py-2 rounded-xl glass-card flex items-center gap-2 text-sm font-medium transition-colors hover:bg-white/10"
                style={{ color: 'var(--accent)' }}
              >
                <Play className="w-4 h-4" /> Start Demo
              </button>
            ) : (
              <button
                onClick={stopDemo}
                className="px-4 py-2 rounded-xl glass-card flex items-center gap-2 text-sm font-medium transition-colors hover:bg-white/10"
                style={{ color: '#fb7185' }}
              >
                <Square className="w-4 h-4" /> Stop Demo
              </button>
            )}
          </div>
        </div>
        {demoMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 glass-card p-3 rounded-xl flex gap-2 flex-wrap"
          >
            <span className="text-xs" style={{ color: 'var(--muted)' }}>Fire Now:</span>
            {['velocity', 'geo', 'sim', 'circular', 'social'].map(s => (
              <button
                key={s}
                onClick={() => runDemoScenario(s)}
                className="px-2 py-1 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors"
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </motion.div>
        )}
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 stagger-children">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              whileHover={{ y: -6, scale: 1.02 }}
              className="glass-card p-5 rounded-2xl group relative overflow-hidden"
            >
              {/* Background glow */}
              <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle, ${stat.color}15, transparent)` }} />

              <div className="flex items-center justify-between mb-3 relative z-10">
                <motion.div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${stat.color}18` }}
                  whileHover={{ rotate: 10, scale: 1.1 }}
                >
                  <Icon className="w-5 h-5" style={{ color: stat.color }} />
                </motion.div>
                <div className={`flex items-center gap-1 text-xs font-bold ${stat.up ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {stat.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {stat.change}
                </div>
              </div>

              <p className="text-[10px] font-bold tracking-widest mb-1 relative z-10" style={{ color: 'var(--muted)' }}>
                {stat.label}
              </p>
              <p className="text-2xl font-black tracking-tight relative z-10 number-glow" style={{ color: 'var(--text)' }}>
                {stat.prefix || ''}
                <CountUp end={stat.value} duration={1} separator="," delay={0.3 + i * 0.1} />
              </p>
              {stat.label === 'FRAUD PREVENTED' && recentBlock && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-xs font-bold text-emerald-400 mt-1"
                >
                  +₹{recentBlock.toLocaleString()} prevented
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Transaction Feed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-panel rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <Clock className="w-5 h-5" style={{ color: 'var(--accent)' }} />
            Live Transaction Feed
          </h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-rose-500 pulse-glow" />
            <span className="text-xs font-medium" style={{ color: 'var(--accent)' }}>Live</span>
          </div>
        </div>

        <div className="space-y-3">
          {transactions.slice(0, 6).map((tx, i) => {
            const statusStyle = statusColors[tx.status] || statusColors.clear;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.08, type: 'spring', bounce: 0.2 }}
                whileHover={{ x: 6 }}
                className="glass-card p-4 rounded-xl flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: statusStyle.bg }}>
                    <Eye className="w-4 h-4" style={{ color: statusStyle.text }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                      {tx.sender} → {tx.receiver}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>{tx.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>₹{tx.amount.toLocaleString()}</p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>Score: {tx.score}</p>
                  </div>
                  <span
                    className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider"
                    style={{ background: statusStyle.bg, color: statusStyle.text }}
                  >
                    {tx.status}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Demo Alerts */}
      {demoAlerts.length > 0 && (
        <div className="fixed bottom-8 right-8 z-50 space-y-3 max-w-sm">
          {demoAlerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ type: 'spring', bounce: 0.3 }}
              className="glass-card p-4 rounded-xl border-l-4"
              style={{
                borderLeftColor: alert.type === 'velocity' ? '#f97316' : 
                                alert.type === 'geo' ? '#f97316' : 
                                alert.type === 'sim' ? '#f43f5e' : 
                                alert.type === 'circular' ? '#7c3aed' : '#f59e0b',
                background: 'rgba(15,23,42,0.95)'
              }}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle 
                  className="w-5 h-5 flex-shrink-0 mt-0.5" 
                  style={{ 
                    color: alert.type === 'velocity' || alert.type === 'geo' ? '#f97316' : 
                          alert.type === 'sim' ? '#f43f5e' : 
                          alert.type === 'circular' ? '#7c3aed' : '#f59e0b'
                  }} 
                />
                <div>
                  <h4 className="text-sm font-bold mb-1" style={{ color: 'var(--text)' }}>{alert.title}</h4>
                  <p className="text-xs mb-2" style={{ color: 'var(--muted)' }}>{alert.description}</p>
                  <button
                    className="text-xs font-medium"
                    style={{ color: 'var(--accent)' }}
                    onClick={() => {
                      if (alert.type === 'circular') {
                        window.dispatchEvent(new CustomEvent('highlightCycle', {
                          detail: { nodes: ['user_44', 'user_8', 'user_89'] }
                        }));
                        onNavigate?.('network');
                      } else {
                        onNavigate?.('investigation');
                      }
                    }}
                  >
                    Investigate →
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
