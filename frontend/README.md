# TerraCast-NER: Command Center Frontend

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fkhushdipakpatil45-dot%2FSIH-Teracast&root-directory=frontend)

## 🚀 1-Click Cloud Deployment

Deploy the TerraCast-NER Command Center frontend directly to **Vercel** with one click:

👉 **[Deploy TerraCast-NER Frontend on Vercel](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fkhushdipakpatil45-dot%2FSIH-Teracast&root-directory=frontend)**

### Recommended Environment Variables for Vercel:
When deploying on Vercel, optionally configure these environment variables:
- `NEXT_PUBLIC_BACKEND_URL`: URL of your FastAPI backend service (e.g. `https://your-backend.onrender.com` or `http://localhost:8000`)
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous public key

---

## 🛠️ Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build
```bash
npm run build
npm run start
```

---

## 🏗️ Architecture & Stack
- **Framework**: Next.js 16 (App Router) + React 19
- **Design Tokens & System**: CSS Custom Properties (`theme.css`) + Scoped CSS Modules (`CommandCenter.module.css`)
- **GIS Mapping**: Leaflet 1.9 + React-Leaflet with Esri Dark Gray Base, World Imagery Satellite, and OpenTopoMap
- **State Management**: Zustand (`useHazardStore`) + TanStack React Query
- **Data Visualizations**: Recharts 3.10 (PINN Factor of Safety & Pore-Water Pressure progression)
- **Offline Storage**: Dexie.js (IndexedDB) for "Snap & Verify" citizen field reports
- **Typography**: Inter (UI text) + JetBrains Mono (coordinates, telemetry, and timestamps)
