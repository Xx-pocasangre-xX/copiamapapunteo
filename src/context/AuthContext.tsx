import React, { useEffect, useState } from 'react';
import type { ApiConfig, User } from '../types';
import {
  apiService,
  EVENTO_SESION_EXPIRADA,
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

  useEffect(() => {
    const handleSesionExpirada = () => {
      setUser(null);
      setError('Tu sesión expiró. Inicia sesión de nuevo.');
    };
    window.addEventListener(EVENTO_SESION_EXPIRADA, handleSesionExpirada);
    return () => window.removeEventListener(EVENTO_SESION_EXPIRADA, handleSesionExpirada);
  }, []);

  const login = async (correo: string, pass: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { user: loggedInUser } = await apiService.login(correo, pass);
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
