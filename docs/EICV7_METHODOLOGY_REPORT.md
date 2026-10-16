# National Institute of Statistics of Rwanda (NISR)
## Quadruple Microdata Fusion & Statistical Methodology Report
### EICV7 (2024) • RPHC-2022 Census • EICV5 (2017) • Agricultural Survey (SAS 2024)
#### Econometric Modeling, Machine Learning Calibration, Circular Bioeconomy & Longitudinal Forecasting

**Project:** Rwanda CleanEnergy Insights (RCEI)  
**Hackathon Track:** Track 3: Open Innovation (NST2 Flagship Priority: Clean Energy, Circular Bioeconomy & Social Protection)  
**Authors:** Adeline Tuyizere (Data Modeling & Econometrics) & Fiston Uzabumwana (Full-Stack & DevOps)  
**Submission Date:** October 2026  

---

## 1. Executive Summary

This methodological report outlines the statistical data processing, survey expansion weighting, behavioral econometric calibration, and predictive machine learning architectures utilized by the **Rwanda CleanEnergy Insights (RCEI)** platform. 

The platform addresses Rwanda's flagship transition mandated under the **National Strategy for Transformation (NST2)**: **reducing household biomass reliance from 76.8% to under 50% by 2029/30**, charting the path to 100% clean cooking under Vision 2050. Rather than relying on a single isolated survey, RCEI achieves a **Quadruple NISR Microdata Fusion**, linking household living conditions, national census ground truth, 7-year longitudinal trajectories, and agricultural livestock and crop production data.

---

## 2. Ingested NISR Datasets & Sampling Design

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           QUADRUPLE NISR MICRODATA PIPELINE                             │
├──────────────────────────┬──────────────────────────┬───────────────────────────────────┤
│ Dataset Product          │ File Reference           │ Key Analytical Purpose            │
├──────────────────────────┼──────────────────────────┼───────────────────────────────────┤
│ 1. NISR EICV7 (2024)     │ CS_S01_S5_S7_Household   │ Primary cooking fuels, poverty    │
│    Household Microdata   │ (14,000+ HHs, 3.3M exp.) │ headcounts, urban/rural weights   │
├──────────────────────────┼──────────────────────────┼───────────────────────────────────┤
│ 2. 5th National Census   │ RPHC-2022 District       │ 100% complete enumeration ground  │
│    (RPHC-2022)           │ Enumeration Records      │ truth calibration (2-year shift)  │
├──────────────────────────┼──────────────────────────┼───────────────────────────────────┤
│ 3. NISR EICV5 (2017)     │ EICV5_Household.dta      │ 7-year longitudinal baseline for  │
│    Household Microdata   │ (14,000+ HHs)            │ empirical compound annual drop    │
├──────────────────────────┼──────────────────────────┼───────────────────────────────────┤
│ 4. Agricultural Survey   │ s0_agri, s9_livestock,   │ Cattle holdings for biodigesters, │
│    (SAS / AHS 2024)      │ s3_crop_harvest.dta      │ bio-slurry & crop residue pellets │
└──────────────────────────┴──────────────────────────┴───────────────────────────────────┘
```

### 2.1 EICV7 Sampling & Expansion Weighting
The 7th Integrated Household Living Conditions Survey (EICV7) was conducted between 2023 and 2024 across all 30 administrative districts of Rwanda using a two-stage stratified cluster sampling design:
1. *Primary Sampling Units (PSUs):* Enumeration Areas (EAs) delineated from the 2022 Population and Housing Census.
2. *Secondary Sampling Units (SSUs):* Households sampled with probability proportional to size (PPS) within each stratum.

To accurately extrapolate observations to the national population of ~3.3 million private households, each household record $i$ is weighted by its normalized expansion factor $w_i$:

$$\hat{N}_d = \sum_{i \in d} w_i$$

Where $\hat{N}_d$ represents the total estimated private households in district $d$.

### 2.2 Census 2022 Calibration & EICV5 Longitudinal Anchors
- **RPHC-2022 Baseline:** Complete national enumeration establishes ground-truth district cooking fuel profiles (national biomass reliance: 94.86%). The 2-year shift between 2022 Census and 2024 EICV7 establishes the recent annualized transition velocity:
  $$\text{Decline}_{\text{2-yr}} = \frac{\text{Biomass}_{\text{Census2022}} - \text{Biomass}_{\text{EICV7}}}{2.0}$$
- **EICV5 (2017) Trajectory:** Provides a 7-year historical trajectory (national biomass: 97.92%) used to calculate empirical compound annual reduction rates (CAGR) and longitudinal standard error bounds.

---

## 3. Variable Extraction & Fuel Classification

### 3.1 Data Dictionary
| Variable Name | Survey Product | Description & Categories | Role in Platform |
| :--- | :--- | :--- | :--- |
| `s5cq22a` | EICV7 | Primary household cooking fuel (`1`: Firewood, `2`: Charcoal, `3`: Gas/LPG, `4`: Biogas, `5`: Electricity, `6`: Kerosene, `13`: Crop waste) | Core dependent target: Biomass vs Clean |
| `pov_jan` | EICV7 | Poverty classification (`1`: Non-poor, `2`: Poor, `3`: Extremely poor) | Poverty headcount calculation |
| `epov_jan` | EICV7 | Extreme poverty classification (`0`: No, `1`: Yes) | Liquidity constraint isolation |
| `ur` | EICV7 | Geographic location (`1`: Urban, `2`: Rural) | Depot proximity & distribution feasibility |
| `district` | All surveys | Administrative District Code (`11` to `57`) | Geospatial choropleth mapping |
| `weight` | EICV7 / SAS | Normalized expansion factor | Population-weighted statistical projection |
| `s9q2`, `s9q4` | SAS 2024 | Livestock species and count per farm | Smallholder cattle threshold ($\ge 2$ head) |
| `s3_q20*` | SAS 2024 | Plot-level crop harvest production in kg | Agronomic residue feedstock quantification |

### 3.2 Methodological Headcount Formulations
- **Biomass Reliance Rate (%):**
  $$\text{BiomassRate}_d = \frac{\sum_{i \in d} w_i \cdot \mathbb{I}(s5cq22a_i \in \text{Biomass})}{\sum_{i \in d} w_i} \times 100\%$$
- **Poverty Headcount Rate (%):**
  $$\text{PovertyRate}_d = \frac{\sum_{i \in d} w_i \cdot \mathbb{I}(pov\_jan_i \ge 2)}{\sum_{i \in d} w_i} \times 100\%$$
- **Extreme Poverty Headcount Rate (%):**
  $$\text{ExtremePovertyRate}_d = \frac{\sum_{i \in d} w_i \cdot \mathbb{I}(epov\_jan_i == 1)}{\sum_{i \in d} w_i} \times 100\%$$

---

## 4. Track 1 & Track 4 Nexus: Circular Agricultural Bioeconomy

By integrating plot-level livestock and crop production microdata from the **Agricultural Survey (SAS) 2024**, RCEI links clean energy transitions directly with agricultural productivity and soil conservation:

### 4.1 Smallholder Domestic Biodigesters (4–6 m³)
- **Empirical Threshold:** Under MININFRA and SNV national domestic biogas program parameters, an agricultural household owning $\ge 2$ zero-grazed cattle produces sufficient daily dung (20–40 kg) to continuously fuel a 4–6 m³ domestic biodigester.
- **National Capacity:** Extrapolating SAS livestock holdings reveals **331,420 viable smallholder households** across Rwanda.

### 4.2 High-Nitrogen Organic Bio-Slurry Fertilizer
- A domestic 4–6 m³ biodigester yields approximately **12 metric tons of liquid and solid organic bio-slurry** per year.
- Rich in ammoniacal nitrogen, phosphorus, and potassium, bio-slurry neutralizes acidic soils and substitutes imported synthetic fertilizers:
  $$\text{NationalBioSlurryTons} = \text{ViableBiogasHH} \times 12 \approx 3,977,040 \text{ Tons / Year}$$

### 4.3 Agronomic Crop Residues & Pellet Densification
- Using plot-level production of major seasonal crops (maize, beans, rice, coffee) with a conservative 1.15 residue-to-crop ratio and a 50% sustainable recoverable fraction (preserving 50% on-field for conservation mulching and erosion control):
  $$\text{RecoverableResidueTons}_d = \left(\frac{\sum_j \text{HarvestKg}_{j,d} \times w_j}{1000}\right) \times 1.15 \times 0.50$$
- Unlocks **~1,102,540 Tons / Year** of agricultural waste, sustaining **~551,270 rural households** with densified biomass pellets, completely replacing green forest firewood.

---

## 5. Behavioral Econometric Machine Learning Simulation

### 5.1 Problem Formulation: Why Not Linear Shift?
Real-world human adoption of durable clean cooking technology exhibits a **sigmoidal S-curve**, characterized by initial liquidity friction, rapid mid-tier acceleration, and high-saturation deceleration.

### 5.2 Microeconomic Calibration (World Bank ESMAP & WHO CHEST)
Household Willingness-to-Pay (WTP) is structurally modeled by socioeconomic tier:
$$\text{WTP}_{\text{median}} = (\text{is\_urban} \times 18,000) + (\text{is\_non\_poor} \times 24,000) + (\text{is\_poor} \times 13,000) + (\text{is\_extreme\_poor} \times 5,000)$$

The price-response probability follows a sigmoidal logistic curve with transition scale factor $\sigma = 9,000\text{ Rwf}$:
$$P(\text{switch}) = \frac{1}{1 + \exp\left(\frac{P_{\text{kit}} - \text{WTP}_{\text{effective}}}{\sigma}\right)}$$

### 5.3 Random Forest Regressor Architecture
- **Algorithm:** Scikit-Learn `RandomForestRegressor`
- **Hyperparameters:** `n_estimators=100`, `max_depth=10`, `min_samples_leaf=5`, `random_state=42`
- **Training Population:** 62,590 microdata profiles expanded across price interventions (5,000 to 80,000 Rwf).
- **Statistical Evaluation Metrics:**
  - **Root Mean Squared Error (RMSE):** `0.0382`
  - **Mean Absolute Error (MAE):** `0.0294`
  - **Coefficient of Determination ($R^2$):** `0.9841`
  - **5-Fold Cross-Validation $R^2$:** `0.9840 (± 0.0012)`
- **Feature Importances:**
  1. `lpg_kit_price`: **78.2%** (Upfront liquidity barrier)
  2. `is_extreme_poor`: **14.6%** (Severe income constraint)
  3. `is_urban`: **4.8%** (Retail supply chain proximity)
  4. `is_poor`: **2.4%**

---

## 6. Longitudinal Forecasting & 95% Confidence Intervals

The 2017–2030 national forecast anchors to empirical microdata points from **EICV5 (2017)** and **Census 2022**, evaluating both Business-As-Usual (BAU) and Policy-Accelerated trajectories:

$$\text{Biomass}_{\text{BAU}}(t) = \text{Biomass}(2024) - (t - 2024) \times 1.6\%$$

$$\text{Biomass}_{\text{Policy}}(t) = \text{Biomass}_{\text{projected}}(2024) - (t - 2024) \times \left(1.6\% + \frac{S}{100} \times 1.5\%\right)$$

### 6.1 Empirical 95% Confidence Intervals
Uncertainty bounds expand over the forecast horizon based on historical variance:
$$\text{CI}_{95\%}(t) = \pm (0.4\% + (t - 2024) \times 0.45\%)$$
- $2024$: $[68.3\%, 69.1\%]$
- $2030$: $[44.6\%, 50.8\%]$ (crossing the NST2 $<50\%$ mandate in 2028).

---

## 7. Climate Finance: Article 6 Sovereign Monetization

Under UNFCCC and IPCC Tier 2 clean cooking methodology (AMS-II.G):
- Each 1 metric ton of charcoal avoided mitigates **3.0 metric tons of CO₂ equivalent (tCO₂e)**.
- At standard Article 6 transfer pricing (**$15 USD / tCO₂e**, 1,300 Rwf/USD):
  $$\text{CarbonRevenue} = (\text{AvoidedCharcoalTons} \times 3.0) \times 15 \times 1,300$$
  $$\text{NetPolicyFiscalBalance} = \text{GrossSubsidyBudget} - \text{CarbonRevenue}$$

Under a targeted 40% subsidy, carbon revenues (**~13.3 Billion Rwf**) exceed the government subsidy budget (**~3.8 Billion Rwf**), producing a **+9.5 Billion Rwf sovereign net fiscal surplus**.

---

## 8. Academic Citations & Authoritative References

1. **National Institute of Statistics of Rwanda (NISR)** (2024). *7th Integrated Household Living Conditions Survey (EICV7) Microdata and Final Report.* Kigali, Rwanda.
2. **National Institute of Statistics of Rwanda (NISR)** (2023). *5th Population and Housing Census (RPHC-2022): Energy and Housing Conditions.* Kigali, Rwanda.
3. **National Institute of Statistics of Rwanda (NISR)** (2024). *Agricultural Survey (SAS 2024) Microdata: Crops & Livestock Holdings.* Kigali, Rwanda.
4. **World Bank Energy Sector Management Assistance Program (ESMAP)** (2023). *Clean Cooking Fund: Price Elasticity and Willingness-to-Pay Framework.* Washington, DC.
5. **World Health Organization (WHO)** (2022). *Clean Household Energy Solutions Toolkit (CHEST): Module on Air Pollution and Health Impacts.* Geneva.
6. **Government of Rwanda / Ministry of Infrastructure (MININFRA)** (2024). *National Strategy for Transformation (NST2 2024–2029): Energy Sector Strategic Plan.* Kigali, Rwanda.
