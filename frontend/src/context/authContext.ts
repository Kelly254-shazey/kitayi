import { createContext } from 'react';

export interface User {
  id: string;
  email: string;
  user_type: string;
  full_name: string;
  account_number?: string;
  is_email_verified?: boolean;
  isFirebaseUser?: boolean;
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
  googleLogin: () => Promise<User>;
  facebookLogin: () => Promise<User>;
  googleRedirectLogin: () => Promise<void>;
  facebookRedirectLogin: () => Promise<void>;
  isFirebaseActive: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);
