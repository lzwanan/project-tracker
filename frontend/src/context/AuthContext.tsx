import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { message } from 'antd';
import { authApi } from '@/services/auth';

interface User {
  id: number;
  employeeId: string;
  name: string;
  email: string;
  firstLogin: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isGuest: boolean;
  login: (employeeId: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res: any = await authApi.me();
      if (res.code === 200 && res.data) {
        setUser(res.data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refreshUser(); }, []);

  const login = async (employeeId: string, password: string) => {
    try {
      const res: any = await authApi.login(employeeId, password, 'true', '');
      if (res.code === 200) {
        setUser(res.data.user);
        if (res.data.firstLogin) {
          message.warning('首次登录，请修改密码');
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    try { await authApi.logout(); } catch {}
    setUser(null);
    localStorage.removeItem('tracker_remember');
  };

  const isGuest = user?.employeeId === 'guest';

  return (
    <AuthContext.Provider value={{ user, loading, isGuest, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function guestProps(isGuest: boolean): { disabled?: boolean; title?: string } {
  return isGuest ? { disabled: true, title: '游客无操作权限' } : {};
}
