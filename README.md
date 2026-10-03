# 🌍 Rwanda CleanEnergy Insights (RCEI)
**NISR Big Data Hackathon 2026 - Track 3 (Open Innovation)**

![Dashboard Preview](asset/image/dashboard%20view.PNG)

## 📌 The Problem
Under the National Strategy for Transformation (NST2), Rwanda has set ambitious targets to achieve 100% clean cooking energy access by 2030, drastically reducing the traditional reliance on biomass (firewood and charcoal). However, policymakers lack real-time, spatial tools to visualize current reliance rates at a granular level and simulate the exact impact of financial interventions (like subsidies). 

## 💡 Our Solution
**Rwanda CleanEnergy Insights (RCEI)** is a dynamic, data-driven Decision Support Platform built directly on top of the **NISR EICV7 (Integrated Household Living Conditions Survey 2023-2024) microdata**. 

By aggregating and processing thousands of household records, our engine provides:
1. **Spatial Intelligence:** A choropleth map highlighting districts with critical biomass dependency.
2. **Policy Simulation:** An interactive "What-If" engine that allows government planners to model the elasticity of LPG/Stove subsidies, instantly calculating projected household conversions and tons of charcoal saved annually.

---

## 🏆 Why This Project Wins (Hackathon Alignment)
* **Data-Driven Policy:** Instead of static reports, this platform turns raw NISR `.dta` microdata into an interactive policy tool. It aligns perfectly with the **Open Innovation** track by extracting maximum public value from the EICV7 dataset.
* **NST2 Alignment:** Directly addresses one of Rwanda's most critical environmental and health targets (Clean Cooking).
* **Modern Architecture:** A highly scalable Python FastAPI backend paired with a blazing-fast React/Tailwind (Vite) frontend. 
* **Real-World Viability:** The simulator uses real weighted household data (`weight` variable in EICV7) to ensure projections represent true population estimates.

---

## ⚙️ Tech Stack
* **Data Engine:** Python, Pandas, GeoPandas (Direct extraction from Stata `.dta` files)
* **Backend:** FastAPI (High-performance API)
* **Frontend:** React, TypeScript, Vite, Tailwind CSS v4
* **Mapping:** Leaflet & React-Leaflet (OpenStreetMap)

---

## 🚀 How to Run Locally

### 1. Backend Setup
Navigate to the root directory and activate the virtual environment:
```bash
# Activate virtual environment (Windows)
backend\venv\Scripts\activate

# Start the FastAPI Server
uvicorn backend.app.main:app --reload --port 8000
```
*The API will be available at `http://localhost:8000/docs`.*

### 2. Frontend Setup
Open a new terminal and navigate to the frontend directory:
```bash
cd frontend

# Install dependencies
npm install

# Start the Vite Development Server
npm run dev
```
*The dashboard will be available at `http://localhost:5173`.*

---

## 📂 Project Structure
```text
rcei-platform/
│
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI Endpoints
│   │   └── data/processed/         # Contains generated district_metrics.json
│   ├── pipeline/
│   │   └── clean_eicv.py           # Engine that processes EICV7 .dta files
│   └── venv/                       # Python Environment
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── MapView.tsx         # Leaflet Spatial Mapping
│   │   │   └── Simulator.tsx       # What-If Policy Drawer
│   │   ├── services/
│   │   │   └── api.ts              # Axios HTTP Client
│   │   ├── App.tsx                 # Main Dashboard Layout
│   │   └── index.css               # Global Tailwind CSS
│   └── vite.config.ts              
│
└── dataset/                        # Raw NISR Microdata (Not pushed to Git)
```

## 👥 The Team
Built with ❤️ for the NISR Big Data Hackathon 2026.
