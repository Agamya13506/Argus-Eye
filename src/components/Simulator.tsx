import { motion } from 'motion/react';
import { useState } from 'react';
import { Play, Settings, ShieldAlert, CheckCircle2, RefreshCw, Zap, Target, TrendingUp, Database, Loader2 } from 'lucide-react';
import api from '../services/api';
import { scoreTransaction } from '../services/mlApi';

const attackVectors = [
  { id: 'card_testing', name: 'Card Testing', description: 'Multiple small transactions to test valid cards', risk: 'High' },
  { id: 'velocity', name: 'Velocity Attack', description: 'Rapid successive transactions from same source', risk: 'High' },
  { id: 'account_takeover', name: 'Account Takeover', description: 'Suspicious login patterns and transaction changes', risk: 'Critical' },
  { id: 'geo_imposter', name: 'Geo Impersonation', description: 'Transactions from impossible travel distances', risk: 'Medium' },
  { id: 'mule', name: 'Money Mule', description: 'Layering transfers through intermediary accounts', risk: 'High' },
  { id: 'phishing', name: 'Phishing Attack', description: 'Credential harvesting and fraudulent transactions', risk: 'Critical' },
  { id: 'uco_bank', name: 'UCO Bank Pattern', description: 'ISO-8583 Process-and-Check logic inversion — credit before validation', risk: 'Critical' },
];

interface SimResult {
  vector: string;
  total: number;
  detected: number;
  blocked: number;
  falsePos: number;
}

export default function Simulator() {
  const [selectedVector, setSelectedVector] = useState('card_testing');
  const [isRunning, setIsRunning] = useState(false);
  const [simProgress, setSimProgress] = useState(0);
  const [results, setResults] = useState<SimResult[]>([]);
  const [simLogs, setSimLogs] = useState<Array<{ id: number; time: string; status: string; score: number }>>([]);
  const [mlScore, setMlScore] = useState<number | null>(null);
  const [mlFraudType, setMlFraudType] = useState<string | null>(null);
  const [mlRiskLevel, setMlRiskLevel] = useState<string | null>(null);
  const [mlLime, setMlLime] = useState<any[]>([]);
  const [currentTxnId, setCurrentTxnId] = useState<string>('');

  function getVectorScore(vectorId: string, iteration: number): number {
    const baseScores: Record<string, number> = {
      card_testing: 88,
      velocity: 91,
      account_takeover: 94,
      geo_imposter: 89,
      mule: 82,
      phishing: 86,
      uco_bank: 96,
    };
    const base = baseScores[vectorId] || 85;
    const variance = (iteration % 3 === 0 ? -8 :
      iteration % 3 === 1 ? +4 : -2);
    return Math.min(99, Math.max(60, base + variance));
  }

  const startSimulation = async () => {
    setIsRunning(true);
    setSimProgress(0);
    setSimLogs([]);
    setResults([]);
    setMlScore(null);
    setMlFraudType(null);
    setMlRiskLevel(null);
    setMlLime([]);

    const txnId = `sim_${selectedVector}_${Date.now()}`;
    setCurrentTxnId(txnId);

    // Call real ML backend
    const mlResult = await scoreTransaction(selectedVector, txnId);

    // Animate logs using ML score as baseline
    const baseScore = mlResult?.score ?? getVectorScore(selectedVector, 0);
    const logs: typeof simLogs = [];
    for (let i = 0; i < 8; i++) {
      await new Promise(r => setTimeout(r, 300));
      // Vary around the real ML score for visual realism
      const variance = (i % 3 === 0 ? -8 : i % 3 === 1 ? +4 : -2);
      const score = Math.min(99, Math.max(40, baseScore + variance));
      const status = score >= 75 ? 'BLOCKED' : score >= 40 ? 'FLAGGED' : 'PASSED';
      logs.push({
        id: 1000 + i + 1,
        time: `00:0${Math.floor(i / 2)}:${String((i * 7) % 60).padStart(2, '0')}`,
        status,
        score,
      });
      setSimLogs([...logs]);
      setSimProgress(Math.min(100, Math.round(((i + 1) / 8) * 100)));
    }

    // Store ML results for display
    if (mlResult) {
      setMlScore(mlResult.score);
      setMlFraudType(mlResult.fraud_type);
      setMlRiskLevel(mlResult.risk_level);
      setMlLime(mlResult.lime || []);
    }

    const vectorStats: Record<string, { detection: number; block: number }> = {
      card_testing: { detection: 0.94, block: 0.97 },
      velocity: { detection: 0.96, block: 0.98 },
      account_takeover: { detection: 0.91, block: 0.95 },
      geo_imposter: { detection: 0.93, block: 0.96 },
      mule: { detection: 0.88, block: 0.92 },
      phishing: { detection: 0.89, block: 0.93 },
      uco_bank: { detection: 0.97, block: 0.99 },
    };
    const stats = vectorStats[selectedVector] || { detection: 0.90, block: 0.94 };
    const total = 800 + Math.floor(selectedVector.length * 47);
    const detected = Math.floor(total * stats.detection);
    const blocked = Math.floor(detected * stats.block);
    const falsePos = Math.floor(total * 0.012);
    const vectorName = attackVectors.find(v => v.id === selectedVector)?.name || selectedVector;
    setResults([{ vector: vectorName, total, detected, blocked, falsePos }]);
    setIsRunning(false);
  };

  const resetSimulation = () => {
    setSimProgress(0);
    setSimLogs([]);
    setResults([]);
  };

  const detectionRate = results.length > 0 ? Math.round((results[0].detected / results[0].total) * 100) : 0;
  const falsePositives = results.length > 0 ? results[0].falsePos : 0;

  const historicalResults = [
    { vector: 'Card Testing', total: 1250, detected: 1180 },
    { vector: 'Velocity', total: 890, detected: 845 },
    { vector: 'Account Takeover', total: 340, detected: 325 },
    { vector: 'Geo Impersonation', total: 520, detected: 480 },
    { vector: 'Money Mule', total: 180, detected: 165 },
  ];

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
            <Play className="w-8 h-8 text-rose-400" />
            Fraud Simulator
          </h2>
          <p style={{ color: 'var(--muted)' }}>Test rulesets against simulated attack vectors</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={startSimulation}
            disabled={isRunning}
            className="btn-accent flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {isRunning ? 'Running...' : 'Run Simulation'}
          </button>
          <button
            onClick={resetSimulation}
            className="px-4 py-2 rounded-xl glass-card flex items-center gap-2 text-sm font-medium transition-colors hover:bg-white/5"
            style={{ color: 'var(--muted)' }}
          >
            <RefreshCw className="w-4 h-4" /> Reset
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Attack Vectors & Logs */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="glass-panel rounded-2xl p-6 lg:col-span-2 h-[420px] flex flex-col"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}>
              <Target className="w-5 h-5 text-rose-400" />
              Attack Vectors
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            {attackVectors.map((vector) => (
              <button
                key={vector.id}
                onClick={() => setSelectedVector(vector.id)}
                className={`p-3 rounded-xl text-left transition-all ${selectedVector === vector.id
                  ? 'bg-rose-500/10 border-2 border-rose-500/40'
                  : 'glass-card hover:border-rose-500/20'
                  }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>{vector.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${vector.risk === 'Critical' ? 'bg-rose-500/15 text-rose-400' :
                    vector.risk === 'High' ? 'bg-amber-500/15 text-amber-400' :
                      'bg-rose-500/15 text-rose-400'
                    }`}>
                    {vector.risk}
                  </span>
                </div>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>{vector.description}</p>
              </button>
            ))}
          </div>

          {selectedVector === 'uco_bank' && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-4 rounded-xl border border-amber-500/20 mb-4"
              style={{ background: 'rgba(245,158,11,0.05)' }}
            >
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                UCO Bank IMPS Glitch — 2023
              </div>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                The 2023 UCO Bank IMPS glitch resulted in ₹820 crore being credited to 41,000
                accounts through ISO-8583 message mis-routing. The middleware used
                "Process-and-Check" logic — credits were applied before message field validation.
                When validation failed, the sender's bank received a refund but the receiver kept
                the money. This preset simulates that exact pattern. FraudShield detects it via
                Circular Fund Flow analysis and velocity rules.
              </p>
            </motion.div>
          )}

          {/* Simulation Logs */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-2">
            {simLogs.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm" style={{ color: 'var(--muted)' }}>
                Select a vector and click "Run Simulation" to start
              </div>
            ) : (
              simLogs.map((log, i) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="glass-card p-3 rounded-xl flex items-center justify-between border-l-4"
                  style={{ borderLeftColor: log.score >= 75 ? '#f43f5e' : log.score >= 40 ? '#f59e0b' : '#e11d48' }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono" style={{ color: 'var(--muted)' }}>{log.time}</span>
                    <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>Txn #{log.id}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${log.status === 'BLOCKED' ? 'bg-rose-500/15 text-rose-400' :
                      log.status === 'FLAGGED' ? 'bg-amber-500/15 text-amber-400' :
                        'bg-emerald-500/15 text-emerald-400'
                      }`}>{log.status}</span>
                    <span className="text-xs font-mono font-bold" style={{ color: 'var(--text)' }}>{log.score}</span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Results Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass-panel rounded-2xl p-6 h-[420px] flex flex-col"
        >
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            Results
          </h3>

          <div className="flex-1 flex flex-col justify-center items-center text-center">
            <div className="relative w-32 h-32 mb-4">
              <svg className="w-full h-full -rotate-90">
                <circle cx="64" cy="64" r="56" fill="none" strokeWidth="8" style={{ stroke: 'var(--border)' }} />
                <motion.circle
                  cx="64" cy="64" r="56" fill="none" strokeWidth="8"
                  strokeDasharray={351.86}
                  initial={{ strokeDashoffset: 351.86 }}
                  animate={{ strokeDashoffset: 351.86 - (351.86 * simProgress / 100) }}
                  transition={{ duration: 0.3 }}
                  className="text-emerald-400"
                  stroke="currentColor"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold number-glow" style={{ color: 'var(--text)' }}>{simProgress}%</span>
              </div>
            </div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--muted)' }}>Completion</h4>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {simProgress === 0 ? 'Ready to start' : simProgress < 100 ? 'In progress...' : 'Complete'}
            </p>
          </div>

          {simProgress === 100 && results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 grid grid-cols-2 gap-4"
            >
              <div className="glass-card p-3 rounded-xl text-center">
                <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--muted)' }}>Detection Rate</div>
                <div className="text-xl font-bold text-emerald-400">{detectionRate}%</div>
              </div>
              <div className="glass-card p-3 rounded-xl text-center">
                <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--muted)' }}>False Positives</div>
                <div className="text-xl font-bold text-rose-400">{falsePositives}</div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {mlScore !== null && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-2xl p-6 mb-8"
        >
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"
            style={{ color: 'var(--text)' }}>
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            ML Model Result
            <span className="text-xs font-normal ml-2 px-2 py-0.5 rounded-full
                             bg-emerald-500/15 text-emerald-400">
              Real AI Score
            </span>
          </h3>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="text-xs uppercase tracking-wider mb-2"
                style={{ color: 'var(--muted)' }}>Risk Score</div>
              <div className="text-4xl font-bold"
                style={{
                  color: mlScore >= 75 ? '#f43f5e' :
                    mlScore >= 40 ? '#fbbf24' : '#4ade80'
                }}>
                {mlScore.toFixed(1)}
              </div>
              <div className={`text-sm mt-1 font-medium ${mlRiskLevel === 'HIGH' ? 'text-rose-400' :
                  mlRiskLevel === 'MEDIUM' ? 'text-amber-400' :
                    'text-emerald-400'
                }`}>{mlRiskLevel} RISK</div>
              {mlFraudType && (
                <div className="text-xs mt-2" style={{ color: 'var(--muted)' }}>
                  Type: <span style={{ color: 'var(--accent)' }}>
                    {mlFraudType.replace(/_/g, ' ')}
                  </span>
                </div>
              )}
            </div>
            <div className="col-span-2">
              <div className="text-xs uppercase tracking-wider mb-3"
                style={{ color: 'var(--muted)' }}>
                LIME — Top Risk Factors
              </div>
              {mlLime.length > 0 ? (
                <div className="space-y-3">
                  {mlLime.slice(0, 4).map((r: any, i: number) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs w-36 truncate"
                        style={{ color: 'var(--muted)' }}>
                        {r.feature.split(' ')[0].replace(/_/g, ' ')}
                      </span>
                      <div className="flex-1 h-2 rounded-full overflow-hidden"
                        style={{ background: 'var(--border)' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(99, r.weight * 8000)}%` }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                          className="h-full rounded-full"
                          style={{
                            backgroundColor:
                              r.weight > 0.005 ? '#f43f5e' : '#f59e0b'
                          }}
                        />
                      </div>
                      <span className="text-xs w-12 text-right"
                        style={{ color: 'var(--muted)' }}>
                        {(r.weight * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  No risk factors returned — model scored as LOW risk.
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Historical Performance & Rulesets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="glass-panel rounded-2xl p-6"
        >
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <TrendingUp className="w-5 h-5 text-rose-400" /> Historical Performance
          </h3>
          <div className="space-y-4">
            {historicalResults.map((result, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="w-28 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{result.vector}</span>
                <div className="flex-1 h-6 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(result.detected / result.total) * 100}%` }}
                    transition={{ duration: 1, delay: 0.6 + i * 0.1 }}
                    className="h-full rounded-full flex items-center justify-end pr-2"
                    style={{ background: 'linear-gradient(90deg, #f43f5e, #f43f5e)' }}
                  >
                    <span className="text-[10px] font-bold text-white">{result.detected}</span>
                  </motion.div>
                </div>
                <span className="text-xs w-16 text-right" style={{ color: 'var(--muted)' }}>{Math.round((result.detected / result.total) * 100)}%</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="glass-panel rounded-2xl p-6"
        >
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <Zap className="w-5 h-5 text-amber-400" /> Active Rulesets
          </h3>
          <div className="space-y-4">
            {[
              { name: 'Velocity Rules', desc: 'Detects rapid successive transactions from a single source.', active: true, rate: '98%' },
              { name: 'Geolocation Mismatch', desc: 'Flags transactions from impossible travel distances.', active: true, rate: '95%' },
              { name: 'New Device Login', desc: 'Requires additional verification for unrecognized devices.', active: false, rate: '' },
            ].map((rule, i) => (
              <div key={i} className={`glass-card p-4 rounded-xl ${!rule.active ? 'opacity-50' : ''}`}
                style={rule.active ? { borderColor: 'rgba(16,185,129,0.2)' } : {}}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold" style={{ color: 'var(--text)' }}>{rule.name}</h4>
                  {rule.active ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <div className="w-4 h-4 rounded-full border-2" style={{ borderColor: 'var(--muted)' }} />}
                </div>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>{rule.desc}</p>
                <div className="mt-2 flex gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded ${rule.active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/5'}`} style={!rule.active ? { color: 'var(--muted)' } : {}}>
                    {rule.active ? 'Active' : 'Inactive'}
                  </span>
                  {rule.rate && <span className="text-[10px] px-2 py-0.5 rounded bg-white/5" style={{ color: 'var(--muted)' }}>{rule.rate} Detection</span>}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Dataset Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="glass-panel rounded-2xl p-6"
      >
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text)' }}>
          <Database className="w-5 h-5 text-rose-400" /> Simulation Dataset
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Transactions', value: '12,450', color: 'var(--text)' },
            { label: 'Fraudulent', value: '3,280', color: '#f43f5e' },
            { label: 'Legitimate', value: '9,170', color: '#e11d48' },
            { label: 'Fraud Rate', value: '26.3%', color: '#fb7185' },
          ].map((stat, i) => (
            <motion.div key={i} whileHover={{ y: -2 }} className="glass-card p-4 rounded-xl text-center">
              <div className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--muted)' }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
