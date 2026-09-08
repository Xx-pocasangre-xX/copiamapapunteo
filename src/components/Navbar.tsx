import React from 'react';
import {
  LogOut,
  Settings,
  Radio,
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { CompanyLogo } from './CompanyLogo';

interface NavbarProps {
  totalPunteos: number;
  totalFiltrados: number;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  totalPunteos,
  totalFiltrados,
  onOpenSettings,
}) => {
  const { user, logout, apiConfig } = useAuth();

  const getRoleBadge = (rol?: string) => {
    switch (rol) {
      case 'administrador':
        return { bg: 'bg-red-50 text-red-700 border-red-200', label: 'Admin' };
      case 'supervisor':
        return { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Supervisor' };
      case 'auditor':
        return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Auditor' };
      default:
        return { bg: 'bg-slate-50 text-slate-700 border-slate-200', label: rol || 'Usuario' };
    }
  };

  const roleStyle = getRoleBadge(user?.rol);

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3.5">
            <div className="flex items-center justify-center p-1.5 bg-white border border-slate-200/80 rounded-xl shadow-xs hover:shadow-sm transition-shadow">
              <CompanyLogo size="md" className="h-8 w-auto" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-none">
                  GeoPunteo <span className="text-red-700 font-bold text-xs tracking-normal px-2 py-0.5 rounded-full bg-red-50 border border-red-200 ml-1">v1.0</span>
                </h1>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5 hidden sm:block">
                Monitoreo y Auditoría Geográfica de Punteos
              </p>
            </div>
          </div>

          {/* Quick Real-Time Metrics & Indicators */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/70 text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-slate-600 font-medium">
                Punteos: <strong className="text-slate-900 font-bold">{totalFiltrados}</strong>
                <span className="text-slate-400 font-normal"> / {totalPunteos} totales</span>
              </span>
            </div>

            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-slate-600 bg-slate-100/70">
              <Radio className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>{apiConfig.baseUrl ? 'API Conectada' : 'Sin API configurada'}</span>
            </div>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenSettings}
              title="Configuración de API y Conexión"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
            >
              <Settings className="w-4 h-4" />
            </button>

            <div className="h-6 w-px bg-slate-200"></div>

            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 text-white flex items-center justify-center font-bold text-xs ring-2 ring-slate-100 shadow-xs">
                {user?.nombre ? user.nombre.charAt(0).toUpperCase() : 'U'}
              </div>

              <div className="hidden lg:block text-left">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-semibold text-slate-800 truncate max-w-[140px]">
                    {user?.nombre || 'Usuario'}
                  </span>
                  <span className={`text-[10px] font-medium px-1.5 py-0.2 rounded border ${roleStyle.bg}`}>
                    {roleStyle.label}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 truncate max-w-[140px]">
                  {user?.correo}
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              title="Cerrar sesión"
              className="flex items-center space-x-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors border border-transparent hover:border-rose-100"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
