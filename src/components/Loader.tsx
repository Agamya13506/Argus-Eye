import { motion } from 'motion/react';
import { Shield } from 'lucide-react';

export default function Loader({ onComplete }: { onComplete: () => void; key?: string }) {
  return (
    <motion.div
      key="loader"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #0c0607 0%, #1a0a0d 50%, #2a0a10 100%)' }}
    >
      {/* Rotating rings */}
      <div className="relative w-32 h-32 mb-8">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-rose-500/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          style={{ borderTopColor: '#fb7185', borderRightColor: '#fb7185' }}
        />
        <motion.div
          className="absolute inset-3 rounded-full border-2 border-rose-600/15"
          animate={{ rotate: -360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          style={{ borderBottomColor: '#f43f5e' }}
        />
        <motion.div
          className="absolute inset-6 rounded-full border border-rose-700/10"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          style={{ borderLeftColor: '#e11d48' }}
        />

        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Shield className="w-10 h-10 text-rose-400" />
          </motion.div>
        </div>
      </div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-bold tracking-tight text-rose-50 mb-2"
      >
        ARGUS EYE
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-xs text-rose-300/60 tracking-widest uppercase"
      >
        Initializing Fraud Defense
      </motion.p>

      {/* Progress bar */}
      <motion.div className="w-48 h-0.5 bg-rose-900/30 rounded-full mt-8 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #e11d48, #fb7185)' }}
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 2.5, ease: 'easeInOut' }}
        />
      </motion.div>
    </motion.div>
  );
}
