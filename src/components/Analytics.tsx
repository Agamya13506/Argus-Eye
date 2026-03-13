import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, PieChart as PieChartIcon, Calendar, Download } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import api from '../services/api';
import FraudHeatmap from './FraudHeatmap';

const mockTimeline = [
  { name: 'Mon', fraud: 4000, legit: 24000 },
  { name: 'Tue', fraud: 3000, legit: 13980 },
  { name: 'Wed', fraud: 2000, legit: 9800 },
  { name: 'Thu', fraud: 2780, legit: 39080 },
  { name: 'Fri', fraud: 1890, legit: 48000 },
  { name: 'Sat', fraud: 2390, legit: 38000 },
  { name: 'Sun', fraud: 3490, legit: 43000 },
];

const categoryData = [
  { name: 'Electronics', value: 400 },
  { name: 'Travel', value: 300 },
  { name: 'Gaming', value: 300 },
  { name: 'Crypto', value: 200 },
  { name: 'Retail', value: 150 },
];

const barColors = ['#f43f5e', '#f59e0b', '#fb7185', '#f43f5e', '#2dd4bf'];

export default function Analytics() {
  const [timelineData, setTimelineData] = useState(mockTimeline);
  const [dateRange, setDateRange] = useState('7d');

  useEffect(() => {
    async function fetchData() {
      try {
        const txData = await api.getTransactions();
        if (txData?.length > 0) {
          // real data would be processed here; for now we use mock
        }
      } catch (e) { /* use mock */ }
    }
    fetchData();
  }, []);

  useEffect(() => {
    const filterByRange = (data: typeof mockTimeline, range: string) => {
      if (range === '7d')  return data.slice(-7);
      if (range === '30d') return data;
      if (range === '90d') return Array.from({length: 13}, (_, i) => ({
        name: `W${i+1}`,
        fraud: Math.floor(Math.random() * 5000) + 1000,
        legit: Math.floor(Math.random() * 50000) + 10000,
      }));
      return data;
    };
    setTimelineData(filterByRange(mockTimeline, dateRange));
  }, [dateRange]);

  const exportCSV = (data: typeof timelineData) => {
    const header = 'Period,Fraud,Legitimate\n';
    const rows = data.map(d => `${d.name},${d.fraud},${d.legit}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fraud-report-${dateRange}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tooltipStyle = {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    border: '1px solid rgba(56,189,248,0.2)',
    borderRadius: '8px',
    color: '#f1f5f9',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="p-8 min-h-screen flex flex-col"
    >
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-1 flex items-center gap-3" style={{ color: 'var(--text)' }}>
            <BarChart3 className="w-8 h-8 text-rose-400" />
            Analytics Dashboard
          </h2>
          <p style={{ color: 'var(--muted)' }}>Historical trends & predictive models</p>
        </div>
        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 rounded-xl glass-card text-sm font-medium transition-colors focus:outline-none"
            style={{ color: 'var(--text)', background: 'var(--cardBg)' }}
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <button 
            onClick={() => exportCSV(timelineData)}
            className="px-4 py-2 rounded-xl glass-card flex items-center gap-2 text-sm font-medium transition-colors hover:bg-white/5" 
            style={{ color: 'var(--muted)' }}
          >
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Area Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="glass-panel rounded-2xl p-6 lg:col-span-2 h-[400px] flex flex-col"
        >
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <TrendingUp className="w-5 h-5 text-rose-400" />
            Fraud vs Legitimate Volume
          </h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLegit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorFraud" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(100,116,139,0.15)" />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="legit" stroke="#2dd4bf" fillOpacity={1} fill="url(#colorLegit)" />
                <Area type="monotone" dataKey="fraud" stroke="#f43f5e" fillOpacity={1} fill="url(#colorFraud)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Bar Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass-panel rounded-2xl p-6 h-[400px] flex flex-col"
        >
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <PieChartIcon className="w-5 h-5 text-rose-400" />
            High-Risk Categories
          </h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} stroke="#64748b" fontSize={12} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={tooltipStyle} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Predictive Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="glass-panel rounded-2xl p-6 flex-1"
      >
        <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text)' }}>Predictive Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Upcoming Holiday Surge', desc: 'Model predicts a 45% increase in Card Testing attacks over the upcoming Diwali weekend.', color: 'amber', cta: 'View Mitigation Plan →' },
            { title: 'New Phishing Campaign', desc: 'Detected a novel phishing template targeting HDFC Bank customers. Expected impact: High.', color: 'rose', cta: 'Update Ruleset →' },
            { title: 'Model Performance', desc: 'False positive rate decreased by 2.1% this week following the latest model retraining.', color: 'emerald', cta: 'View Metrics →' },
          ].map((insight, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -3 }}
              className={`glass-card p-5 rounded-xl border-l-4 border-${insight.color}-400`}
            >
              <h4 className="text-sm font-bold mb-2" style={{ color: 'var(--text)' }}>{insight.title}</h4>
              <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>{insight.desc}</p>
              <button className={`text-xs font-medium text-${insight.color}-400 hover:text-${insight.color}-300 transition-colors`}>
                {insight.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Fraud Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mt-6"
      >
        <FraudHeatmap />
      </motion.div>
    </motion.div>
  );
}
