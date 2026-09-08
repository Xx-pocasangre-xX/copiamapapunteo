import React, { useState } from 'react';
import {
  ChevronLeft,
  ListFilter,
  MapPin,
  ArrowUpDown,
} from 'lucide-react';
import type { Punteo } from '../types';

interface PunteoListSidebarProps {
  punteos: Punteo[];
  selectedPunteo: Punteo | null;
  onSelectPunteo: (punteo: Punteo) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const PunteoListSidebar: React.FC<PunteoListSidebarProps> = ({
  punteos,
  selectedPunteo,
  onSelectPunteo,
  isOpen,
  onToggle,
}) => {
  const [sortOrder, setSortOrder] = useState<'hora-asc' | 'hora-desc' | 'nombre'>('hora-asc');

  const sortedList = [...punteos].sort((a, b) => {
    if (sortOrder === 'hora-asc') {
      return new Date(a.fecha_registro).getTime() - new Date(b.fecha_registro).getTime();
    } else if (sortOrder === 'hora-desc') {
      return new Date(b.fecha_registro).getTime() - new Date(a.fecha_registro).getTime();
    } else {
      const nameA = a.nombre_comercial || a.razon_social;
      const nameB = b.nombre_comercial || b.razon_social;
      return nameA.localeCompare(nameB);
    }
  });

  return (
    <div
      className={`relative bg-white border-r border-slate-200 transition-all duration-300 flex flex-col z-20 shadow-md ${
        isOpen ? 'w-full md:w-80 lg:w-96 shrink-0' : 'w-0 overflow-hidden'
      }`}
    >
      {/* Sidebar Header */}
      <div className="p-3.5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ListFilter className="w-4 h-4 text-red-600" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Listado de Visitas ({punteos.length})
          </span>
        </div>

        <div className="flex items-center space-x-1.5">
          {/* Sort Switcher */}
          <button
            type="button"
            onClick={() => {
              setSortOrder((prev) =>
                prev === 'hora-asc' ? 'hora-desc' : prev === 'hora-desc' ? 'nombre' : 'hora-asc'
              );
            }}
            title={`Orden actual: ${
              sortOrder === 'hora-asc' ? 'Cronológico (1 -> N)' : sortOrder === 'hora-desc' ? 'Más recientes' : 'Alfabético'
            }`}
            className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 text-[11px] font-medium flex items-center gap-1 transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">
              {sortOrder === 'hora-asc' ? '1→N' : sortOrder === 'hora-desc' ? 'N→1' : 'A-Z'}
            </span>
          </button>

          <button
            onClick={onToggle}
            className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
            title="Ocultar panel"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* List Scroll Area */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1.5">
        {sortedList.length === 0 ? (
          <div className="py-12 px-4 text-center text-slate-400 text-xs space-y-2">
            <MapPin className="w-8 h-8 text-slate-300 mx-auto stroke-1" />
            <p className="font-semibold text-slate-600">No hay punteos para los filtros seleccionados</p>
            <p className="text-[11px] text-slate-400">Intenta cambiar el supervisor o la fecha de consulta.</p>
          </div>
        ) : (
          sortedList.map((punteo, index) => {
            const isSelected = selectedPunteo?.id === punteo.id;
            const sequenceNum = index + 1;
            const timeFormatted = new Date(punteo.fecha_registro).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={punteo.id}
                onClick={() => onSelectPunteo(punteo)}
                className={`p-3 rounded-xl cursor-pointer border transition-all ${
                  isSelected
                    ? 'bg-red-50/80 border-red-300 shadow-xs ring-1 ring-red-200'
                    : 'bg-white hover:bg-slate-50/80 border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start space-x-2.5">
                    {/* Sequence Badge */}
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5 ${
                        punteo.estado === 'aprobado'
                          ? 'bg-emerald-100 text-emerald-800'
                          : punteo.estado === 'pendiente'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {sequenceNum}
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">
                        {punteo.nombre_comercial || punteo.razon_social}
                      </h4>
                      {punteo.nombre_comercial && (
                        <p className="text-[11px] text-slate-500 line-clamp-1">{punteo.razon_social}</p>
                      )}
                    </div>
                  </div>

                  {/* Status Indicator Pill */}
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                      punteo.estado === 'aprobado'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : punteo.estado === 'pendiente'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {punteo.estado}
                  </span>
                </div>

                {/* Details snippet */}
                <div className="mt-2 space-y-1 text-[11px] text-slate-500 pl-8.5">
                  <p className="line-clamp-1 text-slate-600 flex items-center gap-1">
                    <span className="text-slate-400">📍</span> {punteo.direccion}
                  </p>
                  <div className="flex items-center justify-between text-[10px] pt-0.5 text-slate-400">
                    <span>{punteo.departamento} &bull; {punteo.municipio}</span>
                    <span className="font-mono text-slate-600 font-medium">{timeFormatted}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
