import { motion } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import { Search, Filter, AlertTriangle, Clock, ArrowRight, ShieldAlert, Activity, Loader2 } from 'lucide-react';
import { Chart as ChartJS, RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, RadialBarChart, RadialBar, Cell } from 'recharts';
import api from '../services/api';
import { getExplanation, getShap, getTimeline, getRecommendations, retrainModel } from '../services/mlApi';

ChartJS.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const LIME_BY_TYPE: Record<string, { label: string; value: number; width: string; color: string }[]> = {
  'Account Takeover': [
    { label: 'Location',  value: 92, width: '92%', color: '#f43f5e' },
    { label: 'Velocity',  value: 85, width: '85%', color: '#f43f5e' },
    { label: 'Amount',    value: 78, width: '78%', color: '#f59e0b' },
    { label: 'Device',    value: 65, width: '65%', color: '#f59e0b' },
  ],
  'SIM Swap': [
    { label: 'New Device', value: 96, width: '96%', color: '#f43f5e' },
    { label: 'Hour (3am)', value: 88, width: '88%', color: '#f43f5e' },
    { label: 'Amount',     value: 71, width: '71%', color: '#f59e0b' },
    { label: 'Velocity',   value: 44, width: '44%', color: '#f59e0b' },
  ],
  'Card Testing': [
    { label: 'Velocity', value: 98, width: '98%', color: '#f43f5e' },
    { label: 'Amount',   value: 45, width: '45%', color: '#f59e0b' },
    { label: 'Merchant', value: 38, width: '38%', color: '#f59e0b' },
    { label: 'Device',   value: 22, width: '22%', color: '#94a3b8' },
  ],
  'Money Mule': [
    { label: 'Recipient', value: 89, width: '89%', color: '#f43f5e' },
    { label: 'Network',   value: 82, width: '82%', color: '#f43f5e' },
    { label: 'Amount',    value: 67, width: '67%', color: '#f59e0b' },
    { label: 'Velocity',  value: 51, width: '51%', color: '#f59e0b' },
  ],
  'Suspicious': [
    { label: 'Velocity', value: 72, width: '72%', color: '#f43f5e' },
    { label: 'Device',   value: 61, width: '61%', color: '#f59e0b' },
    { label: 'Amount',   value: 48, width: '48%', color: '#f59e0b' },
    { label: 'Hour',     value: 35, width: '35%', color: '#94a3b8' },
  ],
  'Phishing': [
    { label: 'Recipient', value: 89, width: '89%', color: '#f43f5e' },
    { label: 'Network',   value: 75, width: '75%', color: '#f43f5e' },
    { label: 'Amount',    value: 62, width: '62%', color: '#f59e0b' },
    { label: 'Time',      value: 48, width: '48%', color: '#f59e0b' },
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
  phishing: [0.3, 0.5, 0.6, 0.6, 0.85, 0.4, 0.5, 0.3],
  card_testing: [0.95, 0.4, 0.3, 0.5, 0.3, 0.2, 0.2, 0.1],
  account_takeover: [0.2, 0.85, 0.9, 0.7, 0.4, 0.3, 0.6, 0.5],
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

  const [mlLimeBars, setMlLimeBars] = useState<
    { label: string; width: string; color: string; value: number }[] | null
  >(null);
  const [limeLoading, setLimeLoading] = useState(false);
  const [corrections, setCorrections] = useState<
    { txn_id: string; true_label: number }[]
  >([]);
  const [mlRecommendations, setMlRecommendations] = useState<any[]>([]);
  const [mlTimeline, setMlTimeline] = useState<any[]>([]);

  const limeBars = LIME_BY_TYPE[selectedCase.type] || LIME_BY_TYPE['Suspicious'];

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Destroy any existing chart on this canvas first
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    const shapData = SHAP_BY_TYPE[selectedCase.type] || SHAP_BY_TYPE['Suspicious'];

    try {
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
              label: 'Phishing Ref',
              data: FINGERPRINTS.phishing,
              borderColor: 'rgba(52,211,153,0.3)',
              backgroundColor: 'rgba(52,211,153,0.15)',
              borderWidth: 1,
              borderDash: [4, 4],
              fill: true,
              pointRadius: 0,
            },
            {
              label: 'Card Testing Ref',
              data: FINGERPRINTS.card_testing,
              borderColor: 'rgba(251,191,36,0.3)',
              backgroundColor: 'rgba(251,191,36,0.15)',
              borderWidth: 1,
              borderDash: [4, 4],
              fill: true,
              pointRadius: 0,
            },
            {
              label: 'Account Takeover Ref',
              data: FINGERPRINTS.account_takeover,
              borderColor: 'rgba(167,139,250,0.3)',
              backgroundColor: 'rgba(167,139,250,0.15)',
              borderWidth: 1,
              borderDash: [4, 4],
              fill: true,
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

      getShap(selectedCase.id).then(shap => {
        if (!shap || !chartRef.current) return;
        const shapValues = [
          Math.abs(shap.velocity || 0),
          Math.abs(shap.device_risk || 0),
          Math.abs(shap.time_risk || 0),
          Math.abs(shap.amount_risk || 0),
          Math.abs(shap.recipient || 0),
          Math.abs(shap.network || 0),
          Math.abs(shap.identity || 0),
          Math.abs(shap.location || 0),
        ];
        const maxVal = Math.max(...shapValues, 0.01);
        chartRef.current.data.datasets[0].data =
          shapValues.map((v: number) => parseFloat((v / maxVal).toFixed(3)));
        chartRef.current.update();
      });

    } catch (e) {
      console.warn('ChartJS init error (non-fatal):', e);
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [selectedCase.$id]);

  useEffect(() => {
    (async () => {
      setMlLimeBars(null);
      setLimeLoading(true);
      // Score WITH explanation enabled (skip_explain: false) and wait for it
      try {
        await fetch('http://localhost:8000/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...casePayload, txn_id: selectedCase.id, skip_explain: false }),
        });
      } catch (_) {}
      // Wait for LIME to complete — LIME takes 800-1500ms
      await new Promise(r => setTimeout(r, 1800));

      getExplanation(selectedCase.id).then(lime => {
        if (lime && lime.length > 0) {
          const maxWeight = Math.max(...lime.map((r: any) => Math.abs(r.weight)), 0.0001);
          const bars = lime
            .slice(0, 5)
            .map((r: any) => ({
              label: r.feature.split(' ')[0].replace(/_/g, ' '),
              value: Number((Math.abs(r.weight) / maxWeight * 100).toFixed(1)),
              width: `${Math.min(99, Math.max(8, (Math.abs(r.weight) / maxWeight) * 99))}%`,
              color: r.weight > 0 ? '#f43f5e' : '#10b981',
            }));
          if (bars.length > 0) {
            setMlLimeBars(bars);
          }
          setLimeLoading(false);
        }
      }).catch(() => setLimeLoading(false));

      getRecommendations(selectedCase.id).then(recs => {
        if (recs && recs.length > 0) setMlRecommendations(recs);
        else setMlRecommendations([]);
      });

      getTimeline(selectedCase.id).then(events => {
        if (events && events.length > 0) setMlTimeline(events);
        else setMlTimeline([]);
      });
    })();
  }, [selectedCase.$id]);

  useEffect(() => {
    let mounted = true;

    async function fetchCases(isInitial = false) {
      try {
        const data = await api.getCases();
        if (!mounted) return;
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
          // Sort by priority descending so new critical cases rise to the top
          mapped.sort((a: any, b: any) => b.priority - a.priority);
          setCases(mapped);
          if (isInitial) setSelectedCase(mapped[0]);
        }
      } catch (e) {
        // use mock
      } finally {
        if (isInitial && mounted) setLoading(false);
      }
    }

    fetchCases(true);
    // Poll every 5 seconds so demo scenario cases appear in real time
    const interval = setInterval(() => fetchCases(false), 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
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
      `ARGUS EYE INCIDENT REPORT`,
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
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>LIME Explainability</h4>
                    {limeLoading && (
                      <span className="text-[10px] text-amber-400 flex items-center gap-1">
                        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        ML computing...
                      </span>
                    )}
                    {!limeLoading && mlLimeBars && (
                      <span className="text-[10px] text-emerald-400">● Live ML</span>
                    )}
                    {!limeLoading && !mlLimeBars && (
                      <span className="text-[10px]" style={{ color: 'var(--muted)' }}>● Baseline</span>
                    )}
                  </div>
                  <div className="w-full h-[180px] mt-3" key={`lime-${selectedCase.$id}`}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={mlLimeBars || limeBars} layout="vertical" margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="label" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} width={80} />
                        <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: '8px', fontSize: '10px', color: '#f8fafc' }} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={12}>
                          {Array.isArray(mlLimeBars) ? mlLimeBars.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color || '#f43f5e'} />
                          )) : limeBars.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color || '#f43f5e'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="glass-card p-5 rounded-xl relative">
                  <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted)' }}>SHAP Fraud DNA</h4>
                  <div className="h-[200px] z-10 relative">
                    <canvas key={selectedCase.$id} ref={canvasRef} />
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card p-5 rounded-xl mb-6">
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--muted)' }}>Recommended Actions</h4>
              <div className="space-y-2">
                {(mlRecommendations.length > 0
                  ? mlRecommendations
                  : [
                    {
                      action: 'Freeze Account Immediately',
                      urgency: 'HIGH',
                      description: 'Prevent further unauthorized transactions',
                      rbi_ref: CASE_DETAILS[selectedCase.type]?.rbi || 'RBI/2021-22/56'
                    },
                    {
                      action: 'Request KYC Reverification',
                      urgency: 'MEDIUM',
                      description: 'Identity mismatch detected',
                      rbi_ref: 'RBI/2020-21/44'
                    },
                  ]
                ).map((rec: any, i: number) => (
                  <div key={i}
                    className={`flex items-center justify-between p-3 rounded-lg border ${rec.urgency === 'HIGH'
                      ? 'bg-rose-500/10 border-rose-500/20'
                      : rec.urgency === 'MEDIUM'
                        ? 'bg-amber-500/10 border-amber-500/20'
                        : 'bg-blue-500/10 border-blue-500/20'
                      }`}>
                    <div>
                      <div className={`font-medium text-sm ${rec.urgency === 'HIGH' ? 'text-rose-400' :
                        rec.urgency === 'MEDIUM' ? 'text-amber-400' : 'text-blue-400'
                        }`}>{rec.action}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                        RBI Ref: {rec.rbi_ref || rec.rbi}
                      </div>
                    </div>
                    {rec.action.includes('KYC') ? (
                      <button
                        onClick={handleKYC}
                        disabled={kycLoading || kycDone}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium
                                   transition-colors flex items-center gap-2 min-w-[80px] justify-center
                                   text-white ${rec.urgency === 'HIGH'
                            ? 'bg-rose-500 hover:bg-rose-600 disabled:opacity-60'
                            : rec.urgency === 'MEDIUM'
                              ? 'bg-amber-500 hover:bg-amber-600 disabled:opacity-60'
                              : 'bg-blue-500 hover:bg-blue-600 disabled:opacity-60'
                          }`}
                      >
                        {kycLoading
                          ? <Loader2 className="w-3 h-3 animate-spin" />
                          : kycDone
                            ? '✓ Sent'
                            : 'Execute'}
                      </button>
                    ) : (
                      <button
                        onClick={rec.urgency === 'HIGH' ? handleBlock : undefined}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium
                                    text-white transition-colors ${rec.urgency === 'HIGH'
                            ? 'bg-rose-500 hover:bg-rose-600'
                            : rec.urgency === 'MEDIUM'
                              ? 'bg-amber-500 hover:bg-amber-600'
                              : 'bg-blue-500 hover:bg-blue-600'
                          }`}>
                        Execute
                      </button>
                    )}
                  </div>
                ))}
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
                  <div className="flex items-center gap-6 mt-4">
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={8} data={[{ name: 'recovery', value: recoveryProb, fill: recoveryColor }]}>
                          <RadialBar background={{ fill: 'rgba(255,255,255,0.05)' }} dataKey="value" cornerRadius={4} />
                        </RadialBarChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center -mt-1">
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
                        Drops 3% per hour — act now to maximise recovery.
                      </div>
                      {recoveryProb > 60 && (
                        <div className="text-xs font-bold text-emerald-400 mt-2 flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded inline-block w-fit border border-emerald-500/20">
                          <Clock className="w-3 h-3" />
                          <span className="animate-pulse">00:59:{(59 - new Date().getSeconds()).toString().padStart(2, '0')}</span>
                        </div>
                      )}
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

            {/* Case Event Timeline */}
            {mlTimeline.length > 0 && (
              <div className="glass-card p-5 rounded-xl mt-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--muted)' }}>
                  Case Event Timeline
                </h4>
                <div className="space-y-3">
                  {mlTimeline.slice(0, 6).map((event: any, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${event.anomaly === 'geo_impossibility' ? 'bg-rose-400' :
                        event.anomaly === 'velocity_attack' ? 'bg-orange-400' :
                          event.anomaly === 'new_device' ? 'bg-amber-400' :
                            event.event === 'ANALYST_ACTION' ? 'bg-blue-400' :
                              event.anomaly ? 'bg-rose-400' :
                                'bg-emerald-400'
                        }`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text)' }}>
                            {event.event?.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[10px] flex-shrink-0" style={{ color: 'var(--muted)' }}>
                            {new Date(event.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{event.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t flex justify-end gap-3" style={{ borderColor: 'var(--border)', background: 'var(--cardBg)' }}>
            <button onClick={handleGenerateReport} className="px-4 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-white/5" style={{ color: 'var(--muted)' }}>
              Generate Report
            </button>
            <button
              onClick={async () => {
                const updated = [
                  ...corrections,
                  { txn_id: selectedCase.id, true_label: 0 }
                ];
                setCorrections(updated);
                if (updated.length >= 50) {
                  const result = await retrainModel(updated);
                  if (result) {
                    alert(`Model updated — ${result.num_corrections} corrections applied in ${result.retrain_time_ms}ms`);
                    setCorrections([]);
                  }
                }
              }}
              className="px-4 py-2 rounded-xl text-sm font-medium text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 transition-colors"
            >
              Mark Legitimate {corrections.length > 0 && `(${corrections.length}/50)`}
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
