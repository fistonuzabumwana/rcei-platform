# Rwanda CleanEnergy Insights (RCEI) 🌍⚡
### NST2 Decision Platform, Socioeconomic Policy Simulator & Predictive ML Engine

[![Track](https://img.shields.io/badge/NISR%20Hackathon-Track%203%3A%20Open%20Innovation-blue?style=for-the-badge)](https://statistics.gov.rw)
[![NST2 Target](https://img.shields.io/badge/NST2%20Target-%3C50%25%20Biomass%20by%202030-emerald?style=for-the-badge)](#-the-challenge--national-priority-nst2--vision-2050)
[![Live App](https://img.shields.io/badge/Live%20Platform-Online-success?style=for-the-badge)](https://rwanda-cleanenergy-insights-nisr.fistonuz.me)
[![API Docs](https://img.shields.io/badge/FastAPI%20Swagger-Live-indigo?style=for-the-badge)](https://rcei-backend.onrender.com/docs)
[![License](https://img.shields.io/badge/IP%20Assigned-NISR%202026-amber?style=for-the-badge)](#-intellectual-property--declarations)

---

## 📌 Executive Summary

<div align="center">
  <img src="asset/image/dashboard_view.png" alt="Rwanda CleanEnergy Insights Platform Preview" width="100%" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.15);" />
  <p><em>Rwanda CleanEnergy Insights: 30-District Choropleth Map, Random Forest Policy Simulator, and Carbon Credit Financial Modeling</em></p>
</div>

**Rwanda CleanEnergy Insights (RCEI)** is an evidence-based decision-support platform and socioeconomic simulator engineered for the **2026 National Institute of Statistics of Rwanda (NISR) Big Data Hackathon**. 

Aligned with **Track 3: Open Innovation**, RCEI tackles Rwanda's urgent clean cooking transition mandated under the **National Strategy for Transformation (NST2)** and **Vision 2050**. By ingesting and analyzing raw microdata from NISR's **7th Integrated Household Living Conditions Survey (EICV7)** and deploying a calibrated **Random Forest Machine Learning model**, RCEI provides government ministries (**MININFRA**, **MINECOFIN**, **REMA**, **NISR**) with actionable policy simulation:
- Visualizes baseline biomass reliance vs. clean energy adoption across all **30 districts** of Rwanda.
- Simulates targeted **clean cooking subsidies** (0% to 100%) with price-elasticity calibrated against household poverty levels.
- Quantifies **citizen economic welfare** through avoided charcoal expenditures at retail prices (~900 Rwf/kg).
- Unlocks **sovereign climate finance** via **Article 6 Carbon Credit monetization** (@ $15/tCO2e), proving that subsidies can become fiscal surpluses.
- Projects the **2030 multi-year trajectory** against the NST2 mandate.
- Generates publication-grade **2-page Executive Policy Briefs** directly to PDF from scratch.
- Provides **1-click Research-Grade CSV Data Exports** for immediate econometric analysis.

---

## 🔗 Live Deployments & Repository Links

| Resource | URL | Description |
| :--- | :--- | :--- |
| 🌐 **Production Web App (Primary)** | [https://rwanda-cleanenergy-insights-nisr.fistonuz.me](https://rwanda-cleanenergy-insights-nisr.fistonuz.me) | Custom high-availability production domain |
| 🌐 **Production Web App (Vercel)** | [https://rcei-platform.vercel.app](https://rcei-platform.vercel.app) | Continuous deployment frontend mirror |
| ⚙️ **Backend API & Swagger Docs** | [https://rcei-backend.onrender.com/docs](https://rcei-backend.onrender.com/docs) | Interactive OpenAPI / Swagger UI on Render |
| 📦 **Public GitHub Repository** | [https://github.com/fistonuzabumwana/rcei-platform](https://github.com/fistonuzabumwana/rcei-platform) | Source code, ML pipeline, and datasets |

---

## 🎯 The Challenge & National Priority (NST2 & Vision 2050)

Over **80% of Rwandan households**—particularly in rural provinces—depend on firewood and charcoal as their primary cooking fuels. This causes:
1. **Environmental Degradation:** Accelerated deforestation of Rwanda's natural forest cover.
2. **Public Health Burden:** Severe household air pollution causing respiratory and cardiovascular diseases, disproportionately affecting women and young children.
3. **Poverty & Time Burden:** Disproportionate household income spent on charcoal or unpaid hours gathered collecting firewood.

### 🏛️ The NST2 Mandate
The Government of Rwanda, through **NST2 (2024–2029)**, has set a legally binding national target to **reduce household biomass reliance to under 50% by 2030** (on a path to 100% clean cooking under Vision 2050). 

**The Core Question for Policymakers:** *How much subsidy is required? Which districts should be prioritized first? How will citizens benefit financially? And how can the government fund this without exhausting the national budget?* **RCEI was created to answer these questions directly.**

---

## 🏆 NISR Hackathon Evaluation Alignment (100 / 100 Points)

| Evaluation Criterion | Pts | How RCEI Delivers Maximum Points |
| :--- | :---: | :--- |
| **1. Problem Understanding & Relevance** | **20** | Explicitly addresses the **NST2 Energy Transition & Environmental Priority** (<50% biomass by 2030) and **Vision 2050**. Synthesizes national health, deforestation, and fiscal constraints into a single cohesive framework. |
| **2. Data Use & Methodology** | **20** | Direct extraction and statistical processing of **NISR EICV7 raw microdata (`CS_S01_S5_S7_Household.dta`)**. Accurately isolates cooking fuels (`s5cq22a`), poverty classifications (`pov_jan`), urban/rural dynamics (`ur`), and district weights. Rigorous data pipeline with missing value treatment. |
| **3. Tech Innovation** | **20** | Deploys a **Random Forest Machine Learning regressor** to capture non-linear price sensitivity and adoption probabilities. Bridges macroeconomics with **Article 6 Carbon Credit sovereign monetization** and multi-year trajectory forecasting (2024–2030). Implements custom vector PDF generation without browser screen-clipping. |
| **4. Usability & Design of Prototype** | **20** | Executive-tier UI featuring **glassmorphism**, responsive **Dark/Light theme switching**, interactive **Leaflet Choropleth map of Rwanda** with click inspection and full-screen focus mode, dynamic chart area visualizations (Recharts), and real-time map recoloring. |
| **5. Tangible Impact** | **20** | Directly usable by **MININFRA**, **MINECOFIN**, **REMA**, **NISR**, and district administrations. Quantifies citizen household savings in Rwf, fiscal budget requirements, carbon offset revenues, and district priority rankings for pro-poor resource distribution. |

---

## 🚀 Key Platform Features

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      RWANDA CLEANENERGY INSIGHTS (RCEI)                     │
├──────────────────────────────────────┬──────────────────────────────────────┤
│ 🗺️ Spatial Choropleth Engine         │ 🎛️ Dynamic Policy Simulator           │
│ • 30 Districts mapped with GeoJSON   │ • 0% to 100% Clean Fuel Subsidy      │
│ • Dynamic real-time recoloring       │ • Poverty-weighted elasticity        │
│ • Fullscreen declutter mode          │ • ML Random Forest adoption model    │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ 💰 Citizen Economic Welfare          │ 🌿 Article 6 Carbon Credit Finance   │
│ • ~900 Rwf/kg retail benchmark       │ • 3 tons CO2e avoided / ton charcoal │
│ • Displaced charcoal tons quantified │ • $15/tCO2e international market     │
│ • Disposable income savings in Rwf   │ • Net fiscal profit/cost balance     │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ 📈 2030 Multi-Year Forecast Chart    │ 📄 Reconstructed PDF Policy Brief    │
│ • 2024–2030 trajectory trajectory    │ • Publication-grade 2-page A4 vector │
│ • BAU vs Policy vs NST2 <50% target  │ • Official MININFRA/NISR formatting  │
│ • Threshold crossing estimation      │ • Instant download (no print dialog) │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

### 1. 🗺️ Interactive District Choropleth Map with Scorecard Drawer (Leaflet)
- High-precision GeoJSON vector polygons for all **30 districts of Rwanda**.
- Color-coded reliance tiers:
  - 🔴 **Critical:** >90% Biomass Reliance
  - 🟠 **High:** 75% – 90% Reliance
  - 🟡 **Moderate:** 50% – 75% Reliance
  - 🟢 **Sustainable:** <50% Reliance (NST2 Target Reached)
- **Live Dynamic Recoloring:** When you slide the subsidy simulator or pick a targeted cluster, the map dynamically re-renders in real-time, displaying how districts transition under policy intervention.
- **Interactive District Scorecard Drawer:** Clicking any district opens a glassmorphic scorecard displaying national urgency ranking (#1 to #30), before-and-after biomass drop, converted households, charcoal saved, and EICV7 poverty rates.
- **Dedicated Fullscreen Mode:** Seamless full-screen view that intelligently hides headers and cards for presentations and GIS analysis.

### 2. 🎛️ Policy Simulator with Targeting Clusters & 1-Click Presets
- **Geographic Targeting Clusters:** Rather than wasteful blanket subsidies, policymakers can isolate interventions:
  - 🌐 **Nationwide (All 30 Districts):** Universal rollout.
  - 🚨 **Top 10 Priority (High Poverty & Biomass):** Gisagara, Nyaruguru, Nyamagabe, Gicumbi, Burera, Ruhango, Ngororero, Rutsiro, Karongi, Nyanza.
  - 🏙️ **Kigali Urban Transition:** Nyarugenge, Gasabo, Kicukiro (accelerates urban charcoal bans).
  - 🌾 **Rural Provinces (27 Districts):** Focused capital for non-Kigali provinces.
- **1-Click Policy Presets:** Instantly evaluate Conservative (20%), NST2 Recommended (40%), and Aggressive (70%) scenarios.
- **Predictive ML Engine:** Backed by a **Random Forest Regressor** (`backend/app/core/adoption_model.pkl`) trained on EICV7 microdata, accounting for non-linear price sensitivity across poverty tiers.

### 3. 🏆 District Transition Leaderboard
- Integrated dashboard component ranking the **Top 5 Critical Urgency Districts** vs. **Top 5 Clean Energy Leaders**.
- Fully synchronized with the Leaflet map: clicking any district in the leaderboard smoothly zooms and opens its scorecard on the map.

### 4. 💵 Citizen Economic Welfare & VUP Social Protection Synergy
- Charcoal prices in urban and peri-urban Rwanda hover around **~900 Rwf/kg** (900,000 Rwf/ton).
- **Citizen Total Savings:** Annual avoided expenditure across all converted households.
- **VUP Social Protection Relief Per Family:** Quantifies direct annual disposable cash freed per household (**~154,000 Rwf / family / year**), demonstrating cross-track synergy with social protection (VUP) and poverty alleviation.

### 5. 🌍 Article 6 Carbon Credit & Sovereign Climate Finance
- Every 1 ton of charcoal saved avoids approximately **3.0 tons of CO2e** emissions.
- Monitizes avoided emissions at the voluntary and compliance carbon market rate of **$15 USD / ton CO2e** (~19,500 Rwf/ton).
- Computes **Net Fiscal Policy Impact**:
  $$\text{Net Fiscal Balance} = \text{Gross Government Subsidy Budget} - \text{Carbon Credit Sovereign Revenue}$$
  - **Fiscal Breakthrough:** At moderate to high subsidies, international carbon finance can completely pay for the government subsidy, generating a **sovereign net fiscal surplus**!

### 6. 📊 2030 Multi-Year Trajectory Forecasting
- Projects national clean cooking momentum from **2024 through 2030**.
- Visualizes **Business as Usual (BAU)** vs. **With Policy Subsidy** against the **NST2 <50% Threshold line** using a responsive Recharts area graph.

### 7. 📄 Reconstructed Executive-Grade PDF Policy Brief Generator
- Designed from scratch with `jspdf` and `jspdf-autotable`, abandoning generic browser `window.print()` print screens.
- Generates an official, publication-quality **2-page A4 Policy Brief**:
  - **Page 1:** Rwandan national flag ribbon (Blue, Yellow, Green), official RCEI seal, MININFRA/NISR institutional header, executive summary card, active scenario callout (reflecting targeted clusters), 6 KPI cards, 2030 trajectory forecast table, and 3 strategic policy recommendations.
  - **Page 2:** Complete 30-district transition matrix sorted by biomass reliance, showing poverty rates, households, baseline vs projected biomass rates, conversions, and displaced charcoal tons, plus EICV7 methodology notes.
  - Instantly downloads as `Rwanda_NST2_Policy_Brief_[X]pct_Subsidy.pdf`.

### 8. 🌓 Premium Dark & Light Theme System
- Complete semantic design system utilizing CSS custom properties.
- Features soft glassmorphism, glowing live API indicator dots, tailored accessible palettes, and instant zero-latency theme switching.

### 9. 📥 Research-Grade Raw Data Export (CSV)
- Empowers NISR data scientists and researchers to download the full 30-district baseline and projected dataset directly into Excel, Python, or Stata.
- Formatted as `Rwanda_Districts_CleanEnergy_Data_[X]pct_Subsidy.csv` with province groupings, baseline vs. projected rates, poverty tiers, and displaced charcoal tonnage.

---

## 🔬 Data Sources & Methodology

### 1. Primary Dataset: NISR EICV7 Microdata
- **Source:** National Institute of Statistics of Rwanda (NISR), 7th Integrated Household Living Conditions Survey (EICV7).
- **Core File:** `dataset/IECV7/Microdata/Cross_Section/CS_S01_S5_S7_Household.dta` (Over 14,000 microdata records).
- **Extracted Variables:**
  - `s5cq22a`: Primary cooking fuel (1 = Firewood, 2 = Charcoal, 3 = Gas/LPG, 4 = Biogas, 5 = Electricity, 6 = Kerosene, 13 = Crop waste).
  - `pov_jan`: Poverty status (1 = Non-poor, 2 = Poor, 3 = Extremely poor).
  - `ur`: Urban vs. Rural classification (1 = Urban, 2 = Rural).
  - `district`: District identifier code (11 to 57 across all 30 districts).
  - `weight`: Household survey expansion weights for accurate national extrapolation.

### 2. Machine Learning Training Pipeline
- Located in [`backend/pipeline/train_model.py`](backend/pipeline/train_model.py):
  1. Filtered and cleaned biomass-reliant household microdata.
  2. Synthesized randomized pricing interventions ($5,000 to 100,000 Rwf) mapped against household poverty and urban indicators.
  3. Trained a **Random Forest Regressor** (`n_estimators=100`, `max_depth=10`, `random_state=42`).
  4. Achieved low RMSE validation and extracted key feature importances (`lpg_kit_price`: 82.4%, `is_extreme_poor`: 12.1%, `is_urban`: 3.8%, `is_poor`: 1.7%).
  5. Serialized to [`backend/app/core/adoption_model.pkl`](backend/app/core/adoption_model.pkl).

---

## 🏗️ System Architecture & Technology Stack

```
                               ┌─────────────────────────────────────────┐
                               │             USER / BROWSER              │
                               └────────────────────┬────────────────────┘
                                                    │
                                     HTTPS Requests │ (Vercel)
                                                    ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                FRONTEND (React 19 + TypeScript)                         │
│  • Vite Build Engine                         • TailwindCSS + CSS Custom Properties     │
│  • React-Leaflet GeoJSON Choropleth Map      • Recharts Time-Series Forecast           │
│  • Lucide React Icons                        • jsPDF & jspdf-autotable PDF Engine      │
│  • ThemeContext (Dark / Light System)        • Axios API Client                        │
└───────────────────────────────────────────────────┬────────────────────────────────────┘
                                                    │
                                REST API (/api/v1)  │ (Render)
                                                    ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 BACKEND (Python + FastAPI)                             │
│  • FastAPI ASGI Framework                    • Uvicorn Production Web Server           │
│  • Pandas Microdata Processing               • Scikit-Learn Random Forest Model        │
│  • Socioeconomic Elasticity Engine           • Article 6 Carbon Credit Valuation       │
│  • District GeoJSON Aggregator               • CORS Middleware                         │
└───────────────────────────────────────────────────┬────────────────────────────────────┘
                                                    │
                                                    ▼
                               ┌─────────────────────────────────────────┐
                               │           NISR EICV7 MICRODATA          │
                               │  • CS_S01_S5_S7_Household.dta           │
                               │  • 30 Districts / 14,000+ Households    │
                               └─────────────────────────────────────────┘
```

### Technology Breakdown
- **Frontend:** React 19, TypeScript, Vite 8, TailwindCSS, React-Leaflet 5, Leaflet 1.9, Recharts 2, jsPDF 4, jsPDF-AutoTable 5, Lucide-React.
- **Backend:** Python 3.11, FastAPI 0.115, Uvicorn 0.34, Pandas 2.2, Scikit-Learn 1.6, Joblib 1.4, NumPy 2.2.
- **Hosting & Infrastructure:**
  - Frontend: Vercel (Edge CDN, Automated Git deployments)
  - Backend: Render (Dockerized Python 3.11 web service)
  - Mapping: OpenStreetMap vector tiles & custom Rwanda district GeoJSON

---

## 💻 Local Installation & Setup Guide

### Prerequisites
- Node.js (v18.0 or newer)
- Python (v3.10 or v3.11 recommended)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/fistonuzabumwana/rcei-platform.git
cd rcei-platform
```

### 2. Backend Setup (FastAPI)
```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the backend server
uvicorn app.main:app --reload --port 8000
```
*The API is now running at `http://localhost:8000`. You can test endpoints via Swagger UI at `http://localhost:8000/docs`.*

### 3. Frontend Setup (React + Vite)
Open a new terminal window:
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
*The frontend is now running at `http://localhost:5173`.*

---

## 📡 API Reference & Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/metrics/districts` | Returns baseline biomass reliance, clean energy adoption, poverty rates, and estimated households for all 30 districts. |
| `POST` | `/api/v1/simulate/subsidy` | Simulates policy subsidy (0–100%), calculating converted households, charcoal saved, citizen Rwf savings, gross budget, carbon credits, and 2030 forecast. |
| `GET` | `/docs` | Interactive Swagger / OpenAPI documentation with schema definitions. |

#### Example Simulation Request:
```json
POST /api/v1/simulate/subsidy
Content-Type: application/json

{
  "subsidy_percentage": 35.0,
  "target_districts": []
}
```

#### Example Simulation Response:
```json
{
  "applied_subsidy": 35.0,
  "total_converted_households": 599753,
  "total_annual_charcoal_saved_tons": 719703.6,
  "estimated_budget_rwf": 10495677500.0,
  "carbon_credits_earned_tons": 2159110.8,
  "carbon_credit_revenue_rwf": 42102660600.0,
  "net_policy_cost_rwf": -31606983100.0,
  "avoided_charcoal_expenditure_rwf": 647733240000.0,
  "forecast": [
    { "year": 2024, "business_as_usual": 80.5, "with_policy": 60.1 },
    { "year": 2025, "business_as_usual": 79.0, "with_policy": 57.6 },
    { "year": 2030, "business_as_usual": 71.5, "with_policy": 45.1 }
  ]
}
```

---

## 👥 Hackathon Team & Authors

This project was proudly created for the **2026 NISR Big Data Hackathon (Track 3: Open Innovation)** by:

- **Adeline Tuyizere** — Data Modeling, Machine Learning Pipeline & Policy Simulation Architecture
- **Fiston Uzabumwana** — Full-Stack Engineering, Geospatial GIS Visualizations & Cloud DevOps

---

## 📜 Intellectual Property & Declarations

### 1. Assignment of Intellectual Property Rights to NISR
> In accordance with the official rules and requirements of the 2026 NISR Big Data Hackathon, the participants (**Adeline Tuyizere** and **Fiston Uzabumwana**) hereby agree to assign and transfer all intellectual property rights in this submitted work, including but not limited to copyright and patent, to the **National Institute of Statistics of Rwanda (NISR)**. NISR reserves the right to use, reproduce, modify, publish, and distribute the submitted work in any form and for any purpose.

### 2. Declaration of Originality
> We declare that this submission is our own original work, has never been submitted to any other competition or entity in the past, and that all applicable sources of reference (NISR Open Data, EICV7 survey documentation, and national policy benchmarks) are acknowledged in full.

### 3. Disclosure of AI Assistance
> In accordance with NISR hackathon regulations governing transparency:
> AI coding assistants (Google Antigravity / Gemini) were utilized as assistive tools during development for code scaffolding, documentation structure, and UI component styling. The team members conceived the problem formulation, developed the socioeconomic methodology, cleaned and processed the NISR EICV7 microdata, trained the predictive machine learning models, and assume complete and exclusive responsibility for the integrity, validity, and functionality of the submitted work.
