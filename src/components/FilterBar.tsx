import React from 'react';
import {
  Calendar,
  UserCheck,
  Search,
  RotateCcw,
  Navigation2,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronDown,
} from 'lucide-react';
import type { FilterState, SupervisorOption } from '../types';

interface FilterBarProps {
  filters: FilterState;
  supervisores: SupervisorOption[];
  departamentos: string[];
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  supervisores,
  departamentos,
  onFilterChange,
  onResetFilters,
}) => {
  const handleSupervisorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ supervisorCodigo: e.target.value });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ fecha: e.target.value });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ searchQuery: e.target.value });
  };

  const formatDate = (date: Date) => date.toISOString().slice(0, 10);

  const setDatePreset = (preset: 'hoy' | 'ayer' | 'todos') => {
    if (preset === 'hoy') {
      onFilterChange({ fecha: formatDate(new Date()) });
    } else if (preset === 'ayer') {
      const ayer = new Date();
      ayer.setDate(ayer.getDate() - 1);
      onFilterChange({ fecha: formatDate(ayer) });
    } else {
      onFilterChange({ fecha: '' });
    }
  };

  const hoyStr = formatDate(new Date());
  const ayerDate = new Date();
  ayerDate.setDate(ayerDate.getDate() - 1);
  const ayerStr = formatDate(ayerDate);

  const hasActiveFilters =
    filters.supervisorCodigo !== 'todos' ||
    filters.fecha !== '' ||
    filters.estado !== 'todos' ||
    filters.departamento !== 'todos' ||
    filters.tipoRegistro !== 'todos' ||
    filters.searchQuery.trim() !== '';

  return (
    <div className="bg-white border-b border-slate-200/90 px-4 sm:px-6 lg:px-8 py-3.5 shadow-xs">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Main Row: Supervisor & Date & Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          
          {/* Supervisor Filter */}
          <div className="lg:col-span-4">
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-red-600" />
                Supervisor (Creado por)
              </span>
              {filters.supervisorCodigo !== 'todos' && (
                <span className="text-[10px] text-red-600 font-bold bg-red-50 px-1.5 py-0.2 rounded border border-red-100">Filtrado activo</span>
              )}
            </label>
            <div className="relative">
              <select
                value={filters.supervisorCodigo}
                onChange={handleSupervisorChange}
                className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-800 text-xs font-medium rounded-lg border border-slate-300/80 focus:border-red-500 focus:ring-2 focus:ring-red-200 py-2 pl-3 pr-8 transition-all appearance-none cursor-pointer"
              >
                <option value="todos">👥 Todos los Supervisores</option>
                {supervisores.map((sup) => (
                  <option key={sup.codigo} value={sup.codigo}>
                    {sup.codigo} - {sup.nombre} ({sup.totalPunteos} pts)
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Date Filter & Quick Presets */}
          <div className="lg:col-span-4">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-red-600" />
                Fecha de Registro
              </label>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => setDatePreset('hoy')}
                  className={`text-[10px] px-2 py-0.5 rounded font-semibold transition-colors ${
                    filters.fecha === hoyStr
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Hoy
                </button>
                <button
                  type="button"
                  onClick={() => setDatePreset('ayer')}
                  className={`text-[10px] px-2 py-0.5 rounded font-semibold transition-colors ${
                    filters.fecha === ayerStr
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Ayer
                </button>
                <button
                  type="button"
                  onClick={() => setDatePreset('todos')}
                  className={`text-[10px] px-2 py-0.5 rounded font-semibold transition-colors ${
                    filters.fecha === ''
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Todas
                </button>
              </div>
            </div>
            <div className="relative">
              <input
                type="date"
                value={filters.fecha}
                onChange={handleDateChange}
                className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-800 text-xs font-medium rounded-lg border border-slate-300/80 focus:border-red-500 focus:ring-2 focus:ring-red-200 py-1.5 px-3 transition-all"
              />
            </div>
          </div>

          {/* Quick Search */}
          <div className="lg:col-span-4">
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-red-600" />
              Búsqueda Rápida
            </label>
            <div className="relative">
              <input
                type="text"
                value={filters.searchQuery}
                onChange={handleSearchChange}
                placeholder="Buscar cliente, DUI, NRC, dirección, giro..."
                className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-800 text-xs font-medium rounded-lg border border-slate-300/80 focus:border-red-500 focus:ring-2 focus:ring-red-200 py-1.5 pl-8 pr-3 transition-all placeholder:text-slate-400"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
              {filters.searchQuery && (
                <button
                  onClick={() => onFilterChange({ searchQuery: '' })}
                  className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Secondary Row: Status Pills, Depto, Itinerary Route Toggle, Reset */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 border-t border-slate-100 text-xs">
          
          {/* Status Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto py-0.5">
            <span className="text-[11px] font-semibold text-slate-500 mr-1 hidden sm:inline">
              Estado:
            </span>
            <button
              type="button"
              onClick={() => onFilterChange({ estado: 'todos' })}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                filters.estado === 'todos'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => onFilterChange({ estado: 'aprobado' })}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                filters.estado === 'aprobado'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Aprobados</span>
            </button>
            <button
              type="button"
              onClick={() => onFilterChange({ estado: 'pendiente' })}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                filters.estado === 'pendiente'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/60'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>Pendientes</span>
            </button>
            <button
              type="button"
              onClick={() => onFilterChange({ estado: 'rechazado' })}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                filters.estado === 'rechazado'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/60'
              }`}
            >
              <XCircle className="w-3 h-3" />
              <span>Rechazados</span>
            </button>
          </div>

          {/* Right Tools: Departamento, Route Toggle & Reset */}
          <div className="flex items-center space-x-2.5 ml-auto">
            {/* Departamento select */}
            <div className="relative">
              <select
                value={filters.departamento}
                onChange={(e) => onFilterChange({ departamento: e.target.value })}
                className="bg-slate-100/90 text-slate-700 text-xs font-medium rounded-md border border-slate-200/80 focus:border-red-500 focus:ring-1 focus:ring-red-300 py-1 pl-2.5 pr-7 appearance-none cursor-pointer"
              >
                <option value="todos">📍 Todos los Departamentos</option>
                {departamentos.map((dep) => (
                  <option key={dep} value={dep}>
                    {dep}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1.5 pointer-events-none" />
            </div>

            {/* Route path toggle */}
            <button
              type="button"
              onClick={() => onFilterChange({ mostrarRuta: !filters.mostrarRuta })}
              title="Trazar ruta cronológica de visitas del supervisor"
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all border ${
                filters.mostrarRuta
                  ? 'bg-red-600 text-white border-red-700 shadow-xs ring-2 ring-red-200'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
              }`}
            >
              <Navigation2 className={`w-3.5 h-3.5 ${filters.mostrarRuta ? 'rotate-45 text-amber-300' : 'text-red-600'}`} />
              <span className="hidden sm:inline">Trazar Recorrido</span>
            </button>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="flex items-center space-x-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 px-2 py-1 rounded-md transition-colors font-medium"
                title="Limpiar todos los filtros"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Limpiar</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
