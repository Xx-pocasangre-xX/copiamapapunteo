import { createContext } from 'react';
import type { ApiConfig, User } from '../types';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  apiConfig: ApiConfig;
  login: (correo: string, pass: string) => Promise<void>;
  logout: () => void;
  updateApiConfig: (config: ApiConfig) => void;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
