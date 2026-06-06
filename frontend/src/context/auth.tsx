import { createContext, useState } from 'react';
import { api } from '../services/api';

export interface User {
  id: string;
  email: string;
  user_type: string;
  full_name: string;
  account_number?: string;
  is_email_verified?: boolean;
}

export interface RegisterData {
  email: string;
  phone_number: string;
  full_name: string;
  user_type: string;
  password: string;
  password_confirm: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export { useAuth } from './useAuth';

function getStoredUser(): User | null {
  try {
    const token = localStorage.getItem('access_token');
    const saved = localStorage.getItem('user');
    if (token && saved) return JSON.parse(saved) as User;
  } catch { /* ignore */ }
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser);
  const [loading] = useState(false);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await api.post('/auth/login/', { email, password });
    const { access_token, refresh_token, user_id, user_type } = res.data;
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    let full_name = email.split('@')[0];
    let account_number: string | undefined;
    let is_email_verified = false;
    try {
      const me = await api.get('/auth/me/');
      full_name = me.data.full_name || full_name;
      is_email_verified = me.data.is_email_verified || false;
      account_number = me.data.customerprofile?.account_number;
    } catch { /* non-fatal */ }
    const u: User = { id: user_id, email, user_type, full_name, account_number, is_email_verified };
    localStorage.setItem('user', JSON.stringify(u));
    setUser(u);
    return u;
  };

  const register = async (data: RegisterData): Promise<User> => {
    const res = await api.post('/auth/register/', data);
    const { access_token, refresh_token, user_id, email } = res.data;
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    const u: User = { id: user_id, email, user_type: data.user_type || 'Residential', full_name: data.full_name };
    localStorage.setItem('user', JSON.stringify(u));
    setUser(u);
    return u;
  };

  const logout = () => {
    const refresh = localStorage.getItem('refresh_token');
    if (refresh) api.post('/auth/logout/', { refresh_token: refresh }).catch(() => {});
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
