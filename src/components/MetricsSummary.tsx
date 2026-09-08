import React from 'react';
import {
  CheckCircle2,
  Clock,
  XCircle,
  MapPin,
  Users,
  Receipt,
} from 'lucide-react';
import type { Punteo } from '../types';

interface MetricsSummaryProps {
  punteos: Punteo[];
  totalGlobal: number;
}

export const MetricsSummary: React.FC<MetricsSummaryProps> = ({ punteos, totalGlobal }) => {
  const total = punteos.length;
  const aprobados = punteos.filter((p) => p.estado === 'aprobado').length;
  const pendientes = punteos.filter((p) => p.estado === 'pendiente').length;
  const rechazados = punteos.filter((p) => p.estado === 'rechazado').length;
  const contribuyentes = punteos.filter((p) => p.es_contribuyente).length;

  const pctAprobados = total > 0 ? Math.round((aprobados / total) * 100) : 0;
  const pctPendientes = total > 0 ? Math.round((pendientes / total) * 100) : 0;
  const pctRechazados = total > 0 ? Math.round((rechazados / total) * 100) : 0;

  // Distinct supervisors in filtered set
  const distinctSupervisors = new Set(punteos.map((p) => p.creado_por_codigo)).size;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 py-2 px-4 sm:px-6 lg:px-8 bg-slate-50/50 border-b border-slate-200/70">
      {/* Total Filtrados */}
      <div className="bg-white p-3 rounded-xl border border-red-100 shadow-xs flex items-center space-x-3">
        <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
          <MapPin className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider truncate">
            Punteos Visibles
          </span>
          <div className="flex items-baseline space-x-1">
            <span className="text-base font-bold text-slate-900">{total}</span>
            <span className="text-[10px] text-slate-400">/{totalGlobal}</span>
          </div>
        </div>
      </div>

      {/* Aprobados */}
      <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-xs flex items-center space-x-3">
        <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <span className="text-[10px] uppercase font-bold text-emerald-700 block tracking-wider truncate">
            Aprobados
          </span>
          <div className="flex items-baseline space-x-1">
            <span className="text-base font-bold text-emerald-950">{aprobados}</span>
            <span className="text-[10px] font-semibold text-emerald-600">({pctAprobados}%)</span>
          </div>
        </div>
      </div>

      {/* Pendientes */}
      <div className="bg-white p-3 rounded-xl border border-amber-100 shadow-xs flex items-center space-x-3">
        <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
          <Clock className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <span className="text-[10px] uppercase font-bold text-amber-700 block tracking-wider truncate">
            Pendientes
          </span>
          <div className="flex items-baseline space-x-1">
            <span className="text-base font-bold text-amber-950">{pendientes}</span>
            <span className="text-[10px] font-semibold text-amber-600">({pctPendientes}%)</span>
          </div>
        </div>
      </div>

      {/* Rechazados */}
      <div className="bg-white p-3 rounded-xl border border-rose-100 shadow-xs flex items-center space-x-3">
        <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
          <XCircle className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <span className="text-[10px] uppercase font-bold text-rose-700 block tracking-wider truncate">
            Rechazados
          </span>
          <div className="flex items-baseline space-x-1">
            <span className="text-base font-bold text-rose-950">{rechazados}</span>
            <span className="text-[10px] font-semibold text-rose-600">({pctRechazados}%)</span>
          </div>
        </div>
      </div>

      {/* Contribuyentes vs Consumidores */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs flex items-center space-x-3">
        <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
          <Receipt className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider truncate">
            Contribuyentes NRC
          </span>
          <div className="flex items-baseline space-x-1">
            <span className="text-base font-bold text-slate-900">{contribuyentes}</span>
            <span className="text-[10px] text-slate-400">/{total}</span>
          </div>
        </div>
      </div>

      {/* Supervisores activos en filtro */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs flex items-center space-x-3">
        <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
          <Users className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider truncate">
            Supervisores
          </span>
          <div className="flex items-baseline space-x-1">
            <span className="text-base font-bold text-slate-900">{distinctSupervisors}</span>
            <span className="text-[10px] text-slate-400">activos</span>
          </div>
        </div>
      </div>
    </div>
  );
};
