import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import CountUp from 'react-countup';
import { ShieldOff, Shield } from 'lucide-react';
import api, { appwriteClient } from '../services/api';

const MOCK_STREAM = [
  { id: 1, sender:'user_492', receiver:'merch_88', amount:45000, score:85, type:'SIM Swap' },
  { id: 2, sender:'user_112', receiver:'user_99',  amount:1200,  score:12, type:'None' },
  { id: 3, sender:'user_77',  receiver:'merch_12', amount:8500,  score:65, type:'Suspicious' },
  { id: 4, sender:'user_44',  receiver:'user_8',   amount:120000,score:92, type:'Account Takeover' },
  { id: 5, sender:'user_321', receiver:'merch_55', amount:75000, score:78, type:'Card Testing' },
  { id: 6, sender:'user_89',  receiver:'merch_33', amount:56000, score:88, type:'Phishing' },
];

export default function SplitScreen() {
  const [transactions, setTransactions] = useState(MOCK_STREAM);
  const [lossWithout, setLossWithout] = useState(0);
  const [fraudPrevented, setFraudPrevented] = useState(0);
  const [txBlockedCount, setTxBlockedCount] = useState(0);

  useEffect(() => {
    let unsub: () => void;
    try {
      unsub = appwriteClient.subscribe(
        'databases/argus_eye_db/collections/transactions/documents',
        (response: any) => {
          if (response.events.includes(
            'databases.*.collections.*.documents.*.create')) {
            const tx = response.payload;
            setTransactions(prev => [
              { id: Date.now(), sender: tx.sender, receiver: tx.receiver,
                amount: tx.amount, score: tx.score, type: tx.type },
              ...prev
            ].slice(0, 20));
            if (tx.score >= 75) {
              setLossWithout(prev => prev + (tx.amount || 0));
            }
            if (tx.score >= 75) {
              setFraudPrevented(prev => prev + (tx.amount || 0));
              setTxBlockedCount(prev => prev + 1);
            }
          }
        }
      );
    } catch (e) {}
    return () => { if (unsub) unsub(); };
  }, []);

  useEffect(() => {
    let idx = 0;
    const interval = setInterval(() => {
      const tx = MOCK_STREAM[idx % MOCK_STREAM.length];
      idx++;
      if (tx.score >= 75) {
        setLossWithout(prev => prev + tx.amount);
        setFraudPrevented(prev => prev + tx.amount);
        setTxBlockedCount(prev => prev + 1);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const txRow = (tx: typeof MOCK_STREAM[0], isProtected: boolean) => {
    const isfraud = tx.score >= 75;
    const status = isProtected
      ? (isfraud ? 'BLOCKED' : 'PASSED')
      : 'PASSED';
    const color = isProtected
      ? (isfraud ? '#f43f5e' : '#4ade80')
      : (isfraud ? '#f43f5e' : '#4ade80');
    const bg = isProtected
      ? (isfraud ? 'rgba(244,63,94,0.1)' : 'rgba(74,222,128,0.08)')
      : (isfraud ? 'rgba(244,63,94,0.05)' : 'rgba(74,222,128,0.08)');

    return (
      <motion.div
        key={tx.id + (isProtected ? '-p' : '-u')}
        initial={{ opacity: 0, x: isProtected ? 20 : -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="p-3 rounded-xl mb-2 flex items-center justify-between"
        style={{ background: bg }}
      >
        <div>
          <div className="text-xs font-medium" style={{ color: 'var(--text)' }}>
            {tx.sender} → {tx.receiver}
          </div>
          <div className="text-[10px]" style={{ color: 'var(--muted)' }}>{tx.type}</div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold" style={{ color: 'var(--text)' }}>
            ₹{tx.amount.toLocaleString()}
          </span>
          <span
            className="text-[10px] font-black px-2 py-0.5 rounded uppercase"
            style={{ background: bg, color }}
          >
            {status}
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
            <div className="text-right">
              <div className="text-xs uppercase tracking-wider mb-1"
                   style={{ color: 'var(--muted)' }}>Fraud Loss</div>
              <div className="text-xl font-bold text-rose-400">
                ₹<CountUp end={lossWithout} duration={1} separator="," />
              </div>
            </div>
          </div>
          <div className="p-4 h-[400px] overflow-y-auto">
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
                  FraudShield Protected
                </div>
                <div className="text-xs" style={{ color: 'var(--muted)' }}>
                  AI-powered detection active
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase tracking-wider mb-1"
                   style={{ color: 'var(--muted)' }}>Fraud Prevented</div>
              <div className="text-xl font-bold text-emerald-400">
                ₹<CountUp end={fraudPrevented} duration={1} separator="," />
              </div>
            </div>
          </div>
          <div className="p-4 h-[400px] overflow-y-auto">
            {transactions.slice(0, 10).map(tx => txRow(tx, true))}
          </div>
          <div className="p-4 border-t flex items-center justify-between"
               style={{ borderColor: 'var(--border)' }}>
            <span className="text-xs" style={{ color: 'var(--muted)' }}>
              {txBlockedCount} transactions blocked
            </span>
            <span className="text-xs font-bold text-emerald-400">
              {txBlockedCount > 0
                ? `${Math.round((txBlockedCount /
                    Math.max(transactions.length, 1)) * 100)}% detection rate`
                : 'Monitoring...'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
