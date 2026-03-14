import { motion } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import CountUp from 'react-countup';
import {
  Activity, AlertTriangle, Shield, TrendingUp, TrendingDown,
  ArrowUpRight, DollarSign, Eye, Clock, Server, Cpu, Database, Wifi, Play, Square
} from 'lucide-react';
import api, { appwriteClient } from '../services/api';
import { getMlHealth, scoreTransaction, mlFetch } from '../services/mlApi';

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
  rbiRef: string;
  timestamp: number;
  sender: string;
  receiver: string;
  amount: number;
  caseTitle: string;
  fraudType: string;
}

interface DashboardProps {
  onNavigate?: (tab: string) => void;
  [key: string]: any;
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
  const [mlHealth, setMlHealth] = useState<{
    ml_inference_ms: number | null;
    model_loaded: boolean | null;
  }>({ ml_inference_ms: null, model_loaded: null });
  const [demoMode, setDemoMode] = useState(false);
  const [demoAlerts, setDemoAlerts] = useState<Alert[]>([]);
  const [liveFeedActive, setLiveFeedActive] = useState(false);
  const [fraudSaved, setFraudSaved] = useState(0);
  const fraudSavedRef = useRef(0);
  const demoTimeoutIds = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [recentBlock, setRecentBlock] = useState<number | null>(null);
  const subscribedRef = useRef(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, txRes] = await Promise.all([api.getStats(), api.getTransactions()]);
        if (statsRes && statsRes.totalTransactions) setStats(statsRes);
        if (Array.isArray(txRes) && txRes.length > 0) setTransactions(txRes);
      } catch (e) { console.error('Error fetching initial data:', e) }
    }
    fetchData();
  }, []);

  useEffect(() => {
    const poll = async () => {
      const t0 = Date.now();
      try {
        const data = await api.health();
        setHealth({ ...data, api_latency_ms: Date.now() - t0 });

        getMlHealth().then(mlData => {
          if (mlData) {
            setMlHealth({
              ml_inference_ms: mlData.ml_inference_ms,
              model_loaded: mlData.model_loaded,
            });
          }
        });
      } catch (e) { }
    };
    poll();
    const interval = setInterval(poll, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (subscribedRef.current) return;
    subscribedRef.current = true;

    let unsubscribe: () => void;
    try {
      console.log('Setting up Appwrite realtime subscription...');
      unsubscribe = appwriteClient.subscribe(
        ['databases.argus_eye_db.collections.transactions.documents'],
        (response: any) => {
          console.log('Realtime event received:', response.events);
          if (response.events.some((e: string) => e.includes('create'))) {
            console.log('New transaction received:', response.payload);
            setTransactions((prev: any[]) => [response.payload, ...prev].slice(0, 500));
            if (response.payload.status === 'blocked') {
              const amount = response.payload.amount || 0;
              setStats((prev: any) => ({
                ...prev,
                fraudDetected: prev.fraudDetected + 1,
                fraudPrevented: prev.fraudPrevented + amount
              }));
              setFraudSaved(prev => prev + amount);
              fraudSavedRef.current += amount;
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
    console.log('runDemoScenario called with:', scenario);
    const alertId = `alert-${Date.now()}`;
    let newAlert: Alert;

    switch (scenario) {
      case 'velocity':
        newAlert = {
          id: alertId,
          type: 'velocity',
          title: 'VELOCITY ATTACK',
          description: '23 micro-transactions in 58 seconds from sim_user_001. Auto-blocked.',
          rbiRef: 'RBI/2021-22/56',
          timestamp: Date.now(),
          sender: 'sim_user_001',
          receiver: 'sim_merch_crypto',
          amount: 2500,
          caseTitle: 'Velocity Attack — sim_user_001',
          fraudType: 'Card Testing'
        };
        scoreTransaction('velocity', alertId).then(mlRes => {
          const score = mlRes?.score ?? 91;
          if (!mlRes) {
            console.warn('Velocity scenario: ML failed, using fallback score 91');
          }
          api.createTransaction({
            sender: 'sim_user_001',
            receiver: 'sim_merch_crypto',
            amount: 2500,
            score: Math.round(score),
            type: mlRes?.fraud_type?.replace(/_/g, ' ') || 'Card Testing',
            status: score >= 75 ? 'blocked' : 'flagged'
          });
          if (score >= 40) {
            api.createCase({
              title: 'Velocity Attack — sim_user_001',
              description: `23 micro-transactions in 58 seconds. ML score: ${score.toFixed(1)}. Auto-blocked.`,
              priority: score >= 75 ? 'critical' : 'high',
              status: 'open',
              amount: 2500,
            });
            api.createThreat({
              entityId: 'sim_user_001',
              entityType: 'UPI ID',
              source: 'SYSTEM',
              reports: 5,
              score: Math.round(score),
              status: score >= 75 ? 'CONFIRMED' : 'REVIEWING',
              time: 'Just now'
            });
          }
        });
        break;
      case 'geo':
        newAlert = {
          id: alertId,
          type: 'geo',
          title: 'GEOGRAPHIC IMPOSSIBILITY',
          description: 'Mumbai → Delhi: 1,156 km in 8 minutes (8,670 km/h). Account takeover probable.',
          rbiRef: 'RBI/2020-21/112',
          timestamp: Date.now(),
          sender: 'user_geo_001',
          receiver: 'merch_delhi_44',
          amount: 84000,
          caseTitle: 'Geographic Impossibility — user_geo_001',
          fraudType: 'Account Takeover'
        };
        scoreTransaction('geo_imposter', alertId).then(mlRes => {
          const score = mlRes?.score ?? 95;
          api.createTransaction({
            sender: 'user_geo_001',
            receiver: 'merch_delhi_44',
            amount: 84000,
            score: Math.round(score),
            type: mlRes?.fraud_type?.replace(/_/g, ' ') || 'Account Takeover',
            status: score >= 75 ? 'blocked' : 'flagged'
          });
          if (score >= 40) {
            api.createCase({
              title: 'Geographic Impossibility — user_geo_001',
              description: `Mumbai → Delhi in 8 min (8,670 km/h). ML score: ${score.toFixed(1)}.`,
              priority: score >= 75 ? 'critical' : 'high',
              status: 'open',
              amount: 84000,
            });
            api.createThreat({
              entityId: 'user_geo_001',
              entityType: 'UPI ID',
              source: 'SYSTEM',
              reports: 3,
              score: Math.round(score),
              status: score >= 75 ? 'CONFIRMED' : 'REVIEWING',
              time: 'Just now'
            });
          }
        });
        break;
      case 'sim':
        newAlert = {
          id: alertId,
          type: 'sim',
          title: 'SIM SWAP WARNING',
          description: 'New device detected. ₹84,000 transfer attempted at 3:14am.',
          rbiRef: 'RBI/2018-19/215',
          timestamp: Date.now(),
          sender: 'user_sim_99',
          receiver: 'merch_finance_7',
          amount: 84000,
          caseTitle: 'SIM Swap — user_sim_99',
          fraudType: 'SIM Swap'
        };
        scoreTransaction('account_takeover', alertId).then(mlRes => {
          const score = mlRes?.score ?? 88;
          api.createTransaction({
            sender: 'user_sim_99',
            receiver: 'merch_finance_7',
            amount: 84000,
            score: Math.round(score),
            type: mlRes?.fraud_type?.replace(/_/g, ' ') || 'SIM Swap',
            status: score >= 75 ? 'blocked' : 'flagged'
          });
          if (score >= 40) {
            api.createCase({
              title: 'SIM Swap — user_sim_99',
              description: `New device detected. ₹84,000 at 3:14am. ML score: ${score.toFixed(1)}.`,
              priority: score >= 75 ? 'critical' : 'high',
              status: 'open',
              amount: 84000,
            });
            api.createThreat({
              entityId: 'user_sim_99',
              entityType: 'Phone',
              source: 'SYSTEM',
              reports: 2,
              score: Math.round(score),
              status: score >= 75 ? 'CONFIRMED' : 'REVIEWING',
              time: 'Just now'
            });
          }
        });
        break;
      case 'circular':
        newAlert = {
          id: alertId,
          type: 'circular',
          title: 'CIRCULAR FLOW CONFIRMED',
          description: 'user_44 → user_8 → user_89 → user_44. Total: ₹1,77,000. Money laundering pattern detected.',
          rbiRef: 'RBI/2017-18/122 (PMLA)',
          timestamp: Date.now(),
          sender: 'user_44',
          receiver: 'user_8',
          amount: 177000,
          caseTitle: 'Circular Fund Flow — user_44 ring',
          fraudType: 'Money Mule'
        };
        onNavigate?.('network');
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('highlightCycle', {
            detail: { nodes: ['user_44', 'user_8', 'user_89'] }
          }));
        }, 600);
        scoreTransaction('mule', alertId).then(mlRes => {
          const score = mlRes?.score ?? 82;
          api.createTransaction({
            sender: 'user_44', receiver: 'user_8',
            amount: 177000, score: Math.round(score),
            type: mlRes?.fraud_type?.replace(/_/g, ' ') || 'Money Mule',
            status: score >= 75 ? 'blocked' : 'flagged'
          });
          api.createCase({
            title: 'Circular Fund Flow — user_44 ring',
            description: `user_44 → user_8 → user_89 → user_44. ₹1,77,000. ML score: ${score.toFixed(1)}.`,
            priority: 'critical', status: 'open', amount: 177000,
          });
          api.createThreat({
            entityId: 'user_44',
            entityType: 'UPI ID',
            source: 'SYSTEM',
            reports: 8,
            score: Math.round(score),
            status: 'CONFIRMED',
            time: 'Just now'
          });
        });
        break;
      case 'social':
        newAlert = {
          id: alertId,
          type: 'social',
          title: 'SOCIAL ENGINEERING',
          description: 'Round number, new recipient, 11pm. High manipulation probability.',
          rbiRef: 'RBI/2022-23/89',
          timestamp: Date.now(),
          sender: 'user_social_12',
          receiver: 'new_recipient_888',
          amount: 50000,
          caseTitle: 'Social Engineering — user_social_12',
          fraudType: 'Phishing'
        };
        scoreTransaction('phishing', alertId).then(mlRes => {
          const score = mlRes?.score ?? 76;
          api.createTransaction({
            sender: 'user_social_12',
            receiver: 'new_recipient_888',
            amount: 50000,
            score: Math.round(score),
            type: mlRes?.fraud_type?.replace(/_/g, ' ') || 'Phishing',
            status: score >= 75 ? 'blocked' : 'flagged'
          });
          if (score >= 40) {
            api.createCase({
              title: 'Social Engineering — user_social_12',
              description: `Round amount, new recipient, 11pm. ML score: ${score.toFixed(1)}.`,
              priority: score >= 75 ? 'critical' : 'high',
              status: 'open',
              amount: 50000,
            });
            api.createThreat({
              entityId: 'user_social_12',
              entityType: 'UPI ID',
              source: 'SYSTEM',
              reports: 1,
              score: Math.round(score),
              status: score >= 75 ? 'CONFIRMED' : 'REVIEWING',
              time: 'Just now'
            });
          }
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
    console.log('startDemo clicked');
    demoTimeoutIds.current.forEach(id => clearTimeout(id));
    demoTimeoutIds.current = [];
    setDemoMode(true);
    setDemoAlerts([]);
    const ids = [
      setTimeout(() => runDemoScenario('velocity'), 5000),
      setTimeout(() => runDemoScenario('geo'), 15000),
      setTimeout(() => runDemoScenario('sim'), 28000),
      setTimeout(() => runDemoScenario('circular'), 45000),
      setTimeout(() => runDemoScenario('social'), 60000),
      setTimeout(() => {
        setDemoMode(false);
        demoTimeoutIds.current = [];
      }, 68000),
    ];
    demoTimeoutIds.current = ids;
  };

  const stopDemo = () => {
    demoTimeoutIds.current.forEach(id => clearTimeout(id));
    demoTimeoutIds.current = [];
    setDemoMode(false);
    setDemoAlerts([]);
    window.dispatchEvent(new CustomEvent('highlightCycle', { detail: { nodes: [] } }));
  };

  const toggleLiveFeed = () => {
    console.log('toggleLiveFeed clicked, current state:', liveFeedActive);
    setLiveFeedActive(prev => {
      console.log('Setting liveFeedActive to:', !prev);
      return !prev;
    });
  };

  useEffect(() => {
    console.log('[DEBUG] liveFeedActive changed to:', liveFeedActive);
  }, [liveFeedActive]);

  // Live Feed - creates transactions every 8 seconds
  const liveFeedActiveRef = useRef(liveFeedActive);
  liveFeedActiveRef.current = liveFeedActive;

  useEffect(() => {
    console.log('Live feed useEffect triggered, liveFeedActive:', liveFeedActive);
    let interval: ReturnType<typeof setInterval> | undefined;
    if (liveFeedActive) {
      console.log('Starting live feed interval...');
      interval = setInterval(async () => {
        console.log('Live feed interval running...');
        // Generate random realistic transaction parameters
        const isFraud = Math.random() > 0.7; // 30% fraud rate
        const amount = isFraud ? Math.floor(Math.random() * 95000) + 5000 : Math.floor(Math.random() * 5000) + 100;
        console.log('Generated amount:', amount, 'isFraud:', isFraud);

        const mlPayload = {
          skip_explain: true,
          amount_inr: amount,
          amount_scaled: amount / 10000,
          hour: Math.floor(Math.random() * 24),
          velocity_60s: isFraud ? Math.floor(Math.random() * 15) + 5 : Math.floor(Math.random() * 3),
          is_new_device: isFraud && Math.random() > 0.5 ? 1 : 0,
          is_new_recipient: isFraud ? 1 : Math.random() > 0.8 ? 1 : 0,
          account_age_days: Math.floor(Math.random() * 1000),
          city_risk_score: isFraud ? 0.8 : 0.2,
          is_festival_day: 0,
          is_sim_swap_signal: 0,
          is_round_amount: amount % 100 === 0 ? 1 : 0,
          cat_crypto: 0,
          cat_grocery: 0,
          cat_electronics: 0,
          cat_travel: 0,
          V14: isFraud ? -20 : 1,
          V4: isFraud ? 6 : -1,
          V12: isFraud ? -15 : 1,
          V10: isFraud ? -12 : 1,
          V11: isFraud ? -6 : 0.5,
        };

        try {
          const txnId = `live_${Date.now()}`;
          let score = Math.floor(Math.random() * 100);
          try {
            console.log('Calling ML scoreTransaction...');
            const mlRes = await scoreTransaction('custom', txnId, mlPayload);
            console.log('ML result:', mlRes);
            score = Math.round(mlRes?.score ?? score);
          } catch (mlErr) {
            console.warn('ML scoring failed, using fallback:', mlErr);
          }

          let status: 'blocked' | 'flagged' | 'review' | 'clear' = 'clear';
          let type = 'Legitimate';

          if (score > 85) { status = 'blocked'; type = isFraud ? 'Device Risk' : 'High Velocity'; }
          else if (score > 60) { status = 'flagged'; type = 'Suspicious'; }

          console.log('Creating transaction with score:', score, 'status:', status);
          // Fire to Appwrite (which triggers the realtime subscription)
          const result = await api.createTransaction({
            sender: `user_${Math.floor(Math.random() * 9999)}`,
            receiver: `merch_${Math.floor(Math.random() * 999)}`,
            amount,
            score,
            type,
            status
          });
          console.log('Transaction created:', result);

          // Optimistically prepend new transaction to UI immediately
          // (don't re-fetch — the 8 seeded records will override the new one)
          const newTx = {
            sender: `user_${Math.floor(Math.random() * 9999)}`,
            receiver: `merch_${Math.floor(Math.random() * 999)}`,
            amount,
            score,
            type,
            status,
          };
          setTransactions(prev => [newTx, ...prev].slice(0, 20));

          // Also create threat if score is high
          if (score > 60) {
            await api.createThreat({
              entityId: `user_${Math.floor(Math.random() * 9999)}`,
              entityType: 'UPI ID',
              source: 'SYSTEM',
              reports: 1,
              score,
              status: score > 85 ? 'CONFIRMED' : 'REVIEWING',
              time: 'Just now'
            });
          }
        } catch (e) {
          console.error("Live feed error:", e);
        }
      }, 8000);
    } else {
      console.log('Live feed NOT active, not starting interval');
    }
    return () => {
      if (interval) {
        console.log('Clearing live feed interval');
        clearInterval(interval);
      }
    };
  }, [liveFeedActive]);

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
      key="dashboard"
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
            { icon: Server, label: 'API Latency:', val: health.api_latency_ms ? `${health.api_latency_ms}ms` : '42ms', ok: health.api_latency_ms !== null ? health.api_latency_ms < 100 : true, v: health.api_latency_ms || 42 },
            {
              icon: Cpu,
              label: 'ML Inference:',
              val: mlHealth.ml_inference_ms ? `${Math.round(mlHealth.ml_inference_ms)}ms` : '184ms',
              ok: mlHealth.model_loaded !== false,
              v: mlHealth.ml_inference_ms || 184
            },
            { icon: Cpu, label: 'TPS:', val: health.tps ? health.tps.toLocaleString('en-IN') : '1,204', ok: true, v: 0 },
            { icon: Activity, label: 'False Pos Rate:', val: health.false_positive_rate ? `${health.false_positive_rate}%` : '2.1%', ok: true, v: 0 },
            { icon: Wifi, label: 'Model Loaded:', val: mlHealth.model_loaded !== false ? '✓' : '✗', ok: mlHealth.model_loaded !== false, v: 0 },
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
              <span className="font-bold flex items-center gap-1" style={{
                color: item.label.includes('TPS') || item.label.includes('False Pos')
                  ? 'var(--text)'
                  : item.label === 'Model Loaded:' ? (item.ok ? '#4ade80' : '#fb7185') : (item.v < 60 ? '#4ade80' : item.v <= 150 ? '#fbbf24' : '#fb7185')
              }}>{item.val}</span>
            </motion.div>
          ))}
        </div>
        <div className="flex items-center gap-2 px-4">
          <div className="w-2 h-2 rounded-full bg-emerald-400 pulse-glow" />
          <span className="text-xs font-bold text-emerald-400">System Active</span>
          <span className="text-xs ml-4" style={{ color: liveFeedActive ? '#4ade80' : 'var(--muted)' }}>
            Live Feed: {liveFeedActive ? 'ON' : 'OFF'}
          </span>
          <span className="text-xs ml-2" style={{ color: demoMode ? '#fbbf24' : 'var(--muted)' }}>
            Demo: {demoMode ? 'ON' : 'OFF'}
          </span>
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
            <button
              onClick={toggleLiveFeed}
              className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all duration-300 ${liveFeedActive
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50 shadow-[0_0_15px_rgba(225,29,72,0.3)]'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                }`}
            >
              {liveFeedActive ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {liveFeedActive ? 'Stop Live Feed' : 'Generate Live Feed'}
            </button>

            <button
              onClick={demoMode ? stopDemo : startDemo}
              className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all duration-300 ${demoMode
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                }`}
            >
              {demoMode ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {demoMode ? 'Stop Demo' : 'Start Demo Scenario'}
            </button>
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
                <CountUp
                  key={stat.label}
                  start={stat.value}
                  end={stat.value}
                  duration={0}
                  formattingFn={(num) => num.toLocaleString('en-IN')}
                  preserveValue={true}
                />
              </p>

              {stat.label === 'FRAUD PREVENTED' && (
                <div className="mt-3 pt-3 border-t border-white/5 relative z-10 space-y-1">
                  <div className="flex justify-between text-[10px]" style={{ color: 'var(--muted)' }}>
                    <span>Blocked:</span><span style={{ color: 'var(--text)' }}>{(stats.fraudDetected + (fraudSaved > 0 ? fraudSaved / 2500 : 0)).toLocaleString('en-IN')} txns</span>
                  </div>
                  <div className="flex justify-between text-[10px]" style={{ color: 'var(--muted)' }}>
                    <span>Detection Rate:</span>
                    <span className="text-emerald-400">
                      {stats.totalTransactions > 0
                        ? `${((stats.fraudDetected / stats.totalTransactions) * 100).toFixed(2)}%`
                        : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px]" style={{ color: 'var(--muted)' }}>
                    <span>Avg Prevented:</span><span style={{ color: 'var(--text)' }}>₹{Math.round(stat.value / (stats.fraudDetected || 1)).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}

              {stat.label === 'FRAUD PREVENTED' && recentBlock && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-xs font-bold text-emerald-400 mt-2 text-right"
                >
                  +₹{recentBlock.toLocaleString('en-IN')} prevented!
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
        <div className="fixed bottom-8 right-8 z-[9999] space-y-3 max-w-sm pointer-events-auto">
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
                  <div className="text-[10px] font-mono mb-3 p-1.5 rounded bg-black/20 text-blue-400 inline-block">
                    {alert.rbiRef}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      className="text-xs font-bold px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                      style={{ pointerEvents: 'auto', position: 'relative', zIndex: 9999 }}
                      onClick={async () => {
                        console.log('BLOCK clicked for alert:', alert.id);

                        // 1. Optimistically add blocked transaction to local feed
                        const blockedTx = {
                          sender: alert.sender,
                          receiver: alert.receiver,
                          amount: alert.amount,
                          score: 95,
                          type: alert.fraudType,
                          status: 'blocked' as const,
                        };
                        setTransactions(prev => [blockedTx, ...prev].slice(0, 20));

                        // 2. Update stats immediately
                        setStats(prev => ({
                          ...prev,
                          fraudDetected: prev.fraudDetected + 1,
                          fraudPrevented: prev.fraudPrevented + alert.amount,
                          totalTransactions: prev.totalTransactions + 1,
                        }));
                        setFraudSaved(prev => prev + alert.amount);
                        fraudSavedRef.current += alert.amount;
                        setRecentBlock(alert.amount);
                        setTimeout(() => setRecentBlock(null), 2000);

                        // 3. Remove alert with brief delay for feedback
                        setDemoAlerts(prev => prev.filter(a => a.id !== alert.id));

                        // 4. Persist to backend (fire-and-forget)
                        try {
                          await api.createTransaction(blockedTx);
                          await api.createThreat({
                            entityId: alert.sender,
                            entityType: 'UPI ID',
                            source: 'ANALYST',
                            reports: 1,
                            score: 95,
                            status: 'CONFIRMED',
                            time: 'Just now'
                          });
                          await api.createCase({
                            title: alert.caseTitle,
                            description: `${alert.description} Analyst action: BLOCKED.`,
                            priority: 'critical',
                            status: 'closed',
                            amount: alert.amount,
                          });
                        } catch (e) {
                          console.error('Block persist error:', e);
                        }
                      }}
                    >
                      ⛔ Block
                    </button>
                    <button
                      className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors cursor-pointer"
                      style={{ pointerEvents: 'auto', position: 'relative', zIndex: 9999 }}
                      onClick={async () => {
                        console.log('VERIFY clicked for alert:', alert.id);

                        // 1. Optimistically add verified (clear) transaction to feed
                        const verifiedTx = {
                          sender: alert.sender,
                          receiver: alert.receiver,
                          amount: alert.amount,
                          score: 15,
                          type: alert.fraudType,
                          status: 'clear' as const,
                        };
                        setTransactions(prev => [verifiedTx, ...prev].slice(0, 20));
                        setStats(prev => ({
                          ...prev,
                          totalTransactions: prev.totalTransactions + 1,
                        }));

                        // 2. Remove alert
                        setDemoAlerts(prev => prev.filter(a => a.id !== alert.id));

                        // 3. Persist to backend
                        try {
                          await api.createTransaction(verifiedTx);
                        } catch (e) {
                          console.error('Verify persist error:', e);
                        }
                      }}
                    >
                      ✓ Approve
                    </button>
                    <button
                      className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors cursor-pointer"
                      style={{ pointerEvents: 'auto', position: 'relative', zIndex: 9999 }}
                      onClick={async () => {
                        if (alert.type === 'circular') {
                          onNavigate?.('network');
                          setTimeout(() => {
                            window.dispatchEvent(new CustomEvent('highlightCycle', {
                              detail: { nodes: ['user_44', 'user_8', 'user_89'] }
                            }));
                          }, 600);
                        } else {
                          // 1. Create the case in backend first
                          let createdCaseId = '';
                          try {
                            const caseResult = await api.createCase({
                              title: alert.caseTitle,
                              description: `${alert.description} Pending investigation.`,
                              priority: 'critical',
                              status: 'open',
                              amount: alert.amount,
                            });
                            createdCaseId = caseResult?.$id || '';
                          } catch (e) {
                            console.error('Create case for investigate error:', e);
                          }

                          // 2. Navigate to investigation
                          onNavigate?.('investigation');

                          // 3. Dispatch event with both type and caseId
                          const typeMap: Record<string, string> = {
                            velocity: 'Card Testing',
                            geo: 'Account Takeover',
                            sim: 'SIM Swap',
                            social: 'Phishing',
                          };
                          setTimeout(() => {
                            window.dispatchEvent(new CustomEvent('investigationSelect', {
                              detail: {
                                caseType: typeMap[alert.type] || 'Suspicious',
                                caseId: createdCaseId,
                                caseTitle: alert.caseTitle,
                              }
                            }));
                          }, 800);
                        }
                        // Keep the alert visible so user can still block/verify after investigating
                      }}
                    >
                      Investigate →
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
