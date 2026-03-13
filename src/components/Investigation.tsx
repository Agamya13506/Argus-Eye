import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { Search, Filter, AlertTriangle, Clock, ArrowRight, ShieldAlert, Activity, Loader2 } from 'lucide-react';
import api from '../services/api';

const mockCases = [
  { $id: 'c1', id: 'CASE-8842', priority: 95, amount: '₹1,20,000', type: 'Account Takeover', time: '5m ago', status: 'URGENT', description: 'Multiple unauthorized login attempts followed by large transfer' },
  { $id: 'c2', id: 'CASE-8841', priority: 88, amount: '₹45,000', type: 'SIM Swap', time: '12m ago', status: 'URGENT', description: 'SIM swap detected, unauthorized OTP verification' },
  { $id: 'c3', id: 'CASE-8840', priority: 72, amount: '₹8,500', type: 'Suspicious', time: '25m ago', status: 'HIGH', description: 'Unusual transaction pattern from new device' },
  { $id: 'c4', id: 'CASE-8839', priority: 65, amount: '₹12,000', type: 'Money Mule', time: '1h ago', status: 'HIGH', description: 'Rapid layering of funds through multiple accounts' },
  { $id: 'c5', id: 'CASE-8838', priority: 45, amount: '₹2,500', type: 'Card Testing', time: '2h ago', status: 'ROUTINE', description: 'Multiple small transactions testing card validity' },
];

export default function Investigation() {
  const [cases, setCases] = useState(mockCases);
  const [selectedCase, setSelectedCase] = useState(mockCases[0]);
  const [loading, setLoading] = useState(true);

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

  const handleBlock = () => {
    setCases(prev => prev.map(c => c.$id === selectedCase.$id ? { ...c, status: 'BLOCKED' } : c));
    setSelectedCase(prev => ({ ...prev, status: 'BLOCKED' }));
  };

  const handleVerify = () => {
    setCases(prev => prev.map(c => c.$id === selectedCase.$id ? { ...c, status: 'VERIFIED' } : c));
    setSelectedCase(prev => ({ ...prev, status: 'VERIFIED' }));
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
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="glass-card p-5 rounded-xl">
                <h4 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--muted)' }}>Transaction Details</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm" style={{ color: 'var(--muted)' }}>Sender</span>
                    <span className="font-medium text-sm" style={{ color: 'var(--text)' }}>user_44 (Verified)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm" style={{ color: 'var(--muted)' }}>Receiver</span>
                    <span className="font-medium text-sm text-rose-400 flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" /> user_8 (New Device)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm" style={{ color: 'var(--muted)' }}>Location</span>
                    <span className="font-medium text-sm" style={{ color: 'var(--text)' }}>Mumbai → Delhi (8 min)</span>
                  </div>
                </div>
              </div>

              <div className="glass-card p-5 rounded-xl">
                <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted)' }}>LIME Explainability</h4>
                <div className="w-full space-y-3 mt-3">
                  {[
                    { label: 'Velocity', width: '85%', color: '#f43f5e' },
                    { label: 'Location', width: '92%', color: '#f43f5e' },
                    { label: 'Amount', width: '60%', color: '#f59e0b' },
                  ].map(bar => (
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
            </div>

            <div className="glass-card p-5 rounded-xl mb-6">
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--muted)' }}>Recommended Actions</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
                  <div>
                    <div className="text-rose-400 font-medium text-sm">Freeze Account Immediately</div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>RBI Ref: RBI/2021-22/56</div>
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
                  <button className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors">
                    Execute
                  </button>
                </div>
              </div>
            </div>

            {/* Case Notes */}
            <div className="glass-card p-5 rounded-xl">
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--muted)' }}>Case Description</h4>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{selectedCase.description}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t flex justify-end gap-3" style={{ borderColor: 'var(--border)', background: 'var(--cardBg)' }}>
            <button className="px-4 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-white/5" style={{ color: 'var(--muted)' }}>
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
