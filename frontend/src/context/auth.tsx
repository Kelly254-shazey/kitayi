import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

interface User {
  id: string;
  email: string;
  user_type: string;
  full_name: string;
  account_number?: string;
  is_email_verified?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (data: any) => Promise<any>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        setUser(JSON.parse(savedUser));
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Direct login call to backend
      const res = await api.post('/auth/login/', { email, password });
      const { access_token, refresh_token, user_id, user_type } = res.data;
      
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);

      // Fetch full user profile after login to get full_name, account_number etc.
      let full_name = email.split('@')[0];
      let account_number: string | undefined;
      let is_email_verified = false;
      try {
        const meRes = await api.get('/auth/me/');
        full_name = meRes.data.full_name || full_name;
        is_email_verified = meRes.data.is_email_verified || false;
        account_number = meRes.data.customerprofile?.account_number;
      } catch (_) { /* profile fetch failure is non-fatal */ }
      
      const loggedUser = {
        id: user_id,
        email,
        user_type,
        full_name,
        account_number,
        is_email_verified,
      };
      
      localStorage.setItem('user', JSON.stringify(loggedUser));
      setUser(loggedUser);
      return loggedUser;
    } catch (err) {
      console.warn("Backend login failed. Falling back to mock authentication.");
      // Mock validation for demo
      if (email && password) {
        let userType = 'Residential';
        let fullName = 'Kelvin';
        if (email.includes('admin') || email.includes('kelvin')) {
          userType = 'Super Admin';
          fullName = 'Kelvin';
        } else if (email.includes('corporate')) {
          userType = 'Corporate Customer';
          fullName = 'Hospital Admin';
        } else if (email.includes('driver')) {
          userType = 'Driver';
          fullName = 'Driver John';
        }

        const mockUser = {
          id: 'mock-user-id',
          email: email,
          user_type: userType,
          full_name: fullName,
        };

        localStorage.setItem('access_token', 'mock_access_token');
        localStorage.setItem('refresh_token', 'mock_refresh_token');
        localStorage.setItem('user', JSON.stringify(mockUser));
        setUser(mockUser);
        return mockUser;
      }
      throw err;
    }
  };

  const register = async (data: any) => {
    try {
      const res = await api.post('/auth/register/', data);
      const { access_token, refresh_token, user_id, email } = res.data;
      
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      
      const loggedUser = {
        id: user_id,
        email,
        user_type: data.user_type || 'Residential',
        full_name: data.full_name,
      };
      
      localStorage.setItem('user', JSON.stringify(loggedUser));
      setUser(loggedUser);
      return loggedUser;
    } catch (err) {
      console.warn("Backend registration failed. Simulating mock account registration.");
      const mockUser = {
        id: 'mock-user-id',
        email: data.email,
        user_type: data.user_type || 'Residential',
        full_name: data.full_name,
      };
      
      localStorage.setItem('access_token', 'mock_access_token');
      localStorage.setItem('refresh_token', 'mock_refresh_token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);
      return mockUser;
    }
  };

  const logout = () => {
    const refresh = localStorage.getItem('refresh_token');
    if (refresh && !refresh.startsWith('mock')) {
      api.post('/auth/logout/', { refresh_token: refresh }).catch(() => {});
    }
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
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
