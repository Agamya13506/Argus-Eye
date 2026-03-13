import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard, AlertTriangle, Search, Share2,
  BarChart3, Shield, Beaker, Settings, Sun, Moon, LogOut
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

const allNavItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['analyst', 'manager', 'admin'] },
  { id: 'threat-intel', label: 'Threat Intel', icon: AlertTriangle, roles: ['analyst', 'manager', 'admin'], badge: 3 },
  { id: 'investigation', label: 'Investigation', icon: Search, roles: ['analyst', 'manager', 'admin'] },
  { id: 'network', label: 'Network Graph', icon: Share2, roles: ['manager', 'admin'] },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, roles: ['analyst', 'manager', 'admin'] },
  { id: 'compliance', label: 'Compliance', icon: Shield, roles: ['manager', 'admin'] },
  { id: 'simulator', label: 'Simulator', icon: Beaker, roles: ['admin'] },
  { id: 'settings', label: 'Settings', icon: Settings, roles: ['admin'] },
];

const portalNames: Record<string, string> = {
  analyst: 'ANALYST PORTAL',
  manager: 'MANAGER PORTAL',
  admin: 'ADMIN PORTAL',
};

export default function Sidebar({ activeTab, setActiveTab, onLogout }: SidebarProps) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  if (!user) return null;

  const visibleItems = allNavItems.filter(item => item.roles.includes(user.role));

  return (
    <motion.aside
      initial={{ x: -260, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, type: 'spring', bounce: 0.15 }}
      className="fixed left-0 top-0 h-full w-64 z-50 glass-sidebar flex flex-col"
    >
      {/* Logo */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <motion.div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}
            whileHover={{ rotate: 10, scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Shield className="w-5 h-5" />
          </motion.div>
          <div>
            <h2 className="font-bold text-sm tracking-tight" style={{ color: 'var(--text)' }}>Argus Eye</h2>
            <p className="text-[10px] font-medium tracking-widest" style={{ color: 'var(--accent)' }}>
              {portalNames[user.role]}
            </p>
          </div>
        </div>
        <div className="gradient-line mt-4 rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto stagger-children">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <motion.button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.97 }}
              className={`group w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden ${isActive
                ? 'text-white'
                : 'hover:bg-white/5'
                }`}
              style={!isActive ? { color: 'var(--muted)' } : {}}
            >
              {/* Active background */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}

              {/* Active glow edge */}
              {isActive && (
                <motion.div
                  layoutId="activeGlow"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                  style={{ background: 'var(--accent3)', boxShadow: '0 0 12px rgba(var(--shadowColor), 0.5)' }}
                />
              )}

              <Icon className={`w-4 h-4 relative z-10 transition-transform duration-300 ${isActive ? 'text-white' : 'group-hover:text-[var(--accent)]'}`} />
              <span className="relative z-10">{item.label}</span>

              {item.badge && (
                <span
                  className="relative z-10 ml-auto px-2 py-0.5 text-[10px] font-bold rounded-full text-white"
                  style={{ background: 'var(--accent)' }}
                >
                  {item.badge}
                </span>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-4 pb-5 space-y-3 border-t" style={{ borderColor: 'var(--border)' }}>
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm transition-all hover:bg-white/5 mt-3"
          style={{ color: 'var(--muted)' }}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          <div
            className={`ml-auto w-9 h-5 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-rose-500' : 'bg-stone-400'}`}
          >
            <motion.div
              className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm"
              animate={{ x: theme === 'dark' ? 16 : 2 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          </div>
        </button>

        {/* User profile */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: 'var(--accentSoft)', border: '1px solid var(--border)' }}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}
          >
            {user.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: 'var(--text)' }}>{user.name}</p>
            <p className="text-[10px] capitalize" style={{ color: 'var(--accent)' }}>{user.role}</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onLogout(); }}
            className="relative z-50 p-2 rounded-lg hover:bg-rose-500/20 transition-colors cursor-pointer"
            style={{ color: 'var(--accent)' }}
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
