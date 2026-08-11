'use client';
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import apiClient from '@/lib/apiClient';

interface User {
  name: string;
  role: string;
  currentYear?: number | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const name = localStorage.getItem('currentUser');
    const role = localStorage.getItem('userRole');

    if (!token || !name) {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('userRole');
      localStorage.removeItem('currentUserEmail');
      localStorage.removeItem('currentYear');
      setLoading(false);
      return;
    }

    const currentYearRaw = localStorage.getItem('currentYear');
    const currentYear = currentYearRaw ? Number(currentYearRaw) : null;

    apiClient.get('/courses?limit=1')
      .then(() => {
        setUser({ name, role: role || '', currentYear });
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userRole');
        localStorage.removeItem('currentUserEmail');
        localStorage.removeItem('currentYear');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
    localStorage.removeItem('currentUserEmail');
    localStorage.removeItem('currentYear');
    setUser(null);
    window.location.href = '/';
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
