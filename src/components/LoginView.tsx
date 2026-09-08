import React, { useState } from 'react';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { CompanyLogo } from './CompanyLogo';

export const LoginView: React.FC = () => {
  const { login, isLoading, error, clearError, apiConfig } = useAuth();

  const [correo, setCorreo] = useState('carlos.mendoza@empresa.com.sv');
  const [password, setPassword] = useState('super123');
  const [showPassword, setShowPassword] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(apiConfig.useMockFallback);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(correo, password, isDemoMode);
    } catch {
      // Error is caught and stored in AuthContext
    }
  };

  const handleQuickSelectUser = (email: string, pass: string) => {
    setCorreo(email);
    setPassword(pass);
    clearError();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-red-600 selection:text-white">
      {/* Background Decorative Gradients - Red and Gold Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Brand Logo & Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white shadow-2xl shadow-red-600/20 ring-4 ring-amber-400/30 mb-2 border border-slate-100">
            <CompanyLogo size="lg" className="h-12 w-auto" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            GeoPunteo <span className="text-amber-400 font-medium text-lg block sm:inline">System</span>
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Plataforma de visualización, auditoría y trazabilidad geográfica de punteos
          </p>
        </div>

        {/* Login Box */}
        <div className="mt-8 bg-white/95 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-white/20">
          <form className="space-y-4" onSubmit={handleSubmit}>
            
            {/* Error Message */}
            {error && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 flex items-start space-x-2.5 text-rose-800 text-xs animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-semibold block">Error de autenticación</span>
                  <span className="text-rose-700">{error}</span>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Correo Electrónico / Usuario
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={correo}
                  onChange={(e) => {
                    setCorreo(e.target.value);
                    if (error) clearError();
                  }}
                  placeholder="ejemplo@empresa.com.sv"
                  className="block w-full pl-10 pr-3 py-2.5 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Contraseña
                </label>
              </div>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) clearError();
                  }}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-10 py-2.5 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Mode Selector Pill */}
            <div className="pt-1 flex items-center justify-between text-xs text-slate-600">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDemoMode}
                  onChange={(e) => setIsDemoMode(e.target.checked)}
                  className="rounded border-slate-300 text-red-600 focus:ring-red-500 h-3.5 w-3.5"
                />
                <span className="text-[11px] font-medium text-slate-600">
                  Modo Demostración / Standalone
                </span>
              </label>
              <span className="text-[10px] text-red-700 font-semibold bg-red-50 px-2 py-0.5 rounded border border-red-200">
                {isDemoMode ? 'Datos Locales' : 'API Externa'}
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all shadow-md shadow-red-600/25 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Autenticando en API...</span>
                </>
              ) : (
                <>
                  <span>Ingresar al Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Credential Presets */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 text-center">
              Perfiles Rápidos para Pruebas
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickSelectUser('carlos.mendoza@empresa.com.sv', 'super123')}
                className="text-left p-2 rounded-lg border border-slate-200 hover:border-red-400 bg-slate-50 hover:bg-red-50/40 transition-all text-[11px]"
              >
                <span className="font-bold text-slate-800 block truncate">Carlos M.</span>
                <span className="text-[10px] text-amber-600 font-medium">Supervisor</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelectUser('maria.torres@empresa.com.sv', 'auditor123')}
                className="text-left p-2 rounded-lg border border-slate-200 hover:border-red-400 bg-slate-50 hover:bg-red-50/40 transition-all text-[11px]"
              >
                <span className="font-bold text-slate-800 block truncate">María T.</span>
                <span className="text-[10px] text-emerald-600 font-medium">Auditor</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelectUser('admin@empresa.com.sv', 'admin123')}
                className="text-left p-2 rounded-lg border border-slate-200 hover:border-red-400 bg-slate-50 hover:bg-red-50/40 transition-all text-[11px]"
              >
                <span className="font-bold text-slate-800 block truncate">Admin</span>
                <span className="text-[10px] text-red-600 font-medium">Administrador</span>
              </button>
            </div>
          </div>
        </div>

        {/* Security Footer Note */}
        <div className="mt-6 text-center">
          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Conexión encriptada SSL & JWT Session
          </p>
        </div>
      </div>
    </div>
  );
};
