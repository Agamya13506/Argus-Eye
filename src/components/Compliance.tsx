import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { FileText, CheckCircle, AlertCircle, Clock, FileDown, Download, Shield, Globe, Building2, AlertTriangle, BarChart3, CreditCard } from 'lucide-react';
import api from '../services/api';

const complianceFrameworks = [
  {
    id: 'pci-dss',
    name: 'PCI-DSS',
    fullName: 'Payment Card Industry Data Security Standard',
    icon: CreditCard,
    iconBg: 'bg-rose-500/10',
    iconColor: 'text-rose-400',
    barColor: '#f43f5e',
    status: 'Compliant',
    score: 98,
    lastAudit: '2024-01-15',
    nextAudit: '2024-07-15',
    requirements: [
      { id: '1', name: 'Install and maintain firewall', status: 'pass', score: 100 },
      { id: '2', name: 'Encrypt transmission of cardholder data', status: 'pass', score: 100 },
      { id: '3', name: 'Maintain vulnerability management program', status: 'pass', score: 95 },
      { id: '4', name: 'Implement strong access controls', status: 'pass', score: 98 },
    ],
  },
  {
    id: 'rbi',
    name: 'RBI Guidelines',
    fullName: 'Reserve Bank of India - Fraud Management',
    icon: Building2,
    iconBg: 'bg-rose-500/10',
    iconColor: 'text-rose-400',
    barColor: '#fb7185',
    status: 'Compliant',
    score: 96,
    lastAudit: '2024-01-20',
    nextAudit: '2024-06-20',
    requirements: [
      { id: '1', name: 'Fraud detection and reporting', status: 'pass', score: 98 },
      { id: '2', name: 'Customer due diligence', status: 'pass', score: 95 },
      { id: '3', name: 'Transaction monitoring', status: 'pass', score: 97 },
      { id: '4', name: 'STR filing within 7 days', status: 'pass', score: 100 },
    ],
  },
  {
    id: 'gdpr',
    name: 'GDPR',
    fullName: 'General Data Protection Regulation',
    icon: Globe,
    iconBg: 'bg-pink-500/10',
    iconColor: 'text-pink-400',
    barColor: '#2dd4bf',
    status: 'Compliant',
    score: 94,
    lastAudit: '2024-01-10',
    nextAudit: '2024-07-10',
    requirements: [
      { id: '1', name: 'Data protection officer appointed', status: 'pass', score: 100 },
      { id: '2', name: 'Privacy impact assessments', status: 'pass', score: 92 },
      { id: '3', name: 'Data breach notification', status: 'pass', score: 95 },
      { id: '4', name: 'User consent management', status: 'pass', score: 93 },
    ],
  },
];

const recentAudits = [
  { id: 'AUD-2024-001', framework: 'PCI-DSS', date: '2024-01-15', auditor: 'QSA India', result: 'Pass', score: 98 },
  { id: 'AUD-2024-002', framework: 'RBI', date: '2024-01-20', auditor: 'Internal Audit', result: 'Pass', score: 96 },
  { id: 'AUD-2023-012', framework: 'GDPR', date: '2023-12-10', auditor: 'DPO Team', result: 'Pass', score: 94 },
];

const reports = [
  { id: 'STR-2024-02-01', type: 'Suspicious Transaction Report (STR)', date: '2024-02-01', status: 'Filed', agency: 'FIU-IND' },
  { id: 'CTR-2024-01-31', type: 'Cash Transaction Report (CTR)', date: '2024-01-31', status: 'Filed', agency: 'FIU-IND' },
  { id: 'SAR-2024-01-28', type: 'Suspicious Activity Report (SAR)', date: '2024-01-28', status: 'Pending Review', agency: 'Internal' },
  { id: 'STR-2024-01-15', type: 'Suspicious Transaction Report (STR)', date: '2024-01-15', status: 'Filed', agency: 'FIU-IND' },
];

export default function Compliance() {
  const [filterType, setFilterType] = useState('All Types');
  const [filterTime, setFilterTime] = useState('30d');

  useEffect(() => {
    async function fetchCompliance() {
      try {
        await api.getCompliance();
      } catch (e) { /* use mock */ }
    }
    fetchCompliance();
  }, []);

  const filteredReports = reports.filter(r => {
    if (filterType === 'All Types') return true;
    return r.type.includes(filterType);
  });

  const exportFrameworkReport = () => {
    const header = 'Framework,Score,Status,Last Audit,Next Audit\n';
    const rows = complianceFrameworks.map(f =>
      `${f.name},${f.score},${f.status},${f.lastAudit},${f.nextAudit}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance-frameworks-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportReportCSV = (report: typeof reports[0]) => {
    const header = 'Report ID,Type,Date,Status,Agency\n';
    const rows = `${report.id},${report.type},${report.date},${report.status},${report.agency}`;
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.id}-report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
            <FileText className="w-8 h-8 text-rose-400" />
            Compliance & Audits
          </h2>
          <p style={{ color: 'var(--muted)' }}>Regulatory compliance & audit trail management</p>
        </div>
        <button onClick={exportFrameworkReport} className="btn-accent flex items-center gap-2">
          <FileDown className="w-4 h-4" /> Generate Report
        </button>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 stagger-children">
        <motion.div whileHover={{ y: -3 }} className="glass-card p-6 rounded-2xl border-l-4 border-emerald-400">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Overall Compliance</h3>
            <CheckCircle className="w-6 h-6 text-emerald-400" />
          </div>
          <p className="text-3xl font-bold mb-1" style={{ color: 'var(--text)' }}>96%</p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>All frameworks in compliance.</p>
        </motion.div>

        <motion.div whileHover={{ y: -3 }} className="glass-card p-6 rounded-2xl border-l-4 border-amber-400">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Pending Actions</h3>
            <AlertCircle className="w-6 h-6 text-amber-400" />
          </div>
          <p className="text-3xl font-bold mb-1" style={{ color: 'var(--text)' }}>3</p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Items require attention before next audit.</p>
        </motion.div>

        <motion.div whileHover={{ y: -3 }} className="glass-card p-6 rounded-2xl border-l-4 border-rose-400">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Next Audit</h3>
            <Clock className="w-6 h-6 text-rose-400" />
          </div>
          <p className="text-3xl font-bold mb-1" style={{ color: 'var(--text)' }}>45 Days</p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>RBI Guidelines quarterly review.</p>
        </motion.div>
      </div>

      {/* Frameworks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {complianceFrameworks.map((fw, index) => (
          <motion.div
            key={fw.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
            whileHover={{ y: -3 }}
            className="glass-panel rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${fw.iconBg} flex items-center justify-center`}>
                  <fw.icon className={`w-5 h-5 ${fw.iconColor}`} />
                </div>
                <div>
                  <h3 className="font-bold" style={{ color: 'var(--text)' }}>{fw.name}</h3>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>{fw.fullName}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400">
                {fw.status}
              </span>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Compliance Score</span>
                <span className="text-lg font-bold" style={{ color: 'var(--text)' }}>{fw.score}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${fw.score}%` }}
                  transition={{ duration: 1, delay: 0.6 + index * 0.1 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: fw.barColor }}
                />
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {fw.requirements.map((req) => (
                <div key={req.id} className="flex items-center justify-between text-sm">
                  <span style={{ color: 'var(--text-secondary)' }}>{req.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${req.score}%` }} />
                    </div>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs pt-4" style={{ borderTop: '1px solid var(--border)', color: 'var(--muted)' }}>
              <span>Last: {fw.lastAudit}</span>
              <span>Next: {fw.nextAudit}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Audits & Action Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="glass-panel rounded-2xl p-6"
        >
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <BarChart3 className="w-5 h-5 text-rose-400" /> Recent Audits
          </h3>
          <div className="space-y-4">
            {recentAudits.map((audit) => (
              <div key={audit.id} className="flex items-center justify-between p-3 glass-card rounded-xl">
                <div>
                  <p className="font-medium text-sm" style={{ color: 'var(--text)' }}>{audit.framework}</p>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>{audit.date} • {audit.auditor}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-emerald-400">{audit.result}</span>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>Score: {audit.score}%</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="glass-panel rounded-2xl p-6"
        >
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <AlertTriangle className="w-5 h-5 text-amber-400" /> Action Items
          </h3>
          <div className="space-y-3">
            {[
              { title: 'GDPR Data Retention Review', due: 'Due: Feb 15, 2024', color: 'amber', icon: AlertCircle },
              { title: 'PCI-DSS Vulnerability Scan', due: 'Due: Feb 28, 2024', color: 'sky', icon: Shield },
              { title: 'RBI Quarterly Report', due: 'Due: Mar 31, 2024', color: 'rose', icon: Building2 },
            ].map((item, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 bg-${item.color}-500/5 rounded-xl border border-${item.color}-500/15`}>
                <item.icon className={`w-5 h-5 text-${item.color}-400 mt-0.5`} />
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{item.title}</p>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>{item.due}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Reports Table */}
      <div className="flex-1 glass-panel rounded-2xl p-6 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold" style={{ color: 'var(--text)' }}>Regulatory Reports</h3>
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1.5 rounded-lg glass-card text-sm focus:outline-none"
              style={{ color: 'var(--text-secondary)', background: 'var(--cardBg)' }}
            >
              <option>All Types</option>
              <option>STR</option>
              <option>CTR</option>
              <option>SAR</option>
            </select>
            <select
              value={filterTime}
              onChange={(e) => setFilterTime(e.target.value)}
              className="px-3 py-1.5 rounded-lg glass-card text-sm focus:outline-none"
              style={{ color: 'var(--text-secondary)', background: 'var(--cardBg)' }}
            >
              <option value="30d">Last 30 Days</option>
              <option value="7d">Last 7 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs uppercase tracking-wider" style={{ borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>
                <th className="pb-3 font-semibold">Report ID</th>
                <th className="pb-3 font-semibold">Type</th>
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold">Agency</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {filteredReports.map((report, i) => (
                <motion.tr
                  key={report.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.9 + (i * 0.08) }}
                  className="transition-colors hover:bg-white/3"
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  <td className="py-4 font-mono font-medium" style={{ color: 'var(--text)' }}>{report.id}</td>
                  <td className="py-4">{report.type}</td>
                  <td className="py-4">{report.date}</td>
                  <td className="py-4">{report.agency}</td>
                  <td className="py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${report.status === 'Filed' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                      }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <button onClick={() => exportReportCSV(report)} className="p-2 hover:bg-rose-500/10 text-rose-400 rounded-lg transition-colors" title="Download PDF">
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
