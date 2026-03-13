import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, ShieldCheck, AlertTriangle, Search } from 'lucide-react';

const mockTransactions = [
  { id: 'TXN-9821', amount: '₹45,000', sender: 'user_882', receiver: 'merch_91', type: 'Account Takeover', score: 88, time: 'Just now' },
  { id: 'TXN-9820', amount: '₹12,500', sender: 'user_112', receiver: 'user_445', type: 'Suspicious', score: 65, time: '2m ago' },
  { id: 'TXN-9819', amount: '₹2,400', sender: 'user_993', receiver: 'merch_22', type: 'Safe', score: 12, time: '5m ago' },
  { id: 'TXN-9818', amount: '₹84,000', sender: 'user_771', receiver: 'user_889', type: 'SIM Swap', score: 92, time: '12m ago' },
  { id: 'TXN-9817', amount: '₹1,200', sender: 'user_442', receiver: 'merch_11', type: 'Safe', score: 5, time: '15m ago' },
];

export default function TransactionFeed() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
      className="glass-panel rounded-2xl flex flex-col h-[500px] overflow-hidden"
    >
      <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/5">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-pink-400" />
          Live Transaction Feed
        </h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search TXN..." 
              className="bg-slate-900/50 border border-white/10 rounded-lg pl-9 pr-4 py-1.5 text-sm text-white focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 w-48 transition-all"
            />
          </div>
          <button className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-300 transition-colors">
            Filter
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs font-medium text-slate-400 uppercase tracking-wider border-b border-white/5">
              <th className="p-3">Transaction</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Sender → Receiver</th>
              <th className="p-3">Risk Score</th>
              <th className="p-3 text-right">Time</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {mockTransactions.map((txn, idx) => (
                <motion.tr 
                  key={txn.id}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors group"
                >
                  <td className="p-3">
                    <div className="font-medium text-white group-hover:text-pink-400 transition-colors">{txn.id}</div>
                    <div className="text-xs text-slate-500">{txn.type}</div>
                  </td>
                  <td className="p-3 font-mono text-slate-300">{txn.amount}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-slate-400">{txn.sender}</span>
                      <span className="text-slate-600">→</span>
                      <span className="text-slate-300">{txn.receiver}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {txn.score >= 75 ? (
                        <ShieldAlert className="w-4 h-4 text-rose-500" />
                      ) : txn.score >= 40 ? (
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      ) : (
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      )}
                      <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            txn.score >= 75 ? 'bg-rose-500' : txn.score >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${txn.score}%` }}
                        />
                      </div>
                      <span className={`text-xs font-bold ${
                        txn.score >= 75 ? 'text-rose-400' : txn.score >= 40 ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {txn.score}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 text-right text-xs text-slate-500 whitespace-nowrap">
                    {txn.time}
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
