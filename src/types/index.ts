export interface Punteo {
  id: number;
  es_contribuyente: boolean;
  tipo_persona: 'natural' | 'juridica' | string;
  razon_social: string;
  primer_nombre: string | null;
  segundo_nombre: string | null;
  apellidos: string | null;
  nombre_comercial: string | null;
  dui: string | null;
  nrc: string | null;
  giro: string | null;
  telefono: string;
  correo_electronico: string;
  direccion: string;
  departamento: string;
  municipio: string;
  distrito: string | null;
  forma_pago: string;
  canal: string | null;
  ruta: string | null;
  latitud: number;
  longitud: number;
  tipo_registro: 'cliente' | 'prospecto' | string;
  nombre_sucursal: string | null;
  cliente_erp_id: number | null;
  estado: 'pendiente' | 'aprobado' | 'rechazado' | string;
  comentario_rechazo: string | null;
  creado_por_oid: string | null;
  creado_por_nombre: string;
  creado_por_codigo: string;
  fecha_registro: string;
  fecha_resolucion: string | null;
  documentos?: PunteoDocumento[];
}

export interface PunteoDocumento {
  id: number;
  punteo_id: number;
  nombre_archivo: string;
  content_type: string;
  orden: number;
  fecha_registro: string;
  url?: string;
  descripcion?: string;
}

export interface User {
  id: string;
  nombre: string;
  correo: string;
  codigo?: string;
  rol: 'administrador' | 'supervisor' | 'auditor' | 'analista';
  token?: string;
  avatarUrl?: string;
}

export interface SupervisorOption {
  codigo: string;
  nombre: string;
  oid?: string | null;
  totalPunteos: number;
}

export interface FilterState {
  supervisorCodigo: string; // 'todos' or supervisor code
  fecha: string; // YYYY-MM-DD or empty
  fechaFin: string; // for optional range
  estado: 'todos' | 'pendiente' | 'aprobado' | 'rechazado';
  departamento: string;
  tipoRegistro: 'todos' | 'cliente' | 'prospecto';
  searchQuery: string;
  mostrarRuta: boolean;
}

export interface ApiConfig {
  baseUrl: string;
  authUrl: string;
  apiKey?: string;
}
