import { motion } from 'motion/react';
import { Shield, Lock, Eye, Settings as Cog, Users, BarChart3 } from 'lucide-react';
import { UserRole } from '../context/AuthContext';

interface LoginPageProps {
  onLogin: (role: UserRole) => void;
  key?: string;
}

const roles = [
  {
    id: 'analyst' as UserRole,
    title: 'Fraud Analyst',
    desc: 'Monitor transactions, investigate threats, and manage fraud cases',
    icon: Eye,
    hue: { from: '#e11d48', to: '#f43f5e' },
    permissions: ['View Dashboard', 'Transaction Monitoring', 'Threat Analysis', 'Case Investigation'],
  },
  {
    id: 'manager' as UserRole,
    title: 'Fraud Manager',
    desc: 'Oversee team performance, generate reports, and approve major decisions',
    icon: Users,
    hue: { from: '#be123c', to: '#e11d48' },
    permissions: ['All Analyst Features', 'Team Management', 'Compliance Reports', 'Network Analysis'],
  },
  {
    id: 'admin' as UserRole,
    title: 'System Admin',
    desc: 'Full system access, user management, and configuration settings',
    icon: Cog,
    hue: { from: '#9f1239', to: '#be123c' },
    permissions: ['All Manager Features', 'User Management', 'System Config', 'Audit Logs'],
  },
];

export default function LoginPage({ onLogin }: LoginPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'var(--bg)' }}
    >
      {/* Logo */}
      <motion.div
        initial={{ y: -40, opacity: 0, scale: 0.5 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', bounce: 0.4, duration: 0.8 }}
        className="mb-8 flex flex-col items-center"
      >
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 pulse-glow"
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}
        >
          <Shield className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>Argus Eye</h1>
        <p className="mt-1" style={{ color: 'var(--muted)' }}>Enterprise Fraud Management Portal</p>
      </motion.div>

      {/* Role cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl w-full">
        {roles.map((role, i) => {
          const Icon = role.icon;
          return (
            <motion.button
              key={role.id}
              initial={{ y: 60, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.12, type: 'spring', bounce: 0.3 }}
              whileHover={{ y: -8, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onLogin(role.id)}
              className="glass-card p-6 rounded-2xl text-left cursor-pointer group relative overflow-hidden"
            >
              {/* Hover glow */}
              <motion.div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `radial-gradient(ellipse at 50% 0%, ${role.hue.from}20, transparent 70%)` }}
              />

              <div className="relative z-10">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
                  style={{ background: `linear-gradient(135deg, ${role.hue.from}, ${role.hue.to})` }}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text)' }}>{role.title}</h3>
                <p className="text-xs mb-4 leading-relaxed" style={{ color: 'var(--muted)' }}>{role.desc}</p>

                <div className="space-y-1.5">
                  {role.permissions.map((perm) => (
                    <div key={perm} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: role.hue.from }} />
                      {perm}
                    </div>
                  ))}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}