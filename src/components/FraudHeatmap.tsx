import { motion } from 'motion/react';
import { useState, useEffect } from 'react';

const FRAUD_COUNTS: Record<string, number> = {
  'Maharashtra': 4821,
  'Delhi': 3940,
  'Karnataka': 2810,
  'Telangana': 2240,
  'Tamil Nadu': 1980,
  'Uttar Pradesh': 1750,
  'West Bengal': 1420,
  'Gujarat': 1380,
  'Rajasthan': 980,
  'Madhya Pradesh': 760,
  'Haryana': 520,
  'Punjab': 480,
  'Kerala': 420,
  'Bihar': 380,
  'Odisha': 320,
  'Chhattisgarh': 280,
  'Jharkhand': 250,
  'Uttarakhand': 220,
  'Assam': 200,
};

function getColor(count: number): string {
  if (count > 4000) return '#7f1d1d';
  if (count > 3000) return '#991b1b';
  if (count > 2000) return '#b91c1c';
  if (count > 1500) return '#dc2626';
  if (count > 1000) return '#ef4444';
  if (count > 500)  return '#f87171';
  if (count > 200)  return '#fca5a5';
  return '#fee2e2';
}

interface StateInfo {
  name: string;
  count: number;
  position: { top: string; left: string };
}

const STATE_POSITIONS: StateInfo[] = [
  { name: 'Delhi', count: 3940, position: { top: '25%', left: '45%' } },
  { name: 'Haryana', count: 520, position: { top: '28%', left: '40%' } },
  { name: 'Uttarakhand', count: 220, position: { top: '22%', left: '42%' } },
  { name: 'Punjab', count: 480, position: { top: '18%', left: '32%' } },
  { name: 'Uttar Pradesh', count: 1750, position: { top: '32%', left: '48%' } },
  { name: 'Rajasthan', count: 980, position: { top: '35%', left: '25%' } },
  { name: 'Madhya Pradesh', count: 760, position: { top: '42%', left: '35%' } },
  { name: 'Gujarat', count: 1380, position: { top: '45%', left: '18%' } },
  { name: 'Maharashtra', count: 4821, position: { top: '55%', left: '28%' } },
  { name: 'Chhattisgarh', count: 280, position: { top: '48%', left: '45%' } },
  { name: 'Jharkhand', count: 250, position: { top: '45%', left: '55%' } },
  { name: 'West Bengal', count: 1420, position: { top: '48%', left: '62%' } },
  { name: 'Odisha', count: 320, position: { top: '55%', left: '55%' } },
  { name: 'Assam', count: 200, position: { top: '52%', left: '72%' } },
  { name: 'Bihar', count: 380, position: { top: '38%', left: '58%' } },
  { name: 'Karnataka', count: 2810, position: { top: '62%', left: '32%' } },
  { name: 'Tamil Nadu', count: 1980, position: { top: '72%', left: '28%' } },
  { name: 'Kerala', count: 420, position: { top: '72%', left: '38%' } },
  { name: 'Telangana', count: 2240, position: { top: '55%', left: '38%' } },
];

export default function FraudHeatmap() {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  const topStates = Object.entries(FRAUD_COUNTS)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass-panel rounded-2xl p-6"
    >
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text)' }}>
        <span className="w-2 h-2 rounded-full bg-rose-500" />
        India Fraud Heatmap
      </h3>
      
      <div className="relative">
        <div 
          className="relative w-full h-[350px] rounded-xl overflow-hidden"
          style={{ 
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            border: '1px solid var(--border)'
          }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full opacity-30">
            <path
              d="M30,20 L45,18 L50,25 L55,22 L70,25 L75,35 L70,45 L75,55 L70,65 L60,75 L50,70 L45,80 L35,75 L30,65 L25,55 L30,45 L25,35 Z"
              fill="none"
              stroke="#475569"
              strokeWidth="0.5"
            />
          </svg>

          {STATE_POSITIONS.map((state) => (
            <motion.div
              key={state.name}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="absolute cursor-pointer"
              style={{
                top: state.position.top,
                left: state.position.left,
                transform: 'translate(-50%, -50%)',
              }}
              onMouseEnter={() => setHoveredState(state.name)}
              onMouseLeave={() => setHoveredState(null)}
              onClick={() => setSelectedState(state.name)}
            >
              <motion.div
                animate={{ 
                  scale: hoveredState === state.name ? 1.3 : 1,
                }}
                className="relative"
              >
                <div 
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-[8px] sm:text-[10px] font-bold shadow-lg"
                  style={{ 
                    background: getColor(state.count),
                    color: state.count > 1500 ? 'white' : '#1e293b',
                    border: hoveredState === state.name ? '2px solid white' : 'none',
                    boxShadow: `0 0 ${state.count > 2000 ? '20px' : '10px'} ${getColor(state.count)}50`
                  }}
                >
                  {state.count > 999 ? `${Math.round(state.count / 1000)}k` : state.count}
                </div>
                
                {(hoveredState === state.name || selectedState === state.name) && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 glass-card px-3 py-2 rounded-lg whitespace-nowrap z-10"
                    style={{ background: 'rgba(15,23,42,0.95)' }}
                  >
                    <div className="text-xs font-bold" style={{ color: 'var(--text)' }}>{state.name}</div>
                    <div className="text-[10px]" style={{ color: 'var(--muted)' }}>Fraud: {state.count.toLocaleString()}</div>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          ))}
        </div>

        <div className="absolute bottom-4 left-4 glass-card p-4 rounded-xl">
          <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text)' }}>
            Top 5 Fraud States
          </h4>
          <div className="space-y-2">
            {topStates.map(([state, count], i) => (
              <div key={state} className="flex items-center gap-2 text-xs">
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{ 
                    background: i === 0 ? '#7f1d1d' : i === 1 ? '#991b1b' : i === 2 ? '#b91c1c' : '#dc2626',
                    color: 'white'
                  }}
                >
                  {i + 1}
                </span>
                <span style={{ color: 'var(--text)' }} className="flex-1">{state}</span>
                <span style={{ color: 'var(--muted)' }}>{count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-4 right-4 glass-card p-3 rounded-xl">
          <div className="text-xs space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ background: '#7f1d1d' }} />
              <span style={{ color: 'var(--muted)' }}>&gt;4000</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ background: '#b91c1c' }} />
              <span style={{ color: 'var(--muted)' }}>2000-4000</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ background: '#ef4444' }} />
              <span style={{ color: 'var(--muted)' }}>1000-2000</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ background: '#fca5a5' }} />
              <span style={{ color: 'var(--muted)' }}>&lt;1000</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
