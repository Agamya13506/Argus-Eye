import { motion } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import { Network, Search, Filter, ZoomIn, ZoomOut, Maximize, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import { getNetworkGraph } from '../services/mlApi';

interface GraphNode {
  id: string;
  label: string;
  type: 'user' | 'merchant' | 'fraudster' | 'suspicious';
  x: number;
  y: number;
  radius: number;
}

interface GraphEdge {
  from: string;
  to: string;
  amount: number;
  suspicious: boolean;
}

const defaultNodes: GraphNode[] = [
  { id: 'user_492', label: 'user_492', type: 'suspicious', x: 200, y: 150, radius: 18 },
  { id: 'merch_88', label: 'merch_88', type: 'merchant', x: 450, y: 100, radius: 16 },
  { id: 'user_112', label: 'user_112', type: 'user', x: 150, y: 300, radius: 14 },
  { id: 'user_99', label: 'user_99', type: 'user', x: 400, y: 280, radius: 14 },
  { id: 'user_77', label: 'user_77', type: 'suspicious', x: 550, y: 200, radius: 16 },
  { id: 'merch_12', label: 'merch_12', type: 'merchant', x: 700, y: 150, radius: 16 },
  { id: 'user_44', label: 'user_44', type: 'fraudster', x: 350, y: 400, radius: 20 },
  { id: 'user_8', label: 'user_8', type: 'fraudster', x: 600, y: 380, radius: 20 },
  { id: 'user_321', label: 'user_321', type: 'suspicious', x: 100, y: 450, radius: 16 },
  { id: 'merch_55', label: 'merch_55', type: 'merchant', x: 300, y: 550, radius: 16 },
  { id: 'user_89', label: 'user_89', type: 'fraudster', x: 500, y: 500, radius: 18 },
  { id: 'merch_33', label: 'merch_33', type: 'merchant', x: 700, y: 450, radius: 16 },
  { id: 'user_67', label: 'user_67', type: 'fraudster', x: 250, y: 200, radius: 18 },
  { id: 'user_92', label: 'user_92', type: 'suspicious', x: 600, y: 300, radius: 16 },
];

const defaultEdges: GraphEdge[] = [
  { from: 'user_492', to: 'merch_88', amount: 45000, suspicious: true },
  { from: 'user_112', to: 'user_99', amount: 1200, suspicious: false },
  { from: 'user_77', to: 'merch_12', amount: 8500, suspicious: true },
  { from: 'user_44', to: 'user_8', amount: 120000, suspicious: true },
  { from: 'user_321', to: 'merch_55', amount: 75000, suspicious: true },
  { from: 'user_89', to: 'merch_33', amount: 56000, suspicious: true },
  { from: 'user_67', to: 'user_92', amount: 95000, suspicious: true },
  { from: 'user_44', to: 'user_492', amount: 30000, suspicious: true },
  { from: 'user_8', to: 'user_89', amount: 42000, suspicious: true },
  { from: 'user_89', to: 'user_321', amount: 20000, suspicious: true },
  { from: 'user_321', to: 'user_44', amount: 15000, suspicious: true },
];

const nodeColors: Record<string, string> = {
  user: '#fb7185',
  merchant: '#f43f5e',
  fraudster: '#f43f5e',
  suspicious: '#f59e0b',
};

interface NetworkGraphProps { onNavigate?: (tab: string) => void; key?: string; }
export default function NetworkGraph({ onNavigate }: NetworkGraphProps) {
  const [nodes] = useState(defaultNodes);
  const [edges] = useState(defaultEdges);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [zoom, setZoom] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [cycleHighlight, setCycleHighlight] = useState<string[]>([]);
  const [mlCycleDetected, setMlCycleDetected] = useState(false);

  useEffect(() => {
    getNetworkGraph('user_492').then(data => {
      if (!data) return;

      if (data.cycle_detected && data.cycle_path) {
        setMlCycleDetected(true);
        // Extract node IDs from cycle path
        const cycleNodeIds = Array.from(new Set(
          data.cycle_path.flatMap((e: any) => [e.source, e.target])
        )) as string[];

        // Only highlight nodes that exist in our hardcoded graph
        const validIds = cycleNodeIds.filter(id =>
          defaultNodes.some(n => n.id === id)
        );

        if (validIds.length > 0) {
          setCycleHighlight(validIds);
        } else {
          // Fallback: use known cycle nodes from hardcoded graph
          setCycleHighlight(['user_44', 'user_8', 'user_89']);
        }

        // Dispatch event so demo mode alert card works
        window.dispatchEvent(new CustomEvent('highlightCycle', {
          detail: {
            nodes: validIds.length > 0 ? validIds :
              ['user_44', 'user_8', 'user_89']
          }
        }));
      }
    });
  }, []);

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      setCycleHighlight(e.detail.nodes);
    };
    window.addEventListener('highlightCycle', handler as EventListener);
    return () => window.removeEventListener('highlightCycle', handler as EventListener);
  }, []);

  const filteredNodes = searchQuery
    ? nodes.filter(n => n.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : nodes;

  const getNodeById = (id: string) => nodes.find(n => n.id === id);

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
            <Network className="w-8 h-8 text-rose-400" />
            Network Intelligence
          </h2>
          <p style={{ color: 'var(--muted)' }}>Money mule network graph & link analysis</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              // Manually trigger cycle detection for demo
              setCycleHighlight(['user_44', 'user_8', 'user_89']);
              setMlCycleDetected(true);
            }}
            className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-sm font-bold border border-amber-500/30 transition-colors cursor-pointer"
          >
            Trigger Demo Alert
          </button>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
            <input
              type="text"
              placeholder="Search nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl glass-card text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 w-64"
              style={{ color: 'var(--text)', background: 'var(--cardBg)' }}
            />
          </div>
        </div>
      </header>

      <div className="flex-1 glass-panel rounded-2xl relative overflow-hidden flex flex-col" style={{ minHeight: '600px' }}>
        {/* Toolbar */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <button
            onClick={() => setZoom(z => Math.min(z + 0.2, 2))}
            className="p-2 rounded-lg glass-card transition-colors hover:bg-white/10"
            style={{ color: 'var(--muted)' }}
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))}
            className="p-2 rounded-lg glass-card transition-colors hover:bg-white/10"
            style={{ color: 'var(--muted)' }}
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-2 rounded-lg glass-card transition-colors hover:bg-white/10"
            style={{ color: 'var(--muted)' }}
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-10 glass-card p-4 rounded-xl">
          <h4 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text)' }}>Node Types</h4>
          <div className="space-y-2">
            {[
              { type: 'user', label: 'Normal User' },
              { type: 'fraudster', label: 'Known Fraudster' },
              { type: 'suspicious', label: 'Suspicious Node' },
              { type: 'merchant', label: 'Merchant Account' },
            ].map(item => (
              <div key={item.type} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                <div className={`w-3 h-3 ${item.type === 'merchant' ? 'rounded-sm' : 'rounded-full'}`} style={{ backgroundColor: nodeColors[item.type] }} />
                {item.label}
              </div>
            ))}
          </div>
        </div>

        {/* Selected Node Info */}
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-4 left-4 z-10 glass-card p-4 rounded-xl w-64"
          >
            <h4 className="text-sm font-bold mb-2" style={{ color: 'var(--text)' }}>{selectedNode.label}</h4>
            <div className="space-y-1 text-xs" style={{ color: 'var(--muted)' }}>
              <div>Type: <span style={{ color: nodeColors[selectedNode.type] }}>{selectedNode.type}</span></div>
              <div>Connections: {edges.filter(e => e.from === selectedNode.id || e.to === selectedNode.id).length}</div>
              <div>Total Flow: ₹{edges
                .filter(e => e.from === selectedNode.id || e.to === selectedNode.id)
                .reduce((sum, e) => sum + e.amount, 0)
                .toLocaleString()}
              </div>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="mt-2 text-xs text-rose-400 hover:text-rose-300"
            >
              Deselect
            </button>
          </motion.div>
        )}

        {/* SVG Graph */}
        <svg
          className="flex-1 w-full"
          viewBox="0 0 800 600"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center', transition: 'transform 0.3s' }}
        >
          {/* Edges */}
          {edges.map((edge, i) => {
            const from = getNodeById(edge.from);
            const to = getNodeById(edge.to);
            if (!from || !to) return null;
            const isHighlighted = hoveredNode === edge.from || hoveredNode === edge.to;
            const isCycleEdge = cycleHighlight.includes(edge.from) && cycleHighlight.includes(edge.to);
            return (
              <g key={i}>
                <motion.line
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: isHighlighted ? 0.8 : 0.3 }}
                  transition={{ duration: 1, delay: 0.5 + i * 0.05 }}
                  x1={from.x} y1={from.y}
                  x2={to.x} y2={to.y}
                  stroke={isCycleEdge ? '#7c3aed' : edge.suspicious ? '#f43f5e' : '#fb7185'}
                  strokeWidth={isCycleEdge ? 3 : isHighlighted ? 2.5 : 1.5}
                  strokeDasharray={edge.suspicious && !isCycleEdge ? '6 3' : 'none'}
                />
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((node, i) => {
            const isFiltered = searchQuery && !filteredNodes.includes(node);
            const isSelected = selectedNode?.id === node.id;
            const isHovered = hoveredNode === node.id;
            const isCycleHighlighted = cycleHighlight.includes(node.id);
            return (
              <motion.g
                key={node.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: isFiltered ? 0.2 : 1 }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.05, type: 'spring' }}
                onClick={() => setSelectedNode(isSelected ? null : node)}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Cycle highlight glow */}
                {isCycleHighlighted && (
                  <circle
                    cx={node.x} cy={node.y}
                    r={node.radius + 12}
                    fill="none"
                    stroke="#7c3aed"
                    strokeWidth="2"
                    opacity="0.6"
                    className="animate-pulse"
                  />
                )}
                {/* Glow */}
                {(isSelected || isHovered) && !isCycleHighlighted && (
                  <circle
                    cx={node.x} cy={node.y}
                    r={node.radius + 8}
                    fill="none"
                    stroke={nodeColors[node.type]}
                    strokeWidth="2"
                    opacity={0.4}
                  />
                )}
                {/* Node */}
                {node.type === 'merchant' ? (
                  <rect
                    x={node.x - node.radius} y={node.y - node.radius}
                    width={node.radius * 2} height={node.radius * 2}
                    rx={4}
                    fill={isCycleHighlighted ? '#7c3aed' : nodeColors[node.type]}
                    opacity={0.9}
                  />
                ) : (
                  <circle
                    cx={node.x} cy={node.y}
                    r={node.radius}
                    fill={isCycleHighlighted ? '#7c3aed' : nodeColors[node.type]}
                    opacity={0.9}
                  />
                )}
                {/* Label */}
                <text
                  x={node.x} y={node.y + node.radius + 14}
                  textAnchor="middle"
                  fontSize="9"
                  fontFamily="monospace"
                  fill={isFiltered ? 'rgba(148,163,184,0.3)' : '#94a3b8'}
                >
                  {node.label}
                </text>
              </motion.g>
            );
          })}
        </svg>

        {/* Circular flow alert - always visible */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute top-4 left-4 z-50 glass-card p-4 rounded-xl max-w-xs flex flex-col gap-2"
          style={{ background: 'rgba(20, 20, 30, 0.95)', border: '1px solid rgba(245, 158, 11, 0.5)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-400 mt-0.5 flex-shrink-0" aria-hidden />
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold mb-1" style={{ color: '#fff' }}>
                {mlCycleDetected ? 'ML: Circular Flow Confirmed' : 'Circular Flow Detected'}
              </h4>
              <p className="text-xs mb-3" style={{ color: '#94a3b8' }}>
                {mlCycleDetected
                  ? 'NetworkX cycle detection confirmed money mule ring. 3 accounts flagged.'
                  : 'A money mule network of 14 nodes with circular fund movement identified.'}
              </p>
              <button
                type="button"
                onClick={async () => {
                  console.log('Investigate clicked');
                  let createdCaseId = '';
                  try {
                    const caseResult = await api.createCase({
                      title: 'Circular Fund Flow — Money Mule Ring',
                      description: 'NetworkX cycle detection confirmed money mule ring: user_44 → user_8 → user_89 → user_44. Total: ₹1,77,000.',
                      priority: 'critical',
                      status: 'open',
                      amount: 177000,
                    });
                    createdCaseId = caseResult?.$id || '';
                  } catch (e) {
                    console.error('Create case error:', e);
                  }
                  
                  // Navigate
                  if (onNavigate) {
                    onNavigate('investigation');
                  } else {
                    window.location.href = '/investigation';
                  }
                  
                  setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('investigationSelect', {
                      detail: { 
                        caseType: 'Money Mule',
                        caseId: createdCaseId,
                      }
                    }));
                  }, 1000);
                }}
                className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Investigate</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
