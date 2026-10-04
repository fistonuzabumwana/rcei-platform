# Rwanda CleanEnergy Insights 🌍⚡

**NST2 Decision Platform & Policy Simulator**

Welcome to the **Rwanda CleanEnergy Insights** platform, an advanced data-driven web application built for the **2026 NISR Big Data Hackathon (Track 3: Open Innovation)**. 

This platform empowers policymakers, planners, and stakeholders to track Rwanda's progress toward the National Strategy for Transformation (NST2) goal of achieving **100% clean cooking energy by 2030**. 

### 🚀 Live Demo
- **Frontend (Live):** [https://rwanda-cleanenergy-insights-nisr.fistonuz.me](https://rwanda-cleanenergy-insights-nisr.fistonuz.me)
- **Backend API (Render):** [https://rcei-backend.onrender.com/docs](https://rcei-backend.onrender.com/docs)

---

## 🎯 The Problem & Our Solution
Rwanda currently faces a high reliance on biomass (firewood and charcoal) for cooking, which causes severe deforestation, indoor air pollution, and health complications. Under NST2 and Vision 2050, the government aims to eradicate this reliance entirely.

**Our Solution:**
We built a real-time web platform that processes raw microdata from the NISR EICV7 survey to map current biomass reliance across all 30 Rwandan districts. 

### ✨ Core Features
1. **Interactive District Map**: Instantly visualize biomass reliance vs. clean energy adoption across the entire nation with pinpoint accurate district coordinates.
2. **Policy Simulator (Budget Estimator)**: Slide to apply government subsidies to LPG/Clean Fuel kits. The system calculates how many households will transition, how many tons of charcoal are saved, and the **Estimated Government Budget required in Rwf**.
3. **Live Map Projection**: Running a simulation dynamically feeds data back into the interactive map. Watch district colors shift in real-time as your simulated policies lift them out of critical biomass reliance.
4. **Poverty-Weighted Elasticity Model**: Our simulator isn't just a flat rate. It ingests EICV7 poverty data (`pov_jan`). Poorer districts are mathematically modeled to be more price-sensitive, meaning subsidies have a realistic, disproportionately powerful impact in vulnerable areas.

---

## 🧮 Data & Methodology
Our platform relies heavily on authentic open data provided by NISR:
*   **NISR EICV7 Household Microdata (`CS_S01_S5_S7_Household.dta`)**: Processed using Python (Pandas). We extract `s5cq22a` (primary cooking fuel) and map it to Clean vs. Biomass categories based on real survey weights. 
*   **Poverty Analysis**: We ingest `pov_jan` (Poverty Rate) to calculate the socioeconomic vulnerability of each district.
*   **Predictive Simulator**: Instead of a flat transition rate, our backend uses a dynamic elasticity formula. Poorer districts are mathematically modeled to be more price-sensitive, meaning a 20% subsidy will have a significantly higher adoption impact in high-poverty districts compared to wealthier ones

## 🏆 Hackathon Evaluation Alignment

This project was specifically designed to maximize impact across all 5 evaluation criteria for **Track 3: Open Innovation**:

1. **Problem Understanding (NST2/Vision 2050)**: Directly addresses the NST2 mandate to achieve 100% clean cooking energy by 2030 by identifying current gaps and modeling the path forward.
2. **Data Use & Methodology**: We processed raw NISR EICV7 microdata (`CS_S01_S5_S7_Household.dta`) to extract fuel usage (`s5cq22a`) and cross-referenced it with district-level poverty metrics (`pov_jan`) for deep socioeconomic context.
3. **Tech Innovation**: Instead of flat dashboards, we built a **Predictive Policy Simulator** using an economic elasticity model to simulate real-world human behavior in response to government pricing interventions.
4. **Usability & Design**: Features a highly intuitive, glassmorphism-inspired UI with live, dynamically recoloring interactive maps (React-Leaflet).
5. **Tangible Impact**: Engineered explicitly for real-world government use. Policymakers can instantly see the **Rwf Budget Required** and the exact number of households transitioning per district, allowing for hyper-targeted, budget-conscious policy rollouts.

---

## 🛠️ Technology Stack
*   **Frontend**: React, TypeScript, Vite, TailwindCSS, React-Leaflet.
*   **Backend**: Python, FastAPI, Pandas, Uvicorn.
*   **CI/CD**: GitHub Actions, Vercel (Frontend Hosting), Render (Backend Hosting).

---

## 💻 Running the Project Locally

### 1. Start the Backend (FastAPI)
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # On Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 2. Start the Frontend (React)
```bash
cd frontend
npm install
npm run dev
```

---

## 👥 Team & Declarations
This project was developed by **Adeline Tuyizere** & **Fiston Uzabumwana** for the 2026 NISR Big Data Hackathon. 

* **Originality Declaration**: We declare that this submission is our own original work, has never been submitted to any other competition or entity in the past, and that all applicable sources of reference (NISR Open Data) are acknowledged in full.
* **IP Agreement**: By submitting this project, we agree to assign and transfer all intellectual property rights in this submitted work, including but not limited to copyright and patent, to the National Institute of Statistics of Rwanda (NISR).
