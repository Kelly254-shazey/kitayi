import { useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { api } from '../services/api';
import { AuthContext } from './authContext';
import type { User, RegisterData } from './authContext';
import {
  firebaseLogin,
  firebaseRegister,
  firebaseLogout,
  firebaseGoogleLogin,
  firebaseFacebookLogin,
} from '../services/firebaseFallback';

const API_TIMEOUT = 5000;

function isBackendAlive(): Promise<boolean> {
  return Promise.race([
    api.get('/auth/me/').then(() => true).catch(() => false),
    new Promise<boolean>((resolve) => setTimeout(() => resolve(false), API_TIMEOUT)),
  ]);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser);
  const [loading, setLoading] = useState(false);
  const [isFirebaseActive, setIsFirebaseActive] = useState(false);

  useEffect(() => {
    if (!getStoredUser()) { setIsFirebaseActive(false); return; }
    isBackendAlive().then(alive => setIsFirebaseActive(!alive));
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login/', { email, password });
      const { access_token, refresh_token, user_id, user_type } = res.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      let full_name = email.split('@')[0];
      let account_number: string | undefined;
      let is_email_verified = false;
      try { const me = await api.get('/auth/me/'); full_name = me.data.full_name || full_name; is_email_verified = me.data.is_email_verified || false; account_number = me.data.customerprofile?.account_number; } catch { /* non-fatal */ }
      const u: User = { id: user_id, email, user_type, full_name, account_number, is_email_verified };
      localStorage.setItem('user', JSON.stringify(u));
      setUser(u);
      setIsFirebaseActive(false);
      return u;
    } catch (err) {
      const axiosErr = err as { code?: string; message?: string };
      if (axiosErr.code === 'ERR_NETWORK' || axiosErr.message?.includes('Network Error')) {
        console.warn('Backend unreachable, falling back to Firebase auth');
        setIsFirebaseActive(true);
        const fbUser = await firebaseLogin(email, password);
        const u: User = { ...fbUser, isFirebaseUser: true };
        localStorage.setItem('user', JSON.stringify(u));
        localStorage.setItem('firebase_user', 'true');
        setUser(u);
        return u;
      }
      throw err;
    } finally { setLoading(false); }
  }, []);

  const register = useCallback(async (data: RegisterData): Promise<User> => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register/', data);
      const { access_token, refresh_token, user_id, email } = res.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      let account_number: string | undefined;
      let is_email_verified = false;
      try { const me = await api.get('/auth/me/'); account_number = me.data.customerprofile?.account_number; is_email_verified = me.data.is_email_verified || false; } catch { /* non-fatal */ }
      const u: User = { id: user_id, email, user_type: data.user_type || 'Residential', full_name: data.full_name, account_number, is_email_verified };
      localStorage.setItem('user', JSON.stringify(u));
      setUser(u);
      setIsFirebaseActive(false);
      return u;
    } catch (err) {
      const axiosErr = err as { code?: string; message?: string };
      if (axiosErr.code === 'ERR_NETWORK' || axiosErr.message?.includes('Network Error')) {
        console.warn('Backend unreachable, falling back to Firebase auth');
        setIsFirebaseActive(true);
        const fbUser = await firebaseRegister(data.email, data.password, data.full_name);
        const u: User = { ...fbUser, isFirebaseUser: true, user_type: data.user_type || 'Residential' };
        localStorage.setItem('user', JSON.stringify(u));
        localStorage.setItem('firebase_user', 'true');
        setUser(u);
        return u;
      }
      throw err;
    } finally { setLoading(false); }
  }, []);

  const googleLogin = useCallback(async (): Promise<User> => {
    setLoading(true);
    try {
      const fbUser = await firebaseGoogleLogin();
      const u: User = { ...fbUser, isFirebaseUser: true };
      localStorage.setItem('user', JSON.stringify(u));
      localStorage.setItem('firebase_user', 'true');
      setIsFirebaseActive(true);
      setUser(u);
      return u;
    } catch (e) {
      console.error('googleLogin error:', e);
      throw e;
    } finally { setLoading(false); }
  }, []);

  const facebookLogin = useCallback(async (): Promise<User> => {
    setLoading(true);
    try {
      const fbUser = await firebaseFacebookLogin();
      const u: User = { ...fbUser, isFirebaseUser: true };
      localStorage.setItem('user', JSON.stringify(u));
      localStorage.setItem('firebase_user', 'true');
      setIsFirebaseActive(true);
      setUser(u);
      return u;
    } catch (e) {
      console.error('facebookLogin error:', e);
      throw e;
    } finally { setLoading(false); }
  }, []);

  const logout = useCallback(() => {
    const refresh = localStorage.getItem('refresh_token');
    if (refresh && !localStorage.getItem('firebase_user')) api.post('/auth/logout/', { refresh_token: refresh }).catch(() => {});
    if (localStorage.getItem('firebase_user')) firebaseLogout().catch(() => {});
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('firebase_user');
    setUser(null);
    setIsFirebaseActive(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, googleLogin, facebookLogin, isFirebaseActive }}>
      {children}
    </AuthContext.Provider>
  );
}

function getStoredUser(): User | null {
  try {
    const saved = localStorage.getItem('user');
    if (saved) return JSON.parse(saved) as User;
  } catch { /* ignore */ }
  return null;
}
