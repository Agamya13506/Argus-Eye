import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { ShieldAlert, Users, Shield, AlertTriangle, CheckCircle2, Search, Loader2, XCircle } from 'lucide-react';
import api, { appwriteClient } from '../services/api';

const mockThreats = [
  { $id: 't1', entityId: 'upi_fraud_992', entityType: 'UPI ID', source: 'BOTH', reports: 14, score: 92, status: 'CONFIRMED', time: '2m ago' },
  { $id: 't2', entityId: '9876543210', entityType: 'Phone', source: 'USER', reports: 3, score: 45, status: 'CORROBORATED', time: '15m ago' },
  { $id: 't3', entityId: 'fake-kyc.com', entityType: 'URL', source: 'ANALYST', reports: 0, score: 85, status: 'REVIEWING', time: '1h ago' },
  { $id: 't4', entityId: 'merch_fake_11', entityType: 'Merchant', source: 'BOTH', reports: 8, score: 98, status: 'BLOCKLISTED', time: '3h ago' },
];

export default function ThreatIntel() {
  const [threats, setThreats] = useState(mockThreats);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchThreats() {
      try {
        const data = await api.getThreats();
        if (data?.length > 0) {
          setThreats(data.map((t: any) => ({
            $id: t.$id,
            entityId: t.entityId,
            entityType: t.entityType,
            source: t.source,
            reports: t.reports,
            score: t.score,
            status: t.status,
            time: t.time || 'Recent',
          })));
        }
      } catch (e) {
        // use mock data
      } finally {
        setLoading(false);
      }
    }
    fetchThreats();
  }, []);

  useEffect(() => {
    let unsubscribe: () => void;
    try {
      unsubscribe = appwriteClient.subscribe(
        'databases/argus_eye_db/collections/threats/documents',
        (response: any) => {
          const payload = response.payload;
          if (response.events.includes('databases.*.collections.*.documents.*.create')) {
            setThreats((prev: any[]) => [payload, ...prev]);
          }
          if (response.events.includes('databases.*.collections.*.documents.*.update')) {
            setThreats((prev: any[]) => prev.map((t: any) =>
              t.$id === payload.$id ? { ...t, ...payload } : t
            ));
          }
        }
      );
      console.log('Appwrite Realtime: subscribed to threats');
    } catch (e: any) {
      console.error('Appwrite Realtime failed:', e.message);
    }
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  const handleConfirm = async (id: string) => {
    setProcessingId(id);
    const prev = threats.find((t: any) => t.$id === id);
    setThreats((prev: any[]) => prev.map((t: any) =>
      t.$id === id ? { ...t, status: 'CONFIRMED' } : t
    ));
    try {
      await api.confirmThreat(id);
    } catch (e) {
      setThreats((prev: any[]) => prev.map((t: any) =>
        t.$id === id ? { ...t, ...prev } : t
      ));
    } finally {
      setProcessingId(null);
    }
  };

  const handleBlocklist = async (id: string) => {
    setProcessingId(id);
    const prev = threats.find((t: any) => t.$id === id);
    setThreats((prev: any[]) => prev.map((t: any) =>
      t.$id === id ? { ...t, status: 'BLOCKLISTED' } : t
    ));
    try {
      await api.blocklistThreat(id);
    } catch (e) {
      setThreats((prev: any[]) => prev.map((t: any) =>
        t.$id === id ? { ...t, ...prev } : t
      ));
    } finally {
      setProcessingId(null);
    }
  };

  const handleDismiss = async (id: string) => {
    setProcessingId(id);
    const prev = threats.find((t: any) => t.$id === id);
    const prevThreats = [...threats];
    setThreats((prev: any[]) => prev.filter((t: any) => t.$id !== id));
    try {
      await api.dismissThreat(id);
    } catch (e) {
      setThreats(prevThreats);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="glass-panel rounded-2xl flex flex-col h-[calc(100vh-8rem)] overflow-hidden"
    >
      {/* Header */}
      <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)', background: 'var(--cardBg)' }}>
        <div className="flex items-center gap-3">
          <div className="bg-rose-500/10 p-2 rounded-xl">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Shared Threat Intel</h2>
            <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Real-time Threat Intelligence Feed</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="glass-card px-3 py-1.5 text-xs font-medium text-rose-300 transition-colors flex items-center gap-1 rounded-lg hover:bg-rose-400/10">
            <Users className="w-3 h-3" /> User Reports
          </button>
          <button className="glass-card px-3 py-1.5 text-xs font-medium text-amber-400 transition-colors flex items-center gap-1 rounded-lg hover:bg-amber-500/10">
            <Shield className="w-3 h-3" /> Analyst Flags
          </button>
        </div>
      </div>

      {/* Threat List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 text-rose-400 animate-spin" />
          </div>
        ) : (
          threats.map((threat, idx) => (
            <motion.div
              key={threat.$id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + idx * 0.08 }}
              whileHover={{ x: 4 }}
              className="glass-card p-4 rounded-xl transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  {threat.status === 'CONFIRMED' || threat.status === 'BLOCKLISTED' ? (
                    <ShieldAlert className="w-8 h-8 text-rose-400" />
                  ) : threat.status === 'CORROBORATED' ? (
                    <AlertTriangle className="w-8 h-8 text-amber-400" />
                  ) : (
                    <Search className="w-8 h-8 text-rose-400" />
                  )}
                  {threat.source === 'BOTH' && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 flex items-center justify-center" style={{ borderColor: 'var(--surface)' }}>
                      <Users className="w-2 h-2 text-white" />
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold font-mono" style={{ color: 'var(--text)' }}>{threat.entityId}</h3>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/5" style={{ color: 'var(--muted)' }}>
                      {threat.entityType}
                    </span>
                    <span 
                      className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full"
                      style={{ 
                        background: threat.source === 'USER' ? 'rgba(20,184,166,0.12)' : 
                                   threat.source === 'ANALYST' ? 'rgba(244,63,94,0.12)' : 
                                   'rgba(168,85,247,0.12)',
                        color: threat.source === 'USER' ? '#2dd4bf' : 
                               threat.source === 'ANALYST' ? '#fb7185' : 
                               '#c084fc'
                      }}
                    >
                      {threat.source}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: 'var(--muted)' }}>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" /> {threat.reports} reports
                    </span>
                    <span>•</span>
                    <span>{threat.time}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div style={{ width: '80px' }}>
                  <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--muted)' }}>Score</div>
                  <div className="text-lg font-bold" style={{
                    color: threat.score >= 86 ? '#f43f5e' :
                           threat.score >= 61 ? '#f97316' :
                           threat.score >= 31 ? '#f59e0b' : 'var(--muted)'
                  }}>
                    {threat.score}
                  </div>
                  <div className="h-1 rounded-full mt-1 overflow-hidden" style={{ background: 'var(--border)', width: '80px' }}>
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${threat.score}%` }}
                      transition={{ duration: 0.8, delay: 0.1 }}
                      style={{
                        background: threat.score >= 86 ? '#f43f5e' :
                                    threat.score >= 61 ? '#f97316' :
                                    threat.score >= 31 ? '#f59e0b' : '#64748b'
                      }}
                    />
                  </div>
                </div>

                <div className="w-32">
                  <div className={`text-[10px] font-bold uppercase tracking-wider text-center py-1 rounded-md border ${threat.status === 'BLOCKLISTED' ? 'bg-rose-500/15 text-rose-400 border-rose-500/20' :
                      threat.status === 'CONFIRMED' ? 'bg-rose-500/10 text-rose-400 border-rose-500/15' :
                        threat.status === 'CORROBORATED' ? 'bg-amber-500/10 text-amber-400 border-amber-500/15' :
                          'bg-rose-500/10 text-rose-400 border-rose-500/15'
                    }`}>
                    {threat.status}
                  </div>
                </div>

                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {threat.status !== 'CONFIRMED' && threat.status !== 'BLOCKLISTED' && (
                    <button
                      onClick={() => handleConfirm(threat.$id)}
                      disabled={processingId === threat.$id}
                      className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors disabled:opacity-50"
                      title="Confirm Threat"
                    >
                      {processingId === threat.$id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    </button>
                  )}
                  <button
                    onClick={() => handleBlocklist(threat.$id)}
                    disabled={processingId === threat.$id}
                    className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors disabled:opacity-50"
                    title="Blocklist"
                  >
                    {processingId === threat.$id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleDismiss(threat.$id)}
                    disabled={processingId === threat.$id}
                    className="p-2 bg-slate-500/10 hover:bg-slate-500/20 text-slate-400 rounded-lg transition-colors disabled:opacity-50"
                    title="Dismiss"
                  >
                    {processingId === threat.$id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
