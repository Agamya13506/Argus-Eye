import { motion } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import { Search, Filter, AlertTriangle, Clock, ArrowRight, ShieldAlert, Activity, Loader2 } from 'lucide-react';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import api from '../services/api';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const LIME_BY_TYPE: Record<string, { label: string; width: string; color: string }[]> = {
  'Account Takeover': [
    { label: 'Location', width: '92%', color: '#f43f5e' },
    { label: 'Velocity', width: '85%', color: '#f43f5e' },
    { label: 'Amount', width: '78%', color: '#f59e0b' },
    { label: 'Device', width: '65%', color: '#f59e0b' },
  ],
  'SIM Swap': [
    { label: 'New Device', width: '96%', color: '#f43f5e' },
    { label: 'Hour (3am)', width: '88%', color: '#f43f5e' },
    { label: 'Amount', width: '71%', color: '#f59e0b' },
    { label: 'Velocity', width: '44%', color: '#f59e0b' },
  ],
  'Card Testing': [
    { label: 'Velocity', width: '98%', color: '#f43f5e' },
    { label: 'Amount', width: '45%', color: '#f59e0b' },
    { label: 'Merchant', width: '38%', color: '#f59e0b' },
    { label: 'Device', width: '22%', color: '#94a3b8' },
  ],
  'Money Mule': [
    { label: 'Recipient', width: '89%', color: '#f43f5e' },
    { label: 'Network', width: '82%', color: '#f43f5e' },
    { label: 'Amount', width: '67%', color: '#f59e0b' },
    { label: 'Velocity', width: '51%', color: '#f59e0b' },
  ],
  'Suspicious': [
    { label: 'Velocity', width: '72%', color: '#f43f5e' },
    { label: 'Device', width: '61%', color: '#f59e0b' },
    { label: 'Amount', width: '48%', color: '#f59e0b' },
    { label: 'Hour', width: '35%', color: '#94a3b8' },
  ],
  'Phishing': [
    { label: 'Recipient', width: '89%', color: '#f43f5e' },
    { label: 'Network', width: '75%', color: '#f43f5e' },
    { label: 'Amount', width: '62%', color: '#f59e0b' },
    { label: 'Time', width: '48%', color: '#f59e0b' },
  ],
};

const SHAP_BY_TYPE: Record<string, number[]> = {
  'Account Takeover': [0.2, 0.85, 0.9, 0.7, 0.4, 0.3, 0.6, 0.5],
  'SIM Swap': [0.2, 0.95, 0.85, 0.8, 0.5, 0.3, 0.7, 0.2],
  'Card Testing': [0.95, 0.4, 0.3, 0.5, 0.3, 0.2, 0.2, 0.1],
  'Money Mule': [0.3, 0.2, 0.2, 0.4, 0.9, 0.8, 0.3, 0.2],
  'Phishing': [0.3, 0.5, 0.6, 0.6, 0.85, 0.4, 0.5, 0.3],
  'Suspicious': [0.5, 0.5, 0.5, 0.5, 0.5, 0.4, 0.4, 0.3],
};

const SHAP_LABELS = [
  'Velocity', 'Device', 'Time', 'Amount',
  'Recipient', 'Network', 'Identity', 'Location'
];

const FINGERPRINTS = {
  velocity_attack: [0.95, 0.4, 0.3, 0.5, 0.3, 0.2, 0.2, 0.1],
  sim_swap: [0.2, 0.95, 0.85, 0.8, 0.5, 0.3, 0.7, 0.2],
  social_engineering: [0.1, 0.3, 0.7, 0.6, 0.9, 0.2, 0.3, 0.2],
};

const mockCases = [
  { $id: 'c1', id: 'CASE-8842', priority: 95, amount: '₹1,20,000', type: 'Account Takeover', time: '5m ago', status: 'URGENT', description: 'Multiple unauthorized login attempts followed by large transfer' },
  { $id: 'c2', id: 'CASE-8841', priority: 88, amount: '₹45,000', type: 'SIM Swap', time: '12m ago', status: 'URGENT', description: 'SIM swap detected, unauthorized OTP verification' },
  { $id: 'c3', id: 'CASE-8840', priority: 72, amount: '₹8,500', type: 'Suspicious', time: '25m ago', status: 'HIGH', description: 'Unusual transaction pattern from new device' },
  { $id: 'c4', id: 'CASE-8839', priority: 65, amount: '₹12,000', type: 'Money Mule', time: '1h ago', status: 'HIGH', description: 'Rapid layering of funds through multiple accounts' },
  { $id: 'c5', id: 'CASE-8838', priority: 45, amount: '₹2,500', type: 'Card Testing', time: '2h ago', status: 'ROUTINE', description: 'Multiple small transactions testing card validity' },
  { $id: 'c6', id: 'CASE-8837', priority: 55, amount: '₹50,000', type: 'Phishing', time: '3h ago', status: 'HIGH', description: 'Phishing attack detected with social engineering tactics' },
];

const CASE_DETAILS: Record<string, {
  sender: string; receiver: string; location: string; rbi: string;
}> = {
  'Account Takeover': {
    sender: 'user_44 (Verified)',
    receiver: 'user_8 (New Device)',
    location: 'Mumbai → Delhi (8 min)',
    rbi: 'RBI/2021-22/56',
  },
  'SIM Swap': {
    sender: 'user_sim_99 (Verified)',
    receiver: 'merch_finance_7 (Suspicious)',
    location: 'Bengaluru (3:14am)',
    rbi: 'RBI/2020-21/58',
  },
  'Card Testing': {
    sender: 'user_321 (New Account)',
    receiver: 'merch_crypto (Flagged)',
    location: 'Delhi (Velocity: 23 txns)',
    rbi: 'RBI/2021-22/74',
  },
  'Money Mule': {
    sender: 'user_67 (Suspicious)',
    receiver: 'user_92 (New Account)',
    location: 'Mumbai → Hyderabad',
    rbi: 'RBI/FIU-IND Circular 2022',
  },
  'Phishing': {
    sender: 'user_social_12 (Verified)',
    receiver: 'new_recipient_888 (First Time)',
    location: 'Chennai (11pm)',
    rbi: 'RBI/DPSS.CO.PD/2017-18/269',
  },
  'Suspicious': {
    sender: 'user_77 (Verified)',
    receiver: 'merch_12 (Review)',
    location: 'Pune (Unusual Hour)',
    rbi: 'RBI/2021-22/56',
  },
};

const getRecoveryProb = (caseData: typeof mockCases[0]) => {
  const baseProbMap: Record<string, number> = {
    'Account Takeover': 45,
    'SIM Swap': 52,
    'Card Testing': 78,
    'Money Mule': 28,
    'Phishing': 61,
    'Suspicious': 70,
  };
  const base = baseProbMap[caseData.type] || 55;
  const hoursElapsed = Math.max(0, (100 - caseData.priority) / 10);
  const decayed = Math.max(5, base - (hoursElapsed * 3));
  return Math.round(decayed);
};

export default function Investigation() {
  const [cases, setCases] = useState(mockCases);
  const [selectedCase, setSelectedCase] = useState(mockCases[0]);
  const [loading, setLoading] = useState(true);
  const chartRef = useRef<ChartJS<'radar'> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [kycLoading, setKycLoading] = useState(false);
  const [kycDone, setKycDone] = useState(false);

  const limeBars = LIME_BY_TYPE[selectedCase.type] || LIME_BY_TYPE['Suspicious'];

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const shapData = SHAP_BY_TYPE[selectedCase.type] || SHAP_BY_TYPE['Suspicious'];

    const chart = new ChartJS(ctx, {
      type: 'radar',
      data: {
        labels: SHAP_LABELS,
        datasets: [
          {
            label: selectedCase.type,
            data: shapData,
            borderColor: '#f43f5e',
            backgroundColor: 'rgba(244,63,94,0.15)',
            borderWidth: 2,
            pointRadius: 3,
          },
          {
            label: 'Velocity pattern',
            data: FINGERPRINTS.velocity_attack,
            borderColor: 'rgba(251,113,133,0.4)',
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderDash: [4, 4],
            pointRadius: 0,
          },
          {
            label: 'SIM Swap pattern',
            data: FINGERPRINTS.sim_swap,
            borderColor: 'rgba(251,191,36,0.4)',
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderDash: [4, 4],
            pointRadius: 0,
          },
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            min: 0,
            max: 1,
            ticks: { display: false },
            grid: { color: 'rgba(148,163,184,0.15)' },
            pointLabels: {
              color: '#94a3b8',
              font: { size: 10 }
            }
          }
        },
        plugins: { legend: { display: false } }
      }
    });

    chartRef.current = chart;

    return () => {
      chart.destroy();
      chartRef.current = null;
    };
  }, [selectedCase.$id]);

  useEffect(() => {
    async function fetchCases() {
      try {
        const data = await api.getCases();
        if (data?.length > 0) {
          const mapped = data.map((c: any, i: number) => ({
            $id: c.$id,
            id: `CASE-${8842 - i}`,
            priority: c.priority === 'critical' ? 95 : c.priority === 'high' ? 80 : 55,
            amount: `₹${(c.amount || 0).toLocaleString()}`,
            type: c.title || c.type || 'Unknown',
            time: 'Recent',
            status: c.priority === 'critical' ? 'URGENT' : c.priority === 'high' ? 'HIGH' : 'ROUTINE',
            description: c.description || 'No description',
          }));
          setCases(mapped);
          setSelectedCase(mapped[0]);
        }
      } catch (e) {
        // use mock
      } finally {
        setLoading(false);
      }
    }
    fetchCases();
  }, []);

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      const match = cases.find(c => c.type === e.detail.caseType);
      if (match) setSelectedCase(match);
    };
    window.addEventListener('investigationSelect', handler as EventListener);
    return () => window.removeEventListener('investigationSelect', handler as EventListener);
  }, [cases]);

  const handleBlock = async () => {
    setCases(prev => prev.map(c => c.$id === selectedCase.$id ? { ...c, status: 'BLOCKED' } : c));
    setSelectedCase(prev => ({ ...prev, status: 'BLOCKED' }));
    try {
      await api.updateCase(selectedCase.$id, { status: 'BLOCKED' });
    } catch (e) { /* silent — state already updated */ }
  };

  const handleVerify = async () => {
    setCases(prev => prev.map(c => c.$id === selectedCase.$id ? { ...c, status: 'VERIFIED' } : c));
    setSelectedCase(prev => ({ ...prev, status: 'VERIFIED' }));
    try {
      await api.updateCase(selectedCase.$id, { status: 'VERIFIED' });
    } catch (e) { /* silent */ }
  };

  const handleKYC = async () => {
    setKycLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setKycLoading(false);
    setKycDone(true);
    setTimeout(() => setKycDone(false), 3000);
  };

  useEffect(() => { setKycDone(false); setKycLoading(false); }, [selectedCase.$id]);

  const handleGenerateReport = () => {
    const caseDetail = CASE_DETAILS[selectedCase.type] || CASE_DETAILS['Suspicious'];
    const recoveryProb = getRecoveryProb(selectedCase);
    const content = [
      `FRAUDSHIELD INCIDENT REPORT`,
      `Generated: ${new Date().toLocaleString()}`,
      ``,
      `Case ID: ${selectedCase.id}`,
      `Type: ${selectedCase.type}`,
      `Amount: ${selectedCase.amount}`,
      `Status: ${selectedCase.status}`,
      `Priority: ${selectedCase.priority}`,
      `Flagged: ${selectedCase.time}`,
      ``,
      `TRANSACTION DETAILS`,
      `Sender: ${caseDetail.sender}`,
      `Receiver: ${caseDetail.receiver}`,
      `Location: ${caseDetail.location}`,
      `RBI Reference: ${caseDetail.rbi}`,
      ``,
      `DESCRIPTION`,
      `${selectedCase.description}`,
      ``,
      `RECOVERY PROBABILITY`,
      `${recoveryProb}% chance of recovery`,
      ``,
      `LIME TOP RISK FACTORS`,
      ...(LIME_BY_TYPE[selectedCase.type] || []).map(b => `  ${b.label}: ${b.width}`),
    ].join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedCase.id}-report.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="p-8 min-h-screen"
    >
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-1 flex items-center gap-3" style={{ color: 'var(--text)' }}>
            <Search className="w-8 h-8 text-rose-400" />
            Case Investigation
          </h2>
          <p style={{ color: 'var(--muted)' }}>Prioritized queue and detailed case analysis.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-[calc(100vh-160px)]">
        {/* Priority Queue */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="glass-panel rounded-2xl flex flex-col h-full overflow-hidden"
        >
          <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)', background: 'var(--cardBg)' }}>
            <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}>
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Priority Queue
            </h3>
            <button className="p-2 rounded-lg transition-colors hover:bg-white/5" style={{ color: 'var(--muted)' }}>
              <Filter className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="flex items-center justify-center h-32"><Loader2 className="w-6 h-6 text-rose-400 animate-spin" /></div>
            ) : (
              cases.map((c, i) => (
                <motion.div
                  key={c.$id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + (i * 0.08) }}
                  whileHover={{ x: 4 }}
                  onClick={() => setSelectedCase(c)}
                  className={`glass-card p-4 rounded-xl cursor-pointer border-l-4 transition-all ${selectedCase.$id === c.$id ? 'ring-1 ring-rose-500/30' : ''
                    } ${c.status === 'URGENT' ? 'border-rose-400' :
                      c.status === 'HIGH' ? 'border-amber-400' :
                        c.status === 'BLOCKED' ? 'border-slate-500' :
                          c.status === 'VERIFIED' ? 'border-emerald-400' :
                            'border-pink-400'
                    }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-sm font-bold" style={{ color: 'var(--text)' }}>{c.id}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${c.status === 'URGENT' ? 'bg-rose-500/20 text-rose-400' :
                      c.status === 'HIGH' ? 'bg-amber-500/15 text-amber-400' :
                        c.status === 'BLOCKED' ? 'bg-slate-500/15 text-slate-400' :
                          c.status === 'VERIFIED' ? 'bg-emerald-500/15 text-emerald-400' :
                            'bg-pink-500/15 text-pink-400'
                      }`}>
                      {c.status === 'BLOCKED' || c.status === 'VERIFIED' ? c.status : `${c.priority} PTS`}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{c.type}</div>
                      <div className="text-xs flex items-center gap-1 mt-1" style={{ color: 'var(--muted)' }}>
                        <Clock className="w-3 h-3" /> {c.time}
                      </div>
                    </div>
                    <div className="font-medium" style={{ color: 'var(--text)' }}>{c.amount}</div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Case Detail */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass-panel rounded-2xl xl:col-span-2 flex flex-col h-full overflow-hidden"
        >
          <div className="p-6 border-b flex justify-between items-center" style={{ borderColor: 'var(--border)', background: 'var(--cardBg)' }}>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-2xl font-bold font-mono" style={{ color: 'var(--text)' }}>{selectedCase.id}</h3>
                <span className="bg-rose-500/15 text-rose-400 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
                  {selectedCase.type}
                </span>
              </div>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>Flagged {selectedCase.time} • Priority Score: {selectedCase.priority}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold" style={{ color: 'var(--text)' }}>{selectedCase.amount}</div>
              <div className="text-sm text-rose-400 flex items-center gap-1 justify-end">
                <Activity className="w-4 h-4" /> High Risk
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {selectedCase.type === 'Account Takeover' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-4 rounded-xl mb-4 border border-rose-500/20"
                style={{ background: 'rgba(244,63,94,0.06)' }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                    Geographic Impossibility Detected
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="text-sm font-bold" style={{ color: 'var(--text)' }}>Mumbai</div>
                    <div className="text-[10px]" style={{ color: 'var(--muted)' }}>08:42 AM</div>
                  </div>
                  <div className="flex-1 relative">
                    <div className="h-0.5 bg-rose-500/40 w-full" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="glass-card px-2 py-0.5 rounded text-[10px] font-bold text-rose-400">
                        1,156 km in 8 min
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold" style={{ color: 'var(--text)' }}>Delhi</div>
                    <div className="text-[10px]" style={{ color: 'var(--muted)' }}>08:50 AM</div>
                  </div>
                </div>
                <div className="mt-2 text-xs" style={{ color: 'var(--muted)' }}>
                  Implied speed: <span className="text-rose-400 font-bold">8,670 km/h</span> — Account takeover highly probable
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-1 gap-4 mb-6">
              <div className="glass-card p-5 rounded-xl">
                <h4 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--muted)' }}>Transaction Details</h4>
                {(() => {
                  const caseDetail = CASE_DETAILS[selectedCase.type] || CASE_DETAILS['Suspicious'];
                  return (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm" style={{ color: 'var(--muted)' }}>Sender</span>
                        <span className="font-medium text-sm" style={{ color: 'var(--text)' }}>{caseDetail.sender}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm" style={{ color: 'var(--muted)' }}>Receiver</span>
                        <span className="font-medium text-sm text-rose-400 flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" /> {caseDetail.receiver}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm" style={{ color: 'var(--muted)' }}>Location</span>
                        <span className="font-medium text-sm" style={{ color: 'var(--text)' }}>{caseDetail.location}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card p-5 rounded-xl">
                  <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted)' }}>LIME Explainability</h4>
                  <div className="w-full space-y-3 mt-3" key={selectedCase.$id}>
                    {limeBars.map(bar => (
                      <div key={bar.label} className="flex items-center gap-2">
                        <span className="text-xs w-24 text-right" style={{ color: 'var(--muted)' }}>{bar.label}</span>
                        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: bar.width }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: bar.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-5 rounded-xl">
                  <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted)' }}>SHAP Fraud DNA</h4>
                  <div className="h-[200px]">
                    <canvas key={selectedCase.$id} ref={canvasRef} />
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card p-5 rounded-xl mb-6">
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--muted)' }}>Recommended Actions</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
                  <div>
                    <div className="text-rose-400 font-medium text-sm">Freeze Account Immediately</div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>RBI Ref: {CASE_DETAILS[selectedCase.type]?.rbi || 'RBI/2021-22/56'}</div>
                  </div>
                  <button onClick={handleBlock} className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors">
                    Execute
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <div>
                    <div className="text-amber-400 font-medium text-sm">Request KYC Reverification</div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>Identity mismatch detected</div>
                  </div>
                  <button
                    onClick={handleKYC}
                    disabled={kycLoading || kycDone}
                    className="bg-amber-500 hover:bg-amber-600 disabled:opacity-60
                               text-white px-4 py-1.5 rounded-lg text-sm font-medium
                               transition-colors flex items-center gap-2 min-w-[80px] justify-center"
                  >
                    {kycLoading
                      ? <Loader2 className="w-3 h-3 animate-spin" />
                      : kycDone
                        ? '✓ Sent'
                        : 'Execute'}
                  </button>
                </div>
              </div>
            </div>

            {(() => {
              const recoveryProb = getRecoveryProb(selectedCase);
              const recoveryColor = recoveryProb > 60 ? '#4ade80' :
                recoveryProb > 30 ? '#fbbf24' : '#f43f5e';
              const recoveryAction = recoveryProb > 60
                ? 'Process chargeback immediately — high recovery window'
                : recoveryProb > 30
                  ? 'Escalate to senior analyst — window closing'
                  : 'Escalate to FIU-IND — low recovery probability';

              return (
                <div className="glass-card p-5 rounded-xl mb-6">
                  <h4 className="text-xs font-semibold uppercase tracking-wider mb-4"
                    style={{ color: 'var(--muted)' }}>
                    Recovery Probability
                  </h4>
                  <div className="flex items-center gap-6">
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="32" fill="none" strokeWidth="6"
                          style={{ stroke: 'var(--border)' }} />
                        <motion.circle
                          cx="40" cy="40" r="32" fill="none" strokeWidth="6"
                          strokeLinecap="round"
                          strokeDasharray={201.06}
                          initial={{ strokeDashoffset: 201.06 }}
                          animate={{ strokeDashoffset: 201.06 - (201.06 * recoveryProb / 100) }}
                          transition={{ duration: 1, delay: 0.3 }}
                          stroke={recoveryColor}
                          key={selectedCase.$id}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold" style={{ color: recoveryColor }}>
                          {recoveryProb}%
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                        {recoveryAction}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--muted)' }}>
                        Probability decays 3% per hour. Act now to maximise recovery.
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Case Notes */}
            <div className="glass-card p-5 rounded-xl">
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--muted)' }}>Case Description</h4>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{selectedCase.description}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t flex justify-end gap-3" style={{ borderColor: 'var(--border)', background: 'var(--cardBg)' }}>
            <button onClick={handleGenerateReport} className="px-4 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-white/5" style={{ color: 'var(--muted)' }}>
              Generate Report
            </button>
            <button onClick={handleVerify} className="px-4 py-2 rounded-xl text-sm font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors">
              Verify (Safe)
            </button>
            <button onClick={handleBlock} className="btn-accent flex items-center gap-2">
              Block Transaction <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
