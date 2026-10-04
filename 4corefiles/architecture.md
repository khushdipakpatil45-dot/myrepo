# TerraCast-NER: System Architecture & Technical Specifications
**Ministry of Development of North Eastern Region (MDoNER) | Problem Statement ID: 26001**

---

## 1. System Overview

**TerraCast-NER** is an enterprise-grade, all-weather landslide early warning and dynamic disaster response system engineered specifically for the North Eastern Region (NER) of India. The platform integrates heterogeneous earth-observation feeds, deep physical mechanics via Physics-Informed Neural Networks (PINNs), edge IoT ground telemetry, and dynamic transit graph algorithms into a unified, high-availability architecture.

### Key Architectural Tenets
1. **Zero-Monsoon Blindness**: Decoupling early warning from optical satellite availability by ingesting cloud-penetrating Sentinel-1 (C-Band) and NISAR (L/S-Band) Synthetic Aperture Radar (SAR).
2. **Physics-Constrained Inference**: Bounding deep learning predictions within the laws of continuum mechanics (Richards equation, Green-Ampt infiltration, Mohr-Coulomb failure criteria) to prevent false-positive alert fatigue.
3. **End-to-End Resilience**: Dual offline-first edge architecture:
   - Low-cost PWA client using IndexedDB and Service Worker background synchronization.
   - Low-bandwidth Vector Tile (MVT) streaming for high-density 3D GIS visualization in remote command centers.
4. **Actionable Evacuation & Convoy Routing**: Moving beyond static heatmaps to compute 3D kinetic debris runouts, pinpointing the exact minute of highway severance and recalculating real-time bypass routes for disaster convoys (NDRF/SDRF/BRO).

---

## 2. End-to-End Architectural Blueprint

```mermaid
flowchart TB
    subgraph Layer1 ["1. Data Acquisition & Remote Sensing Layer"]
        L1_IMD["IMD Gridded API<br/>(0.25° Daily/Hourly Rainfall)"]
        L1_GPM["NASA GPM IMERG<br/>(0.1° Early/Late Precipitation)"]
        L1_SAR["Sentinel-1 & NISAR SAR<br/>(Google Earth Engine API)"]
        L1_DEM["CartoDEM 10m / ALOS 12.5m<br/>(Slope, Aspect, Curvature)"]
        L1_IOT["Edge IoT Field Probes<br/>(ESP32: Moisture & Pore Pressure)"]
        L1_GSI["GSI Landslide Catalog<br/>(Historical Slip Polygons & Lithology)"]
    end

    subgraph Layer2 ["2. Distributed Ingestion & Stream Processing"]
        L2_KAFKA["Apache Kafka / RabbitMQ<br/>(Sensor Streams & Event Bus)"]
        L2_REDIS["Redis 7 Queue & Cache<br/>(Broker & Ephemeral Store)"]
        L2_CELERY["Celery Distributed Workers<br/>(Raster Tiling, InSAR Processing)"]
        L2_GDAL["GDAL 3.8 / Rasterio Engine<br/>(Coordinate Warping, Tiling)"]
    end

    subgraph Layer3 ["3. Supabase Geospatial & Persistence Tier"]
        L3_POSTGIS[("Supabase PostgreSQL 16 + PostGIS 3.4<br/>(Road Graphs & Geometries)")]
        L3_TS[("Supabase Partitioned Hypertables<br/>(Sensor & Rainfall Time-Series)")]
        L3_STORAGE[("Supabase Storage (S3 Protocol)<br/>(GeoTIFFs, DEM Meshes, Field Photos)")]
        L3_REALTIME["Supabase Realtime & Martin<br/>(CDC WebSocket Streams & MVT Tiles)"]
    end

    subgraph Layer4 ["4. AI Analytics & Hydro-Mechanical Engine"]
        L4_PINN["PINN Geotechnical Core<br/>(Green-Ampt + Richards 1D Solver)"]
        L4_CV["YOLOv8-Seg Toe-Cut Detector<br/>(Road Excavation Vulnerability)"]
        L4_RUNOUT["D-Infinity Kinetic Simulator<br/>(Voellmy-Salm Debris Routing)"]
        L4_FSEVAL["Dynamic Safety Factor Evaluator<br/>(FS Raster Matrix & Threat Tiers)"]
    end

    subgraph Layer5 ["5. Core API Services & Microservices"]
        L5_FASTAPI["FastAPI Asynchronous Gateway<br/>(REST, GeoJSON, OpenAPI)"]
        L5_WS["Supabase Realtime / WS Gateway<br/>(Instant Threat & Closure Broadcasts)"]
        L5_OSRM["OSRM Transit Routing Engine<br/>(Dynamic Graph Edge Penalties)"]
        L5_IVRS["Telephony SIP Gateway<br/>(Exotel/Twilio Multi-Lingual IVRS/SMS)"]
    end

    subgraph Layer6 ["6. Client Presentation & Field Operations"]
        L6_NEXTJS["Command Center 3D GIS<br/>(Next.js 14, CesiumJS, Mapbox GL)"]
        L6_PWA["Snap & Verify PWA<br/>(Offline-First Dexie.js / Supabase Sync)"]
        L6_PUBLIC["Disaster Alert Recipients<br/>(Regional Voice Calls & Geofenced SMS)"]
    end

    Layer1 --> L2_KAFKA
    L2_KAFKA --> L2_REDIS
    L2_REDIS --> L2_CELERY
    L2_CELERY --> L2_GDAL
    L2_GDAL --> L3_POSTGIS & L3_TS & L3_STORAGE
    L3_POSTGIS --> L3_REALTIME

    L3_POSTGIS & L3_TS & L3_STORAGE --> L4_PINN & L4_CV
    L4_PINN & L4_CV --> L4_FSEVAL --> L4_RUNOUT
    L4_RUNOUT --> L3_POSTGIS

    L3_POSTGIS & L3_TS & L4_FSEVAL --> L5_FASTAPI
    L3_REALTIME --> L6_NEXTJS & L6_PWA
    L4_RUNOUT --> L5_OSRM
    L4_FSEVAL --> L5_IVRS

    L3_REALTIME --> L6_NEXTJS
    L5_FASTAPI --> L6_NEXTJS
    L5_OSRM --> L6_NEXTJS
    L5_FASTAPI <--> L6_PWA
    L5_IVRS --> L6_PUBLIC
```

---

## 3. Detailed Data Flow & Execution Sequences

### 3.1 Real-Time Hazard Evaluation & Dynamic $FS$ Workflow

```mermaid
sequenceDiagram
    autonumber
    participant CRON as Celery Scheduler
    participant INGEST as GEE & IMD Ingest Worker
    participant TS as Supabase Time-Series
    participant PINN as PINN Geotechnical Core
    participant RUNOUT as D-Infinity Simulator
    participant DB as Supabase PostGIS
    participant RT as Supabase Realtime
    participant OSRM as OSRM Routing Engine
    participant ALERT as Alert Microservice

    CRON->>INGEST: Trigger hourly rainfall & SAR sync
    INGEST->>TS: Upsert Gridded Precipitation & InSAR velocities
    CRON->>PINN: Trigger Corridor Hazard Assessment (e.g. NH-10)
    PINN->>TS: Fetch antecedent rainfall & live IoT pore pressures
    PINN->>DB: Fetch slope gradient, soil cohesion, friction angle
    PINN->>PINN: Solve 1D Richards & Mohr-Coulomb equations
    PINN-->>DB: Write Dynamic Factor of Safety (FS) raster grid

    alt FS <= 1.0 (Critical Slope Destabilization)
        PINN->>RUNOUT: Initiate Debris Runout Simulation for cell (x, y)
        RUNOUT->>RUNOUT: Execute Voellmy-Salm hydro-kinetic routing
        RUNOUT->>DB: Store predicted runout polygon & debris volume (m³)
        DB->>DB: Trigger trg_debris_runout_severance (Mark Road BLOCKED)
        DB->>RT: Publish CDC event (threat_tier='CRITICAL', status='BLOCKED')
        RT-->>RT: Broadcast to Command Center & Field PWAs (<100ms)
        RUNOUT->>OSRM: Query intersection with highway vector network
        OSRM->>OSRM: Apply infinite penalty (cutoff) to severed road edge
        RUNOUT->>ALERT: Dispatch CRITICAL alert event
        ALERT->>ALERT: Query affected population within +500m buffer
        ALERT-->>ALERT: Trigger Multi-Lingual IVRS calls & SMS broadcast
    else FS > 1.3 (Stable)
        PINN->>DB: Maintain status "NORMAL"
    end
```

---

### 3.2 Dynamic Convoy Rerouting (NDRF/SDRF Logistics)

```mermaid
sequenceDiagram
    autonumber
    actor Commander as NDRF Ops Commander
    participant Web as Command Center GIS (Next.js)
    participant API as FastAPI Gateway
    participant OSRM as OSRM Dynamic Routing Engine
    participant PostGIS as Supabase PostGIS

    Commander->>Web: Request safe route from Siliguri to Gangtok
    Web->>API: POST /api/v1/routes/safe-corridor (Origin, Dest, Convoy Type)
    API->>PostGIS: Check active/predicted landslide runouts intersecting NH-10
    PostGIS-->>API: Conflict detected: NH-10 KM 28.4-31.2 BLOCKED (FS = 0.88)
    API->>OSRM: Compute path avoiding penalty weight edges
    OSRM->>OSRM: Recalculate shortest bypass via Lava - Algarah - Kalimpong
    OSRM-->>API: Return alternate bypass geometry, time delta (+85 min), checkpoints
    API-->>Web: Render 3D bypass path with passability clearance status
    Commander->>Web: Export convoy itinerary as GPX/KML for offline tactical GPS
```

---

## 4. Subsystem Breakdown

### 4.1 Ingestion & Preprocessing Subsystem
* **Rainfall Processor**: Ingests IMD gridded daily/hourly APIs and NASA GPM IMERG Early/Late runs. Computes the Antecedent Precipitation Index ($API_{15}$) over a 15-day sliding decay window ($k=0.85$).
* **SAR InSAR Interferometry Processor**: Interfaces with Google Earth Engine (GEE) Python API. Ingests Sentinel-1 Single Look Complex (SLC) and Ground Range Detected (GRD) interferograms to track millimeter-scale ground creep along highway slopes.
* **IoT Telemetry Broker**: Encrypted MQTT/HTTPS endpoints receiving telemetry from ESP32 edge probes (soil moisture volumetric water content $\theta_{30}, \theta_{60}, \theta_{120}$ and pore-water pressure $u_w$).

### 4.2 Analytical & Modeling Subsystem
* **PINN Geotechnical Core**: A DeepXDE/PyTorch neural network that evaluates slope stability by enforcing 1D Green-Ampt infiltration and Richards equations within its loss function, determining dynamic Factor of Safety ($FS$) without the false alarms of empirical thresholding.
* **Anthropogenic Toe-Cut Detector**: Computer vision engine (YOLOv8-Seg) trained on aerial/satellite imagery and digital elevation curvature to flag destabilized slopes caused by unreinforced road cutting and highway widening.
* **D-Infinity Kinetic Runout Simulator**: Hydrodynamic mass-movement solver that simulates downslope debris propagation, flow velocity, deposit thickness, and road cutoff impact timestamps.

### 4.3 Storage, Realtime & Geospatial Engine (Supabase)
* **Supabase PostgreSQL 16 + PostGIS 3.4**: Houses the road network topology, administrative boundaries, GSI historical landslide polygons, and live threat zones indexed using `GIST` spatial indices.
* **Supabase Realtime (CDC)**: Direct WebSocket subscriptions for frontend clients, eliminating polling overhead for critical landslide elevations and road cutoff alerts.
* **Supabase Storage**: Managed S3-compatible asset store with automatic optimization for high-resolution field photos, drone footage, and InSAR GeoTIFF rasters.
* **Martin Vector Tile Server**: Converts PostGIS geometries into Mapbox Vector Tiles (`.mvt`) on the fly, enabling low-bandwidth 60fps rendering in the browser.

### 4.4 Communication & Dissemination Subsystem
* **Telephony SIP Trunking & IVRS**: Automated outbound voice calling through Exotel/Twilio SIP trunks, executing regional neural text-to-speech in **Khasi, Mizo, Assamese, Bodo, Garo, Nepali, and Hindi**.
* **SMS Gateway**: Prioritized transactional SMS broadcasts dispatched to geofenced mobile numbers registered within the threat perimeter.

---

## 5. Deployment Topology & Infrastructure

```mermaid
flowchart TB
    subgraph Public_Internet ["Public Internet / External World"]
        Clients["Web Browsers / Mobile PWA / Field Edge"]
        IoTDevices["ESP32 Field Probes (LTE-M/NB-IoT)"]
        SatFeeds["NASA GPM / IMD / GEE APIs"]
        Telco["Telecom SIP Trunks (Exotel / BSNL)"]
    end

    subgraph DMZ ["Edge Ingress & Reverse Proxy"]
        Traefik["Traefik v3 Edge Router<br/>(TLS Termination, Rate Limiting, CORS)"]
    end

    subgraph App_Cluster ["Application & Microservices Cluster"]
        direction TB
        subgraph Frontend_Pod ["Frontend Pods"]
            NextApp["Next.js 14 SSR & Static Server (Node.js 20)"]
        end

        subgraph Backend_Pod ["Backend Services"]
            FastAPI1["FastAPI Worker 1"]
            FastAPI2["FastAPI Worker 2"]
        end

        subgraph Celery_Pod ["Async Processing Workers"]
            Worker_Sat["Celery InSAR & GEE Worker"]
            Worker_Rain["Celery Rainfall & Telemetry Worker"]
            Worker_PINN["Celery PINN & Simulation Worker (GPU)"]
        end

        subgraph Geo_Pod ["Spatial Engine"]
            Martin["Martin Vector Tile Server"]
            OSRM_Engine["OSRM Routing Engine"]
        end
    end

    subgraph Supabase_Tier ["Supabase Managed Platform"]
        SB_PG[("Supabase PostgreSQL 16 + PostGIS 3.4<br/>(Primary & Read Replicas)")]
        SB_RT["Supabase Realtime Engine (WebSockets)"]
        SB_AUTH["Supabase Auth (GoTrue JWT & RLS)"]
        SB_STORE[("Supabase Storage Buckets (S3 API)")]
        Redis_Inst[("Redis 7 (Celery Task Broker & Cache)")]
    end

    Clients & IoTDevices & SatFeeds --> Traefik
    Traefik --> NextApp
    Traefik --> FastAPI1 & FastAPI2
    Traefik --> Martin

    Clients <--> SB_RT
    Clients <--> SB_AUTH
    Clients <--> SB_STORE

    FastAPI1 & FastAPI2 --> Redis_Inst
    FastAPI1 & FastAPI2 --> SB_PG
    Martin --> SB_PG

    Redis_Inst --> Worker_Sat & Worker_Rain & Worker_PINN
    Worker_Sat & Worker_Rain & Worker_PINN --> SB_PG
    Worker_Sat & Worker_Rain & Worker_PINN --> SB_STORE
    FastAPI1 --> OSRM_Engine
    FastAPI1 --> Telco
```

---

## 6. Security, Reliability & Governance

### 6.1 Authentication & Access Control (RBAC)
* **JWT-Based Authentication**: Secure stateless token issuance with role-based access control (`SUPER_ADMIN`, `COMMAND_OFFICER`, `FIELD_REPORTER`, `PUBLIC_OBSERVER`).
* **Hardware API Keys**: IoT telemetry submissions authenticated via HMAC-SHA256 device signatures cross-verified against a hardware security module (HSM) device registry.

### 6.2 Data Integrity & Anti-Spoofing
* **Field Report Attestation**: Citizen/officer submissions via "Snap & Verify" must provide genuine EXIF metadata, GPS accuracy $< 15\text{m}$, and device compass/gyroscope slope azimuth matching the underlying CartoDEM aspect within $\pm 25^\circ$.

### 6.3 Disaster Recovery & High Availability
* **Database Replication**: Multi-AZ PostgreSQL physical streaming replication with automated failover via Patroni.
* **Low-Bandwidth Fallback**: When bandwidth drops below 128 kbps (common in mountain valleys), the frontend automatically drops 3D terrain meshes, falling back to 2D vector tiles and lightweight cached alerts.
