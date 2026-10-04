-- ==============================================================================
-- TerraCast-NER: Supabase PostgreSQL 16 + PostGIS 3.4 Production DDL
-- Problem Statement ID: 26001 (MDoNER - Smart India Hackathon)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "postgis_topology";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- 2. HIGHWAY CORRIDORS
CREATE TABLE IF NOT EXISTS public.corridors (
    corridor_id VARCHAR(32) PRIMARY KEY, -- e.g. 'NH-10', 'NH-29', 'NH-6'
    name VARCHAR(128) NOT NULL,
    state_region VARCHAR(64) NOT NULL,    -- e.g. 'Sikkim-West Bengal', 'Nagaland'
    total_length_km NUMERIC(6, 2) NOT NULL,
    corridor_geom GEOMETRY(MultiLineString, 4326) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_corridors_geom ON public.corridors USING GIST(corridor_geom);

-- 3. ROAD SEGMENTS
CREATE TABLE IF NOT EXISTS public.road_segments (
    segment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    corridor_id VARCHAR(32) REFERENCES public.corridors(corridor_id) ON DELETE CASCADE,
    segment_name VARCHAR(128) NOT NULL,
    chainage_start_km NUMERIC(6, 2) NOT NULL,
    chainage_end_km NUMERIC(6, 2) NOT NULL,
    operational_status VARCHAR(16) DEFAULT 'OPEN' 
        CHECK (operational_status IN ('OPEN', 'CONTROLLED', 'BLOCKED', 'EVACUATING')),
    speed_limit_kmh INTEGER DEFAULT 40,
    segment_geom GEOMETRY(LineString, 4326) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_road_segments_geom ON public.road_segments USING GIST(segment_geom);
CREATE INDEX IF NOT EXISTS idx_road_segments_status ON public.road_segments(operational_status);

-- 4. IOT SENSOR TELEMETRY (PARTITIONED)
CREATE TABLE IF NOT EXISTS public.iot_sensor_telemetry (
    id BIGSERIAL,
    time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sensor_id VARCHAR(64) NOT NULL,
    corridor_id VARCHAR(32) REFERENCES public.corridors(corridor_id),
    volumetric_water_content_30cm DOUBLE PRECISION,
    volumetric_water_content_60cm DOUBLE PRECISION,
    volumetric_water_content_120cm DOUBLE PRECISION,
    pore_water_pressure_kpa DOUBLE PRECISION,
    battery_millivolts INTEGER,
    probe_geom GEOMETRY(Point, 4326) NOT NULL,
    PRIMARY KEY (id, time)
) PARTITION BY RANGE (time);

-- Monthly partition tables
CREATE TABLE IF NOT EXISTS public.iot_telemetry_y2026m09 PARTITION OF public.iot_sensor_telemetry
    FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');
CREATE TABLE IF NOT EXISTS public.iot_telemetry_y2026m10 PARTITION OF public.iot_sensor_telemetry
    FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');

CREATE INDEX IF NOT EXISTS idx_iot_geom ON public.iot_sensor_telemetry USING GIST(probe_geom);
CREATE INDEX IF NOT EXISTS idx_iot_sensor_time ON public.iot_sensor_telemetry(sensor_id, time DESC);

-- 5. RAINFALL TIME-SERIES (PARTITIONED)
CREATE TABLE IF NOT EXISTS public.rainfall_timeseries (
    id BIGSERIAL,
    time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    grid_cell_id VARCHAR(64) NOT NULL,
    source VARCHAR(16) CHECK (source IN ('IMD_GRIDDED', 'NASA_GPM', 'AWS_GROUND')),
    precipitation_mm_hour DOUBLE PRECISION NOT NULL,
    accumulated_24h_mm DOUBLE PRECISION,
    grid_geom GEOMETRY(Polygon, 4326) NOT NULL,
    PRIMARY KEY (id, time)
) PARTITION BY RANGE (time);

CREATE TABLE IF NOT EXISTS public.rainfall_y2026m09 PARTITION OF public.rainfall_timeseries
    FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');

CREATE INDEX IF NOT EXISTS idx_rainfall_geom ON public.rainfall_timeseries USING GIST(grid_geom);
CREATE INDEX IF NOT EXISTS idx_rainfall_cell ON public.rainfall_timeseries(grid_cell_id, time DESC);

-- 6. LANDSLIDE THREAT ZONES
CREATE TABLE IF NOT EXISTS public.landslide_threat_zones (
    zone_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    corridor_id VARCHAR(32) REFERENCES public.corridors(corridor_id),
    location_name VARCHAR(128) NOT NULL,
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    factor_of_safety NUMERIC(4, 2) NOT NULL,
    threat_tier VARCHAR(16) NOT NULL 
        CHECK (threat_tier IN ('NORMAL', 'ADVISORY', 'WARNING', 'CRITICAL')),
    trigger_probability NUMERIC(4, 3) NOT NULL,
    pore_water_pressure_kpa DOUBLE PRECISION NOT NULL,
    estimated_slip_depth_m NUMERIC(4, 2) NOT NULL,
    initiation_geom GEOMETRY(Polygon, 4326) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_threat_zones_initiation ON public.landslide_threat_zones USING GIST(initiation_geom);
CREATE INDEX IF NOT EXISTS idx_threat_zones_tier ON public.landslide_threat_zones(threat_tier);
CREATE INDEX IF NOT EXISTS idx_threat_zones_corridor ON public.landslide_threat_zones(corridor_id, calculated_at DESC);

-- 7. DEBRIS FLOW RUNOUTS
CREATE TABLE IF NOT EXISTS public.debris_flow_runouts (
    runout_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    threat_zone_id UUID REFERENCES public.landslide_threat_zones(zone_id) ON DELETE CASCADE,
    estimated_volume_m3 DOUBLE PRECISION NOT NULL,
    peak_flow_velocity_ms DOUBLE PRECISION NOT NULL,
    time_to_cutoff_mins INTEGER NOT NULL,
    max_deposition_depth_m NUMERIC(4, 2) NOT NULL,
    severed_chainage_km NUMERIC(6, 2),
    runout_polygon GEOMETRY(Polygon, 4326) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_runouts_polygon ON public.debris_flow_runouts USING GIST(runout_polygon);

-- 8. FIELD REPORTS (INTEGRATED WITH SUPABASE AUTH)
CREATE TABLE IF NOT EXISTS public.field_reports (
    report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_uuid VARCHAR(64) UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reporter_phone VARCHAR(20),
    reporter_role VARCHAR(32) DEFAULT 'CITIZEN' 
        CHECK (reporter_role IN ('CITIZEN', 'VDMC_MEMBER', 'POLICE_PATROL', 'BRO_OFFICER')),
    hazard_type VARCHAR(32) NOT NULL 
        CHECK (hazard_type IN ('TENSION_CRACK', 'ROCKFALL', 'ROAD_SUBSIDENCE', 'MUD_FLOW')),
    compass_azimuth_degrees NUMERIC(5, 2),
    slope_tilt_degrees NUMERIC(4, 2),
    is_verified BOOLEAN DEFAULT FALSE,
    anti_spoofing_status VARCHAR(16) DEFAULT 'VALID' 
        CHECK (anti_spoofing_status IN ('VALID', 'SUSPECT_LOCATION', 'EXIF_TAMPERED')),
    notes TEXT,
    photo_storage_paths TEXT[],
    report_geom GEOMETRY(Point, 4326) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_field_reports_geom ON public.field_reports USING GIST(report_geom);
CREATE INDEX IF NOT EXISTS idx_field_reports_time ON public.field_reports(submitted_at DESC);

-- 9. EMERGENCY CONTACTS & BROADCAST LOGS
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
    contact_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    corridor_id VARCHAR(32) REFERENCES public.corridors(corridor_id),
    full_name VARCHAR(128) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    role VARCHAR(32) NOT NULL,
    preferred_language VARCHAR(16) DEFAULT 'en' 
        CHECK (preferred_language IN ('en', 'khasi', 'mizo', 'assamese', 'bodo', 'garo', 'hindi', 'nepali')),
    home_geom GEOMETRY(Point, 4326) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_contacts_geom ON public.emergency_contacts USING GIST(home_geom);

CREATE TABLE IF NOT EXISTS public.alert_broadcast_logs (
    broadcast_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    threat_zone_id UUID REFERENCES public.landslide_threat_zones(zone_id),
    dispatched_at TIMESTAMPTZ DEFAULT NOW(),
    threat_tier VARCHAR(16) NOT NULL,
    total_calls_initiated INTEGER DEFAULT 0,
    total_sms_dispatched INTEGER DEFAULT 0,
    target_geofence_polygon GEOMETRY(Polygon, 4326) NOT NULL
);

-- ==============================================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.corridors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.road_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landslide_threat_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debris_flow_runouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Public Read: Corridors" ON public.corridors FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Public Read: Road Segments" ON public.road_segments FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Public Read: Threat Zones" ON public.landslide_threat_zones FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Public Read: Debris Runouts" ON public.debris_flow_runouts FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Citizens submit reports" ON public.field_reports FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Public view verified reports" ON public.field_reports FOR SELECT USING (is_verified = true OR auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ==============================================================================
-- 11. SUPABASE REALTIME REPLICATION SETUP
-- ==============================================================================
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.landslide_threat_zones;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.road_segments;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.field_reports;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.alert_broadcast_logs;
EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- ==============================================================================
-- 12. AUTOMATED HIGHWAY SEVERANCE TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.trigger_highway_cutoff_detection()
RETURNS TRIGGER AS $$
DECLARE
    r_segment RECORD;
BEGIN
    FOR r_segment IN 
        SELECT segment_id, segment_name, chainage_start_km, chainage_end_km
        FROM public.road_segments
        WHERE ST_Intersects(segment_geom, NEW.runout_polygon)
    LOOP
        UPDATE public.road_segments 
        SET operational_status = 'BLOCKED', updated_at = NOW()
        WHERE segment_id = r_segment.segment_id;

        RAISE NOTICE 'HIGHWAY SEVERANCE: Segment % severed by Debris Runout %', 
            r_segment.segment_name, NEW.runout_id;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_debris_runout_severance ON public.debris_flow_runouts;
CREATE TRIGGER trg_debris_runout_severance
AFTER INSERT ON public.debris_flow_runouts
FOR EACH ROW
EXECUTE FUNCTION public.trigger_highway_cutoff_detection();

-- ==============================================================================
-- 13. STORAGE BUCKETS SETUP
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES 
    ('field-reports', 'field-reports', true),
    ('sar-rasters', 'sar-rasters', false)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
    CREATE POLICY "Public Upload Field Photos" ON storage.objects
        FOR INSERT WITH CHECK (bucket_id = 'field-reports');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Public Read Field Photos" ON storage.objects
        FOR SELECT USING (bucket_id = 'field-reports');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
