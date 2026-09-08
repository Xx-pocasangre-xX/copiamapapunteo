import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Maximize2,
  Minimize2,
  Navigation,
  Compass,
  Route,
} from 'lucide-react';
import type { Punteo } from '../types';

interface MapViewProps {
  punteos: Punteo[];
  selectedPunteo: Punteo | null;
  onSelectPunteo: (punteo: Punteo) => void;
  mostrarRuta: boolean;
  supervisorNombre?: string;
  fechaFiltro?: string;
}

const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

// Calculate Haversine distance in km
function calculateRouteDistance(points: [number, number][]): number {
  if (points.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const [lat1, lon1] = points[i];
    const [lat2, lon2] = points[i + 1];
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    total += R * c;
  }
  return Number(total.toFixed(2));
}

export const MapView: React.FC<MapViewProps> = ({
  punteos,
  selectedPunteo,
  onSelectPunteo,
  mostrarRuta,
  supervisorNombre,
  fechaFiltro,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Default center in El Salvador (San Salvador)
    const initialLat = 13.6929;
    const initialLng = -89.2182;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 12,
      zoomControl: false,
    });

    // Custom zoom control in bottom right
    L.control
      .zoom({
        position: 'bottomright',
      })
      .addTo(map);

    // Set standard OpenStreetMap tile layer
    const tileLayer = L.tileLayer(OSM_TILE_URL, {
      attribution: OSM_ATTRIBUTION,
      maxZoom: 19,
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Layer group for markers
    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Sort chronologically for sequential route
  const sortedPunteos = [...punteos].sort(
    (a, b) => new Date(a.fecha_registro).getTime() - new Date(b.fecha_registro).getTime()
  );

  const routeCoordinates: [number, number][] = sortedPunteos
    .filter((p) => typeof p.latitud === 'number' && typeof p.longitud === 'number')
    .map((p) => [p.latitud, p.longitud]);

  const routeDistanceKm = calculateRouteDistance(routeCoordinates);

  // Render Markers & Route
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    markersGroup.clearLayers();

    // Remove old route polyline
    if (routePolylineRef.current) {
      map.removeLayer(routePolylineRef.current);
      routePolylineRef.current = null;
    }

    if (punteos.length === 0) return;

    const bounds = L.latLngBounds([]);

    // Sort chronologically for sequential route
    const sorted = [...punteos].sort(
      (a, b) => new Date(a.fecha_registro).getTime() - new Date(b.fecha_registro).getTime()
    );

    const coords: [number, number][] = sorted
      .filter((p) => typeof p.latitud === 'number' && typeof p.longitud === 'number')
      .map((p) => [p.latitud, p.longitud]);

    sorted.forEach((punteo, index) => {
      if (!punteo.latitud || !punteo.longitud) return;

      const latLng: [number, number] = [punteo.latitud, punteo.longitud];
      bounds.extend(latLng);

      const isSelected = selectedPunteo?.id === punteo.id;

      // Determine pin color and badge
      let pinColor = '#10b981'; // green for aprobado
      let ringColor = 'rgba(16, 185, 129, 0.4)';
      let statusLabel = 'Aprobado';

      if (punteo.estado === 'pendiente') {
        pinColor = '#f59e0b'; // amber
        ringColor = 'rgba(245, 158, 11, 0.4)';
        statusLabel = 'Pendiente';
      } else if (punteo.estado === 'rechazado') {
        pinColor = '#ef4444'; // rose
        ringColor = 'rgba(239, 68, 68, 0.4)';
        statusLabel = 'Rechazado';
      }

      // Sequential sequence number (1-based)
      const sequenceNumber = index + 1;

      // Custom HTML Marker Icon
      const iconHtml = `
        <div class="custom-marker-pin relative flex items-center justify-center cursor-pointer">
          ${
            isSelected
              ? `<div class="pulse-ring" style="background-color: ${ringColor}; width: 44px; height: 44px; left: -6px; top: -6px;"></div>`
              : ''
          }
          <div style="
            background: linear-gradient(135deg, ${pinColor}, ${pinColor}ee);
            color: #ffffff;
            width: ${isSelected ? '36px' : '30px'};
            height: ${isSelected ? '36px' : '30px'};
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.25), 0 0 0 2px #ffffff;
            border: 2px solid #ffffff;
            transition: all 0.2s ease;
          ">
            <span style="
              transform: rotate(45deg);
              font-size: ${isSelected ? '12px' : '11px'};
              font-weight: 700;
              font-family: inherit;
              line-height: 1;
            ">${sequenceNumber}</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-div-icon',
        iconSize: isSelected ? [36, 36] : [30, 30],
        iconAnchor: isSelected ? [18, 36] : [15, 30],
        popupAnchor: [0, -32],
      });

      const marker = L.marker(latLng, { icon: customIcon });

      // Create Custom Popup Content
      const dateFormatted = new Date(punteo.fecha_registro).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      const popupContent = document.createElement('div');
      popupContent.className = 'p-3.5 max-w-[280px] text-slate-800 font-sans';
      popupContent.innerHTML = `
        <div class="flex items-center justify-between gap-2 mb-1.5 border-b border-slate-100 pb-1.5">
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
            punteo.estado === 'aprobado'
              ? 'bg-emerald-100 text-emerald-800'
              : punteo.estado === 'pendiente'
              ? 'bg-amber-100 text-amber-800'
              : 'bg-rose-100 text-rose-800'
          }">
            Parada #${sequenceNumber} &bull; ${statusLabel}
          </span>
          <span class="text-[11px] text-slate-400 font-medium">${dateFormatted}</span>
        </div>

        <h4 class="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
          ${punteo.nombre_comercial || punteo.razon_social}
        </h4>

        ${
          punteo.nombre_comercial && punteo.razon_social !== punteo.nombre_comercial
            ? `<p class="text-[11px] text-slate-500 line-clamp-1 mt-0.5">${punteo.razon_social}</p>`
            : ''
        }

        <div class="mt-2 text-[11px] text-slate-600 space-y-1">
          <div class="flex items-start gap-1">
            <span class="text-slate-400">📍</span>
            <span class="line-clamp-2 leading-tight">${punteo.direccion}</span>
          </div>
          <div class="flex items-center gap-1 text-[10px] text-slate-500 pt-1">
            <span>👤 Sup: <strong>${punteo.creado_por_nombre}</strong> (${punteo.creado_por_codigo})</span>
          </div>
        </div>

        <button id="btn-popup-ver-${punteo.id}" class="mt-2.5 w-full bg-red-600 hover:bg-red-700 text-white font-medium text-xs py-1.5 px-3 rounded-lg flex items-center justify-center gap-1 transition-colors shadow-xs">
          <span>Ver Ficha Completa</span>
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
        </button>
      `;

      // Attach event to button inside popup
      marker.bindPopup(popupContent, { maxWidth: 300, minWidth: 260 });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-popup-ver-${punteo.id}`);
        if (btn) {
          btn.onclick = () => {
            onSelectPunteo(punteo);
          };
        }
      });

      marker.on('click', () => {
        onSelectPunteo(punteo);
      });

      markersGroup.addLayer(marker);
    });

    // Draw route polyline if enabled and 2+ points exist
    if (mostrarRuta && coords.length >= 2) {
      const routePolyline = L.polyline(coords, {
        color: '#dc2626',
        weight: 4,
        opacity: 0.9,
        dashArray: '8, 8',
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      routePolylineRef.current = routePolyline;
    }

    // Adjust map zoom bounds if markers exist
    if (bounds.isValid()) {
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 15,
        animate: true,
      });
    }
  }, [punteos, mostrarRuta, selectedPunteo?.id, onSelectPunteo]);

  // Center on selected punteo when changed
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedPunteo) return;
    if (selectedPunteo.latitud && selectedPunteo.longitud) {
      mapInstanceRef.current.flyTo(
        [selectedPunteo.latitud, selectedPunteo.longitud],
        16,
        { duration: 0.8 }
      );
    }
  }, [selectedPunteo]);

  // Fit bounds helper
  const handleFitBounds = () => {
    if (!mapInstanceRef.current || routeCoordinates.length === 0) return;
    const bounds = L.latLngBounds(routeCoordinates);
    if (bounds.isValid()) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  };

  const handleResetToElSalvador = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView([13.7942, -88.8965], 9);
  };

  return (
    <div
      className={`relative w-full h-full bg-slate-100 overflow-hidden ${
        isFullscreen ? 'fixed inset-0 z-50' : 'relative'
      }`}
    >
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Floating Header Info Badge (When filtered by supervisor/date) */}
      {(supervisorNombre || fechaFiltro || mostrarRuta) && (
        <div className="absolute top-4 left-4 z-20 pointer-events-none max-w-[calc(100%-120px)] sm:max-w-md">
          <div className="bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-lg border border-slate-200/80 pointer-events-auto space-y-1">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
                <span className="text-xs font-bold text-slate-900 truncate">
                  {supervisorNombre ? `Supervisor: ${supervisorNombre}` : 'Vista General de Punteos'}
                </span>
              </div>
              <span className="text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                {punteos.length} {punteos.length === 1 ? 'punto' : 'puntos'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 font-medium">
              {fechaFiltro && (
                <span>📅 Fecha: <strong className="text-slate-700">{fechaFiltro}</strong></span>
              )}
              {mostrarRuta && routeDistanceKm > 0 && (
                <span className="flex items-center gap-1 text-amber-700 font-bold">
                  <Route className="w-3.5 h-3.5 text-amber-600" />
                  Distancia de Ruta: {routeDistanceKm} km
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Map Floating Controls (Top Right) */}
      <div className="absolute top-4 right-4 z-20 flex flex-col space-y-2">
        {/* Fit Bounds Button */}
        <button
          onClick={handleFitBounds}
          title="Centrar en todos los puntos"
          className="p-2.5 bg-white/95 backdrop-blur-md hover:bg-white text-slate-700 hover:text-slate-900 rounded-xl shadow-md border border-slate-200/80 transition-all"
        >
          <Navigation className="w-4 h-4" />
        </button>

        {/* Reset View to El Salvador */}
        <button
          onClick={handleResetToElSalvador}
          title="Ver todo El Salvador"
          className="p-2.5 bg-white/95 backdrop-blur-md hover:bg-white text-slate-700 hover:text-slate-900 rounded-xl shadow-md border border-slate-200/80 transition-all"
        >
          <Compass className="w-4 h-4" />
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          className="p-2.5 bg-white/95 backdrop-blur-md hover:bg-white text-slate-700 hover:text-slate-900 rounded-xl shadow-md border border-slate-200/80 transition-all"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Bottom Map Legend */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md rounded-xl px-3 py-2 shadow-md border border-slate-200/80 flex items-center space-x-3 text-[11px] font-medium text-slate-700 pointer-events-auto">
          <span className="text-[10px] uppercase font-bold text-slate-400">Leyenda:</span>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Aprobado</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Pendiente</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>Rechazado</span>
          </div>
        </div>
      </div>
    </div>
  );
};
