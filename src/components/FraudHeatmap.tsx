import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
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
  if (count > 500)  return '#f87171';
  if (count > 200)  return '#fca5a5';
  return '#fee2e2';
}

const GEOJSON_URL = 'https://raw.githubusercontent.com/geohacker/india/master/state/india_state.geojson';

export default function FraudHeatmap() {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [geoData, setGeoData] = useState<any>(null);

  useEffect(() => {
    fetch(GEOJSON_URL)
      .then(r => r.json())
      .then(setGeoData)
      .catch(() => setGeoData(null));
  }, []);

  const topStates = Object.entries(FRAUD_COUNTS)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const styleFeature = (feature: any) => {
    const name = feature?.properties?.NAME_1 || feature?.properties?.ST_NM || '';
    const count = FRAUD_COUNTS[name] || 150;
    return {
      fillColor: getColor(count),
      weight: 0.8,
      color: 'rgba(255,255,255,0.2)',
      fillOpacity: 0.85,
    };
  };

  const onEachFeature = (feature: any, layer: any) => {
    const name = feature.properties?.NAME_1 || feature.properties?.ST_NM || '';
    const count = FRAUD_COUNTS[name] || 150;
    layer.bindPopup(
      `<div style="font-family:monospace;font-size:12px">
        <strong>${name}</strong><br/>
        Fraud cases: ${count.toLocaleString()}
      </div>`
    );
    layer.on({
      mouseover: (e: any) => {
        e.target.setStyle({ weight: 2, color: 'white', fillOpacity: 0.95 });
      },
      mouseout: (e: any) => {
        e.target.setStyle({ weight: 0.8, color: 'rgba(255,255,255,0.2)', fillOpacity: 0.85 });
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
        {!geoData ? (
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
