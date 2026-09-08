import React, { useState } from 'react';
import {
  X,
  MapPin,
  Building,
  User as UserIcon,
  Phone,
  Clock,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Image as ImageIcon,
  ShieldAlert,
  Send,
  Navigation,
} from 'lucide-react';
import type { Punteo, PunteoDocumento } from '../types';

interface PunteoDetailModalProps {
  punteo: Punteo | null;
  onClose: () => void;
  onUpdateEstado: (punteoId: number, nuevoEstado: 'aprobado' | 'pendiente' | 'rechazado', comentario?: string) => Promise<void>;
}

export const PunteoDetailModal: React.FC<PunteoDetailModalProps> = ({
  punteo,
  onClose,
  onUpdateEstado,
}) => {
  const [copied, setCopied] = useState(false);
  const [activePhoto, setActivePhoto] = useState<PunteoDocumento | null>(null);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectComment, setRejectComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!punteo) return null;

  const copyCoordinates = () => {
    navigator.clipboard.writeText(`${punteo.latitud}, ${punteo.longitud}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openGoogleMaps = () => {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${punteo.latitud},${punteo.longitud}`,
      '_blank'
    );
  };

  const openWaze = () => {
    window.open(
      `https://waze.com/ul?ll=${punteo.latitud},${punteo.longitud}&navigate=yes`,
      '_blank'
    );
  };

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await onUpdateEstado(punteo.id, 'aprobado');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectComment.trim()) return;
    setIsSubmitting(true);
    try {
      await onUpdateEstado(punteo.id, 'rechazado', rejectComment.trim());
      setShowRejectForm(false);
      setRejectComment('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetPending = async () => {
    setIsSubmitting(true);
    try {
      await onUpdateEstado(punteo.id, 'pendiente');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedDate = new Date(punteo.fecha_registro).toLocaleString('es-SV', {
    dateStyle: 'full',
    timeStyle: 'medium',
  });

  const formattedResolutionDate = punteo.fecha_resolucion
    ? new Date(punteo.fecha_resolucion).toLocaleString('es-SV', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white shadow-md ring-2 ring-amber-400/30">
              <MapPin className="w-5 h-5 fill-amber-300/30" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-medium text-slate-400">PUNTEO #{punteo.id}</span>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    punteo.estado === 'aprobado'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : punteo.estado === 'pendiente'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {punteo.estado}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">
                  {punteo.tipo_registro}
                </span>
              </div>
              <h2 className="text-base font-bold text-white tracking-tight mt-0.5">
                {punteo.nombre_comercial || punteo.razon_social}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Rejection Alert If Exists */}
          {punteo.estado === 'rechazado' && punteo.comentario_rechazo && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start space-x-3 text-rose-900">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800">
                  Motivo de Rechazo en Auditoría
                </h4>
                <p className="text-xs mt-1 text-rose-700 leading-relaxed font-medium">
                  {punteo.comentario_rechazo}
                </p>
                {formattedResolutionDate && (
                  <p className="text-[11px] text-rose-500 mt-1">
                    Resuelto el: {formattedResolutionDate}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Grid of details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Section: Datos del Contribuyente & Negocio */}
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4.5 space-y-3.5">
              <div className="flex items-center space-x-2 text-slate-800 font-bold text-xs border-b border-slate-200 pb-2 uppercase tracking-wider">
                <Building className="w-4 h-4 text-red-600" />
                <span>Datos del Negocio & Contribuyente</span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Razón Social</span>
                  <span className="font-semibold text-slate-800">{punteo.razon_social}</span>
                </div>

                {punteo.nombre_comercial && (
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Nombre Comercial</span>
                    <span className="font-semibold text-slate-800">{punteo.nombre_comercial}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Tipo Persona</span>
                    <span className="font-medium text-slate-700 capitalize">{punteo.tipo_persona}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">¿Es Contribuyente?</span>
                    <span className={`inline-flex items-center font-semibold text-[11px] ${punteo.es_contribuyente ? 'text-emerald-700' : 'text-slate-600'}`}>
                      {punteo.es_contribuyente ? '✓ SÍ (Tiene NRC)' : '✗ NO (Consumidor)'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">DUI</span>
                    <span className="font-mono font-medium text-slate-800">{punteo.dui || 'No registrado'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">NRC</span>
                    <span className="font-mono font-medium text-slate-800">{punteo.nrc || 'No registrado'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Giro Económico</span>
                  <span className="font-medium text-slate-700 leading-tight block">{punteo.giro || 'No especificado'}</span>
                </div>

                {punteo.cliente_erp_id && (
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">ID Cliente ERP</span>
                    <span className="font-mono font-semibold text-red-700">#{punteo.cliente_erp_id}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Section: Ubicación & Logística */}
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4.5 space-y-3.5">
              <div className="flex items-center space-x-2 text-slate-800 font-bold text-xs border-b border-slate-200 pb-2 uppercase tracking-wider">
                <Navigation className="w-4 h-4 text-red-600" />
                <span>Ubicación Geográfica & Ruta</span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Dirección Completa</span>
                  <span className="font-semibold text-slate-800 leading-snug block">{punteo.direccion}</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Departamento</span>
                    <span className="font-medium text-slate-800">{punteo.departamento}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Municipio</span>
                    <span className="font-medium text-slate-800">{punteo.municipio}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Distrito</span>
                    <span className="font-medium text-slate-800">{punteo.distrito || '-'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Ruta Asignada</span>
                    <span className="font-semibold text-slate-800">{punteo.ruta || 'Sin ruta'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Canal Comercial</span>
                    <span className="font-medium text-slate-700">{punteo.canal || 'Detalle'}</span>
                  </div>
                </div>

                {/* GPS Coordinates & Quick Launch */}
                <div className="pt-1">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Coordenadas GPS</span>
                  <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-2 font-mono text-xs text-slate-700">
                    <span>{punteo.latitud.toFixed(6)}, {punteo.longitud.toFixed(6)}</span>
                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={copyCoordinates}
                        title="Copiar coordenadas"
                        className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-colors"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={openGoogleMaps}
                        title="Abrir en Google Maps"
                        className="text-[11px] font-semibold text-red-600 hover:text-red-800 px-1.5 py-0.5 rounded hover:bg-red-50"
                      >
                        Google Maps ↗
                      </button>
                      <button
                        type="button"
                        onClick={openWaze}
                        title="Abrir en Waze"
                        className="text-[11px] font-semibold text-amber-600 hover:text-amber-800 px-1.5 py-0.5 rounded hover:bg-amber-50"
                      >
                        Waze ↗
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Contacto & Condiciones */}
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4.5 space-y-3.5">
              <div className="flex items-center space-x-2 text-slate-800 font-bold text-xs border-b border-slate-200 pb-2 uppercase tracking-wider">
                <Phone className="w-4 h-4 text-red-600" />
                <span>Contacto & Condiciones Comerciales</span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Teléfono</span>
                    <a
                      href={`tel:${punteo.telefono}`}
                      className="font-semibold text-red-600 hover:underline flex items-center gap-1"
                    >
                      {punteo.telefono}
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Forma de Pago</span>
                    <span className="font-medium text-slate-800">{punteo.forma_pago}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Correo Electrónico</span>
                  <a
                    href={`mailto:${punteo.correo_electronico}`}
                    className="font-medium text-red-600 hover:underline truncate block"
                  >
                    {punteo.correo_electronico}
                  </a>
                </div>
              </div>
            </div>

            {/* Section: Auditoría & Supervisor */}
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4.5 space-y-3.5">
              <div className="flex items-center space-x-2 text-slate-800 font-bold text-xs border-b border-slate-200 pb-2 uppercase tracking-wider">
                <UserIcon className="w-4 h-4 text-red-600" />
                <span>Auditoría de Registro (Supervisor)</span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Supervisor Asignado</span>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className="font-bold text-slate-900">{punteo.creado_por_nombre}</span>
                    <span className="font-mono text-[11px] bg-slate-200 text-slate-800 px-1.5 py-0.2 rounded font-semibold">
                      {punteo.creado_por_codigo}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Fecha y Hora de Registro</span>
                  <span className="font-medium text-slate-700 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {formattedDate}
                  </span>
                </div>

                {punteo.creado_por_oid && (
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">OID UUID Supervisor</span>
                    <span className="font-mono text-[10px] text-slate-500 truncate block">{punteo.creado_por_oid}</span>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Section: Documentos y Evidencias Fotográficas */}
          <div className="border border-slate-200/90 rounded-xl p-4.5 bg-white space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                <ImageIcon className="w-4 h-4 text-red-600" />
                <span>Documentos & Fotografías del Punteo ({punteo.documentos?.length || 0})</span>
              </div>
              <span className="text-[11px] text-slate-400">Tabla punteo_documento</span>
            </div>

            {punteo.documentos && punteo.documentos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {punteo.documentos.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => setActivePhoto(doc)}
                    className="group relative cursor-pointer border border-slate-200 rounded-xl overflow-hidden bg-slate-50 hover:shadow-md transition-all"
                  >
                    <div className="aspect-video w-full bg-slate-200 overflow-hidden relative">
                      <img
                        src={doc.url}
                        alt={doc.nombre_archivo}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/30 transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 text-white text-[11px] font-semibold bg-black/50 px-2 py-1 rounded backdrop-blur-xs transition-opacity">
                          Ampliar
                        </span>
                      </div>
                    </div>
                    <div className="p-2">
                      <p className="text-[11px] font-semibold text-slate-800 truncate" title={doc.nombre_archivo}>
                        {doc.nombre_archivo}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        {doc.descripcion || doc.content_type}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-slate-400 text-xs">
                No hay fotografías ni documentos adjuntos para este punteo.
              </div>
            )}
          </div>

          {/* Form to Reject If Opened */}
          {showRejectForm && (
            <form onSubmit={handleReject} className="bg-rose-50 border border-rose-200 rounded-xl p-4 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                  Ingresa el Motivo del Rechazo
                </label>
                <button
                  type="button"
                  onClick={() => setShowRejectForm(false)}
                  className="text-xs text-rose-700 hover:text-rose-900 font-semibold"
                >
                  Cancelar
                </button>
              </div>
              <textarea
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                required
                rows={2}
                placeholder="Explica la razón por la que se rechaza este punteo (ej: dirección fuera de ruta, local inexistente, falta de NRC...)"
                className="w-full bg-white text-slate-900 text-xs rounded-lg border border-rose-300 p-2.5 focus:ring-2 focus:ring-rose-400 focus:border-rose-500"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !rejectComment.trim()}
                  className="bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center space-x-1.5 transition-colors shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Confirmar Rechazo</span>
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Modal Footer / Audit Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {punteo.estado === 'aprobado' ? (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Punteo validado y aprobado en sistema
              </span>
            ) : punteo.estado === 'rechazado' ? (
              <span className="text-rose-700 font-semibold flex items-center gap-1">
                <XCircle className="w-4 h-4" /> Punteo en estado rechazado
              </span>
            ) : (
              <span className="text-amber-700 font-semibold flex items-center gap-1">
                <Clock className="w-4 h-4" /> Pendiente de resolución por auditoría
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {punteo.estado !== 'aprobado' && (
              <button
                type="button"
                onClick={handleApprove}
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold px-3.5 py-2 rounded-lg flex items-center space-x-1.5 transition-colors shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Aprobar Punteo</span>
              </button>
            )}

            {punteo.estado !== 'rechazado' && !showRejectForm && (
              <button
                type="button"
                onClick={() => setShowRejectForm(true)}
                disabled={isSubmitting}
                className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold px-3.5 py-2 rounded-lg flex items-center space-x-1.5 transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Rechazar</span>
              </button>
            )}

            {punteo.estado !== 'pendiente' && (
              <button
                type="button"
                onClick={handleSetPending}
                disabled={isSubmitting}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
              >
                Marcar Pendiente
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors ml-2"
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>

      {/* Lightbox Photo Zoom Modal */}
      {activePhoto && (
        <div className="fixed inset-0 z-60 bg-black/90 flex flex-col items-center justify-center p-4 animate-in fade-in">
          <button
            onClick={() => setActivePhoto(null)}
            className="absolute top-4 right-4 text-white hover:text-slate-300 p-2 rounded-full bg-white/10 hover:bg-white/20"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={activePhoto.url}
            alt={activePhoto.nombre_archivo}
            className="max-h-[80vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
          />
          <div className="mt-4 text-center text-white">
            <h4 className="text-sm font-semibold">{activePhoto.nombre_archivo}</h4>
            <p className="text-xs text-slate-400 mt-1">{activePhoto.descripcion}</p>
          </div>
        </div>
      )}
    </div>
  );
};
