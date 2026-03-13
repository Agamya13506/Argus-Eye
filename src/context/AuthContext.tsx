import { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'analyst' | 'manager' | 'admin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
}

interface AuthContextType {
  user: User | null;
  login: (role: UserRole) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const rolePermissions: Record<UserRole, string[]> = {
  analyst: ['view_dashboard', 'view_transactions', 'view_threats', 'view_investigation', 'view_analytics'],
  manager: ['view_dashboard', 'view_transactions', 'view_threats', 'view_investigation', 'view_analytics', 'manage_cases', 'view_reports', 'manage_team'],
  admin: ['view_dashboard', 'view_transactions', 'view_threats', 'view_investigation', 'view_analytics', 'manage_cases', 'view_reports', 'manage_team', 'manage_users', 'system_settings', 'view_audit_logs'],
};

const roleNames: Record<UserRole, string> = {
  analyst: 'Fraud Analyst',
  manager: 'Fraud Manager',
  admin: 'System Admin',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (role: UserRole) => {
    setUser({
      id: `${role}_${Date.now()}`,
      name: roleNames[role],
      role: role,
      avatar: role.charAt(0).toUpperCase(),
    });
  };

  const logout = () => {
    setUser(null);
  };

  const hasPermission = (permission: string) => {
    if (!user) return false;
    return rolePermissions[user.role].includes(permission);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}