'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Layers, ZoomIn, ZoomOut, Compass, MapPin, AlertTriangle, RefreshCw } from 'lucide-react';
import { CORRIDORS_DATA, HighwayNode } from '@/lib/corridors';

interface InteractiveMapProps {
  corridorId: string;
  isBlocked: boolean;
  onSelectNode?: (nodeName: string) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  corridorId,
  isBlocked,
  onSelectNode,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layersGroupRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);

  const [activeTileType, setActiveTileType] = useState<'dark' | 'satellite' | 'topo'>('dark');
  const [isMapReady, setIsMapReady] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<string | null>('NH-10 Ranipool Sector');

  // Tile sources
  const tileSources = {
    dark: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
      maxZoom: 18,
      maxNativeZoom: 16,
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      maxZoom: 18,
    },
    topo: {
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)',
      maxZoom: 17,
    },
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let isMounted = true;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      if (!isMounted || !mapContainerRef.current) return;

      // Clean up previous instance if any
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Initial center: Northeast India - Sikkim NH-10 corridor
      const map = L.map(mapContainerRef.current, {
        center: [27.18, 88.52],
        zoom: 11,
        zoomControl: false,
        attributionControl: false,
      });

      // Set base dark tiles
      const currentTile = tileSources[activeTileType];
      tileLayerRef.current = L.tileLayer(currentTile.url, {
        maxZoom: currentTile.maxZoom,
        maxNativeZoom: (currentTile as any).maxNativeZoom,
      }).addTo(map);

      // Create feature group for all overlays
      layersGroupRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
      setIsMapReady(true);
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Base Layer when user switches tile type
  useEffect(() => {
    if (!mapInstanceRef.current || typeof window === 'undefined') return;

    const updateTile = async () => {
      const L = (await import('leaflet')).default;
      if (tileLayerRef.current) {
        mapInstanceRef.current.removeLayer(tileLayerRef.current);
      }
      const newSource = tileSources[activeTileType];
      tileLayerRef.current = L.tileLayer(newSource.url, {
        maxZoom: newSource.maxZoom,
        maxNativeZoom: (newSource as any).maxNativeZoom,
      }).addTo(mapInstanceRef.current);
    };

    updateTile();
  }, [activeTileType]);

  // Render Spatial Overlays: Highways, SAR heatmaps, InSAR deformation zones, and Towns
  useEffect(() => {
    if (!mapInstanceRef.current || !layersGroupRef.current || typeof window === 'undefined') return;

    const renderOverlays = async () => {
      const L = (await import('leaflet')).default;
      const group = layersGroupRef.current;
      group.clearLayers();

      // 1. DYNAMIC SAR GROUND DEFORMATION HEATMAPS (Colored gradients along mountain valleys)
      // Teesta River Gorge Valley deformation polygons (InSAR line-of-sight velocity > 18 mm/yr)
      const sarDeformationZones = [
        // Critical zone: 29th Mile / KM 29.4
        {
          coords: [
            [27.085, 88.465],
            [27.098, 88.485],
            [27.089, 88.502],
            [27.072, 88.481],
          ],
          color: '#ef4444', // Bright Red
          fillOpacity: 0.65,
          label: 'CRITICAL SAR DEFORMATION: -24.8 mm/yr (KM 29.4)',
        },
        // High risk zone: Pagla Pahar
        {
          coords: [
            [27.145, 88.515],
            [27.162, 88.535],
            [27.151, 88.549],
            [27.135, 88.528],
          ],
          color: '#f97316', // Amber Orange
          fillOpacity: 0.55,
          label: 'HIGH IN-SAR SLUMPING: -14.2 mm/yr (Singtam)',
        },
        // Moderate zone: Ranipool slopes
        {
          coords: [
            [27.280, 88.580],
            [27.305, 88.602],
            [27.295, 88.618],
            [27.271, 88.595],
          ],
          color: '#eab308', // Amber / Yellow
          fillOpacity: 0.45,
          label: 'MODERATE SUBSIDENCE: -8.1 mm/yr (Ranipool)',
        },
        // Low deformation baseline: Stable lower ridge
        {
          coords: [
            [26.910, 88.450],
            [26.940, 88.480],
            [26.920, 88.505],
            [26.890, 88.475],
          ],
          color: '#22c55e', // Green
          fillOpacity: 0.35,
          label: 'STABLE BASELINE: < 2 mm/yr (Sevoke Corridor)',
        },
      ];

      sarDeformationZones.forEach((zone) => {
        const poly = L.polygon(zone.coords as [number, number][], {
          color: zone.color,
          weight: 2,
          fillColor: zone.color,
          fillOpacity: zone.fillOpacity,
          dashArray: '4, 4',
        }).addTo(group);

        poly.bindPopup(`
          <div class="p-1 text-xs">
            <strong class="text-rose-400 block font-mono">${zone.label}</strong>
            <p class="text-slate-300 mt-1">Sentinel-1 & NISAR Differential Interferogram Coherence: 0.89</p>
          </div>
        `);
      });

      // 2. HIGHWAY VECTORS
      // NH-10 Vector (Siliguri -> Sevoke -> Teesta -> Ranipool -> Gangtok)
      const nh10Coords: [number, number][] = [
        [26.727, 88.395], // Siliguri
        [26.883, 88.466], // Sevoke
        [27.050, 88.445], // Teesta Bazaar
        [27.085, 88.475], // 29th Mile
        [27.150, 88.520], // Singtam
        [27.294, 88.591], // Ranipool
        [27.338, 88.606], // Gangtok
      ];

      // Highway line
      L.polyline(nh10Coords, {
        color: '#facc15', // Vibrant Yellow
        weight: 4,
        opacity: 0.9,
      }).addTo(group).bindPopup('<b style="color:#facc15">NH-10 LIFELINE CORRIDOR (Siliguri - Gangtok)</b>');

      // Blocked Highway Section (KM 29.4) if blocked
      if (isBlocked) {
        const blockedSegment: [number, number][] = [
          [27.070, 88.460],
          [27.085, 88.475],
          [27.100, 88.490],
        ];

        L.polyline(blockedSegment, {
          color: '#ef4444', // Red
          weight: 8,
          opacity: 1,
          dashArray: '8, 6',
        }).addTo(group).bindPopup('<b style="color:#ef4444">CRITICAL: NH-10 KM 29.4 SEVERED BY DEBRIS RUNOUT</b>');

        // Pulsing Circle Marker at failure point
        const pulseIcon = L.divIcon({
          className: 'custom-pulse-icon',
          html: `
            <div class="relative flex items-center justify-center w-8 h-8">
              <div class="absolute w-8 h-8 bg-red-600 rounded-full animate-ping opacity-75"></div>
              <div class="relative w-4 h-4 bg-red-600 border-2 border-white rounded-full flex items-center justify-center shadow-lg"></div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        L.marker([27.085, 88.475], { icon: pulseIcon })
          .addTo(group)
          .bindPopup('<b>🚨 FAILURE POINT: KM 29.4 Teesta Chokepoint</b>');
      }

      // Safe Alternate Bypass Route: Lava -> Algarah -> Kalimpong -> Gangtok
      const bypassCoords: [number, number][] = [
        [26.883, 88.466], // Sevoke junction
        [26.980, 88.580], // Gorubathan
        [27.080, 88.660], // Lava
        [27.110, 88.580], // Algarah
        [27.059, 88.469], // Kalimpong
        [27.150, 88.520], // Rejoin Singtam
        [27.338, 88.606], // Gangtok
      ];

      L.polyline(bypassCoords, {
        color: '#10b981', // Emerald Green
        weight: 3.5,
        opacity: 0.85,
        dashArray: '6, 6',
      }).addTo(group).bindPopup('<b style="color:#10b981">CLEARANCE: Lava - Algarah - Kalimpong Tactical Convoy Bypass</b>');

      // NH-29 & NH-6 regional feeder lines for context
      const nh29Coords: [number, number][] = [
        [26.910, 89.100],
        [26.820, 89.300],
        [26.700, 89.500],
      ];
      L.polyline(nh29Coords, {
        color: '#fbbf24',
        weight: 2.5,
        opacity: 0.7,
      }).addTo(group);

      // 3. TOWNS & KEY HUBS
      const towns = [
        { name: 'Gangtok', coords: [27.3389, 88.6065], isCapital: true },
        { name: 'Ranipool', coords: [27.2941, 88.5912], isCapital: false },
        { name: 'Singtam', coords: [27.1500, 88.5200], isCapital: false },
        { name: 'Kalimpong', coords: [27.0594, 88.4695], isCapital: false },
        { name: 'Siliguri', coords: [26.7271, 88.3953], isCapital: false },
      ];

      towns.forEach((town) => {
        const townIcon = L.divIcon({
          className: 'town-marker',
          html: `
            <div class="flex items-center gap-1 cursor-pointer bg-slate-950/80 backdrop-blur-md px-1.5 py-0.5 rounded border border-slate-700 shadow-md">
              <div class="w-2 h-2 rounded-full ${town.isCapital ? 'bg-cyan-400 ring-2 ring-cyan-500/50' : 'bg-slate-300'}"></div>
              <span class="text-[10px] font-mono font-bold text-slate-200">${town.name}</span>
            </div>
          `,
          iconSize: [70, 20],
          iconAnchor: [35, 10],
        });

        L.marker(town.coords as [number, number], { icon: townIcon })
          .addTo(group)
          .on('click', () => {
            setSelectedFeature(town.name);
            onSelectNode?.(town.name);
          });
      });

      // 4. FLAGGED SLOPES (Warning Flags 🚩)
      const flaggedSlopes = [
        { name: 'Slope FL-12 (Ranipool North)', coords: [27.302, 88.596], risk: 'CRITICAL' },
        { name: 'Slope FL-29 (29th Mile Escarpment)', coords: [27.085, 88.475], risk: 'CRITICAL' },
        { name: 'Slope FL-08 (Sevoke Cutting)', coords: [26.892, 88.472], risk: 'MODERATE' },
      ];

      flaggedSlopes.forEach((slope) => {
        const flagIcon = L.divIcon({
          className: 'flag-marker',
          html: `
            <div class="flex items-center justify-center w-6 h-6 rounded-full bg-red-950/90 border border-red-500 text-xs text-red-300 shadow-lg cursor-pointer hover:scale-110 transition-transform">
              🚩
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        L.marker(slope.coords as [number, number], { icon: flagIcon })
          .addTo(group)
          .bindPopup(`
            <div class="text-xs">
              <strong class="text-red-400">${slope.name}</strong>
              <p class="text-slate-300 mt-0.5">Risk Tier: <span class="font-bold text-red-500">${slope.risk}</span></p>
              <p class="text-slate-400 text-[10px]">PINN Mohr-Coulomb Factor of Safety: 0.88</p>
            </div>
          `);
      });
    };

    renderOverlays();
  }, [corridorId, isBlocked, onSelectNode]);

  // Zoom helpers
  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([27.18, 88.52], 11);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[460px] bg-slate-950 flex flex-col rounded-lg overflow-hidden border border-slate-700/80 shadow-2xl">
      {/* Header with constraint tags */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900/95 border-b border-slate-700/80 z-10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <h3 className="text-xs font-mono font-bold tracking-wider text-slate-100 uppercase">
            DETAILED GIS MAP <span className="text-slate-400 text-[10px] font-normal">(Constraints d/b)</span>
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/70 border border-blue-600/40 text-blue-400">
            ESRI SATELLITE + InSAR SAR DEFORMATION
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <Compass className="w-3 h-3 text-cyan-400" />
            27.18°N, 88.52°E
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400 font-semibold">COHERENCE: 94.2%</span>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative flex-1 w-full h-full min-h-[380px]">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Top-Left Floating Translucent Legend Box */}
        <div className="absolute top-3 left-3 z-20 bg-slate-900/85 backdrop-blur-md border border-slate-700/80 rounded-lg p-2.5 shadow-2xl max-w-[210px] text-[11px] select-none pointer-events-auto">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-300 font-bold border-b border-slate-700/60 pb-1 mb-1.5 flex items-center justify-between">
            <span>Spatial Legend</span>
            <span className="text-cyan-400 text-[9px]">SAR 10m</span>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-red-500 border border-red-400 flex-shrink-0"></span>
              <span className="text-slate-200 font-medium">High Risk (FS &lt; 1.0)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-amber-500 border border-amber-400 flex-shrink-0"></span>
              <span className="text-slate-300">Moderate (FS 1.0 - 1.2)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-emerald-500 border border-emerald-400 flex-shrink-0"></span>
              <span className="text-slate-400">Low (FS &gt; 1.2)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-1 rounded bg-yellow-400 flex-shrink-0"></span>
              <span className="text-slate-300">Road Network (NH)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-1 rounded bg-emerald-400 border-t border-dashed border-white flex-shrink-0"></span>
              <span className="text-slate-300">Safe Convoy Bypass</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs">🚩</span>
              <span className="text-slate-300">Flagged Slopes</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 flex-shrink-0"></span>
              <span className="text-slate-300">Towns (Gangtok, Ranipool)</span>
            </div>
          </div>
        </div>

        {/* Bottom-Right Floating Map Controls */}
        <div className="absolute bottom-3 right-3 z-20 flex flex-col gap-1.5 bg-slate-900/85 backdrop-blur-md border border-slate-700/80 p-1.5 rounded-lg shadow-2xl">
          {/* Layer Switcher */}
          <div className="flex items-center gap-1 bg-slate-950/60 p-0.5 rounded border border-slate-800">
            <button
              onClick={() => setActiveTileType('dark')}
              title="Dark Mode (Default) - Esri Dark Gray"
              className={`px-2 py-1 text-[10px] font-mono rounded transition-colors ${
                activeTileType === 'dark'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              DARK (DEFAULT)
            </button>
            <button
              onClick={() => setActiveTileType('satellite')}
              title="Esri Satellite Basemap"
              className={`px-2 py-1 text-[10px] font-mono rounded transition-colors ${
                activeTileType === 'satellite'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              SATELLITE
            </button>
            <button
              onClick={() => setActiveTileType('topo')}
              title="OpenTopoMap Topographic Basemap"
              className={`px-2 py-1 text-[10px] font-mono rounded transition-colors ${
                activeTileType === 'topo'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              TERRAIN
            </button>
          </div>

          <div className="flex items-center justify-between gap-1 mt-0.5">
            <button
              onClick={handleZoomIn}
              className="flex-1 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded flex items-center justify-center text-xs font-bold transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomOut}
              className="flex-1 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded flex items-center justify-center text-xs font-bold transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetView}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded flex items-center justify-center text-xs transition-colors"
              title="Reset View to NH-10 Corridor"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
