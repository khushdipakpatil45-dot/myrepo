'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  MapPin, 
  Radio, 
  Camera, 
  Clock, 
  RotateCcw, 
  Download, 
  CloudRain, 
  CloudLightning, 
  Droplets, 
  Wind, 
  ChevronDown, 
  Flame, 
  ArrowLeft,
  Film,
  Satellite,
  Activity
} from 'lucide-react';
import { useHazardStore } from '@/stores/useHazardStore';
import { subscribeToHazardEvents } from '@/lib/supabase';
import { CORRIDORS_DATA } from '@/lib/corridors';
import { GoogleMapsGis } from '@/components/gis/GoogleMapsGis';
import { SnapAndVerify } from '@/components/field/SnapAndVerify';
import { PredictiveChart } from '@/components/analytics/PredictiveChart';
import { 
  fetchLiveWeather, 
  fetchCorridorStatus, 
  fetchSarStatus, 
  evaluateHazard, 
  fetchAlertsHistory, 
  fetchFieldReports,
  CorridorStatusResponse,
  SarStatusResponse,
  BACKEND_URL
} from '@/lib/api';
import s from './CommandCenter.module.css';

// ─── Interfaces ─────────────────────────────────────────────────────────────

interface AlertItem {
  id: string;
  tier: string;
  district: string;
  corridor: string;
  location: string;
  timestamp: string;
  summary: string;
  dialects: string[];
  channels: string[];
}

interface FieldReportItem {
  report_id: string;
  client_uuid: string;
  reporter_name: string;
  reporter_phone: string;
  corridor_id: string;
  location_name: string;
  latitude: number;
  longitude: number;
  compass_azimuth: number;
  slope_tilt: number;
  hazard_type: string;
  severity: string;
  notes: string;
  media_type: string;
  media_url: string;
  thumbnail_url: string;
  exif_verified: boolean;
  exif_metadata?: Record<string, string>;
  anti_spoofing_status: string;
  confidence_score: number;
  timestamp: string;
  created_at: string;
}

interface StationTelemetryItem {
  id: string;
  name: string;
  sector: string;
  status: 'Nominal' | 'Warning' | 'Critical';
  temp: string;
  wind: string;
  barometer: string;
  precip: string;
  feed: string;
  feedLag: 'nominal' | 'warning' | 'critical';
}

interface DistrictWeatherDisplay {
  district: string;
  label: string;
  rate: number;
  sat: number;
  alert: string;
}

// ─── Initial Mock Feeds (Resilient Fallbacks) ────────────────────────────────

const INITIAL_WEATHER_FEED: DistrictWeatherDisplay[] = [
  { district: 'Dima Hasao', label: 'Dima Hasao', rate: 48.5, sat: 91.2, alert: 'RED_WARNING' },
  { district: 'East Khasi Hills', label: 'East Khasi', rate: 62.0, sat: 94.8, alert: 'RED_WARNING' },
  { district: 'North Sikkim', label: 'N. Sikkim', rate: 38.0, sat: 89.5, alert: 'ORANGE_ALERT' },
  { district: 'Aizawl', label: 'Aizawl', rate: 32.5, sat: 86.4, alert: 'ORANGE_ALERT' },
];

const INITIAL_ALERTS: AlertItem[] = [
  {
    id: 'ALT-2026-0891',
    tier: 'CRITICAL',
    district: 'Dima Hasao',
    corridor: 'NH-27',
    location: 'Haflong Hill Cut (KM 112)',
    timestamp: '10:45 IST',
    summary: 'Debris flow imminent. Pore pressure > 60 kPa. Evacuate lower valley rail alignment immediately.',
    dialects: ['Assamese', 'Dimasa', 'Hindi'],
    channels: ['IVRS Auto-Dial', 'SMS Broadcast', 'CAP Siren Gateway']
  },
  {
    id: 'ALT-2026-0892',
    tier: 'CRITICAL',
    district: 'Kalimpong',
    corridor: 'NH-10',
    location: '29th Mile Escarpment (KM 29.4)',
    timestamp: '10:30 IST',
    summary: 'Rapid InSAR creep acceleration detected (18 mm/hr). Rockfall barrier collapse probable within 4 hours.',
    dialects: ['Nepali', 'Bengali', 'Hindi'],
    channels: ['VHF Radio Ch 4', 'BRO Tactical Dispatch', 'SDMA Dashboard']
  },
  {
    id: 'ALT-2026-0893',
    tier: 'HIGH',
    district: 'North Sikkim',
    corridor: 'NH-310A',
    location: 'Chungthang Headwaters',
    timestamp: '09:50 IST',
    summary: 'Precipitation 38 mm/h exceeding saturation threshold. Tension cracks expanding at culvert #4.',
    dialects: ['Lepcha', 'Bhutia', 'Nepali'],
    channels: ['IVRS Auto-Dial', 'Local Admin SMS']
  },
  {
    id: 'ALT-2026-0894',
    tier: 'HIGH',
    district: 'East Jaintia Hills',
    corridor: 'NH-06',
    location: 'Sonapur Tunnel Bypass Ridge',
    timestamp: '09:15 IST',
    summary: 'Pore pressure spike 42 kPa following cloudburst. Heavy convoy movement temporarily halted.',
    dialects: ['Khasi', 'Pnar', 'English'],
    channels: ['SMS Broadcast', 'Police Checkpost V-SAT']
  },
  {
    id: 'ALT-2026-0895',
    tier: 'MODERATE',
    district: 'Kohima',
    corridor: 'NH-29',
    location: 'Dzüdza River Valley Cut',
    timestamp: '08:40 IST',
    summary: 'Cut-slope surface erosion active. Single-lane movement permitted under speed restriction.',
    dialects: ['Angami', 'Nagamese', 'English'],
    channels: ['SDMA Traffic Advisory', 'SMS Push']
  }
];

const INITIAL_FIELD_REPORTS: FieldReportItem[] = [
  {
    report_id: 'rep-ner-001',
    client_uuid: 'cl-001',
    reporter_name: 'Subedar R. K. Thapa',
    reporter_phone: '+91-94360-44556',
    corridor_id: 'NH-10',
    location_name: 'Birik Dara Slip (Sevoke)',
    latitude: 26.8821,
    longitude: 88.4315,
    compass_azimuth: 142.5,
    slope_tilt: 52.0,
    hazard_type: 'DEBRIS_FLOW',
    severity: 'CRITICAL',
    notes: 'Crown scarp widened by 40cm. Water discharge muddy with high silt volume.',
    media_type: 'image',
    media_url: '/uploads/seed_birik.jpg',
    thumbnail_url: '/uploads/seed_birik.jpg',
    exif_verified: true,
    exif_metadata: { camera: 'Samsung SM-G998B', geotag_integrity: 'HARDWARE_STAMPED_MATCH' },
    anti_spoofing_status: 'VALID',
    confidence_score: 0.99,
    timestamp: '10:45 IST',
    created_at: '2026-09-11T05:15:00Z'
  },
  {
    report_id: 'rep-ner-002',
    client_uuid: 'cl-002',
    reporter_name: 'Tashi BRO Officer',
    reporter_phone: '+91-94350-11223',
    corridor_id: 'NH-10',
    location_name: '29th Mile Escarpment',
    latitude: 26.9851,
    longitude: 88.4612,
    compass_azimuth: 184.0,
    slope_tilt: 46.5,
    hazard_type: 'ROCKFALL',
    severity: 'CRITICAL',
    notes: 'Talus scree sliding onto road shoulder. Rockfall barrier breached.',
    media_type: 'image',
    media_url: '/uploads/seed_29mile.jpg',
    thumbnail_url: '/uploads/seed_29mile.jpg',
    exif_verified: true,
    exif_metadata: { camera: 'Garmin GPSCam Pro', geotag_integrity: 'HARDWARE_STAMPED_MATCH' },
    anti_spoofing_status: 'VALID',
    confidence_score: 0.98,
    timestamp: '10:12 IST',
    created_at: '2026-09-11T04:42:00Z'
  },
  {
    report_id: 'rep-ner-003',
    client_uuid: 'cl-003',
    reporter_name: 'Lalthanga SDRF Scout',
    reporter_phone: '+91-98623-77889',
    corridor_id: 'NH-27',
    location_name: 'Haflong Hill Cut (Dima Hasao)',
    latitude: 25.1682,
    longitude: 93.0298,
    compass_azimuth: 210.0,
    slope_tilt: 44.0,
    hazard_type: 'MUD_FLOW',
    severity: 'CRITICAL',
    notes: 'Rotational mudflow active near Jatinga valley railway alignment.',
    media_type: 'video',
    media_url: '/uploads/seed_haflong.mp4',
    thumbnail_url: '/uploads/seed_haflong_thumb.jpg',
    exif_verified: true,
    exif_metadata: { video_codec: 'H.264 / MP4', geotag_integrity: 'CELLULAR_TRIANGULATION_VERIFIED' },
    anti_spoofing_status: 'VALID',
    confidence_score: 0.94,
    timestamp: '09:50 IST',
    created_at: '2026-09-11T04:20:00Z'
  },
  {
    report_id: 'rep-ner-004',
    client_uuid: 'cl-004',
    reporter_name: 'Pema Citizen',
    reporter_phone: '+91-94361-99887',
    corridor_id: 'NH-310A',
    location_name: 'Chungthang Headwaters',
    latitude: 27.6040,
    longitude: 88.6470,
    compass_azimuth: 175.0,
    slope_tilt: 48.0,
    hazard_type: 'TENSION_CRACK',
    severity: 'HIGH',
    notes: 'Turbid seepage observed at culvert base and 8cm fissure.',
    media_type: 'image',
    media_url: '/uploads/seed_chungthang.jpg',
    thumbnail_url: '/uploads/seed_chungthang.jpg',
    exif_verified: true,
    exif_metadata: { camera: 'iPhone 14 Pro', geotag_integrity: 'HARDWARE_STAMPED_MATCH' },
    anti_spoofing_status: 'VALID',
    confidence_score: 0.95,
    timestamp: '09:30 IST',
    created_at: '2026-09-11T04:00:00Z'
  }
];

const SURFACE_OBSERVATIONS: StationTelemetryItem[] = [
  { id: 'MET-44028', name: 'North Ridge Cut Escarpment', sector: 'NH-10 Sevoke-Gangtok', status: 'Nominal', temp: '17.8 °C', wind: '24 kts NW (G 32)', barometer: '1011.2 hPa', precip: '6.4 mm', feed: 'GTS-SYNC: 4s', feedLag: 'nominal' },
  { id: 'TB-08012', name: 'Teesta Basin Hydro-Station', sector: 'Teesta Stage V Headwaters', status: 'Warning', temp: '19.4 °C', wind: '18 kts N (G 28)', barometer: '1008.5 hPa', precip: '14.8 mm', feed: 'IRIDIUM LAG: 2m', feedLag: 'warning' },
  { id: 'HF-14002', name: 'Haflong Hill Cut Met Mast', sector: 'NH-27 Dima Hasao', status: 'Critical', temp: '22.1 °C', wind: '34 kts SE (G 46)', barometer: '996.4 hPa', precip: '48.5 mm', feed: 'CELL-SYNC: 1s', feedLag: 'nominal' },
  { id: 'SK-02045', name: 'Chungthang Headwaters Tower', sector: 'NH-310A North Sikkim', status: 'Nominal', temp: '4.6 °C', wind: '36 kts W (G 51)', barometer: '812.4 hPa', precip: '1.2 mm (Frozen)', feed: 'GTS-SYNC: 1s', feedLag: 'nominal' },
  { id: 'ML-05019', name: 'Sonapur Tunnel Weather Radar', sector: 'NH-06 Jaintia Hills', status: 'Warning', temp: '21.0 °C', wind: '22 kts NE (G 30)', barometer: '1002.8 hPa', precip: '26.0 mm', feed: 'UHF-SYNC: 8s', feedLag: 'nominal' },
  { id: 'NL-09033', name: 'Kohima Saddle Automatic Met', sector: 'NH-29 Nagaland Spine', status: 'Nominal', temp: '16.5 °C', wind: '14 kts E (G 20)', barometer: '890.2 hPa', precip: '8.2 mm', feed: 'GTS-SYNC: 3s', feedLag: 'nominal' },
  { id: 'MZ-03011', name: 'Aizawl South Fault Observatory', sector: 'NH-02 Mizoram Ridge', status: 'Nominal', temp: '20.5 °C', wind: '12 kts S (G 18)', barometer: '924.6 hPa', precip: '5.0 mm', feed: 'GTS-SYNC: 2s', feedLag: 'nominal' },
  { id: 'AR-07088', name: 'Bomdila Pass Met Observatory', sector: 'NH-13 Tawang Corridor', status: 'Nominal', temp: '8.2 °C', wind: '28 kts WNW (G 42)', barometer: '745.0 hPa', precip: '3.6 mm', feed: 'SAT-SYNC: 5s', feedLag: 'nominal' },
];

// ─── Component ──────────────────────────────────────────────────────────────

export default function CommandCenter() {
  const { 
    selectedCorridor, 
    setSelectedCorridor, 
    updateCriticalCount,
    blockedRoadSegments,
    addBlockedSegment
  } = useHazardStore();

  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'GIS MAP' | 'FIELD SYNC' | 'ALERTS' | 'RESOURCES'>('DASHBOARD');
  const [currentTime, setCurrentTime] = useState('11 SEP 2026 | 09:30 IST');
  const [isSimulatingStorm, setIsSimulatingStorm] = useState(false);
  const [isSnapModalOpen, setIsSnapModalOpen] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const [alertsCount, setAlertsCount] = useState(5);

  const [alertsLog, setAlertsLog] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [fieldReports, setFieldReports] = useState<FieldReportItem[]>(INITIAL_FIELD_REPORTS);
  const [weatherDistricts, setWeatherDistricts] = useState<DistrictWeatherDisplay[]>(INITIAL_WEATHER_FEED);
  const [corridorStatus, setCorridorStatus] = useState<CorridorStatusResponse | null>(null);
  const [sarStatus, setSarStatus] = useState<SarStatusResponse | null>(null);

  const activeCorridorData = CORRIDORS_DATA[selectedCorridor] || CORRIDORS_DATA['NH-10'];
  const isHighwayBlocked = blockedRoadSegments.includes(selectedCorridor) || isSimulatingStorm || corridorStatus?.status === 'CRITICAL_SEVERANCE';

  // Clock ticker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }).toUpperCase();
      const timeStr = now.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      setCurrentTime(`${dateStr} | ${timeStr} IST`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch initial feeds & live telemetry from backend API
  useEffect(() => {
    let alive = true;

    const loadAllBackendFeeds = async () => {
      try {
        const [alertsData, reportsData, weatherData, sarData] = await Promise.all([
          fetchAlertsHistory(),
          fetchFieldReports(),
          fetchLiveWeather(),
          fetchSarStatus(),
        ]);

        if (!alive) return;

        if (Array.isArray(alertsData) && alertsData.length > 0) {
          setAlertsLog(alertsData as AlertItem[]);
          setAlertsCount(alertsData.length);
        }

        if (Array.isArray(reportsData) && reportsData.length > 0) {
          setFieldReports(reportsData as FieldReportItem[]);
        }

        if (weatherData && weatherData.districts && weatherData.districts.length > 0) {
          const mapped = weatherData.districts.slice(0, 4).map((d) => ({
            district: d.district,
            label: d.district === 'East Khasi Hills' ? 'East Khasi' : d.district === 'North Sikkim' ? 'N. Sikkim' : d.district,
            rate: d.rainfall_rate_mm_hr,
            sat: d.soil_saturation_pct,
            alert: d.alert_level
          }));
          setWeatherDistricts(mapped);
        }

        if (sarData) {
          setSarStatus(sarData);
        }
      } catch {
        // Retain initial pre-seeded data on offline mode
      }
    };

    loadAllBackendFeeds();

    // Poll live weather every 30s
    const weatherTimer = setInterval(async () => {
      const w = await fetchLiveWeather();
      if (w && w.districts && alive) {
        const mapped = w.districts.slice(0, 4).map((d) => ({
          district: d.district,
          label: d.district === 'East Khasi Hills' ? 'East Khasi' : d.district === 'North Sikkim' ? 'N. Sikkim' : d.district,
          rate: d.rainfall_rate_mm_hr,
          sat: d.soil_saturation_pct,
          alert: d.alert_level
        }));
        setWeatherDistricts(mapped);
      }
    }, 30000);

    return () => {
      alive = false;
      clearInterval(weatherTimer);
    };
  }, []);

  // Update corridor status & PINN hazard evaluation dynamically when corridor changes
  useEffect(() => {
    let alive = true;

    const syncCorridor = async () => {
      try {
        const [statusData] = await Promise.all([
          fetchCorridorStatus(selectedCorridor),
          evaluateHazard(selectedCorridor, true),
        ]);

        if (alive && statusData) {
          setCorridorStatus(statusData);
          if (statusData.status === 'CRITICAL_SEVERANCE') {
            addBlockedSegment(selectedCorridor);
          }
        }
      } catch {
        // Offline resilience fallback
      }
    };

    syncCorridor();

    return () => {
      alive = false;
    };
  }, [selectedCorridor, addBlockedSegment]);

  // Supabase Realtime CDC subscription
  useEffect(() => {
    const unsubscribe = subscribeToHazardEvents(
      selectedCorridor,
      () => {
        updateCriticalCount((c) => c + 1);
        setAlertsCount((prev) => prev + 1);
      },
      (cutoff) => {
        addBlockedSegment(cutoff.segment_name);
      }
    );
    return unsubscribe;
  }, [selectedCorridor, updateCriticalCount, addBlockedSegment]);

  // Handlers
  const handleToggleStormSimulation = async () => {
    if (!isSimulatingStorm) {
      setIsSimulatingStorm(true);
      addBlockedSegment(selectedCorridor);
      try {
        await fetch(`${BACKEND_URL}/api/v1/simulation/storm-surge`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ corridor_id: selectedCorridor, intensity: 1.8 })
        });
      } catch {
        // Offline resilience fallback
      }
    } else {
      setIsSimulatingStorm(false);
    }
  };

  const handleExportBypassGeoJSON = () => {
    const geojson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            name: activeCorridorData.bypass.name,
            corridor: selectedCorridor,
            distance_km: activeCorridorData.bypass.distanceKm,
            clearance: 'MILITARY_CONVOY_CLEARED'
          },
          geometry: {
            type: 'LineString',
            coordinates: activeCorridorData.bypass.coordinates
          }
        }
      ]
    };

    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `terracast_bypass_${selectedCorridor.toLowerCase()}_route.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportAlertsCSV = () => {
    const headers = ['Alert ID', 'Tier', 'District', 'Corridor', 'Location', 'Timestamp', 'Summary', 'Channels'];
    const rows = alertsLog.map((a) => [
      a.id,
      a.tier,
      a.district,
      a.corridor,
      `"${a.location.replace(/"/g, '""')}"`,
      a.timestamp,
      `"${a.summary.replace(/"/g, '""')}"`,
      `"${a.channels.join(', ')}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `terracast_alerts_register_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportTelemetryCSV = () => {
    const headers = ['Station ID', 'Station Name', 'Sector', 'Status', 'Surface Temp', 'Wind Vector', 'Barometer', 'Precip 1h', 'Feed'];
    const rows = SURFACE_OBSERVATIONS.map((sObs) => [
      sObs.id,
      `"${sObs.name.replace(/"/g, '""')}"`,
      `"${sObs.sector.replace(/"/g, '""')}"`,
      sObs.status,
      sObs.temp,
      `"${sObs.wind.replace(/"/g, '""')}"`,
      sObs.barometer,
      sObs.precip,
      sObs.feed
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `terracast_meteorological_telemetry_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleNewReportSubmitted = (newReport: FieldReportItem) => {
    setFieldReports((prev) => [newReport, ...prev]);
  };

  // ─── Render ───────────────────────────────────────────────────────────

  return (
    <div className={s.shell}>
      
      {/* ================================================================= */}
      {/* PERSISTENT FROSTED GLASS HEADER                                   */}
      {/* ================================================================= */}
      <header className={s.header}>
        
        {/* Left: Brand Emblem + Title */}
        <div className={s.headerLeft}>
          <div className={s.logoBox}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 3v18M3 12h18" />
            </svg>
          </div>
          <div>
            <div className={s.logoText}>TERRACAST-NER</div>
            <div className={s.headerSubtitle}>
              MDoNER PS-26001 • Atmospheric &amp; Geotechnical Early Warning Command
            </div>
          </div>
        </div>

        {/* Center: Navigation Tabs */}
        <nav className={s.nav}>
          {(['DASHBOARD', 'GIS MAP', 'FIELD SYNC', 'ALERTS', 'RESOURCES'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={activeTab === tab ? s.navTabActive : s.navTab}
            >
              {tab === 'RESOURCES' ? 'SURFACE TELEMETRY' : tab}
            </button>
          ))}
        </nav>

        {/* Right: Telemetry Live Pill + Alert Badge + Admin Sector */}
        <div className={s.headerRight}>
          <div className={s.telemetryNominal}>
            <span className={`${s.dotSm} ${s.dotGreen}`} />
            <span>WMO GTS LIVE</span>
          </div>

          <div className={s.alertsBadge}>
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{alertsCount} ALERTS</span>
          </div>

          <div style={{ position: 'relative' }}>
            <button onClick={() => setAdminDropdownOpen(!adminDropdownOpen)} className={s.adminBtn}>
              <span>👤</span>
              <span>NER HQ | Gangtok</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {adminDropdownOpen && (
              <div className={s.dropdown}>
                <div className={s.dropdownHeader}>
                  Command Agency: <strong style={{ color: 'var(--textNavyTitle)', display: 'block' }}>SDRF / NDRF NER Joint Cell</strong>
                </div>
                <div className={s.dropdownLabel}>Monitored Highway Sector</div>
                {Object.keys(CORRIDORS_DATA).map((cid) => (
                  <button
                    key={cid}
                    onClick={() => { setSelectedCorridor(cid); setAdminDropdownOpen(false); }}
                    className={selectedCorridor === cid ? s.dropdownItemActive : s.dropdownItem}
                  >
                    <span>{cid}</span>
                    <span className={s.textTiny} style={{ color: 'var(--textMuted)' }}>{CORRIDORS_DATA[cid].district}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

      </header>

      {/* ================================================================= */}
      {/* TAB: FIELD SYNC (full-screen view)                                 */}
      {/* ================================================================= */}
      {activeTab === 'FIELD SYNC' ? (
        <main className={s.tabView}>
          <div className={s.tabHeader}>
            <button onClick={() => setActiveTab('DASHBOARD')} className={s.backBtn}>
              <ArrowLeft className="w-4 h-4" />
              <span>← Back to Dashboard</span>
            </button>
            <span className={s.tabMeta}>
              Field Patrol Sync | Sector: <strong>{selectedCorridor} ({activeCorridorData.district})</strong>
            </span>
          </div>
          <SnapAndVerify
            isOpen={true}
            onClose={() => setActiveTab('DASHBOARD')}
            corridorId={selectedCorridor}
            onReportSubmitted={handleNewReportSubmitted}
            isFullScreenTab={true}
          />
        </main>

      ) : activeTab === 'GIS MAP' ? (
        /* ================================================================= */
        /* TAB: GIS MAP (full-screen view)                                   */
        /* ================================================================= */
        <main className={s.tabViewWide}>
          <div className={s.tabHeader}>
            <button onClick={() => setActiveTab('DASHBOARD')} className={s.backBtn}>
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </button>
            <span className={s.tabMeta}>
              Full-Screen GIS Digital Twin | Corridor: <strong>{selectedCorridor}</strong>
            </span>
          </div>
          <div className={s.fullMapContainer}>
            <GoogleMapsGis corridorId={selectedCorridor} isBlocked={isHighwayBlocked} />
          </div>
        </main>

      ) : activeTab === 'ALERTS' ? (
        /* ================================================================= */
        /* TAB: ALERTS (Floating Translucent Glass Table)                    */
        /* ================================================================= */
        <main className={s.tabViewWide}>
          <div className={s.tabHeader}>
            <button onClick={() => setActiveTab('DASHBOARD')} className={s.backBtn}>
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </button>
            <span className={s.tabMeta}>
              CAP Early Warning Register | <strong>{alertsLog.length} Geofenced Dispatches Active</strong>
            </span>
          </div>

          <div className={s.tableContainer}>
            <div className={s.cardHeader} style={{ background: 'rgba(255, 255, 255, 0.45)', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--borderGlassDefault)' }}>
              <div>
                <h3 className={s.cardTitle}>
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                  MDoNER Multi-Hazard Early Warning Alert Feeds
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--textMuted)', marginTop: '3px' }}>
                  Live geofenced CAP alert broadcasts across North Eastern highway lifelines
                </p>
              </div>
              <button 
                onClick={handleExportAlertsCSV} 
                className={s.bypassExportBtn}
                style={{ padding: '6px 14px', background: 'var(--textBrandBlue)', color: '#fff', border: 'none' }}
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV Register
              </button>
            </div>

            <table className={s.glassTable}>
              <thead className={s.tableHead}>
                <tr>
                  <th>Alert ID &amp; Tier</th>
                  <th>District / Corridor</th>
                  <th>Hazard Coordinates &amp; Location</th>
                  <th>Intimation Summary</th>
                  <th>Linguistic Dialects</th>
                  <th>Broadcast Gateway</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody className={s.tableBody}>
                {alertsLog.map((alert) => (
                  <tr key={alert.id}>
                    <td>
                      <span className={alert.tier === 'CRITICAL' ? s.badgeRed : s.badgeCyan}>
                        {alert.tier}
                      </span>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', marginTop: '4px', color: 'var(--textMuted)' }}>
                        {alert.id}
                      </div>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--textNavyTitle)' }}>
                      {alert.district} ({alert.corridor})
                    </td>
                    <td>{alert.location}</td>
                    <td style={{ maxWidth: '340px', lineHeight: 1.4 }}>{alert.summary}</td>
                    <td>
                      <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--textSecondary)' }}>
                        {alert.dialects.join(', ')}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--textBrandBlue)', fontWeight: 600 }}>
                        {alert.channels.join(' • ')}
                      </span>
                    </td>
                    <td data-telemetry>{alert.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>

      ) : activeTab === 'RESOURCES' ? (
        /* ================================================================= */
        /* TAB: RESOURCES / SURFACE TELEMETRY (Meteorological Template)      */
        /* ================================================================= */
        <main className={s.tabViewWide}>
          <div className={s.tabHeader}>
            <button onClick={() => setActiveTab('DASHBOARD')} className={s.backBtn}>
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </button>
            <span className={s.tabMeta}>
              Atmospheric &amp; Hydrological Observation Stations | <strong>WMO GTS Synchronized</strong>
            </span>
          </div>

          <div className={s.tableContainer}>
            <div className={s.cardHeader} style={{ background: 'rgba(255, 255, 255, 0.45)', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--borderGlassDefault)' }}>
              <div>
                <h3 className={s.cardTitle}>
                  <Radio className="w-4 h-4 text-blue-700" />
                  NER Ground Observation Telemetry &amp; Synoptic Monitoring Network
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--textMuted)', marginTop: '3px' }}>
                  Continuous synchronized automated ground station observations floating over synoptic backdrop
                </p>
              </div>
              <button 
                onClick={handleExportTelemetryCSV} 
                className={s.bypassExportBtn}
                style={{ padding: '6px 14px', background: 'var(--textBrandBlue)', color: '#fff', border: 'none' }}
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV Telemetry
              </button>
            </div>

            <table className={s.glassTable}>
              <thead className={s.tableHead}>
                <tr>
                  <th>Station ID &amp; Identifier</th>
                  <th>Operational Status</th>
                  <th>Surface Temp</th>
                  <th>Wind Vector</th>
                  <th>Barometer</th>
                  <th>Precip (1h)</th>
                  <th>Data Feed</th>
                </tr>
              </thead>
              <tbody className={s.tableBody}>
                {SURFACE_OBSERVATIONS.map((station) => (
                  <tr key={station.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--textNavyTitle)' }}>{station.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--textMuted)', fontFamily: 'var(--font-mono)' }}>{station.id} • {station.sector}</div>
                    </td>
                    <td>
                      <span className={station.status === 'Nominal' ? s.badgeEmerald : station.status === 'Warning' ? s.badgeCyan : s.badgeRed}>
                        {station.status}
                      </span>
                    </td>
                    <td data-telemetry>{station.temp}</td>
                    <td data-telemetry>{station.wind}</td>
                    <td data-telemetry>{station.barometer}</td>
                    <td data-telemetry>{station.precip}</td>
                    <td>
                      <span style={{ color: station.feedLag === 'nominal' ? '#2563eb' : '#d97706', fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600 }}>
                        {station.feed}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>

      ) : (
        /* ================================================================= */
        /* DASHBOARD: Vertical Hero Map + 3-Column Data Grid                 */
        /* ================================================================= */
        <main className={s.main}>

          {/* ── HERO: Full-Width GIS Map (56vh landscape) ──────────────── */}
          <div className={s.heroMap}>
            <GoogleMapsGis 
              corridorId={selectedCorridor} 
              isBlocked={isHighwayBlocked}
            />
          </div>

          {/* ── DATA DASHBOARD: 3-Column Grid ─────────────────────────── */}
          <div className={s.dataGrid}>

            {/* ── COLUMN 1: Station Metadata & Weather ─────────────────── */}
            <div className={s.column}>

              {/* Station Clock */}
              <div className={s.card}>
                <div className={s.cardHeader}>
                  <span className={s.cardTitle}>Station Clock</span>
                  <span className={`${s.dot} ${s.dotGreen}`} />
                </div>
                <div className={s.clockRow} data-mono="">
                  <Clock className="w-4 h-4 text-blue-800" />
                  <span>{currentTime}</span>
                </div>
                <div className={s.clockSub}>Indian Standard Time (UTC+05:30) • GPS Locked</div>
              </div>

              {/* Operational Mode */}
              <div className={s.card}>
                <div className={s.cardHeader}>
                  <span className={s.cardTitle}>Operation Mode</span>
                  <span className={s.opModeTag}>MONSOON SURGE</span>
                </div>
                <div className={s.opModeStatus}>
                  HIGHWAY PASSABILITY: {corridorStatus?.status ? corridorStatus.status.replace(/_/g, ' ') : (isHighwayBlocked ? 'CRITICAL SEVERANCE' : 'CONTROLLED OPEN')}
                </div>
                <div className={s.metaRow}>
                  <span>Current Basin:</span>
                  <span className={s.textWhite}>{activeCorridorData.district}</span>
                </div>
                {corridorStatus?.severed_point && isHighwayBlocked && (
                  <div className="text-[10px] text-red-600 font-mono mt-1 font-semibold">
                    Severed: {corridorStatus.severed_point}
                  </div>
                )}
              </div>

              {/* NER Corridor Selector */}
              <div className={s.card}>
                <div className={s.cardHeader}>
                  <span className={s.cardTitle}>NER Corridor Selection</span>
                  <span className={s.badgeCyan}>8 CORRIDORS</span>
                </div>
                <div className={s.corridorGrid}>
                  {Object.keys(CORRIDORS_DATA).map((cid) => {
                    const isSel = selectedCorridor === cid;
                    const item = CORRIDORS_DATA[cid];
                    return (
                      <button
                        key={cid}
                        onClick={() => setSelectedCorridor(cid)}
                        className={isSel ? s.corridorBtnActive : s.corridorBtn}
                      >
                        <div className={s.corridorBtnLabel}>{cid}</div>
                        <div className={s.corridorBtnSub}>{item.district}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* ── COLUMN 2: Precipitation & Satellite Telemetry ───────── */}
            <div className={s.column}>

              {/* Weather / Precipitation Feed (Live IMD Doppler & NASA GPM) */}
              <div className={s.card}>
                <div className={s.cardHeader}>
                  <span className={s.cardTitle}>Precipitation &amp; GPM Feed</span>
                  <span className={s.textEmerald} style={{ fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span className={`${s.dotSm} ${s.dotGreen}`} />
                    IMD / NASA GPM
                  </span>
                </div>
                <div className={s.weatherGrid}>
                  {weatherDistricts.map((w, idx) => {
                    const Icon = idx === 0 ? CloudRain : idx === 1 ? CloudLightning : idx === 2 ? Droplets : Wind;
                    const iconColor = idx === 0 ? 'text-blue-700' : idx === 1 ? 'text-amber-600' : idx === 2 ? 'text-blue-600' : 'text-emerald-600';
                    const satClass = w.sat > 90 ? s.weatherSatDanger : w.sat > 85 ? s.weatherSatWarn : s.weatherSatOk;
                    return (
                      <div key={w.district} className={s.weatherCell}>
                        <div className={s.weatherCellHead}>
                          <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
                          <span>{w.label}</span>
                        </div>
                        <div className={s.weatherVal}>{w.rate.toFixed(1)} mm/h</div>
                        <div className={`${s.weatherSat} ${satClass}`}>Saturation {w.sat.toFixed(1)}%</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Storm Simulation Action */}
              <button
                onClick={handleToggleStormSimulation}
                className={isSimulatingStorm ? s.simBtnActive : s.simBtnIdle}
              >
                {isSimulatingStorm ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>RESET MONSOON SIMULATION</span>
                  </>
                ) : (
                  <>
                    <Flame className="w-3.5 h-3.5 text-amber-600" />
                    <span>SIMULATE STORM SURGE</span>
                  </>
                )}
              </button>

              {/* Sentinel-1 SAR & Surface Sensor Status */}
              <div className={s.card}>
                <div className={s.cardHeader}>
                  <span className={s.cardTitle}>
                    <Satellite className="w-3.5 h-3.5 text-blue-700" />
                    SAR &amp; Constellation
                  </span>
                  <span className={s.badgeEmerald}>PASS ACTIVE</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Sentinel-1 InSAR:</span>
                    <span className="font-mono font-bold text-blue-900">Orbit #31084 (Asc)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Phase Coherence:</span>
                    <span className="font-mono font-bold text-emerald-700">γ = 0.94 (Optimal)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Doppler Radar:</span>
                    <span className="font-mono font-bold text-slate-800">Gangtok X-Band 9.4GHz</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Piezometer Sensors:</span>
                    <span className="font-mono font-bold text-emerald-700">24 / 24 Online (100%)</span>
                  </div>
                </div>
              </div>

            </div>

            {/* ── COLUMN 3: PINN Charts & Bypass Routing ───────────────── */}
            <div className={s.column}>

              {/* Predictive PINN Chart */}
              <div className={s.card}>
                <div className={s.cardHeader}>
                  <span className={s.cardTitle}>Predictive PINN Geotech Chart</span>
                  <span className={s.badgeRed}>MDoNER 26001</span>
                </div>
                <PredictiveChart />
              </div>

              {/* Bypass Routing */}
              <div className={s.card}>
                <div className={s.cardHeader}>
                  <span className={s.cardTitle}>Tactical Convoy Bypass Routing</span>
                  <span className={s.badgeEmerald}>CLEAR ROUTE</span>
                </div>
                <div className={s.textXs}>
                  <span className={s.textMuted}>Active Corridor: </span>
                  <strong className={s.textWhite}>{activeCorridorData.name}</strong>
                </div>
                <div className={s.textCyan} style={{ fontSize: '11px', marginTop: '3px' }}>
                  Bypass Route: <strong>{activeCorridorData.bypass.name}</strong>
                </div>
                <div className={s.bypassRow}>
                  <span className={s.textMuted}>
                    Distance: <strong style={{ color: 'var(--textNavyTitle)' }}>{activeCorridorData.bypass.distanceKm} km</strong>
                  </span>
                  <button onClick={handleExportBypassGeoJSON} className={s.bypassExportBtn}>
                    <Download className="w-3.5 h-3.5" />
                    Export GeoJSON
                  </button>
                </div>
              </div>

            </div>

            {/* ── COLUMN 4: Alerts & Field Reports ─────────────────────── */}
            <div className={s.column}>

              {/* Emergency Alerts Log */}
              <div className={s.card} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div className={`${s.cardHeader} ${s.sectionDivider}`}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className={`${s.dot} ${s.dotRed}`} />
                    <span className={s.cardTitle}>Emergency Alerts Log</span>
                  </div>
                  <span className={s.badgeCyan}>SIP/SMS GATEWAY</span>
                </div>

                <div className={s.alertFeed}>
                  {alertsLog.map((alert) => {
                    const isCrit = alert.tier === 'CRITICAL';
                    return (
                      <div key={alert.id} className={isCrit ? s.alertItemCritical : s.alertItemHigh}>
                        <div className={s.alertMeta}>
                          <span style={{ color: isCrit ? '#dc2626' : '#d97706' }}>
                            [{alert.tier} | {alert.district} | {alert.timestamp}]
                          </span>
                          <span className={s.textTiny} style={{ color: 'var(--textMuted)' }}>
                            {alert.dialects.join('/')}
                          </span>
                        </div>
                        <div className={s.alertSummary}>{alert.summary}</div>
                        <div className={s.alertChannels}>
                          <span>Channels: <strong>{alert.channels.join(', ')}</strong></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Field Reports & Media */}
              <div className={s.card} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div className={`${s.cardHeader} ${s.sectionDivider}`}>
                  <span className={s.cardTitle}>Field Reports &amp; Media</span>
                  <span className={s.textEmerald} style={{ fontSize: '10px' }}>
                    {fieldReports.length} REPORTS VALIDATED
                  </span>
                </div>

                {/* Action Bar */}
                <div style={{
                  background: 'rgba(241, 245, 253, 0.65)',
                  border: '1px solid var(--borderGlassDefault)',
                  borderRadius: '6px',
                  padding: '5px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                }}>
                  <span className={s.textCyan} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin className="w-3.5 h-3.5" />
                    Geotagged Media Feeds
                  </span>
                  <span className={s.textTiny} style={{ color: 'var(--textMuted)' }}>EXIF Hardware Stamped</span>
                </div>

                {/* Reports Feed */}
                <div className={s.reportsFeed}>
                  {fieldReports.map((rep) => (
                    <div key={rep.report_id} className={s.reportCard}>
                      <div className={s.reportHeader}>
                        <span className={s.reportName}>{rep.reporter_name}</span>
                        <span className={s.reportTime}>{rep.timestamp}</span>
                      </div>
                      <div className={s.reportLocation}>
                        <span>{rep.location_name}</span>
                        <span className={rep.severity === 'CRITICAL' ? s.severityCritical : s.severityHigh}>
                          {rep.severity}
                        </span>
                      </div>
                      <div className={s.reportNotes}>&ldquo;{rep.notes}&rdquo;</div>
                      <div className={s.reportThumb}>
                        <div className={s.reportThumbOverlay}>
                          <span className={s.reportCoords}>
                            {rep.latitude.toFixed(3)}°N, {rep.longitude.toFixed(3)}°E
                          </span>
                        </div>
                        {rep.media_type === 'video' ? (
                          <div className={s.mediaVideo}>
                            <Film className="w-3 h-3" />
                            <span>MP4 VIDEO</span>
                          </div>
                        ) : (
                          <div className={s.mediaImage}>
                            <Camera className="w-3 h-3" />
                            <span>EXIF STAMPED</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Upload CTA */}
                <button onClick={() => setIsSnapModalOpen(true)} className={s.uploadBtn}>
                  <Camera className="w-4 h-4" />
                  <span>+ UPLOAD GEOTAGGED REPORT</span>
                </button>
              </div>

            </div>

          </div>
        </main>
      )}

      {/* ================================================================= */}
      {/* PERSISTENT FROSTED GLASS FOOTER                                   */}
      {/* ================================================================= */}
      <footer className={s.footer}>
        <div className={s.footerLeft}>
          <div className={s.footerIndicator}>
            <span className={`${s.dotSm} ${s.dotGreen}`} />
            <span>PINN SOLVER: <strong style={{ color: 'var(--textNavyTitle)' }}>OPERATIONAL ({sarStatus ? sarStatus.processing_latency_ms + 'ms' : '38ms'})</strong></span>
          </div>
          <span className={s.footerDivider}>|</span>
          <div className={s.footerIndicator}>
            <span className={`${s.dotSm} ${s.dotCyan}`} />
            <span>SAR COHERENCE: <strong style={{ color: 'var(--textNavyTitle)' }}>{sarStatus ? '98.2% (' + (sarStatus.active_constellations[0]?.satellite || 'Sentinel-1A') + ')' : '98.2%'}</strong></span>
          </div>
          <span className={s.footerDivider}>|</span>
          <div className={s.footerIndicator}>
            <span className={`${s.dotSm} ${s.dotGreen}`} />
            <span>VOELLMY-SALM: <strong style={{ color: 'var(--textNavyTitle)' }}>CALIBRATED</strong></span>
          </div>
          <span className={s.footerDivider}>|</span>
          <div className={s.footerIndicator}>
            <span className={`${s.dotSm} ${s.dotGreen}`} />
            <span>WMO GTS SYNC: <strong style={{ color: 'var(--textNavyTitle)' }}>STABLE (4s)</strong></span>
          </div>
        </div>
        <div className={s.footerRight}>
          <div className={s.footerIndicator} style={{ color: 'var(--statusNominal)', fontWeight: 700 }}>
            <span className={`${s.dotSm} ${s.dotGreen}`} />
            <span>OFFLINE-ADAPTIVE MESH: ACTIVE</span>
          </div>
        </div>
      </footer>

      {/* Snap & Verify Modal */}
      <SnapAndVerify 
        isOpen={isSnapModalOpen} 
        onClose={() => setIsSnapModalOpen(false)} 
        corridorId={selectedCorridor}
        onReportSubmitted={handleNewReportSubmitted}
      />

    </div>
  );
}
