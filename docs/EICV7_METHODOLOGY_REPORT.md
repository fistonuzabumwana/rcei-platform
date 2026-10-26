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

The platform addresses the NST2 clean-cooking priority: household biomass reliance under 50% by 2029/30, on the path to Vision 2050. The household-weighted EICV7 baseline in `district_metrics.json` is **93.95% biomass**, **5.42% clean fuel**, and **23.37% poverty** across **3,289,805** households. Census 2022 biomass is **94.84%** and EICV5 biomass is **97.88%**. Those three surveys are the measured story.

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
│ 2. 5th National Census   │ PHC5_Public_microdata    │ 2022 cooking-fuel anchor from the │
│    (RPHC-2022)           │ (331,917 HH-head rows)   │ public-use sample (2-year shift)  │
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
- **RPHC-2022 Anchor:** The 2022 point comes from the NISR public-use census microdata file (`PHC5_Public_microdata.dta`), not the full enumeration. The pipeline keeps household-head rows (`p02 == 1`, 331,917 households), classifies `h16`, and takes an unweighted district mean. The household-weighted national figure is **94.84%** biomass. The 2-year shift to EICV7 is reported per district:
  $$\text{Decline}_{\text{2-yr}} = \frac{\text{Biomass}_{\text{Census2022}} - \text{Biomass}_{\text{EICV7}}}{2.0}$$
- **EICV5 (2017) Anchor:** Household-weighted national biomass **97.88%**, clean **1.22%** (14,580 sampled households). The measured 2017 to 2024 national decline, \((97.88 - 93.95) / 7 \approx 0.56\) percentage points per year, is the business-as-usual slope used in the forecast (section 6).

---

## 3. Variable Extraction & Fuel Classification

### 3.1 Data Dictionary
| Variable Name | Survey Product | Description & Categories | Role in Platform |
| :--- | :--- | :--- | :--- |
| `s5cq22a` | EICV7 | Primary cooking fuel. Biomass in this build: `1` firewood, `2` charcoal, `4` peat, `8` crop waste, `12` sawdust, `13` straw/grass. Clean: `3` gas, `6` biogas, `7` oil/kerosene, `10` briquette, `11` electricity. Kerosene is not WHO-clean; it is 0.006% of weighted households, so including it does not change any reported rate. | Measured fuel outcome and classifier target |
| `pov_jan` | EICV7 | `0` non-poor, `1` poor (includes extreme poor) | Poverty headcount. Poor means `pov_jan == 1`, not `>= 2`. |
| `epov_jan` | EICV7 | Extreme poverty classification (`0`: No, `1`: Yes) | Liquidity constraint isolation |
| `ur` | EICV7 | Geographic location (`1`: Urban, `2`: Rural) | Depot proximity & distribution feasibility |
| `s5cq14` | EICV7 | Electricity connection (`1` grid, `2` solar only, `3` grid and solar, `4` none) | Classifier feature `is_grid_connected` |
| `quintile` | EICV7 | Quintile of real consumption per adult equivalent (`1` to `5`) | Classifier feature `consumption_quintile` |
| `s5fq0`, `s5fq3a`, `s5fq3b` | EICV7 access-to-services | Service id (`2` = food market / shop), travel time in hours and minutes | Classifier feature `minutes_to_food_market` |
| `district` | All surveys | Administrative District Code (`11` to `57`) | Geospatial choropleth mapping |
| `weight` | EICV7 / SAS | Normalized expansion factor | Population-weighted statistical projection |
| `s9q2`, `s9q4` | SAS 2024 | Livestock species and count per farm | Smallholder cattle threshold ($\ge 2$ head) |
| `s3_q20*` | SAS 2024 | Plot-level crop harvest production in kg | Agronomic residue feedstock quantification |

### 3.2 Methodological Headcount Formulations
- **Biomass Reliance Rate (%):**
  $$\text{BiomassRate}_d = \frac{\sum_{i \in d} w_i \cdot \mathbb{I}(s5cq22a_i \in \text{Biomass})}{\sum_{i \in d} w_i} \times 100\%$$
- **Poverty Headcount Rate (%):**
  $$\text{PovertyRate}_d = \frac{\sum_{i \in d} w_i \cdot \mathbb{I}(pov\_jan_i = 1)}{\sum_{i \in d} w_i} \times 100\%$$
- **Extreme Poverty Headcount Rate (%):**
  $$\text{ExtremePovertyRate}_d = \frac{\sum_{i \in d} w_i \cdot \mathbb{I}(epov\_jan_i == 1)}{\sum_{i \in d} w_i} \times 100\%$$

---

## 4. Agricultural bioeconomy from SAS 2024

Cattle counts and harvest kilograms are measured. The totals below also apply assumption multipliers: biogas households = all district households × cattle-household share × 0.75; slurry = those households × 12 tonnes; residue = weighted harvest tonnes × 1.15; pellets = residue × 0.50.

By integrating plot-level livestock and crop production microdata from the **Agricultural Survey (SAS) 2024**, RCEI links clean energy transitions directly with agricultural productivity and soil conservation:

### 4.1 Smallholder Domestic Biodigesters (4–6 m³)
- **Empirical Threshold:** Under MININFRA and SNV national domestic biogas program parameters, an agricultural household owning $\ge 2$ zero-grazed cattle produces sufficient daily dung (20–40 kg) to continuously fuel a 4–6 m³ domestic biodigester.
- **National figure in the current JSON:** **390,320** households after the 0.75 multiplier. This is not a count of installed biodigesters.

### 4.2 High-Nitrogen Organic Bio-Slurry Fertilizer
- A domestic 4–6 m³ biodigester yields approximately **12 metric tons of liquid and solid organic bio-slurry** per year.
- Rich in ammoniacal nitrogen, phosphorus, and potassium, bio-slurry neutralizes acidic soils and substitutes imported synthetic fertilizers:
  $$\text{NationalBioSlurryTons} = \text{ViableBiogasHH} \times 12 = 4,683,840 \text{ tonnes / year in the current JSON}$$

### 4.3 Agronomic Crop Residues & Pellet Densification
- Using plot-level production of major seasonal crops (maize, beans, rice, coffee) with a conservative 1.15 residue-to-crop ratio and a 50% sustainable recoverable fraction (preserving 50% on-field for conservation mulching and erosion control):
  $$\text{RecoverableResidueTons}_d = \left(\frac{\sum_j \text{HarvestKg}_{j,d} \times w_j}{1000}\right) \times 1.15 \times 0.50$$
- Current JSON: **6,163,552 tonnes** of residue feedstock and **3,081,777 tonnes** of pellet potential. Compare the weighted harvest sum with the published SAS 2024 crop total before treating the residue figure as official production.

---

## 5. Observed-fuel classifier and a separate subsidy scenario

### 5.1 Classifier
`backend/pipeline/train_model.py` trains a `RandomForestClassifier` (`class_weight="balanced"`, 200 trees, `max_depth=10`, `min_samples_leaf=5`, `random_state=42`) on observed `s5cq22a`. The positive class is clean fuel (codes 3, 10, 6, 11, 7). There is no synthetic price or willingness-to-pay label.

Six features, all measured EICV7 household variables:

| Feature | Source | Definition |
| :--- | :--- | :--- |
| `is_urban` | Household file `ur` | `ur == 1` |
| `is_poor` | Household file `pov_jan`, `epov_jan` | moderate poor: `pov_jan == 1` and `epov_jan == 0` |
| `is_extreme_poor` | Household file `epov_jan` | `epov_jan == 1` |
| `is_grid_connected` | Household file `s5cq14` | `1` grid or `3` grid and solar |
| `consumption_quintile` | Household file `quintile` | real consumption per adult equivalent, 1 (lowest) to 5 |
| `minutes_to_food_market` | `CS_S5F_access_to_services.dta`, service `s5fq0 == 2` | `s5fq3a × 60 + s5fq3b`; 1,026 households without a recorded time are filled with the 40-minute sample median |

Grid connection and market distance are infrastructure features, not fuel variables, so they do not leak the target. Stove type (`s5cq21`) was deliberately excluded because it is close to a restatement of the fuel.

From `backend/app/core/model_metrics.json` (stratified 80/20 split, `random_state=42`):

| Metric | Three flags only | Six features |
| :--- | :---: | :---: |
| Test ROC-AUC | 0.8759 | **0.9452** |
| Balanced accuracy | 0.8677 | **0.8856** |
| 5-fold CV ROC-AUC | 0.8634 | **0.9368 (± 0.0117)** |

- Sample size: **14,966** households (held-out test size 2,994), unweighted clean-fuel base rate **5.12%**
- Feature importance: `consumption_quintile` **49.5%**, `is_urban` **25.0%**, `is_grid_connected` **14.6%**, `minutes_to_food_market` **8.0%**, `is_poor` **2.5%**, `is_extreme_poor` **0.3%**

The measured, household-weighted cross-tabs behind those importances: clean fuel is **10.65%** among grid-connected households and **0.12%** among the rest; by consumption quintile it is Q1 **0.00%**, Q2 **0.11%**, Q3 **0.41%**, Q4 **1.29%**, Q5 **22.26%**. Clean cooking in Rwanda today is a top-quintile, grid-connected phenomenon.

The classifier does not predict subsidy response. Raw accuracy is not the headline, because most households already use biomass.

### 5.2 Subsidy scenario rule
For a subsidy percentage \(S > 0\) and a district poverty rate \(p\):

$$\text{shift} = \min\left(\frac{S}{10} \times \left(0.02 + \frac{p}{100} \times 0.03\right), 1\right)$$

Converted households are current biomass households times that shift. A 40% national run of this rule converts **336,331** households and displaces **74,442 tonnes** of charcoal. Kit price (50,000 RWF) and 1.2 tonnes of biomass per household are assumptions.

Weighted clean-fuel rates by poverty, from the same household file: non-poor **7.06%**, moderate poor **0.04%**, extreme poor **0.00%**.

---

## 6. Forecast scenario band

2017, 2022 and 2024 on the chart are the household-weighted EICV5, census and EICV7 biomass rates (**97.9%**, **94.8%**, **94.0%**). Business as usual continues the measured 2017 to 2024 slope:

$$m = \frac{\text{Biomass}(2017) - \text{Biomass}(2024)}{7} \approx 0.56 \text{ points per year}$$

$$\text{Biomass}_{\text{BAU}}(t) = \text{Biomass}(2024) - (t - 2024) \times m$$

$$\text{Biomass}_{\text{Policy}}(t) = \text{Biomass}_{\text{after subsidy}}(2024) - (t - 2024) \times \left(m + \frac{S}{100} \times 1.5\right)$$

The slope \(m\) is measured. The extra 1.5 points per year at a 100% subsidy, the one-time 2024 step from the shift rule, and the constant household count are assumptions. The API returns both slopes in `forecast_slopes`. The shaded band is \(\pm (0.5 + 0.6 \sqrt{t - 2024})\) percentage points and is not a confidence interval.

Under this path, business as usual reaches about **90.6%** biomass in 2030, a 40% national subsidy about **76.8%**, and a 70% subsidy about **66.4%**. None of the subsidy-only scenarios reaches the NST2 target of under 50%. That is a finding of the tool: a kit subsidy on its own, at the measured pace of change, does not close the gap, so supply-side measures (LPG distribution, electricity tariffs, biogas programmes) have to carry the rest.

---

## 7. Climate Finance: Article 6 Sovereign Monetization

These factors are assumptions, not EICV fields: 3.0 tCO₂e per tonne of charcoal, the selected dollar price, and 1,300 RWF per USD.

$$\text{CarbonRevenue} = (\text{AvoidedCharcoalTons} \times 3.0) \times \text{Price}_{\text{USD}} \times 1,300$$

A national 40% scenario at $15 returns carbon revenue of about **4.35 billion RWF** and a subsidy budget of about **6.73 billion RWF**, so the net figure is a **cost of about 2.37 billion RWF**. It is not a fiscal surplus. Changing the price in the request changes the revenue. The UI and the PDF both use the price the API returns.

---

## 8. Academic Citations & Authoritative References

1. **National Institute of Statistics of Rwanda (NISR)** (2024). *7th Integrated Household Living Conditions Survey (EICV7) Microdata and Final Report.* Kigali, Rwanda.
2. **National Institute of Statistics of Rwanda (NISR)** (2023). *5th Population and Housing Census (RPHC-2022): Energy and Housing Conditions.* Kigali, Rwanda.
3. **National Institute of Statistics of Rwanda (NISR)** (2024). *Agricultural Survey (SAS 2024) Microdata: Crops & Livestock Holdings.* Kigali, Rwanda.
4. **Government of Rwanda / Ministry of Infrastructure (MININFRA)** (2024). *National Strategy for Transformation (NST2 2024–2029).* Kigali, Rwanda.

ESMAP and WHO are not inputs to the classifier or the subsidy rule in this build.
