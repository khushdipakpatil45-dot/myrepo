/**
 * TerraCast-NER: Centralized Typed API Client
 * Connects Next.js Frontend with FastAPI Backend Services.
 * Includes offline resilience, fallback defaults, and full TypeScript typings.
 */

export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:8000';

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface DistrictWeatherMetric {
  district: string;
  state: string;
  station_name: string;
  corridor_id: string;
  latitude: number;
  longitude: number;
  rainfall_rate_mm_hr: number;
  gpm_24h_accum_mm: number;
  soil_saturation_pct: number;
  doppler_reflectivity_dbz: number;
  alert_level: 'RED_WARNING' | 'ORANGE_ALERT' | 'YELLOW_ADVISORY' | 'GREEN_NORMAL' | string;
  source: string;
}

export interface LiveWeatherResponse {
  timestamp: string;
  region: string;
  monsoon_status: string;
  source_providers: string[];
  districts: DistrictWeatherMetric[];
}

export interface CorridorStatusResponse {
  corridor_id: string;
  name: string;
  status: 'CONTROLLED_OPEN' | 'CRITICAL_SEVERANCE' | 'RESTRICTED_CONVOY' | string;
  open_segments_count: number;
  blocked_segments_count: number;
  active_advisories: number;
  severed_point: string;
  recommended_bypass: string;
  updated_at: string;
}

export interface HazardEvaluationResponse {
  status: string;
  evaluation_timestamp: string;
  corridor: string;
  summary: {
    total_length_km: number;
    at_risk_length_km: number;
    active_critical_points: number;
  };
  critical_zones: Array<{
    zone_id: string;
    location_name: string;
    chainage_km: number;
    factor_of_safety: number;
    threat_tier: string;
    trigger_probability: number;
    pore_water_pressure_kpa: number;
    estimated_slip_depth_meters: number;
    runout_metrics?: {
      time_to_road_cutoff_mins: number;
      debris_volume_cubic_meters: number;
      debris_deposition_depth_meters: number;
    };
    affected_road_geojson?: GeoJSON.FeatureCollection | GeoJSON.Geometry | Record<string, unknown>;
  }>;
}

export interface SarSatelliteInfo {
  satellite: string;
  instrument: string;
  revisit_interval_days: number;
  latest_pass?: string;
  coherence_quality?: string;
  penetration_depth?: string;
  status?: string;
}

export interface SarStatusResponse {
  status: string;
  active_constellations: SarSatelliteInfo[];
  ner_coverage_bbox: [number, number, number, number];
  processing_latency_ms: number;
}

// ─── API Client Methods ─────────────────────────────────────────────────────

/**
 * Fetches real-time multi-district precipitation & soil saturation from IMD AWS / NASA GPM
 */
export async function fetchLiveWeather(): Promise<LiveWeatherResponse | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/telemetry/weather/live`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Fetches NASA GPM 30-min global precipitation dataset feed for NER
 */
export async function fetchGpmFeed(): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/telemetry/gpm/feed`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Fetches real-time passability status for a designated lifeline corridor
 */
export async function fetchCorridorStatus(corridorId: string): Promise<CorridorStatusResponse | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/hazard/corridor/${encodeURIComponent(corridorId)}/status`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Evaluates geotechnical Factor of Safety & runout kinetics for a corridor
 */
export async function evaluateHazard(
  corridorId: string,
  includeRunout: boolean = true
): Promise<HazardEvaluationResponse | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/hazard/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        corridor_id: corridorId,
        include_runout_simulation: includeRunout,
      }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Fetches history of emergency broadcast intimations (IVRS voice & SMS gateway)
 */
export async function fetchAlertsHistory(): Promise<unknown[] | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/hazard/alerts/history`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Dispatches an outbound emergency voice/SMS notification to SDRF and local villages
 */
export async function dispatchAlert(params: {
  district: string;
  corridor_id: string;
  location: string;
  tier: string;
  language: string;
}): Promise<unknown | null> {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BACKEND_URL}/api/v1/hazard/alerts/dispatch?${query}`, {
      method: 'POST',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Fetches verified field hazard reports with photos/videos and EXIF metadata
 */
export async function fetchFieldReports(): Promise<unknown[] | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/field-reports/history`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Submits a geotagged hazard observation from "Snap & Verify" PWA
 */
export async function submitFieldReport(formData: FormData): Promise<unknown | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/field-reports/submit`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Fetches C-Band SAR ground deformation polygons (GeoJSON FeatureCollection) for map overlay
 */
export async function fetchSarHeatmap(corridorId: string = 'NH-10'): Promise<GeoJSON.FeatureCollection | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/sar/heatmap?corridor_id=${encodeURIComponent(corridorId)}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Fetches constellation telemetry status for Sentinel-1 and NISAR
 */
export async function fetchSarStatus(): Promise<SarStatusResponse | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/sar/status`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Requests tactical safe corridor routing avoiding active SAR hazard zones
 */
export async function calculateTacticalBypass(params: {
  corridor_id: string;
  origin_lat: number;
  origin_lon: number;
  dest_lat: number;
  dest_lon: number;
}): Promise<unknown | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/sar/tactical-bypass`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
