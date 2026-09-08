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

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReloadData: () => void;
}

export const ApiConfigModal: React.FC<ApiConfigModalProps> = ({
  isOpen,
  onClose,
  onReloadData,
}) => {
  const { apiConfig, updateApiConfig } = useAuth();

  const [baseUrl, setBaseUrl] = useState(apiConfig.baseUrl);
  const [authUrl, setAuthUrl] = useState(apiConfig.authUrl);
  const [apiKey, setApiKey] = useState(apiConfig.apiKey || '');

  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateApiConfig({
      baseUrl: baseUrl.trim(),
      authUrl: authUrl.trim(),
      apiKey: apiKey.trim(),
    });
    onReloadData();
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
              URL de la API de Punteos (appPunteo)
            </label>
            <input
              type="url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.empresa.com/api/appPunteo"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-red-500 font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              URL completa del endpoint <code>/api/appPunteo</code> de ERPAPI (misma convención que
              usa InterfazPunteo). El login se deriva automáticamente del origen de esta URL:{' '}
              <code>{'{origen}'}/api/auth/login-pos</code>, salvo que se indique otro endpoint abajo.
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
                placeholder="https://api.empresa.com/api/auth/login-pos"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-red-500 font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Déjalo vacío para usar <code>{'{origen de la URL anterior}'}/api/auth/login-pos</code> automáticamente.
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
