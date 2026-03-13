import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import CountUp from 'react-countup';
import {
  Activity, AlertTriangle, Shield, TrendingUp, TrendingDown,
  ArrowUpRight, DollarSign, Eye, Clock, Server, Cpu, Database, Wifi
} from 'lucide-react';
import api from '../services/api';

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

export default function Dashboard() {
  const [stats, setStats] = useState(mockStats);
  const [transactions, setTransactions] = useState(mockTransactions);

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

  const statCards = [
    { label: 'TOTAL TRANSACTIONS', value: stats.totalTransactions, icon: Activity, change: '+12%', up: true, color: '#fb7185' },
    { label: 'FRAUD DETECTED', value: stats.fraudDetected, icon: AlertTriangle, change: '-5%', up: false, color: '#f43f5e' },
    { label: 'FRAUD PREVENTED', value: stats.fraudPrevented, prefix: '₹', icon: DollarSign, change: '+8%', up: true, color: '#e11d48' },
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
            { icon: Server, label: 'API:', val: 'Connected', ok: true },
            { icon: Cpu, label: 'ML Inference:', val: '18ms', ok: true },
            { icon: Activity, label: 'TPS:', val: '1,204', ok: true },
            { icon: Wifi, label: 'Uptime:', val: '99.99%', ok: true },
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
              <span className="font-bold" style={{ color: item.ok ? '#4ade80' : '#fb7185' }}>{item.val}</span>
            </motion.div>
          ))}
        </div>
        <div className="flex items-center gap-2 px-4">
          <div className="w-2 h-2 rounded-full bg-emerald-400 pulse-glow" />
          <span className="text-xs font-bold text-emerald-400">System Active</span>
        </div>
      </motion.div>

      <header className="mb-8">
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
                <CountUp end={stat.value} duration={2} separator="," delay={0.3 + i * 0.1} />
              </p>
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
    </motion.div>
  );
}
