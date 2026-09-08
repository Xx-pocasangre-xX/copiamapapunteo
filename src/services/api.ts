import CryptoJS from 'crypto-js';
import { PUNTEOS_MOCK, SUPERVISORES_MOCK, DOCUMENTOS_MOCK } from '../data/mockData';
import type { ApiConfig, FilterState, Punteo, PunteoDocumento, SupervisorOption, User } from '../types';

const STORAGE_KEY_CONFIG = 'mapa_punteo_api_config';
const STORAGE_KEY_AUTH = 'mapa_punteo_auth_user';
const STORAGE_KEY_PUNTEOS = 'mapa_punteo_custom_punteos';

export const EVENTO_SESION_EXPIRADA = 'mapa_punteo:sesion-expirada';

// ERPAPI (módulo appPunteo) desencripta la contraseña con una llave e IV AES fijos
// (ver ERPAPI/Utils/EncriptacionService.cs). Deben coincidir exactamente con el backend.
const AES_KEY = import.meta.env.VITE_LOGIN_POS_AES_KEY || 'rvSecretKeyParaPOS2026Seguridad!';
const AES_IV = import.meta.env.VITE_LOGIN_POS_AES_IV || 'rvVectorInicio26';

export const DEFAULT_API_CONFIG: ApiConfig = {
  baseUrl: (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '').replace(/\/+$/, ''),
  authUrl: import.meta.env.VITE_AUTH_API_URL || '',
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

function forzarCierreSesion(): void {
  saveStoredUser(null);
  window.dispatchEvent(new Event(EVENTO_SESION_EXPIRADA));
}

// --- Resolución de endpoints reales de ERPAPI (módulo appPunteo) ---

function sinBarraFinal(url: string): string {
  return url.replace(/\/+$/, '');
}

function resolveAuthUrl(config: ApiConfig): string {
  if (config.authUrl && config.authUrl.trim()) return config.authUrl.trim();
  return config.baseUrl ? `${sinBarraFinal(config.baseUrl)}/api/auth/login-punteo` : '';
}

function resolvePunteosUrl(config: ApiConfig): string {
  return config.baseUrl ? `${sinBarraFinal(config.baseUrl)}/api/appPunteo` : '';
}

function encriptarPassword(passwordPlano: string): string {
  const clave = CryptoJS.enc.Utf8.parse(AES_KEY);
  const iv = CryptoJS.enc.Utf8.parse(AES_IV);
  const cifrado = CryptoJS.AES.encrypt(passwordPlano, clave, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return cifrado.toString();
}

function construirHeaders(config: ApiConfig, extra: Record<string, string> = {}): Record<string, string> {
  const token = getStoredUser()?.token;
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(config.apiKey ? { 'X-API-Key': config.apiKey } : {}),
  };
}

async function manejarRespuestaProtegida(res: Response): Promise<void> {
  if (res.status === 401) {
    forzarCierreSesion();
    throw new Error('Tu sesión expiró o no tienes permisos para esta acción. Inicia sesión de nuevo.');
  }
  if (!res.ok) {
    const cuerpo = await res.json().catch(() => null);
    throw new Error(cuerpo?.title || cuerpo?.mensaje || cuerpo?.message || cuerpo || `Error del servidor (${res.status})`);
  }
}

function urlAbsolutaDocumento(baseUrl: string, ruta?: string | null): string | undefined {
  if (!ruta) return undefined;
  if (/^https?:\/\//i.test(ruta)) return ruta;
  return `${sinBarraFinal(baseUrl)}${ruta.startsWith('/') ? '' : '/'}${ruta}`;
}

// El endpoint de listado (GET /api/appPunteo) de ERPAPI serializa en camelCase
// (razonSocial, creadoPorCodigo, etc.). Estas funciones lo traducen al formato
// snake_case que usa toda la interfaz de este proyecto.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDocumentoFromApi(raw: any, punteoId: number, baseUrl: string): PunteoDocumento {
  return {
    id: raw.id,
    punteo_id: punteoId,
    nombre_archivo: raw.nombreArchivo || `documento-${raw.id}`,
    content_type: raw.contentType || 'image/jpeg',
    orden: raw.orden ?? 0,
    fecha_registro: raw.fechaRegistro || '',
    url: urlAbsolutaDocumento(baseUrl, raw.url),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPunteoFromApi(raw: any, baseUrl: string): Punteo {
  return {
    id: raw.id,
    es_contribuyente: !!raw.esContribuyente,
    tipo_persona: raw.tipoPersona,
    razon_social: raw.razonSocial,
    primer_nombre: raw.primerNombre ?? null,
    segundo_nombre: raw.segundoNombre ?? null,
    apellidos: raw.apellidos ?? null,
    nombre_comercial: raw.nombreComercial ?? null,
    dui: raw.dui ?? null,
    nrc: raw.nrc ?? null,
    giro: raw.giro ?? null,
    telefono: raw.telefono,
    correo_electronico: raw.correoElectronico,
    direccion: raw.direccion,
    departamento: raw.departamento,
    municipio: raw.municipio,
    distrito: raw.distrito ?? null,
    forma_pago: raw.formaPago,
    canal: raw.canal ?? null,
    ruta: raw.ruta ?? null,
    latitud: raw.latitud,
    longitud: raw.longitud,
    tipo_registro: raw.tipoRegistro,
    nombre_sucursal: raw.nombreSucursal ?? null,
    cliente_erp_id: raw.clienteErpId ?? null,
    estado: raw.estado,
    comentario_rechazo: raw.comentarioRechazo ?? null,
    creado_por_oid: raw.creadoPorOid ?? null,
    creado_por_nombre: raw.creadoPorNombre ?? '',
    creado_por_codigo: raw.creadoPorCodigo ?? '',
    fecha_registro: raw.fechaRegistro || raw.horaInicio || '',
    fecha_resolucion: raw.fechaResolucion ?? null,
    documentos: Array.isArray(raw.documentos)
      ? raw.documentos.map((d: unknown) => mapDocumentoFromApi(d, raw.id, baseUrl))
      : [],
  };
}

function aplicarFiltrosLocales(lista: Punteo[], filters?: Partial<FilterState>): Punteo[] {
  let results = [...lista];
  if (!filters) return results;

  if (filters.supervisorCodigo && filters.supervisorCodigo !== 'todos') {
    results = results.filter((p) => p.creado_por_codigo === filters.supervisorCodigo);
  }

  if (filters.fecha) {
    results = results.filter((p) => p.fecha_registro?.slice(0, 10) === filters.fecha);
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

  return results;
}

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

// Cache del último listado completo obtenido de la API real, para no repetir
// la petición al pedir los documentos o los supervisores de un solo punteo.
let cachePunteosApi: Punteo[] | null = null;

async function obtenerPunteosDeApi(config: ApiConfig, estado?: string): Promise<Punteo[]> {
  const url = new URL(resolvePunteosUrl(config));
  if (estado && estado !== 'todos') {
    url.searchParams.set('estado', estado);
  }

  const res = await fetch(url.toString(), { headers: construirHeaders(config) });
  await manejarRespuestaProtegida(res);
  const data = await res.json();
  const lista: Punteo[] = (Array.isArray(data) ? data : []).map((raw) => mapPunteoFromApi(raw, config.baseUrl));
  if (!estado || estado === 'todos') {
    cachePunteosApi = lista;
  }
  return lista;
}

export const apiService = {
  async login(correo: string, password: string, forceMock = false): Promise<{ user: User; token: string }> {
    const config = getStoredApiConfig();
    const authUrl = resolveAuthUrl(config);

    if (!forceMock && authUrl) {
      try {
        const response = await fetch(authUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(config.apiKey ? { 'X-API-Key': config.apiKey } : {}),
          },
          body: JSON.stringify({
            username: correo.trim(),
            password: encriptarPassword(password),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const user: User = {
            id: data.oid || 'usr-' + Date.now(),
            nombre: data.nombre || correo.split('@')[0],
            correo: correo.trim(),
            codigo: data.supervisorCodigo || undefined,
            rol: 'supervisor',
            token: data.token,
            avatarUrl: undefined,
          };
          saveStoredUser(user);
          return { user, token: user.token || '' };
        }

        if (response.status === 401) {
          throw new Error('Usuario o contraseña incorrectos, o el usuario no tiene un supervisor asignado.');
        }

        if (!config.useMockFallback) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.title || errData.message || `Error de autenticación (${response.status})`);
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

    if (config.baseUrl) {
      try {
        const lista = cachePunteosApi ?? (await obtenerPunteosDeApi(config));
        const porCodigo = new Map<string, SupervisorOption>();
        for (const p of lista) {
          if (!p.creado_por_codigo) continue;
          const existente = porCodigo.get(p.creado_por_codigo);
          if (existente) {
            existente.totalPunteos += 1;
          } else {
            porCodigo.set(p.creado_por_codigo, {
              codigo: p.creado_por_codigo,
              nombre: p.creado_por_nombre || p.creado_por_codigo,
              oid: p.creado_por_oid,
              totalPunteos: 1,
            });
          }
        }
        return Array.from(porCodigo.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));
      } catch (err) {
        console.warn('Fallback a supervisores locales:', err);
        if (!config.useMockFallback) throw err;
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

    if (config.baseUrl) {
      try {
        const lista = await obtenerPunteosDeApi(config, filters?.estado);
        return aplicarFiltrosLocales(lista, { ...filters, estado: undefined });
      } catch (err) {
        console.warn('Error fetching live punteos, using local data:', err);
        if (!config.useMockFallback) throw err;
      }
    }

    return aplicarFiltrosLocales(
      inMemoryPunteos.map((p) => ({ ...p, documentos: DOCUMENTOS_MOCK[p.id] || [] })),
      filters
    );
  },

  async getPunteoDocumentos(punteoId: number): Promise<PunteoDocumento[]> {
    const config = getStoredApiConfig();

    if (config.baseUrl) {
      try {
        const lista = cachePunteosApi ?? (await obtenerPunteosDeApi(config));
        const punteo = lista.find((p) => p.id === punteoId);
        if (punteo) return punteo.documentos || [];
      } catch (err) {
        console.warn('Error fetching documentos:', err);
        if (!config.useMockFallback) throw err;
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

    if (config.baseUrl) {
      if (estado === 'pendiente') {
        throw new Error(
          'La API no permite regresar un punteo a estado "pendiente" una vez resuelto. Esta acción solo está disponible en modo demostración.'
        );
      }

      try {
        const punteosUrl = resolvePunteosUrl(config);

        if (estado === 'aprobado') {
          const listaActual = cachePunteosApi ?? (await obtenerPunteosDeApi(config));
          const actual = listaActual.find((p) => p.id === punteoId);
          const clienteErpId = actual?.cliente_erp_id;

          if (!clienteErpId || clienteErpId <= 0) {
            throw new Error(
              'Este registro aún no tiene un Cliente ERP asociado. Debe aprobarse primero desde la aplicación de aprobación de punteos, que crea el cliente en el ERP antes de marcarlo como aprobado.'
            );
          }

          const res = await fetch(`${punteosUrl}/${punteoId}/aprobar`, {
            method: 'PUT',
            headers: construirHeaders(config, { 'Content-Type': 'application/json' }),
            body: JSON.stringify({ clienteErpId }),
          });
          await manejarRespuestaProtegida(res);
        } else {
          const res = await fetch(`${punteosUrl}/${punteoId}/rechazar`, {
            method: 'PUT',
            headers: construirHeaders(config, { 'Content-Type': 'application/json' }),
            body: JSON.stringify({ comentario: comentarioRechazo || null }),
          });
          await manejarRespuestaProtegida(res);
        }

        // El backend solo responde con un mensaje de confirmación, no con el
        // registro actualizado; se vuelve a consultar para reflejar el estado real.
        cachePunteosApi = null;
        const listaActualizada = await obtenerPunteosDeApi(config);
        const actualizado = listaActualizada.find((p) => p.id === punteoId);
        if (!actualizado) {
          throw new Error('El punteo se actualizó pero no se pudo recargar su información más reciente.');
        }
        return actualizado;
      } catch (err) {
        if (!config.useMockFallback) throw err;
        console.warn('Error actualizando estado en API, aplicando cambio en modo demo:', err);
      }
    }

    // Local mutation (demo mode / fallback)
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
    cachePunteosApi = null;
    try {
      localStorage.removeItem(STORAGE_KEY_PUNTEOS);
    } catch {
      // ignore
    }
  },
};
