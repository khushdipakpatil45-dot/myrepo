-- ==============================================================================
-- TerraCast-NER Migration 002: Vulnerable District Bounding Boxes & Critical Infrastructure
-- Cross-references live SAR ground deformation against PostGIS assets
-- Problem Statement ID: 26001 (MDoNER - Smart India Hackathon)
-- ==============================================================================

-- 1. VULNERABLE DISTRICTS & ADMINISTRATIVE BOUNDING BOXES
CREATE TABLE IF NOT EXISTS public.vulnerable_districts (
    district_id VARCHAR(64) PRIMARY KEY,
    district_name VARCHAR(128) NOT NULL,
    state_name VARCHAR(64) NOT NULL,
    deoc_contact VARCHAR(32) NOT NULL,
    vulnerability_tier VARCHAR(16) DEFAULT 'HIGH' 
        CHECK (vulnerability_tier IN ('CRITICAL', 'HIGH', 'MODERATE')),
    bbox_geom GEOMETRY(Polygon, 4326) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_districts_bbox_geom ON public.vulnerable_districts USING GIST(bbox_geom);

-- Seed Vulnerable District Bounding Boxes in Northeast India
INSERT INTO public.vulnerable_districts (district_id, district_name, state_name, deoc_contact, vulnerability_tier, bbox_geom)
VALUES
    ('SK-GTK', 'Gangtok', 'Sikkim', '+91-3592-202228', 'CRITICAL', 
     ST_MakeEnvelope(88.50, 27.25, 88.75, 27.42, 4326)),
    ('SK-PKY', 'Pakyong', 'Sikkim', '+91-3592-257890', 'CRITICAL', 
     ST_MakeEnvelope(88.45, 27.10, 88.65, 27.28, 4326)),
    ('SK-MGN', 'Mangan (North Sikkim)', 'Sikkim', '+91-3592-234201', 'CRITICAL', 
     ST_MakeEnvelope(88.40, 27.40, 88.85, 27.90, 4326)),
    ('SK-NMC', 'Namchi (South Sikkim)', 'Sikkim', '+91-3595-254222', 'HIGH', 
     ST_MakeEnvelope(88.30, 27.05, 88.55, 27.25, 4326)),
    ('NL-KOH', 'Kohima', 'Nagaland', '+91-370-2290022', 'CRITICAL', 
     ST_MakeEnvelope(93.95, 25.55, 94.25, 25.80, 4326)),
    ('NL-DMP', 'Dimapur', 'Nagaland', '+91-3862-248444', 'HIGH', 
     ST_MakeEnvelope(93.65, 25.75, 93.90, 25.98, 4326)),
    ('ML-EKH', 'East Khasi Hills (Shillong)', 'Meghalaya', '+91-364-2224010', 'HIGH', 
     ST_MakeEnvelope(91.70, 25.30, 92.10, 25.65, 4326))
ON CONFLICT (district_id) DO NOTHING;

-- 2. CRITICAL INFRASTRUCTURE (Bridges, Hospitals, DEOCs, Fuel Depots)
CREATE TABLE IF NOT EXISTS public.critical_infrastructure (
    infra_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(128) NOT NULL,
    infra_type VARCHAR(32) NOT NULL 
        CHECK (infra_type IN ('BRIDGE', 'HOSPITAL', 'MILITARY_BASE', 'FUEL_DEPOT', 'DEOC', 'TUNNEL')),
    corridor_id VARCHAR(32) REFERENCES public.corridors(corridor_id),
    district_id VARCHAR(64) REFERENCES public.vulnerable_districts(district_id),
    seismic_zone VARCHAR(16) DEFAULT 'ZONE_IV',
    is_operational BOOLEAN DEFAULT TRUE,
    location_geom GEOMETRY(Point, 4326) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_infrastructure_geom ON public.critical_infrastructure USING GIST(location_geom);

-- Seed Critical Lifeline Infrastructure along NH-10 & NH-29
INSERT INTO public.critical_infrastructure (name, infra_type, corridor_id, district_id, location_geom)
VALUES
    ('Sevoke Coronation Bridge', 'BRIDGE', 'NH-10', 'SK-PKY', ST_SetSRID(ST_MakePoint(88.4667, 26.8833), 4326)),
    ('Teesta Low Dam Stage IV Bridge', 'BRIDGE', 'NH-10', 'SK-PKY', ST_SetSRID(ST_MakePoint(88.4520, 27.0540), 4326)),
    ('Singtam Suspension Bridge', 'BRIDGE', 'NH-10', 'SK-GTK', ST_SetSRID(ST_MakePoint(88.5200, 27.1500), 4326)),
    ('Ranipool Multi-Span Viaduct', 'BRIDGE', 'NH-10', 'SK-GTK', ST_SetSRID(ST_MakePoint(88.5912, 27.2941), 4326)),
    ('STNM Multispeciality Hospital Gangtok', 'HOSPITAL', 'NH-10', 'SK-GTK', ST_SetSRID(ST_MakePoint(88.5980, 27.3250), 4326)),
    ('Singtam District Hospital', 'HOSPITAL', 'NH-10', 'SK-GTK', ST_SetSRID(ST_MakePoint(88.5180, 27.1520), 4326)),
    ('17 Mountain Division Army Staging Camp', 'MILITARY_BASE', 'NH-10', 'SK-GTK', ST_SetSRID(ST_MakePoint(88.6150, 27.3420), 4326)),
    ('Pagla Pahar Steel Truss Bridge', 'BRIDGE', 'NH-29', 'NL-KOH', ST_SetSRID(ST_MakePoint(93.8650, 25.7420), 4326)),
    ('Sonapur Bypass Tunnel', 'TUNNEL', 'NH-6', 'ML-EKH', ST_SetSRID(ST_MakePoint(92.3610, 25.1090), 4326))
ON CONFLICT DO NOTHING;

-- 3. SAR DEFORMATION ANOMALIES TABLE
CREATE TABLE IF NOT EXISTS public.sar_deformation_anomalies (
    anomaly_id VARCHAR(64) PRIMARY KEY,
    corridor_id VARCHAR(32) REFERENCES public.corridors(corridor_id),
    threat_tier VARCHAR(16) NOT NULL CHECK (threat_tier IN ('CRITICAL', 'HIGH', 'MODERATE', 'LOW')),
    los_velocity_mm_year DOUBLE PRECISION NOT NULL,
    coherence DOUBLE PRECISION NOT NULL,
    pore_pressure_kpa DOUBLE PRECISION,
    satellite_platform VARCHAR(64) NOT NULL,
    acquisition_time TIMESTAMPTZ DEFAULT NOW(),
    deformation_geom GEOMETRY(Polygon, 4326) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sar_anomalies_geom ON public.sar_deformation_anomalies USING GIST(deformation_geom);

-- 4. SPATIAL QUERY FUNCTION: Cross-reference live SAR data with infrastructure & road segments
CREATE OR REPLACE FUNCTION public.get_infrastructure_at_risk(hazard_tier VARCHAR DEFAULT 'HIGH')
RETURNS TABLE (
    infra_name VARCHAR(128),
    infra_type VARCHAR(32),
    corridor VARCHAR(32),
    threat_tier VARCHAR(16),
    los_velocity_mm_yr DOUBLE PRECISION,
    distance_to_hazard_meters DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ci.name AS infra_name,
        ci.infra_type,
        ci.corridor_id AS corridor,
        sar.threat_tier,
        sar.los_velocity_mm_year AS los_velocity_mm_yr,
        ST_Distance(
            ci.location_geom::geography,
            sar.deformation_geom::geography
        ) AS distance_to_hazard_meters
    FROM public.critical_infrastructure ci
    JOIN public.sar_deformation_anomalies sar
      ON ST_DWithin(ci.location_geom::geography, sar.deformation_geom::geography, 1500.0) -- within 1.5 km
    WHERE 
        (hazard_tier = 'CRITICAL' AND sar.threat_tier = 'CRITICAL') OR
        (hazard_tier = 'HIGH' AND sar.threat_tier IN ('CRITICAL', 'HIGH')) OR
        (hazard_tier = 'MODERATE')
    ORDER BY distance_to_hazard_meters ASC;
END;
$$ LANGUAGE plpgsql;
