# TerraCast-NER: Physics-Informed Real-Time Landslide Early Warning & Safe Corridor System
**Ministry of Development of North Eastern Region (MDoNER) | Problem Statement ID: 26001**

[![Next.js 16](https://img.shields.io/badge/Frontend-Next.js%2016%20App%20Router-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-blue?style=flat&logo=react)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Supabase](https://img.shields.io/badge/Database-Supabase%20PostGIS-3ECF8E?style=flat&logo=supabase)](https://supabase.com/)
[![Docker](https://img.shields.io/badge/Container-Docker%20Compose-2496ED?style=flat&logo=docker)](https://www.docker.com/)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fkhushdipakpatil45-dot%2FSIH-Teracast&root-directory=frontend)

---

## 🌐 Quick Access & Deployment Links

* **🚀 1-Click Cloud Deployment (Vercel)**: **[Deploy TerraCast-NER on Vercel](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fkhushdipakpatil45-dot%2FSIH-Teracast&root-directory=frontend)**
* **💻 Frontend Command Center (Local)**: **[http://localhost:3000](http://localhost:3000)**
* **⚙️ Backend API Swagger Documentation**: **[http://localhost:8000/docs](http://localhost:8000/docs)**
* **📦 GitHub Repository**: **[https://github.com/khushdipakpatil45-dot/SIH-Teracast](https://github.com/khushdipakpatil45-dot/SIH-Teracast)**

---

## 📌 Overview

**TerraCast-NER** is an enterprise-grade, all-weather landslide early warning and dynamic disaster response system engineered specifically for the North Eastern Region (NER) of India. The platform eliminates the 4–6 month monsoon optical satellite blind spot using all-weather Synthetic Aperture Radar (SAR), calculates dynamic slope Factor of Safety ($FS$) via Physics-Informed Neural Networks (PINNs), simulates 3D debris flow runouts, and dynamically reroutes rescue convoys (NDRF/SDRF) around blocked corridors.

### Target Lifeline Corridors (8 High-Risk NER Arteries)
1. **NH-10 (Siliguri - Sevoke - Gangtok)**: Critical supply line for Sikkim along the Teesta River gorge (chokepoint: 29th Mile).
2. **NH-27 (Siliguri - Bongaigaon - Guwahati)**: East-West Corridor connecting mainland India through the Assam bottleneck.
3. **SH-5 (Jorhat - Sivasagar - Dibrugarh)**: Brahmaputra South Bank flood-slope failure axis.
4. **NH-310A (Gangtok - Mangan - Chungthang)**: North Sikkim Defense Axis vulnerable to GLOF and torrential flash floods.
5. **NH-306 (Silchar - Kolasib - Aizawl)**: Sole vehicular lifeline connecting Mizoram with the rest of India.
6. **NH-13 (Pasighat - Roing - Tezu)**: Trans-Arunachal Highway traversing braided alluvial fans and unstable slopes.
7. **NH-29 (Dimapur - Kohima - Imphal)**: Nagaland & Manipur transit lifeline (chokepoints: Pagla Pahar, Old KMC).
8. **NH-6 (Guwahati - Shillong - Silchar)**: Meghalaya & Barak Valley lifeline (chokepoint: Sonapur Tunnel).

---

## 🚀 Getting Started

### 1. Running the Frontend Command Center

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server (Webpack mode for Windows WASM compatibility)
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

#### Frontend Command Center Architecture & Features:
* **Vertical Operations Hierarchy**: Dedicated 58vh Hero GIS Map on top, feeding into a synchronized 3-column operations & telemetry grid below.
* **Atmospheric Glassmorphic UI**: Hazy desaturated satellite cloud backdrop with Slate-950 dark wash overlay, muted tactical status indicators, and zero distracting neon glows.
* **Monospace Data Precision**: Strictly monospaced (`JetBrains Mono` / `Roboto Mono`) coordinates, FoS values, UTC/IST clocks, and sensor readings.
* **Full 8 NER Corridors GIS Map**: Dynamic GIS vector map covering all 8 major northeastern lifeline routes, Sentinel-1 InSAR coherence overlays, and instant layer switching (Esri Dark Gray / Satellite / OpenTopoMap).
* **PINN Geotechnical Simulator**: Interactive monsoon storm surge simulation demonstrating dynamic $FS$ degradation and soil pore-pressure progression.
* **Dynamic Safe Bypass Routing**: OSRM-powered tactical evacuation bypass calculation with GPX and GeoJSON download capabilities.
* **Offline "Snap & Verify" Ground-Truth PWA**: Field photo capture with compass azimuth heading HUD, device telemetry, and IndexedDB (Dexie.js) background synchronization.
* **Regional Multilingual Support**: Instant switching across 6 northeastern languages (**English, Khasi, Mizo, Assamese, Bodo, and Garo**).

---

### 2. Running Backend Microservices & Celery Workers

```bash
# Build and run FastAPI, Redis, and Celery worker
docker compose up --build
```
Interactive API documentation will be accessible at **[http://localhost:8000/docs](http://localhost:8000/docs)**.

#### Core Endpoints:
* `POST /api/v1/hazard/evaluate`: PINN dynamic Factor of Safety & Voellmy-Salm debris runout calculator.
* `POST /api/v1/routes/safe-corridor`: OSRM dynamic convoy bypass rerouting.
* `POST /api/v1/telemetry/iot-ingest`: In-situ ESP32 moisture & pore-pressure telemetry ingestion.
* `POST /api/v1/field-reports/submit`: Citizen & field officer hazard reports.

---

### 3. Deploying Supabase Database Schema

The database is built on **Supabase** (PostgreSQL 16 + PostGIS 3.4).
1. Copy the SQL script in [`supabase/schema.sql`](supabase/schema.sql).
2. Paste and run it in your **Supabase SQL Editor**.
3. It sets up PostGIS geometry types, partitioned time-series tables, Row Level Security (RLS), Supabase Realtime CDC publication, and the automated highway severance trigger (`trg_debris_runout_severance`).

---

## 📁 Repository Structure

```
SIH-Teracast/
├── 4corefiles/              # Core specifications & system design
│   ├── architecture.md      # End-to-end architecture & sequence diagrams
│   ├── backend.md           # FastAPI microservices, PINN, and Celery pipelines
│   ├── database.md          # Supabase PostGIS schemas, RLS, and triggers
│   ├── frontend.md          # Next.js 14, Cesium/Mapbox GIS, and offline PWA
│   └── idea.md              # Original MDoNER problem statement & proposal
├── supabase/
│   └── schema.sql           # Complete Supabase PostgreSQL 16 + PostGIS DDL
├── backend/                 # FastAPI microservices & ML models
│   ├── app/
│   │   ├── ml/pinn/         # Geotechnical Green-Ampt & Richards physics solver
│   │   ├── ml/runout/       # D-Infinity & Voellmy-Salm debris flow simulator
│   │   ├── services/        # OSRM routing, IVRS, and anti-spoofing
│   │   └── api/v1/          # REST endpoints
│   ├── Dockerfile
│   ├── main.py
│   └── requirements.txt
├── frontend/                # Next.js 14 App Router + Tailwind CSS + PWA
│   ├── public/manifest.json # PWA standalone manifest
│   ├── src/
│   │   ├── app/page.tsx     # 3D Command Center & Live Telemetry Dashboard
│   │   ├── components/gis/  # Interactive vector map & HUD
│   │   ├── components/field/# Snap & Verify offline PWA modal
│   │   └── lib/             # Supabase client, Dexie.js, and corridor fixtures
│   └── package.json
├── .env.example             # Configuration template for cloud credentials
└── docker-compose.yml       # Local Redis, FastAPI, and Celery orchestration
```

---

## 🧪 Testing

Run the automated Python test suite covering physics, runout kinetics, dynamic routing, anti-spoofing, and telephony:

```bash
python backend/tests/run_tests.py
```

---

*Compiled for Problem Statement ID: 26001 (Ministry of Development of North Eastern Region - MDoNER) | Smart India Hackathon.*
