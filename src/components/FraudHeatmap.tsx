import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import 'leaflet/dist/leaflet.css';

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
  if (count > 500) return '#f87171';
  if (count > 200) return '#fca5a5';
  return '#fee2e2';
}

const GEOJSON_URL = 'https://raw.githubusercontent.com/geohacker/india/master/state/india_state.geojson';

const normalizeStateName = (name: string): string => {
  if (!name) return '';
  const upper = name.toUpperCase();
  const map: Record<string, string> = {
    'MH': 'Maharashtra', 'DL': 'Delhi', 'KA': 'Karnataka', 'TS': 'Telangana', 'TN': 'Tamil Nadu',
    'UP': 'Uttar Pradesh', 'WB': 'West Bengal', 'GJ': 'Gujarat', 'RJ': 'Rajasthan', 'MP': 'Madhya Pradesh',
    'NCT OF DELHI': 'Delhi', 'ANDAMAN AND NICOBAR ISLANDS': 'Andaman and Nicobar', 'ODISHA': 'Odisha', 'ORISSA': 'Odisha',
  };
  return map[upper] || name;
};

const STATE_THREATS: Record<string, { name: string, pct: number }[]> = {
  'Maharashtra': [{ name: 'SIM Swap', pct: 45 }, { name: 'Phishing', pct: 30 }, { name: 'Money Mule', pct: 25 }],
  'Delhi': [{ name: 'Account Takeover', pct: 50 }, { name: 'Card Testing', pct: 35 }, { name: 'Phishing', pct: 15 }],
  'Karnataka': [{ name: 'Money Mule', pct: 40 }, { name: 'SIM Swap', pct: 35 }, { name: 'Velocity', pct: 25 }],
  'Telangana': [{ name: 'Velocity', pct: 42 }, { name: 'Account Takeover', pct: 38 }, { name: 'Phishing', pct: 20 }],
  'Tamil Nadu': [{ name: 'Card Testing', pct: 55 }, { name: 'SIM Swap', pct: 25 }, { name: 'Money Mule', pct: 20 }],
};

const getDefaultThreats = () => [
  { name: 'Phishing', pct: 40 }, { name: 'Card Testing', pct: 35 }, { name: 'Account Takeover', pct: 25 }
];

export default function FraudHeatmap() {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [geoData, setGeoData] = useState<any>(null);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    fetch(GEOJSON_URL)
      .then(r => {
        if (!r.ok) throw new Error('Failed to fetch map');
        return r.json();
      })
      .then(setGeoData)
      .catch((e) => {
        console.warn('Map boundary load failed, falling back to BarChart:', e);
        setMapError(true);
      });
  }, []);

  const topStates = Object.entries(FRAUD_COUNTS)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const styleFeature = (feature: any) => {
    const rawName = feature?.properties?.NAME_1 || feature?.properties?.ST_NM || '';
    const name = normalizeStateName(rawName);
    const count = FRAUD_COUNTS[name] || 150;
    return {
      fillColor: getColor(count),
      weight: 0.8,
      color: 'rgba(255,255,255,0.2)',
      fillOpacity: 0.85,
    };
  };

  const onEachFeature = (feature: any, layer: any) => {
    const rawName = feature.properties?.NAME_1 || feature.properties?.ST_NM || '';
    const name = normalizeStateName(rawName);

    layer.on({
      mouseover: (e: any) => {
        e.target.setStyle({ weight: 2, color: 'white', fillOpacity: 0.95 });
        setHoveredState(name);
      },
      mouseout: (e: any) => {
        e.target.setStyle({ weight: 0.8, color: 'rgba(255,255,255,0.2)', fillOpacity: 0.85 });
        setHoveredState(null);
      },
    });
  };

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
        {mapError ? (
          <div className="glass-card rounded-xl p-6 h-[400px] flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-6 justify-center">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-bold text-amber-500">Map unavailable. Showing Top States.</span>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={topStates.map(([s, c]) => ({ name: s, value: c }))} margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} width={100} />
                <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: 'rgba(15,23,42,0.9)', border: '1px solid #334155', borderRadius: '8px' }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {topStates.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getColor(entry[1])} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : !geoData ? (
          <div className="flex items-center justify-center h-[400px] glass-card rounded-xl">
            <Loader2 className="w-8 h-8 text-rose-400 animate-spin" />
            <span className="ml-3 text-sm" style={{ color: 'var(--muted)' }}>
              Loading India map...
            </span>
          </div>
        ) : (
          <MapContainer
            center={[20.5937, 78.9629]}
            zoom={4}
            style={{ height: '400px', width: '100%', borderRadius: '12px' }}
            zoomControl={true}
            scrollWheelZoom={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution="CartoDB"
            />
            <GeoJSON
              data={geoData}
              style={styleFeature}
              onEachFeature={onEachFeature}
            />
          </MapContainer>
        )}

        {!mapError && (
          <div className="absolute bottom-4 left-4 glass-card p-4 rounded-xl flex flex-col gap-4 z-[400]">
            <div>
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
                    <span style={{ color: 'var(--text)' }} className="flex-1 min-w-[80px]">{state}</span>
                    <span style={{ color: 'var(--muted)' }}>{count.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: hoveredState ? 'auto' : 0, opacity: hoveredState ? 1 : 0 }}
              className="overflow-hidden border-t border-white/10"
            >
              <div className="pt-3">
                <h4 className="text-[10px] font-bold uppercase tracking-wider mb-2 text-amber-400">
                  {hoveredState} Threats
                </h4>
                {hoveredState && (STATE_THREATS[hoveredState] || getDefaultThreats()).map((threat, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[10px] mb-1">
                    <span style={{ color: 'var(--text)' }}>{threat.name}</span>
                    <span style={{ color: 'var(--muted)' }}>{threat.pct}%</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

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
    </motion.div >
  );
}
