import React, { useState, useEffect, useMemo } from 'react';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import { Navbar } from './components/Navbar';
import { FilterBar } from './components/FilterBar';
import { MetricsSummary } from './components/MetricsSummary';
import { MapView } from './components/MapView';
import { PunteoListSidebar } from './components/PunteoListSidebar';
import { PunteoDetailModal } from './components/PunteoDetailModal';
import { ApiConfigModal } from './components/ApiConfigModal';
import { LoginView } from './components/LoginView';
import { apiService } from './services/api';
import type { FilterState, Punteo, SupervisorOption } from './types';
import {
  PanelLeftClose,
  PanelLeftOpen,
  Loader2,
  CheckCircle,
} from 'lucide-react';

const INITIAL_FILTERS: FilterState = {
  supervisorCodigo: 'todos',
  fecha: '',
  fechaFin: '',
  estado: 'todos',
  departamento: 'todos',
  tipoRegistro: 'todos',
  searchQuery: '',
  mostrarRuta: true,
};

const Dashboard: React.FC = () => {
  const [punteos, setPunteos] = useState<Punteo[]>([]);
  const [totalGlobalPunteos, setTotalGlobalPunteos] = useState<number>(0);
  const [supervisores, setSupervisores] = useState<SupervisorOption[]>([]);
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [selectedPunteo, setSelectedPunteo] = useState<Punteo | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load Supervisors
  useEffect(() => {
    let isMounted = true;
    apiService
      .getSupervisores()
      .then((list) => {
        if (isMounted) setSupervisores(list);
      })
      .catch((e) => console.error('Error cargando supervisores', e));
    return () => {
      isMounted = false;
    };
  }, []);

  // Load Punteos based on current filters
  useEffect(() => {
    let isMounted = true;

    Promise.all([apiService.getPunteos(filters), apiService.getPunteos()])
      .then(([filtered, allData]) => {
        if (isMounted) {
          setPunteos(filtered);
          setTotalGlobalPunteos(allData.length);
          setIsLoadingData(false);
        }
      })
      .catch((e) => {
        console.error('Error cargando punteos', e);
        if (isMounted) setIsLoadingData(false);
      });

    return () => {
      isMounted = false;
    };
  }, [filters]);

  // Extract distinct departments from dataset for dropdown
  const departamentosDisponibles = useMemo(() => {
    const deps = new Set<string>();
    punteos.forEach((p) => {
      if (p.departamento) deps.add(p.departamento);
    });
    // Add default Salvadoran departments if list is small
    deps.add('San Salvador');
    deps.add('La Libertad');
    deps.add('Santa Ana');
    deps.add('San Miguel');
    deps.add('Sonsonate');
    return Array.from(deps).sort();
  }, [punteos]);

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  const reloadData = () => {
    apiService.getPunteos(filters).then(setPunteos).catch(console.error);
    apiService.getPunteos().then((all) => setTotalGlobalPunteos(all.length)).catch(console.error);
    apiService.getSupervisores().then(setSupervisores).catch(console.error);
  };

  const handleUpdateEstado = async (
    punteoId: number,
    nuevoEstado: 'aprobado' | 'pendiente' | 'rechazado',
    comentario?: string
  ) => {
    try {
      const updated = await apiService.updatePunteoEstado(punteoId, nuevoEstado, comentario);
      setPunteos((prev) => prev.map((p) => (p.id === punteoId ? updated : p)));
      setSelectedPunteo(updated);
      apiService.getSupervisores().then(setSupervisores).catch(console.error);
      showToast(`Punteo #${punteoId} actualizado a "${nuevoEstado}" correctamente`);
    } catch (e) {
      showToast('Error al actualizar el estado del punteo');
      console.error(e);
    }
  };

  // Find supervisor name if filtered
  const activeSupervisor = supervisores.find((s) => s.codigo === filters.supervisorCodigo);
  const supervisorNombre = activeSupervisor ? `${activeSupervisor.nombre} (${activeSupervisor.codigo})` : undefined;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-60 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center space-x-2 animate-in slide-in-from-top-3">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        totalPunteos={totalGlobalPunteos}
        totalFiltrados={punteos.length}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Filter Bar */}
      <FilterBar
        filters={filters}
        supervisores={supervisores}
        departamentos={departamentosDisponibles}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />

      {/* Executive Metrics Ribbon */}
      <MetricsSummary punteos={punteos} totalGlobal={totalGlobalPunteos} />

      {/* Map & List Content Area */}
      <div className="flex-1 relative flex overflow-hidden">
        
        {/* Toggle List Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-md hover:bg-white text-slate-800 p-2.5 rounded-xl shadow-md border border-slate-200/80 transition-all ${
            isSidebarOpen ? 'hidden md:flex' : 'flex'
          }`}
          title={isSidebarOpen ? 'Colapsar panel de lista' : 'Abrir panel de lista'}
        >
          {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
        </button>

        {/* Collapsible Sidebar */}
        <PunteoListSidebar
          punteos={punteos}
          selectedPunteo={selectedPunteo}
          onSelectPunteo={(punteo) => setSelectedPunteo(punteo)}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(false)}
        />

        {/* Interactive Map */}
        <main className="flex-1 h-full relative">
          {isLoadingData && (
            <div className="absolute top-4 right-20 z-30 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 flex items-center space-x-2 text-xs text-slate-600 font-medium">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600" />
              <span>Actualizando mapa...</span>
            </div>
          )}

          <MapView
            punteos={punteos}
            selectedPunteo={selectedPunteo}
            onSelectPunteo={(punteo) => setSelectedPunteo(punteo)}
            mostrarRuta={filters.mostrarRuta}
            supervisorNombre={supervisorNombre}
            fechaFiltro={filters.fecha || undefined}
          />
        </main>
      </div>

      {/* Punteo Detail Inspector Modal */}
      <PunteoDetailModal
        punteo={selectedPunteo}
        onClose={() => setSelectedPunteo(null)}
        onUpdateEstado={handleUpdateEstado}
      />

      {/* API Configuration & Connection Modal */}
      <ApiConfigModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onDataReset={() => {
          reloadData();
          showToast('Datos de demostración restablecidos');
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-3 text-white">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
        <p className="text-xs text-slate-400 font-medium">Iniciando GeoPunteo...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return <Dashboard />;
}
