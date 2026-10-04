'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Eye,
  EyeOff,
  ShieldAlert
} from 'lucide-react';
import { CORRIDORS_DATA, CorridorData } from '@/lib/corridors';
import { fetchSarHeatmap } from '@/lib/api';

interface GoogleMapsGisProps {
  corridorId: string;
  isBlocked: boolean;
  onSelectNode?: (nodeName: string) => void;
}

type TileLayer = 'terrain' | 'satellite' | 'dark';

const TILE_SOURCES: Record<TileLayer, { url: string; attr: string; maxZoom: number; maxNativeZoom?: number }> = {
  terrain: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attr: 'Map data: &copy; OpenStreetMap contributors, SRTM',
    maxZoom: 17,
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attr: 'Tiles &copy; Esri &mdash; USGS, ESA, Copernicus',
    maxZoom: 18,
  },
  dark: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attr: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
    maxZoom: 18,
    maxNativeZoom: 16,
  },
};

// Fallback SAR zones mapped by corridor
const FALLBACK_SAR_ZONES: Record<string, Array<{
  id: string;
  name: string;
  tier: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  color: string;
  fillOpacity: number;
  velocity: string;
  coords: [number, number][];
}>> = {
  'NH-10': [
    {
      id: 'crit-teesta',
      name: '29th Mile Teesta River Gorge Active Creep (Kalimpong)',
      tier: 'CRITICAL',
      color: '#ef4444',
      fillOpacity: 0.65,
      velocity: '-24.8 mm/yr',
      coords: [[26.980, 88.455], [27.005, 88.475], [26.990, 88.490], [26.965, 88.465]]
    },
    {
      id: 'high-birik',
      name: 'Birik Dara Slip (Sevoke Basin)',
      tier: 'HIGH',
      color: '#f97316',
      fillOpacity: 0.50,
      velocity: '-14.2 mm/yr',
      coords: [[26.875, 88.425], [26.895, 88.445], [26.885, 88.455], [26.865, 88.435]]
    }
  ],
  'NH-27': [
    {
      id: 'crit-haflong',
      name: 'Haflong Hill Cut Rotational Debris Flow (Dima Hasao)',
      tier: 'CRITICAL',
      color: '#ef4444',
      fillOpacity: 0.65,
      velocity: '-28.5 mm/yr',
      coords: [[25.160, 93.020], [25.185, 93.050], [25.170, 93.065], [25.145, 93.035]]
    },
    {
      id: 'high-jatinga',
      name: 'Jatinga Valley Escarpment Slope (Assam)',
      tier: 'HIGH',
      color: '#f97316',
      fillOpacity: 0.55,
      velocity: '-18.1 mm/yr',
      coords: [[25.115, 92.990], [25.135, 93.015], [25.125, 93.030], [25.105, 93.005]]
    },
    {
      id: 'crit-mahurbazar',
      name: 'Mahur Section Slope Failure Chokepoint',
      tier: 'CRITICAL',
      color: '#ef4444',
      fillOpacity: 0.55,
      velocity: '-21.2 mm/yr',
      coords: [[24.960, 92.840], [24.990, 92.875], [24.975, 92.890], [24.945, 92.855]]
    }
  ],
  'SH-5': [
    {
      id: 'crit-mawkdok',
      name: 'Mawkdok Dympep Gorge Canyon Rim (East Khasi Hills)',
      tier: 'CRITICAL',
      color: '#ef4444',
      fillOpacity: 0.60,
      velocity: '-22.1 mm/yr',
      coords: [[25.340, 91.740], [25.370, 91.775], [25.355, 91.790], [25.325, 91.755]]
    },
    {
      id: 'high-sohra',
      name: 'Sohra (Cherrapunji) Plateau Saturation Toe',
      tier: 'HIGH',
      color: '#f97316',
      fillOpacity: 0.50,
      velocity: '-16.4 mm/yr',
      coords: [[25.260, 91.710], [25.285, 91.745], [25.275, 91.760], [25.250, 91.725]]
    }
  ],
  'NH-310A': [
    {
      id: 'crit-chungthang',
      name: 'Chungthang Teesta Headwaters Dam Breach (North Sikkim)',
      tier: 'CRITICAL',
      color: '#ef4444',
      fillOpacity: 0.65,
      velocity: '-26.3 mm/yr',
      coords: [[27.590, 88.630], [27.620, 88.665], [27.605, 88.675], [27.575, 88.640]]
    }
  ],
  'NH-306': [
    {
      id: 'high-sairang',
      name: 'Sairang Valley Regolith Slump (Aizawl)',
      tier: 'HIGH',
      color: '#f97316',
      fillOpacity: 0.55,
      velocity: '-16.8 mm/yr',
      coords: [[23.790, 92.650], [23.820, 92.685], [23.805, 92.695], [23.775, 92.660]]
    }
  ],
  'NH-13': [
    {
      id: 'high-sela',
      name: 'Sela Pass High-Altitude Talus Slump (Tawang)',
      tier: 'HIGH',
      color: '#f97316',
      fillOpacity: 0.55,
      velocity: '-15.4 mm/yr',
      coords: [[27.490, 92.090], [27.520, 92.125], [27.505, 92.135], [27.475, 92.100]]
    }
  ],
  'NH-29': [
    {
      id: 'crit-paglapahar',
      name: 'Pagla Pahar Chokepoint Creep Zone (Nagaland)',
      tier: 'CRITICAL',
      color: '#ef4444',
      fillOpacity: 0.60,
      velocity: '-21.4 mm/yr',
      coords: [[25.750, 93.850], [25.770, 93.880], [25.755, 93.895], [25.735, 93.865]]
    }
  ],
  'NH-6': [
    {
      id: 'crit-sonapur',
      name: 'Sonapur Tunnel Mudflow Chokepoint (Meghalaya)',
      tier: 'CRITICAL',
      color: '#ef4444',
      fillOpacity: 0.60,
      velocity: '-23.4 mm/yr',
      coords: [[25.095, 92.345], [25.125, 92.380], [25.110, 92.395], [25.080, 92.360]]
    }
  ]
};

export const GoogleMapsGis: React.FC<GoogleMapsGisProps> = ({
  corridorId,
  isBlocked,
  onSelectNode,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tileRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const overlayGroupRef = useRef<any>(null);

  const [activeTile, setActiveTile] = useState<TileLayer>('terrain');
  const [showSarHeatmap, setShowSarHeatmap] = useState(true);
  const [showBypass, setShowBypass] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sarGeoJsonData, setSarGeoJsonData] = useState<any>(null);

  const corridorData: CorridorData = CORRIDORS_DATA[corridorId] || CORRIDORS_DATA['NH-10'];

  // Fetch live SAR GeoJSON feed for the active corridor from FastAPI backend
  useEffect(() => {
    let isSubscribed = true;
    const fetchSarFeed = async () => {
      try {
        const data = await fetchSarHeatmap(corridorId);
        if (isSubscribed && data && data.features) {
          setSarGeoJsonData(data);
        }
      } catch {
        // Fallback to calibrated local fixtures
      }
    };

    fetchSarFeed();
    return () => {
      isSubscribed = false;
    };
  }, [corridorId]);

  // Initial Leaflet Map Boot
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current || typeof window === 'undefined') return;

    let alive = true;
    const boot = async () => {
      const L = (await import('leaflet')).default;
      if (!alive || !mapContainerRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center: corridorData.center,
        zoom: corridorData.zoom,
        zoomControl: false,
        attributionControl: false,
      });

      const src = TILE_SOURCES[activeTile];
      tileRef.current = L.tileLayer(src.url, {
        maxZoom: src.maxZoom,
        maxNativeZoom: src.maxNativeZoom,
      }).addTo(map);

      overlayGroupRef.current = L.layerGroup().addTo(map);

      mapRef.current = map;
      setMapReady(true);
    };

    boot();

    return () => {
      alive = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update center/zoom when corridor changes
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;
    mapRef.current.flyTo(corridorData.center, corridorData.zoom, {
      duration: 1.2,
      easeLinearity: 0.25,
    });
  }, [corridorId, corridorData, mapReady]);

  // Switch base tiles
  useEffect(() => {
    if (!mapRef.current || typeof window === 'undefined') return;
    const swap = async () => {
      const L = (await import('leaflet')).default;
      if (tileRef.current) mapRef.current.removeLayer(tileRef.current);
      const src = TILE_SOURCES[activeTile];
      tileRef.current = L.tileLayer(src.url, {
        maxZoom: src.maxZoom,
        maxNativeZoom: src.maxNativeZoom,
      }).addTo(mapRef.current);
    };
    swap();
  }, [activeTile]);

  // Render overlays
  useEffect(() => {
    if (!mapRef.current || !overlayGroupRef.current || typeof window === 'undefined') return;

    const draw = async () => {
      const L = (await import('leaflet')).default;
      const grp = overlayGroupRef.current;
      grp.clearLayers();

      // 1. SAR Deformation Hazard Polygons
      if (showSarHeatmap) {
        if (sarGeoJsonData && sarGeoJsonData.features && sarGeoJsonData.features.length > 0) {
          L.geoJSON(sarGeoJsonData, {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            style: (feature: any) => {
              const p = feature.properties || {};
              return {
                color: p.stroke_color || p.risk_color || '#ef4444',
                weight: p.stroke_weight || 2,
                fillColor: p.fill_color || p.risk_color || '#ef4444',
                fillOpacity: p.fill_opacity || 0.55,
              };
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onEachFeature: (feature: any, layer: any) => {
              const p = feature.properties || {};
              layer.bindPopup(`
                <div style="font-family: 'Public Sans', sans-serif; font-size: 12px; padding: 6px 8px; line-height: 1.5; color: #1e293b;">
                  <div style="font-weight: 700; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin-bottom: 4px;">
                    ${p.name || 'SAR Hazard Sector'}
                  </div>
                  <div>Threat Tier: <b style="color: ${p.risk_color || '#dc2626'}">${p.threat_tier || 'CRITICAL'}</b></div>
                  <div>InSAR Velocity: <b style="font-family: monospace">${p.los_velocity_mm_year ? p.los_velocity_mm_year + ' mm/yr' : 'N/A'}</b></div>
                  <div>Pore Pressure: <b style="font-family: monospace">${p.pore_pressure_kpa ? p.pore_pressure_kpa + ' kPa' : 'N/A'}</b></div>
                  <div>Platform: <b style="font-size: 11px">${p.sensor_platform || 'Sentinel-1C C-Band'}</b></div>
                  <div style="color: #64748b; font-size: 11px; margin-top: 3px;">${p.description || ''}</div>
                </div>
              `);
            },
          }).addTo(grp);
        } else {
          // Local fallback polygons for active corridor
          const fallbackZones = FALLBACK_SAR_ZONES[corridorId] || FALLBACK_SAR_ZONES['NH-10'];
          fallbackZones.forEach((z) => {
            const poly = L.polygon(z.coords, {
              color: z.color,
              weight: 2,
              fillColor: z.color,
              fillOpacity: z.fillOpacity,
            }).addTo(grp);

            poly.bindPopup(`
              <div style="font-family: 'Public Sans', sans-serif; font-size: 12px; padding: 6px 8px; line-height: 1.5; color: #1e293b;">
                <div style="font-weight: 700; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin-bottom: 4px;">
                  ${z.name}
                </div>
                <div>Threat Tier: <b style="color: ${z.color}">${z.tier}</b></div>
                <div>InSAR LOS Velocity: <b style="font-family: monospace">${z.velocity}</b></div>
                <div style="font-size: 11px; color: #64748b;">Platform: Sentinel-1C / InSAR C-Band</div>
              </div>
            `);
          });
        }
      }

      // 2. Main Highway Polyline
      const waypoints: [number, number][] = corridorData.nodes.map((n) => [n.lat, n.lon]);
      L.polyline(waypoints, {
        color: isBlocked ? '#ef4444' : '#0284c7',
        weight: 4.5,
        opacity: 0.9,
        dashArray: isBlocked ? '6, 6' : undefined,
      }).addTo(grp);

      // 3. Highway Nodes & Critical Severance Points
      corridorData.nodes.forEach((node) => {
        const isCrit = node.critical_risk;
        const marker = L.circleMarker([node.lat, node.lon], {
          radius: isCrit ? 8 : 5,
          fillColor: isCrit ? '#dc2626' : '#2563eb',
          color: '#ffffff',
          weight: 2,
          fillOpacity: 1,
        });

        marker.bindPopup(`
          <div style="font-family: 'Public Sans', sans-serif; font-size: 12px; padding: 4px 6px; line-height: 1.4;">
            <div style="font-weight: 700; color: ${isCrit ? '#dc2626' : '#1e3a8a'}">${node.name}</div>
            <div style="color: #64748b; font-size: 11px;">Chainage: KM ${node.chainage_km}</div>
            ${isCrit ? '<div style="color: #dc2626; font-weight: 700; margin-top: 2px;">⚠ CRITICAL SHEAR FAILURE ZONE</div>' : ''}
          </div>
        `);

        if (onSelectNode) {
          marker.on('click', () => onSelectNode(node.name));
        }

        marker.addTo(grp);
      });

      // 4. Tactical Bypass Route
      if (showBypass && corridorData.bypass && corridorData.bypass.coordinates.length > 0) {
        const bypassCoords: [number, number][] = corridorData.bypass.coordinates.map((c) => [c[1], c[0]]);

        L.polyline(bypassCoords, {
          color: '#059669',
          weight: 3.5,
          opacity: 0.9,
        }).addTo(grp);

        // Checkpoints along bypass
        corridorData.bypass.checkpoints.forEach((cp, idx) => {
          if (idx < bypassCoords.length) {
            const coord = bypassCoords[Math.min(idx, bypassCoords.length - 1)];
            L.circleMarker(coord, {
              radius: 4.5,
              fillColor: '#059669',
              color: '#ffffff',
              weight: 1.5,
              fillOpacity: 1,
            })
              .bindPopup(`
                <div style="font-family: 'Public Sans', sans-serif; font-size: 12px; padding: 4px 6px;">
                  <strong style="color: #059669">${cp.name}</strong><br/>
                  Status: <b>${cp.status}</b><br/>
                  <span style="color: #64748b; font-size: 11px;">Route: Convoy Safe Bypass</span>
                </div>
              `)
              .addTo(grp);
          }
        });
      }
    };

    draw();
  }, [corridorId, corridorData, isBlocked, showSarHeatmap, showBypass, sarGeoJsonData, onSelectNode]);

  // Zoom controls
  const handleZoom = (delta: number) => {
    if (!mapRef.current) return;
    mapRef.current.setZoom(mapRef.current.getZoom() + delta);
  };

  const handleResetView = () => {
    if (!mapRef.current) return;
    mapRef.current.flyTo(corridorData.center, corridorData.zoom, { duration: 1.0 });
  };

  return (
    <div className="relative w-full h-full min-h-[560px] bg-slate-100/60 rounded-2xl overflow-hidden flex flex-col select-none">
      
      {/* Top Floating Glass HUD Bar */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex items-center justify-between gap-2 pointer-events-none">
        
        {/* Left Status HUD */}
        <div className="bg-white/85 border border-slate-200/80 rounded-xl px-3 py-2 flex items-center gap-3 text-xs font-mono pointer-events-auto shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-700 animate-pulse"></span>
            <span className="font-bold text-slate-900">{corridorData.id}</span>
            <span className="text-slate-500 text-[11px]">({corridorData.state})</span>
          </div>

          <span className="text-slate-300">|</span>

          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="text-slate-500">Passability:</span>
            {isBlocked ? (
              <span className="text-red-600 font-bold flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> SEVERED
              </span>
            ) : (
              <span className="text-emerald-600 font-bold">CONTROLLED OPEN</span>
            )}
          </div>

          <span className="text-slate-300 hidden sm:inline">|</span>

          <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-500">
            <span>Center:</span>
            <span className="text-slate-700 font-semibold">{corridorData.center[0].toFixed(2)}°N, {corridorData.center[1].toFixed(2)}°E</span>
          </div>
        </div>

        {/* Right Layer & Satellite Switcher */}
        <div className="bg-white/85 border border-slate-200/80 rounded-xl p-1 flex items-center gap-1 pointer-events-auto shadow-lg backdrop-blur-md text-xs font-mono">
          {(['terrain', 'satellite', 'dark'] as TileLayer[]).map((tile) => (
            <button
              key={tile}
              onClick={() => setActiveTile(tile)}
              className={`px-2.5 py-1 rounded-lg uppercase text-[10px] font-bold transition-all ${
                activeTile === tile
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tile}
            </button>
          ))}
        </div>

      </div>

      {/* Leaflet Map Canvas Container */}
      <div ref={mapContainerRef} className="w-full h-full flex-1 z-0" />

      {/* Bottom Map Controls Overlay */}
      <div className="absolute bottom-3 left-3 z-[400] flex items-center gap-2 bg-white/85 border border-slate-200/80 rounded-xl p-1.5 text-xs font-sans shadow-lg backdrop-blur-md">
        
        {/* Toggle SAR */}
        <button
          onClick={() => setShowSarHeatmap(!showSarHeatmap)}
          className={`px-3 py-1.5 rounded-lg text-[11px] flex items-center gap-1.5 font-bold transition-all ${
            showSarHeatmap
              ? 'bg-red-50 text-red-700 border border-red-200 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          {showSarHeatmap ? <Eye className="w-3.5 h-3.5 text-red-600" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>SAR InSAR Polygons</span>
        </button>

        {/* Toggle Tactical Bypass */}
        <button
          onClick={() => setShowBypass(!showBypass)}
          className={`px-3 py-1.5 rounded-lg text-[11px] flex items-center gap-1.5 font-bold transition-all ${
            showBypass
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          {showBypass ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>Tactical Convoy Bypass</span>
        </button>

        {/* Reset View */}
        <button
          onClick={handleResetView}
          className="px-2.5 py-1.5 rounded-lg text-[11px] text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center gap-1 transition-all"
          title="Reset Corridor View"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
          <button
            onClick={() => handleZoom(1)}
            className="w-6 h-6 rounded-md text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleZoom(-1)}
            className="w-6 h-6 rounded-md text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
};
