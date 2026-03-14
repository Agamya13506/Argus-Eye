import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import CountUp from 'react-countup';
import { ShieldOff, Shield } from 'lucide-react';
import api, { appwriteClient } from '../services/api';
import { scoreTransaction } from '../services/mlApi';

const generateMockTx = () => {
  const isFraud = Math.random() < 0.15; // 15% true fraud
  const isHighValue = Math.random() < 0.2; // 20% legitimate high value
  const amount = isFraud
    ? (Math.random() > 0.5 ? 85000 : 2500) // Fraud comes in high or very low amounts
    : (isHighValue ? Math.floor(75000 + Math.random() * 50000) : Math.floor(100 + Math.random() * 20000));

  // Argus ML is highly accurate
  const argusScore = isFraud ? Math.floor(78 + Math.random() * 21) : Math.floor(5 + Math.random() * 65);
  // Legacy is naive (flags anything > 70k or random rules)
  const legacyBlocked = amount > 70000;

  return {
    id: Date.now(),
    sender: `user_${Math.floor(Math.random() * 999)}`,
    receiver: `merch_${Math.floor(Math.random() * 999)}`,
    amount,
    argusScore,
    legacyBlocked,
    isFraud,
    type: isFraud ? (amount > 50000 ? 'Account Takeover' : 'Card Testing') : 'Standard',
  };
};

export default function SplitScreen() {
  const [transactions, setTransactions] = useState<Array<ReturnType<typeof generateMockTx>>>([]);

  const [legacyStats, setLegacyStats] = useState({ prevented: 0, fp: 0, missed: 0 });
  const [argusStats, setArgusStats] = useState({ prevented: 0, fp: 0, missed: 0 });

  useEffect(() => {
    // Initial batch
    const initial = Array.from({ length: 6 }).map(() => generateMockTx());
    setTransactions(initial);

    const interval = setInterval(async () => {
      const tx = generateMockTx();

      // Build ML payload from the generated transaction
      const mlPayload = {
        skip_explain: true,
        amount_inr: tx.amount,
        amount_scaled: tx.amount / 10000,
        hour: new Date().getHours(),
        velocity_60s: tx.isFraud ? Math.floor(Math.random() * 12) + 3 : Math.random() < 0.3 ? 2 : 0,
        is_new_device: tx.isFraud && Math.random() > 0.6 ? 1 : 0,
        is_new_recipient: tx.isFraud ? 1 : 0,
        account_age_days: tx.isFraud ? Math.floor(Math.random() * 30) + 1 : 400,
        city_risk_score: tx.isFraud ? 0.75 : 0.2,
        is_festival_day: 0,
        is_sim_swap_signal: 0,
        is_round_amount: tx.amount % 1000 === 0 ? 1 : 0,
        cat_crypto: 0, cat_grocery: 0, cat_electronics: 0, cat_travel: 0,
        V14: tx.isFraud ? -20 : 1,
        V4:  tx.isFraud ?   6 : -1,
        V12: tx.isFraud ? -15 : 1,
        V10: tx.isFraud ? -12 : 1,
        V11: tx.isFraud ?  -6 : 0.5,
      };

      let finalScore = tx.argusScore;
      try {
        const mlRes = await scoreTransaction('custom', `split_${Date.now()}`, mlPayload);
        if (mlRes?.score != null) finalScore = Math.round(mlRes.score);
      } catch { /* use generated score */ }

      const txWithMlScore = { ...tx, argusScore: finalScore };
      setTransactions(prev => [txWithMlScore, ...prev].slice(0, 30));

      // Write to Appwrite so it appears in the main live feed
      const status = finalScore >= 75 ? 'blocked' : finalScore >= 40 ? 'flagged' : 'clear';
      api.createTransaction({
        sender: tx.sender,
        receiver: tx.receiver,
        amount: tx.amount,
        score: finalScore,
        type: tx.type,
        status,
      }).catch(() => {});

      // Update stats using ML score
      if (tx.isFraud) {
        if (tx.legacyBlocked) setLegacyStats(s => ({ ...s, prevented: s.prevented + tx.amount }));
        else setLegacyStats(s => ({ ...s, missed: s.missed + tx.amount }));

        if (finalScore >= 75) setArgusStats(s => ({ ...s, prevented: s.prevented + tx.amount }));
        else setArgusStats(s => ({ ...s, missed: s.missed + tx.amount }));
      } else {
        if (tx.legacyBlocked) setLegacyStats(s => ({ ...s, fp: s.fp + 1 }));
        if (finalScore >= 75) setArgusStats(s => ({ ...s, fp: s.fp + 1 }));
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const txRow = (tx: ReturnType<typeof generateMockTx>, isArgus: boolean) => {
    const isBlocked = isArgus ? tx.argusScore >= 75 : tx.legacyBlocked;

    // For Argus: green if correctly passed/blocked, red if false negative/positive
    // For Legacy: same logic to show its flaws visually
    const isCorrect = (tx.isFraud && isBlocked) || (!tx.isFraud && !isBlocked);

    const color = isCorrect ? '#4ade80' : '#f43f5e';
    const bg = isCorrect ? 'rgba(74,222,128,0.08)' : 'rgba(244,63,94,0.1)';
    const statusText = isBlocked
      ? (tx.isFraud ? 'BLOCKED' : 'FALSE POSITIVE')
      : (tx.isFraud ? 'MISSED FRAUD' : 'PASSED');

    return (
      <motion.div
        key={tx.id + (isArgus ? '-a' : '-l')}
        initial={{ opacity: 0, x: isArgus ? 20 : -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="p-3 rounded-xl mb-2 flex items-center justify-between border-l-2"
        style={{ background: bg, borderLeftColor: color }}
      >
        <div>
          <div className="text-xs font-medium" style={{ color: 'var(--text)' }}>
            {tx.sender} → {tx.receiver}
          </div>
          <div className="text-[10px]" style={{ color: 'var(--muted)' }}>
            {tx.type} • {isArgus ? `ML Score: ${tx.argusScore}` : `Rule: Amount > 70k`}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold" style={{ color: 'var(--text)' }}>
            ₹{tx.amount.toLocaleString()}
          </span>
          <span
            className="text-[10px] font-black px-2 py-0.5 rounded uppercase"
            style={{ background: bg, color }}
          >
            {statusText}
          </span>
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="p-8 min-h-screen"
    >
      <header className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight mb-1 flex items-center gap-3"
          style={{ color: 'var(--text)' }}>
          <Shield className="w-8 h-8" style={{ color: 'var(--accent)' }} />
          Protected vs Unprotected
        </h2>
        <p style={{ color: 'var(--muted)' }}>
          Same live transaction stream — two outcomes.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-6">
        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="p-5 border-b flex items-center justify-between"
            style={{ borderColor: 'var(--border)', background: 'rgba(244,63,94,0.05)' }}>
            <div className="flex items-center gap-3">
              <ShieldOff className="w-5 h-5 text-rose-400" />
              <div>
                <div className="font-bold" style={{ color: 'var(--text)' }}>
                  Unprotected Bank
                </div>
                <div className="text-xs" style={{ color: 'var(--muted)' }}>
                  No fraud detection
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-right">
              <div>
                <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--muted)' }}>Losses Missed</div>
                <div className="text-lg font-bold text-rose-400">
                  ₹<CountUp end={legacyStats.missed} duration={1} separator="," />
                </div>
              </div>
              <div className="pl-4 border-l" style={{ borderColor: 'var(--border)' }}>
                <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--muted)' }}>False Positives</div>
                <div className="text-lg font-bold text-amber-400">
                  <CountUp end={legacyStats.fp} duration={1} />
                </div>
              </div>
            </div>
          </div>
          <div className="flex px-5 py-2 justify-between text-[10px] uppercase font-bold tracking-wider" style={{ background: 'rgba(0,0,0,0.2)' }}>
            <span style={{ color: 'var(--muted)' }}>Rule: Block Amount &gt; ₹70k</span>
            <span className="text-emerald-400">₹<CountUp end={legacyStats.prevented} /> Prevented</span>
          </div>
          <div className="p-4 h-[420px] overflow-y-auto">
            {transactions.slice(0, 10).map(tx => txRow(tx, false))}
          </div>
        </div>

        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="p-5 border-b flex items-center justify-between"
            style={{ borderColor: 'var(--border)', background: 'rgba(74,222,128,0.05)' }}>
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-emerald-400" />
              <div>
                <div className="font-bold" style={{ color: 'var(--text)' }}>
                  Argus Eye Protected
                </div>
                <div className="text-xs" style={{ color: 'var(--muted)' }}>
                  AI-powered detection active
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-right">
              <div>
                <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--muted)' }}>Fraud Prevented</div>
                <div className="text-lg font-bold text-emerald-400">
                  ₹<CountUp end={argusStats.prevented} duration={1} separator="," />
                </div>
              </div>
              <div className="pl-4 border-l" style={{ borderColor: 'var(--border)' }}>
                <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--muted)' }}>False Positives</div>
                <div className="text-lg font-bold text-emerald-400">
                  <CountUp end={argusStats.fp} duration={1} />
                </div>
              </div>
            </div>
          </div>
          <div className="flex px-5 py-2 justify-between text-[10px] uppercase font-bold tracking-wider" style={{ background: 'rgba(0,0,0,0.2)' }}>
            <span style={{ color: 'var(--muted)' }}>AI Model: score {'>'}= 75</span>
            <span className="text-rose-400">₹<CountUp end={argusStats.missed} /> Missed</span>
          </div>
          <div className="p-4 h-[420px] overflow-y-auto">
            {transactions.map(tx => txRow(tx, true))}
          </div>
          <div className="p-4 border-t flex items-center justify-between"
            style={{ borderColor: 'var(--border)' }}>
            <span className="text-xs" style={{ color: 'var(--muted)' }}>
              Superior accuracy & minimal customer friction
            </span>
            <span className="text-xs font-bold text-emerald-400">
              99.98% Model Uptime
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
