import React, { useState } from 'react';
import {
  X,
  Settings,
  CheckCircle2,
  AlertCircle,
  Activity,
  Save,
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { apiService } from '../services/api';

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataReset: () => void;
}

export const ApiConfigModal: React.FC<ApiConfigModalProps> = ({
  isOpen,
  onClose,
  onDataReset,
}) => {
  const { apiConfig, updateApiConfig } = useAuth();

  const [baseUrl, setBaseUrl] = useState(apiConfig.baseUrl);
  const [authUrl, setAuthUrl] = useState(apiConfig.authUrl);
  const [useMockFallback, setUseMockFallback] = useState(apiConfig.useMockFallback);
  const [apiKey, setApiKey] = useState(apiConfig.apiKey || '');

  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateApiConfig({
      baseUrl: baseUrl.trim(),
      authUrl: authUrl.trim(),
      useMockFallback,
      apiKey: apiKey.trim(),
    });
    onClose();
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage('Probando conexión con API...');
    const start = Date.now();

    try {
      const targetUrl = authUrl.trim() || baseUrl.trim();
      await fetch(targetUrl, {
        method: 'HEAD',
        mode: 'no-cors',
      });
      const elapsed = Date.now() - start;
      setTestStatus('success');
      setTestMessage(`Conexión alcanzable (${elapsed} ms de latencia)`);
    } catch (err: unknown) {
      setTestStatus('error');
      setTestMessage(
        err instanceof Error ? err.message : 'No se pudo contactar con el endpoint configurado'
      );
    }
  };

  const handleResetData = () => {
    if (window.confirm('¿Deseas restablecer todos los punteos a los valores originales de prueba?')) {
      apiService.resetDemoData();
      onDataReset();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <Settings className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Configuración de Conexión & API Externa
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
          
          <div>
            <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">
              URL Base de ERPAPI (Backend)
            </label>
            <input
              type="url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.empresa.com"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-red-500 font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Raíz del backend ERPAPI. Se consulta <code>/api/appPunteo</code> para los registros y{' '}
              <code>/api/auth/login-punteo</code> para el login (usuario en formato{' '}
              <code>usuario@tenant</code>), salvo que se indique otro endpoint abajo.
            </p>
          </div>

          <div>
            <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">
              Endpoint de Autenticación (Opcional)
            </label>
            <div className="relative">
              <input
                type="url"
                value={authUrl}
                onChange={(e) => setAuthUrl(e.target.value)}
                placeholder="https://api.empresa.com/api/auth/login-punteo"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-red-500 font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Déjalo vacío para usar <code>{'{URL Base}'}/api/auth/login-punteo</code> automáticamente.
            </p>
          </div>

          <div>
            <label className="block text-slate-700 font-bold uppercase tracking-wider mb-1">
              API Key o Token Estático (Opcional)
            </label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="pk_live_..."
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-red-500 font-mono"
            />
          </div>

          {/* Toggle Fallback */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <label className="flex items-center space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={useMockFallback}
                onChange={(e) => setUseMockFallback(e.target.checked)}
                className="rounded text-red-600 focus:ring-red-500 h-4 w-4"
              />
              <span className="font-bold text-slate-800">
                Fallback automático a datos demo si la API no responde
              </span>
            </label>
            <p className="text-[11px] text-slate-500 pl-6.5 leading-relaxed">
              Permite continuar navegando y visualizando el mapa con datos simulados si la red o el backend remoto se encuentran offline.
            </p>
          </div>

          {/* Connection Test Result */}
          {testStatus !== 'idle' && (
            <div
              className={`p-3 rounded-xl border flex items-center space-x-2 text-xs ${
                testStatus === 'testing'
                  ? 'bg-slate-100 border-slate-200 text-slate-700'
                  : testStatus === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}
            >
              {testStatus === 'testing' && <Activity className="w-4 h-4 animate-spin text-slate-500" />}
              {testStatus === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              {testStatus === 'error' && <AlertCircle className="w-4 h-4 text-amber-600" />}
              <span className="font-medium">{testMessage}</span>
            </div>
          )}

          {/* Buttons Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleTestConnection}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors"
              >
                Probar Conexión
              </button>

              <button
                type="button"
                onClick={handleResetData}
                className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-lg text-xs transition-colors"
              >
                Resetear Demo
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-slate-600 hover:text-slate-800 font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors flex items-center space-x-1 shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Guardar Cambios</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
