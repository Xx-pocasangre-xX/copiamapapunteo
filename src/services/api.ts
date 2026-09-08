import { PUNTEOS_MOCK, SUPERVISORES_MOCK, DOCUMENTOS_MOCK } from '../data/mockData';
import type { ApiConfig, FilterState, Punteo, PunteoDocumento, SupervisorOption, User } from '../types';

const STORAGE_KEY_CONFIG = 'mapa_punteo_api_config';
const STORAGE_KEY_AUTH = 'mapa_punteo_auth_user';
const STORAGE_KEY_PUNTEOS = 'mapa_punteo_custom_punteos';

export const DEFAULT_API_CONFIG: ApiConfig = {
  baseUrl: import.meta.env.VITE_API_URL || 'https://api.sistema-punteo.com/v1',
  authUrl: import.meta.env.VITE_AUTH_API_URL || 'https://auth.sistema-punteo.com/api/v1/auth/login',
  useMockFallback: true,
  apiKey: '',
};

export const getStoredApiConfig = (): ApiConfig => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (saved) return { ...DEFAULT_API_CONFIG, ...JSON.parse(saved) };
  } catch (e) {
    console.error('Error reading API config from storage', e);
  }
  return DEFAULT_API_CONFIG;
};

export const saveStoredApiConfig = (config: ApiConfig): void => {
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving API config', e);
  }
};

export const getStoredUser = (): User | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_AUTH);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error reading user from storage', e);
  }
  return null;
};

export const saveStoredUser = (user: User | null): void => {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_AUTH);
    }
  } catch (e) {
    console.error('Error storing user', e);
  }
};

// Memory store for mutated punteos in demo mode
let inMemoryPunteos: Punteo[] = (() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_PUNTEOS);
    if (saved) return JSON.parse(saved);
  } catch {
    // fallback
  }
  return [...PUNTEOS_MOCK];
})();

export const apiService = {
  async login(correo: string, password: string, forceMock = false): Promise<{ user: User; token: string }> {
    const config = getStoredApiConfig();

    if (!forceMock && config.authUrl && !config.authUrl.includes('localhost:0000')) {
      try {
        const response = await fetch(config.authUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(config.apiKey ? { 'X-API-Key': config.apiKey } : {}),
          },
          body: JSON.stringify({
            correo: correo.trim(),
            email: correo.trim(),
            password: password,
            clave: password,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const user: User = {
            id: data.user?.id || data.id || 'usr-' + Date.now(),
            nombre: data.user?.nombre || data.nombre || data.user?.name || correo.split('@')[0],
            correo: data.user?.correo || data.email || correo,
            codigo: data.user?.codigo || data.codigo || 'SUP-01',
            rol: data.user?.rol || data.rol || 'administrador',
            token: data.token || data.accessToken || data.jwt || 'jwt_token_' + Date.now(),
            avatarUrl: data.user?.avatarUrl || data.avatarUrl,
          };
          saveStoredUser(user);
          return { user, token: user.token || '' };
        } else if (!config.useMockFallback) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.message || `Error de autenticación (${response.status})`);
        }
      } catch (err: unknown) {
        if (!config.useMockFallback) {
          throw err;
        }
        console.warn('Conexión con API externa falló, usando autenticación demo:', err);
      }
    }

    // Demo / Mock fallback validation
    await new Promise((resolve) => setTimeout(resolve, 400));

    if (!correo || !password) {
      throw new Error('Por favor ingresa tu correo y contraseña');
    }

    // Default demo users
    let rol: User['rol'] = 'administrador';
    let nombre = 'Lic. Alejandro Morales';
    let codigo = 'ADM-01';

    if (correo.includes('supervisor') || correo.includes('carlos')) {
      rol = 'supervisor';
      nombre = 'Carlos Eduardo Mendoza';
      codigo = 'SUP-01';
    } else if (correo.includes('auditor') || correo.includes('maria')) {
      rol = 'auditor';
      nombre = 'María Elena Torres';
      codigo = 'SUP-02';
    } else if (correo.includes('analista')) {
      rol = 'analista';
      nombre = 'Analista de Operaciones';
      codigo = 'ANA-01';
    }

    const mockUser: User = {
      id: 'usr-demo-' + Math.floor(Math.random() * 1000),
      nombre,
      correo,
      codigo,
      rol,
      token: 'demo_jwt_token_' + btoa(correo),
    };

    saveStoredUser(mockUser);
    return { user: mockUser, token: mockUser.token || '' };
  },

  async getSupervisores(): Promise<SupervisorOption[]> {
    const config = getStoredApiConfig();
    const token = getStoredUser()?.token;

    if (config.baseUrl && !config.useMockFallback) {
      try {
        const res = await fetch(`${config.baseUrl}/supervisores`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(config.apiKey ? { 'X-API-Key': config.apiKey } : {}),
          },
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn('Fallback a supervisores locales:', err);
      }
    }

    // Calculate dynamic counts from current in-memory punteos
    return SUPERVISORES_MOCK.map((sup) => {
      const count = inMemoryPunteos.filter((p) => p.creado_por_codigo === sup.codigo).length;
      return {
        ...sup,
        totalPunteos: count,
      };
    });
  },

  async getPunteos(filters?: Partial<FilterState>): Promise<Punteo[]> {
    const config = getStoredApiConfig();
    const token = getStoredUser()?.token;

    if (config.baseUrl && !config.useMockFallback) {
      try {
        const params = new URLSearchParams();
        if (filters?.supervisorCodigo && filters.supervisorCodigo !== 'todos') {
          params.append('creado_por_codigo', filters.supervisorCodigo);
        }
        if (filters?.fecha) {
          params.append('fecha', filters.fecha);
        }
        if (filters?.estado && filters.estado !== 'todos') {
          params.append('estado', filters.estado);
        }
        if (filters?.departamento) {
          params.append('departamento', filters.departamento);
        }
        if (filters?.searchQuery) {
          params.append('q', filters.searchQuery);
        }

        const res = await fetch(`${config.baseUrl}/punteos?${params.toString()}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(config.apiKey ? { 'X-API-Key': config.apiKey } : {}),
          },
        });
        if (res.ok) {
          const list: Punteo[] = await res.json();
          return list.map((p) => ({
            ...p,
            documentos: p.documentos || DOCUMENTOS_MOCK[p.id] || [],
          }));
        }
      } catch (err) {
        console.warn('Error fetching live punteos, using local data:', err);
      }
    }

    // Local filtering
    let results = [...inMemoryPunteos];

    if (filters) {
      if (filters.supervisorCodigo && filters.supervisorCodigo !== 'todos') {
        results = results.filter((p) => p.creado_por_codigo === filters.supervisorCodigo);
      }

      if (filters.fecha) {
        results = results.filter((p) => {
          const pDate = p.fecha_registro.slice(0, 10);
          return pDate === filters.fecha;
        });
      }

      if (filters.estado && filters.estado !== 'todos') {
        results = results.filter((p) => p.estado === filters.estado);
      }

      if (filters.departamento && filters.departamento !== 'todos') {
        const depFilter = filters.departamento.toLowerCase();
        results = results.filter((p) => p.departamento && p.departamento.toLowerCase() === depFilter);
      }

      if (filters.tipoRegistro && filters.tipoRegistro !== 'todos') {
        results = results.filter((p) => p.tipo_registro === filters.tipoRegistro);
      }

      if (filters.searchQuery && filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase().trim();
        results = results.filter(
          (p) =>
            p.razon_social?.toLowerCase().includes(query) ||
            p.nombre_comercial?.toLowerCase().includes(query) ||
            p.primer_nombre?.toLowerCase().includes(query) ||
            p.apellidos?.toLowerCase().includes(query) ||
            p.dui?.toLowerCase().includes(query) ||
            p.nrc?.toLowerCase().includes(query) ||
            p.giro?.toLowerCase().includes(query) ||
            p.direccion?.toLowerCase().includes(query) ||
            p.telefono?.includes(query) ||
            p.creado_por_nombre?.toLowerCase().includes(query) ||
            p.creado_por_codigo?.toLowerCase().includes(query) ||
            p.ruta?.toLowerCase().includes(query)
        );
      }
    }

    // Attach documents
    return results.map((p) => ({
      ...p,
      documentos: DOCUMENTOS_MOCK[p.id] || [],
    }));
  },

  async getPunteoDocumentos(punteoId: number): Promise<PunteoDocumento[]> {
    const config = getStoredApiConfig();
    const token = getStoredUser()?.token;

    if (config.baseUrl && !config.useMockFallback) {
      try {
        const res = await fetch(`${config.baseUrl}/punteos/${punteoId}/documentos`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(config.apiKey ? { 'X-API-Key': config.apiKey } : {}),
          },
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn('Error fetching documentos:', err);
      }
    }

    return DOCUMENTOS_MOCK[punteoId] || [];
  },

  async updatePunteoEstado(
    punteoId: number,
    estado: 'aprobado' | 'pendiente' | 'rechazado',
    comentarioRechazo?: string | null
  ): Promise<Punteo> {
    const config = getStoredApiConfig();
    const token = getStoredUser()?.token;

    if (config.baseUrl && !config.useMockFallback) {
      try {
        const res = await fetch(`${config.baseUrl}/punteos/${punteoId}/estado`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(config.apiKey ? { 'X-API-Key': config.apiKey } : {}),
          },
          body: JSON.stringify({
            estado,
            comentario_rechazo: comentarioRechazo || null,
            fecha_resolucion: new Date().toISOString(),
          }),
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn('Error actualizando estado en API:', err);
      }
    }

    // Local mutation
    const idx = inMemoryPunteos.findIndex((p) => p.id === punteoId);
    if (idx !== -1) {
      const updated: Punteo = {
        ...inMemoryPunteos[idx],
        estado,
        comentario_rechazo: estado === 'rechazado' ? comentarioRechazo || 'Rechazado en auditoría' : null,
        fecha_resolucion: new Date().toISOString(),
      };
      inMemoryPunteos[idx] = updated;
      try {
        localStorage.setItem(STORAGE_KEY_PUNTEOS, JSON.stringify(inMemoryPunteos));
      } catch {
        // ignore storage error
      }
      return updated;
    }

    throw new Error('Punteo no encontrado');
  },

  resetDemoData(): void {
    inMemoryPunteos = [...PUNTEOS_MOCK];
    try {
      localStorage.removeItem(STORAGE_KEY_PUNTEOS);
    } catch {
      // ignore
    }
  },
};
