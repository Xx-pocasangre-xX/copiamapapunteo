import React, { useState } from 'react';
import type { ApiConfig, User } from '../types';
import {
  apiService,
  getStoredApiConfig,
  getStoredUser,
  saveStoredApiConfig,
  saveStoredUser,
} from '../services/api';
import { AuthContext } from './auth-context-def';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiConfig, setApiConfig] = useState<ApiConfig>(() => getStoredApiConfig());

  const login = async (correo: string, pass: string, forceMock = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const { user: loggedInUser } = await apiService.login(correo, pass, forceMock);
      setUser(loggedInUser);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    saveStoredUser(null);
    setUser(null);
  };

  const updateApiConfig = (newConfig: ApiConfig) => {
    setApiConfig(newConfig);
    saveStoredApiConfig(newConfig);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        apiConfig,
        login,
        logout,
        updateApiConfig,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
