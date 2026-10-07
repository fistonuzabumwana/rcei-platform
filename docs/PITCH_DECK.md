# 2026 NISR Big Data Hackathon — Pitch Presentation Deck
## Rwanda CleanEnergy Insights (RCEI) 🌍⚡
### NST2 Decision Platform & Socioeconomic Policy Simulator

**Track 3:** Open Innovation (National Strategy for Transformation & Vision 2050)  
**Presenter:** Adeline Tuyizere (Lead Data Modeling & ML) & Fiston Uzabumwana (Full-Stack & DevOps)  
**Time Limit:** 5–7 Minutes Pitch + 3 Minutes Jury Q&A  

---

## 📽️ Slide Breakdown & Pitch Narrative

### 🏷️ Slide 1: Title & The 2030 National Mandate
- **Headline:** Rwanda CleanEnergy Insights: Accelerating NST2 Clean Cooking Targets via Open Microdata & Machine Learning.
- **Visual:** Platform Hero Banner & Rwanda Tri-Color Ribbon.
- **Presenter Script:**
  > *"Distinguished jury members, under the National Strategy for Transformation (NST2), Rwanda has committed to reducing household biomass dependence from over 80% to under 50% by 2030. But for MININFRA and MINECOFIN, the defining question is: Where do we target subsidies to maximize citizen adoption without draining national coffers? We built Rwanda CleanEnergy Insights to answer this definitively."*

---

### 🚨 Slide 2: The Core Problem — Deforestation, Health & Time Poverty
- **Key Statistics:**
  - **80.5%** national biomass cooking reliance (exceeding 90% in rural districts).
  - **Over 5,000** premature respiratory deaths annually in Rwanda from household air pollution (predominantly women and infants).
  - **14 hours / week** spent by rural women in unpaid fuel collection.
- **The Policy Dilemma:** Blanket national subsidies waste limited budget on wealthy urban households while leaving vulnerable rural districts behind.

---

### 🔬 Slide 3: Data Integrity — Ingesting NISR EICV7 Microdata
- **Source:** NISR 7th Integrated Household Living Conditions Survey (`CS_S01_S5_S7_Household.dta`).
- **Data Pipeline:**
  - Ingested **14,000+ representative household microdata records**.
  - Normalized with household expansion weights to represent Rwanda's **3.3 million private households**.
  - Isolated primary cooking fuel (`s5cq22a`), poverty tiers (`pov_jan`), and urban/rural classification (`ur`).
  - Mapped across all **30 administrative districts** from Gisagara (96.2% biomass) to Kicukiro (38.4% biomass).

---

### 🤖 Slide 4: Tech Innovation — The Random Forest Adoption Model
- **Algorithmic Engine:** Scikit-Learn `RandomForestRegressor` trained on empirical microdata.
- **Why ML instead of flat percentages?**
  - Real human decision-making follows an **S-curve adoption pattern**.
  - Vulnerable households (`pov_jan = 3`) exhibit **2.8x higher price sensitivity** to upfront LPG kit costs than non-poor households.
- **Feature Importance:**
  - `lpg_kit_price`: 82.4%
  - `is_extreme_poor`: 12.1%
  - `is_urban`: 3.8%
  - `is_poor`: 1.7%

---

### 🗺️ Slide 5: Live Platform Demo — Spatial GIS & Policy Targeting
- **Live Action 1:** Show Rwanda's 30-district interactive Leaflet choropleth map.
- **Live Action 2:** Click **Gisagara District** on the map — slide open the **District Scorecard Drawer** (#1 Urgency Rank, 96.2% baseline biomass, 44.8% poverty).
- **Live Action 3:** In the Policy Simulator, select **"Top 10 Priority Districts"** and apply a **40% Subsidy**.
- **Live Action 4:** Watch the map recolor dynamically! Notice that the required subsidy budget drops from **12 Billion Rwf to just 3.8 Billion Rwf**, while converting 190,000 of the nation's most vulnerable households.

---

### 💰 Slide 6: The Economic Breakthrough — Article 6 Carbon Self-Funding
- **Carbon Physics:** 1 ton of charcoal saved mitigates **3.0 metric tons of CO₂e**.
- **Monetization Engine:**
  - Modeled under **Article 6 of the Paris Agreement** at a conservative **$15 USD / tCO₂e** transfer price.
- **The Fiscal Result:**
  - In a 40% subsidy scenario, sovereign carbon credit revenues (**~13.3 Billion Rwf**) exceed the government subsidy budget (**~3.8 Billion Rwf**).
  - **Net Policy Balance:** Generates a **+9.5 Billion Rwf sovereign net fiscal surplus**!
  - **Citizen Relief:** Saves Rwandan families **~154,000 Rwf / family / year** in avoided retail charcoal costs.

---

### 📄 Slide 7: Actionable Deliverables & Institutional Adoption
- **1-Click Executive PDF Policy Brief:** Reconstructed from scratch using `jspdf` into a publication-grade 2-page A4 brief with MININFRA/NISR branding.
- **Research Data Export (CSV):** 1-click download of all 30 district baseline & simulated indicators for NISR analysts.
- **Production Readiness:**
  - Live Frontend: Vercel CDN (`rwanda-cleanenergy-insights-nisr.fistonuz.me`)
  - Live Backend: Render Dockerized FastAPI (`/docs`)
  - Open-Source: Full GitHub repo, tests, and documentation.

---

## 🎯 Jury Q&A Defense Strategy (Answering the Judges)

### ❓ Question 1: *"How realistic is the $15/ton carbon credit price in Rwanda?"*
> **Answer:** *"Rwanda is already an international pioneer in Article 6 carbon finance, having signed bilateral Article 6.2 cooperation agreements with Singapore and Sweden. Voluntary and compliance markets for high-integrity clean cooking projects currently trade between $12 and $18 USD per ton. Our $15 benchmark is conservative and aligns with recent Article 6 transactions in East Africa."*

### ❓ Question 2: *"Why did you use Random Forest instead of simple linear regression?"*
> **Answer:** *"Clean cooking adoption has severe non-linear threshold effects. A 5,000 Rwf discount does very little for an extreme-poor household, but once a subsidy crosses the 50% liquidity threshold, adoption probability accelerates rapidly. Linear regression assumes a constant slope; Random Forest captures the true non-linear S-curve and interactions between poverty status, urban distribution proximity, and kit price."*

### ❓ Question 3: *"How does this platform directly help MININFRA or local district mayors?"*
> **Answer:** *"Currently, district mayors receive national targets without district-specific fiscal models. With our platform, the Mayor of Gisagara or Nyaruguru can see the exact number of households they can convert with a specific district budget, while MININFRA can issue targeted social protection vouchers aligned with the VUP program."*
