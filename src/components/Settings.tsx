import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Users, Shield, Bell, Database, Globe, Server, Activity, CheckCircle, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { useAuth, UserRole } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

interface AuditLog {
    id: string;
    action: string;
    user: string;
    timestamp: string;
    details: string;
}

const mockAuditLogs: AuditLog[] = [
    { id: 'LOG-001', action: 'User Login', user: 'admin@argus.io', timestamp: '2024-02-01 10:30:00', details: 'Admin login from 192.168.1.1' },
    { id: 'LOG-002', action: 'Case Blocked', user: 'analyst_42', timestamp: '2024-02-01 10:25:00', details: 'CASE-8842 marked as blocked' },
    { id: 'LOG-003', action: 'Threat Confirmed', user: 'analyst_15', timestamp: '2024-02-01 10:20:00', details: 'upi_fraud_992 confirmed as threat' },
    { id: 'LOG-004', action: 'Ruleset Updated', user: 'admin@argus.io', timestamp: '2024-02-01 09:45:00', details: 'Velocity Rules threshold changed to 5 TPS' },
    { id: 'LOG-005', action: 'Report Generated', user: 'manager_8', timestamp: '2024-02-01 09:30:00', details: 'STR report generated for FIU-IND' },
    { id: 'LOG-006', action: 'System Config', user: 'admin@argus.io', timestamp: '2024-02-01 09:00:00', details: 'ML model retrained with latest data' },
];

const mockUsers = [
    { id: 1, name: 'Priya Sharma', email: 'priya@argus.io', role: 'analyst' as UserRole, status: 'active', lastLogin: '2 hours ago' },
    { id: 2, name: 'Rahul Kumar', email: 'rahul@argus.io', role: 'analyst' as UserRole, status: 'active', lastLogin: '30 min ago' },
    { id: 3, name: 'Anita Desai', email: 'anita@argus.io', role: 'manager' as UserRole, status: 'active', lastLogin: '1 hour ago' },
    { id: 4, name: 'Vikram Singh', email: 'vikram@argus.io', role: 'admin' as UserRole, status: 'active', lastLogin: '5 min ago' },
    { id: 5, name: 'Meera Iyer', email: 'meera@argus.io', role: 'analyst' as UserRole, status: 'inactive', lastLogin: '3 days ago' },
];

export default function Settings() {
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [activeSection, setActiveSection] = useState('users');
    const [apiHealth, setApiHealth] = useState<any>(null);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>(mockAuditLogs);
    const [auditLoading, setAuditLoading] = useState(false);
    const [users, setUsers] = useState(mockUsers);
    const [alertThreshold, setAlertThreshold] = useState<number>(() => {
        const saved = localStorage.getItem('argus_alert_threshold');
        return saved ? Number(saved) : 75;
    });
    const [emailNotifications, setEmailNotifications] = useState<boolean>(() => {
        const saved = localStorage.getItem('argus_email_notifications');
        return saved !== null ? saved === 'true' : true;
    });
    const [slackNotifications, setSlackNotifications] = useState<boolean>(() => {
        const saved = localStorage.getItem('argus_slack_notifications');
        return saved !== null ? saved === 'true' : false;
    });
    const [auditRefreshing, setAuditRefreshing] = useState(false);
    const [autoBlock, setAutoBlock] = useState(true);

    useEffect(() => {
        async function checkHealth() {
            const health = await api.health();
            setApiHealth(health);
        }
        checkHealth();
    }, []);

    useEffect(() => {
        if (activeSection !== 'audit') return;
        setAuditLoading(true);
        api.getAuditLogs().then((data: any[]) => {
            if (Array.isArray(data) && data.length > 0) {
                setAuditLogs(data.map((log: any) => ({
                    id:        log.$id || log.id || `LOG-${Math.random()}`,
                    action:    log.action || 'System Action',
                    user:      log.analystId || log.user || 'System',
                    timestamp: log.timestamp ? new Date(log.timestamp).toLocaleString('en-IN') : 'Unknown',
                    details:   log.details || (log.entityId ? `${log.action} on ${log.entityId}` : 'No details'),
                })));
            }
        }).finally(() => setAuditLoading(false));
    }, [activeSection]);

    const sections = [
        { id: 'users', label: 'User Management', icon: Users },
        { id: 'system', label: 'System Config', icon: Server },
        { id: 'audit', label: 'Audit Logs', icon: Shield },
        { id: 'notifications', label: 'Notifications', icon: Bell },
    ];

    const toggleUserStatus = async (userId: number) => {
        const user = users.find(u => u.id === userId);
        if (!user) return;
        const newStatus = user.status === 'active' ? 'inactive' : 'active';
        setUsers(prev => prev.map(u =>
            u.id === userId ? { ...u, status: newStatus } : u
        ));
        try {
          await api.createAuditLog({
            action: `USER_${newStatus.toUpperCase()}`,
            entityId: user.email,
            analystId: 'admin',
            details: `User ${user.name} (${user.email}) set to ${newStatus}`,
            rbi_reference: '',
          });
        } catch (e) { /* silent */ }
    };

    const changeUserRole = async (userId: number, newRole: UserRole) => {
        const user = users.find(u => u.id === userId);
        if (!user) return;
        setUsers(prev => prev.map(u =>
            u.id === userId ? { ...u, role: newRole } : u
        ));
        try {
          await api.createAuditLog({
            action: 'USER_ROLE_CHANGED',
            entityId: user.email,
            analystId: 'admin',
            details: `User ${user.name} role changed to ${newRole}`,
            rbi_reference: '',
          });
        } catch (e) { /* silent */ }
    };

    const handleRefreshAudit = async () => {
        setAuditRefreshing(true);
        try {
          const data = await api.getAuditLogs();
          if (Array.isArray(data) && data.length > 0) {
            setAuditLogs(data.map((log: any) => ({
              id: log.$id || log.id || `LOG-${Math.random()}`,
              action: log.action || 'System Action',
              user: log.analystId || log.user || 'System',
              timestamp: log.timestamp
                ? new Date(log.timestamp).toLocaleString('en-IN')
                : 'Unknown',
              details: log.details || `${log.action} on ${log.entityId}`,
            })));
          }
        } catch (e) {
          console.error('Audit refresh failed:', e);
        } finally {
          setAuditRefreshing(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-8 min-h-screen"
        >
            <header className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight mb-1 flex items-center gap-3" style={{ color: 'var(--text)' }}>
                    <SettingsIcon className="w-8 h-8 text-rose-400" />
                    Settings
                </h2>
                <p style={{ color: 'var(--muted)' }}>System configuration and administration</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar Nav */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="glass-panel rounded-2xl p-4 h-fit"
                >
                    <div className="space-y-1">
                        {sections.map(section => {
                            const Icon = section.icon;
                            return (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeSection === section.id
                                        ? 'bg-rose-500/10 text-rose-400'
                                        : 'hover:bg-white/5'
                                        }`}
                                    style={activeSection !== section.id ? { color: 'var(--muted)' } : {}}
                                >
                                    <Icon className="w-4 h-4" />
                                    {section.label}
                                </button>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Content */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="lg:col-span-3"
                >
                    {/* User Management */}
                    {activeSection === 'users' && (
                        <div className="glass-panel rounded-2xl p-6">
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--text)' }}>
                                <Users className="w-5 h-5 text-rose-400" /> User Management
                            </h3>
                            <div className="space-y-4">
                                {users.map(u => (
                                    <motion.div
                                        key={u.id}
                                        whileHover={{ x: 4 }}
                                        className="glass-card p-4 rounded-xl flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                                                style={{ background: u.role === 'admin' ? 'linear-gradient(135deg, #be123c, #e11d48)' : u.role === 'manager' ? 'linear-gradient(135deg, #e11d48, #f43f5e)' : 'linear-gradient(135deg, #f43f5e, #fb7185)' }}
                                            >
                                                {u.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{u.name}</p>
                                                <p className="text-xs" style={{ color: 'var(--muted)' }}>{u.email} • Last: {u.lastLogin}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <select
                                                value={u.role}
                                                onChange={(e) => changeUserRole(u.id, e.target.value as UserRole)}
                                                className="px-3 py-1.5 rounded-lg glass-card text-xs font-medium focus:outline-none"
                                                style={{ color: 'var(--text)', background: 'var(--cardBg)' }}
                                            >
                                                <option value="analyst">Analyst</option>
                                                <option value="manager">Manager</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                            <button
                                                onClick={() => toggleUserStatus(u.id)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${u.status === 'active' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                                                    }`}
                                            >
                                                {u.status === 'active' ? 'Active' : 'Inactive'}
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* System Config */}
                    {activeSection === 'system' && (
                        <div className="space-y-6">
                            <div className="glass-panel rounded-2xl p-6">
                                <h3 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--text)' }}>
                                    <Server className="w-5 h-5 text-rose-400" /> System Status
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="glass-card p-4 rounded-xl">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium" style={{ color: 'var(--muted)' }}>API Server</span>
                                            {apiHealth?.status === 'ok' ? (
                                                <CheckCircle className="w-5 h-5 text-emerald-400" />
                                            ) : (
                                                <AlertCircle className="w-5 h-5 text-amber-400" />
                                            )}
                                        </div>
                                        <p className="text-lg font-bold" style={{ color: apiHealth?.status === 'ok' ? '#e11d48' : '#f59e0b' }}>
                                            {apiHealth?.status === 'ok' ? 'Online' : 'Using Mock'}
                                        </p>
                                    </div>
                                    <div className="glass-card p-4 rounded-xl">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Database</span>
                                            <Database className="w-5 h-5 text-rose-400" />
                                        </div>
                                        <p className="text-lg font-bold" style={{ color: 'var(--text)' }}>Appwrite</p>
                                    </div>
                                    <div className="glass-card p-4 rounded-xl">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium" style={{ color: 'var(--muted)' }}>ML Model</span>
                                            <Activity className="w-5 h-5 text-pink-400" />
                                        </div>
                                        <p className="text-lg font-bold" style={{ color: 'var(--text)' }}>v2.4.1</p>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-panel rounded-2xl p-6">
                                <h3 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--text)' }}>
                                    <Globe className="w-5 h-5 text-rose-400" /> Configuration
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 glass-card rounded-xl">
                                        <div>
                                            <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Dark Mode</p>
                                            <p className="text-xs" style={{ color: 'var(--muted)' }}>Toggle between light and dark theme</p>
                                        </div>
                                        <button
                                            onClick={toggleTheme}
                                            className={`w-12 h-6 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-rose-500' : 'bg-slate-400'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between p-4 glass-card rounded-xl">
                                        <div>
                                            <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Auto-block High Risk</p>
                                            <p className="text-xs" style={{ color: 'var(--muted)' }}>Automatically block transactions with risk score &gt; 90</p>
                                        </div>
                                        <div className="w-12 h-6 rounded-full bg-emerald-500 relative cursor-pointer">
                                            <button
                                                onClick={() => setAutoBlock(v => !v)}
                                                className={`w-12 h-6 rounded-full relative transition-colors
                                                            ${autoBlock ? 'bg-emerald-500' : 'bg-slate-500'}`}
                                            >
                                                <motion.div
                                                    className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                                                    animate={{ x: autoBlock ? 24 : 2 }}
                                                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                                />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-4 glass-card rounded-xl">
                                        <div>
                                            <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Refresh Interval</p>
                                            <p className="text-xs" style={{ color: 'var(--muted)' }}>Dashboard data refresh frequency</p>
                                        </div>
                                        <select
                                            className="px-3 py-1.5 rounded-lg glass-card text-sm focus:outline-none"
                                            style={{ color: 'var(--text)', background: 'var(--cardBg)' }}
                                        >
                                            <option>10 seconds</option>
                                            <option>30 seconds</option>
                                            <option>1 minute</option>
                                            <option>5 minutes</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Audit Logs */}
                    {activeSection === 'audit' && (
                        <div className="glass-panel rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}>
                                    <Shield className="w-5 h-5 text-rose-400" /> Audit Logs
                                </h3>
                                <button
                                    onClick={handleRefreshAudit}
                                    disabled={auditRefreshing}
                                    className="px-3 py-1.5 rounded-lg glass-card text-xs font-medium
                                               flex items-center gap-1.5 hover:bg-white/5 transition-colors
                                               disabled:opacity-50"
                                    style={{ color: 'var(--muted)' }}
                                >
                                    <RefreshCw className={`w-3 h-3 ${auditRefreshing ? 'animate-spin' : ''}`} />
                                    {auditRefreshing ? 'Refreshing...' : 'Refresh'}
                                </button>
                            </div>
                            <div className="space-y-3">
                                {auditLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="w-6 h-6 text-rose-400 animate-spin" />
                                        <span className="ml-2 text-sm" style={{ color: 'var(--muted)' }}>Loading audit logs...</span>
                                    </div>
                                ) : auditLogs.map((log, i) => (
                                    <motion.div
                                        key={log.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: i * 0.05 }}
                                        className="glass-card p-4 rounded-xl flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-2 h-2 rounded-full bg-rose-400" />
                                            <div>
                                                <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{log.action}</p>
                                                <p className="text-xs" style={{ color: 'var(--muted)' }}>{log.details}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{log.user}</p>
                                            <p className="text-xs" style={{ color: 'var(--muted)' }}>{log.timestamp}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Notifications */}
                    {activeSection === 'notifications' && (
                        <div className="glass-panel rounded-2xl p-6">
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--text)' }}>
                                <Bell className="w-5 h-5 text-rose-400" /> Notification Preferences
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 glass-card rounded-xl">
                                    <div>
                                        <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Email Notifications</p>
                                        <p className="text-xs" style={{ color: 'var(--muted)' }}>Receive fraud alerts via email</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                          const next = !emailNotifications;
                                          setEmailNotifications(next);
                                          localStorage.setItem('argus_email_notifications', String(next));
                                        }}
                                        className={`w-12 h-6 rounded-full relative transition-colors ${emailNotifications ? 'bg-rose-500' : 'bg-slate-500'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${emailNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between p-4 glass-card rounded-xl">
                                    <div>
                                        <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Slack Integration</p>
                                        <p className="text-xs" style={{ color: 'var(--muted)' }}>Post alerts to #fraud-alerts channel</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                          const next = !slackNotifications;
                                          setSlackNotifications(next);
                                          localStorage.setItem('argus_slack_notifications', String(next));
                                        }}
                                        className={`w-12 h-6 rounded-full relative transition-colors ${slackNotifications ? 'bg-rose-500' : 'bg-slate-500'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${slackNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                                <div className="p-4 glass-card rounded-xl">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Alert Threshold</p>
                                            <p className="text-xs" style={{ color: 'var(--muted)' }}>Minimum risk score to trigger alerts</p>
                                        </div>
                                        <span className="text-lg font-bold text-rose-400">{alertThreshold}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={alertThreshold}
                                        onChange={(e) => {
                                          const v = Number(e.target.value);
                                          setAlertThreshold(v);
                                          localStorage.setItem('argus_alert_threshold', String(v));
                                        }}
                                        className="w-full h-2 rounded-full appearance-none cursor-pointer"
                                        style={{ background: `linear-gradient(to right, #f43f5e 0%, #f43f5e ${alertThreshold}%, var(--border) ${alertThreshold}%, var(--border) 100%)` }}
                                    />
                                    <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--muted)' }}>
                                        <span>Low (0)</span>
                                        <span>High (100)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
}
