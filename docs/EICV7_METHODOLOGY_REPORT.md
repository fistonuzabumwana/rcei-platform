# National Institute of Statistics of Rwanda (NISR)
## 7th Integrated Household Living Conditions Survey (EICV7)
### Econometric Modeling, Machine Learning Calibration & Statistical Methodology Report

**Project:** Rwanda CleanEnergy Insights (RCEI)  
**Hackathon Track:** Track 3: Open Innovation (NST2 & Vision 2050 Energy Transition)  
**Authors:** Adeline Tuyizere & Fiston Uzabumwana  
**Submission Date:** October 2026  

---

## 1. Executive Summary

This methodological document outlines the statistical data processing, survey weighting, and predictive machine learning architectures utilized by the **Rwanda CleanEnergy Insights (RCEI)** platform. 

The primary objective is to evaluate household cooking energy transition pathways toward the **National Strategy for Transformation (NST2)** target of **reducing biomass dependency from >80% to under 50% by 2030**. All baseline metrics and econometric elasticity curves are empirically derived from raw microdata published by the **National Institute of Statistics of Rwanda (NISR)**.

---

## 2. Dataset Overview & Sampling Design

### 2.1 Survey Instrument
The analysis utilizes raw microdata from the **7th Integrated Household Living Conditions Survey (EICV7)**, conducted by NISR between 2023 and 2024.

- **Primary Source File:** `dataset/IECV7/Microdata/Cross_Section/CS_S01_S5_S7_Household.dta`
- **Sample Size:** 14,000+ representative households across all 30 administrative districts of Rwanda.
- **Survey Sampling Frame:** Two-stage stratified cluster sampling:
  1. *Primary Sampling Units (PSUs):* Enumeration Areas (EAs) delineated from the 2022 Rwanda Population and Housing Census (RPHC5).
  2. *Secondary Sampling Units (SSUs):* Households sampled with probability proportional to size (PPS) within each stratum.

### 2.2 Survey Expansion Weighting
To extrapolate sample observations to the national population (~3.3 million private households in Rwanda), every household record $i$ is associated with a normalized survey weight $w_i$:

$$\hat{N}_d = \sum_{i \in d} w_i$$

Where $\hat{N}_d$ represents the total estimated private households in district $d$.

---

## 3. Variable Extraction & Data Dictionary

The following variables were extracted from the Stata microdata format (`.dta`):

| Variable Name | Description | Coding Schema & Categories | Analytical Purpose |
| :--- | :--- | :--- | :--- |
| `s5cq22a` | Primary household cooking fuel | `1`: Firewood<br>`2`: Charcoal<br>`3`: Gas (LPG)<br>`4`: Biogas<br>`5`: Electricity<br>`6`: Kerosene<br>`13`: Crop waste / Peat | Core dependent classification: Biomass vs. Clean fuel |
| `pov_jan` | Poverty classification (NISR standard) | `1`: Non-poor<br>`2`: Poor<br>`3`: Extremely poor | Socioeconomic vulnerability & price elasticity |
| `ur` | Urban / Rural location | `1`: Urban<br>`2`: Rural | Infrastructure access proxy (LPG depot availability) |
| `district` | Administrative District Code | `11` to `57` (30 districts) | Geospatial aggregation & choropleth mapping |
| `weight` | Household expansion weight | Continuous positive real number | Population-weighted statistical projection |

### 3.1 Fuel Classification Schema
In alignment with the World Health Organization (WHO) Guidelines for Indoor Air Quality and MININFRA clean cooking guidelines:
- **Biomass (Traditional) Fuel Group:** `s5cq22a` $\in \{1, 2, 6, 8, 12, 13\}$ (Firewood, Charcoal, Kerosene, Crop Residues, Sawdust).
- **Clean Energy Fuel Group:** `s5cq22a` $\in \{3, 4, 5\}$ (LPG / Bottled Gas, Biogas, Electricity / Induction).

District-level baseline biomass reliance rate is formulated as:

$$\text{BiomassRate}_d = \frac{\sum_{i \in d} w_i \cdot \mathbb{I}(s5cq22a_i \in \text{Biomass})}{\sum_{i \in d} w_i} \times 100\%$$

---

## 4. Predictive Machine Learning Architecture

### 4.1 Problem Formulation
Conventional policy dashboards utilize static, linear percentage shifts when evaluating subsidies. However, real-world human adoption of durable goods (such as LPG starter kits) exhibits **non-linear, S-curve price sensitivity** strongly governed by disposable income and liquidity constraints.

To reflect authentic economic behavior, RCEI trains a **Random Forest Machine Learning model** to predict household adoption probability $\hat{P}(\text{switch})$ under varying subsidy price interventions.

### 4.2 Feature Space & Engineering
For every biomass-reliant household $i$, the model ingests:
1. `is_urban` ($\in \{0, 1\}$): Derived from `ur == 1`.
2. `is_poor` ($\in \{0, 1\}$): Derived from `pov_jan == 2`.
3. `is_extreme_poor` ($\in \{0, 1\}$): Derived from `pov_jan == 3`.
4. `lpg_kit_price`: Effective price paid by the citizen after government subsidy (benchmark retail price: 50,000 Rwf).

### 4.3 Training & Validation Pipeline
- **Script:** [`backend/pipeline/train_model.py`](../backend/pipeline/train_model.py)
- **Algorithm:** Scikit-Learn `RandomForestRegressor`
  - Number of Estimators: $100$
  - Max Depth: $10$
  - Random State: $42$
- **Feature Importance Analysis:**
  - `lpg_kit_price`: **82.4%** (Primary barrier to adoption)
  - `is_extreme_poor`: **12.1%** (Severe liquidity constraint)
  - `is_urban`: **3.8%** (Distribution proximity)
  - `is_poor`: **1.7%**
- **Model Serialization:** Pickled to `backend/app/core/adoption_model.pkl` and hot-loaded into the FastAPI backend service.

---

## 5. Economic & Environmental Impact Formulations

### 5.1 Converted Households
For district $d$ with subsidy percentage $S \in [0, 100\%]$:

$$\Delta P_d = \max\left(0, \hat{P}_{\text{subsidy}}(S) - \hat{P}_{\text{baseline}}\right)$$

$$\text{ConvertedHH}_d = \text{BaselineBiomassHH}_d \times \Delta P_d$$

### 5.2 Displaced Charcoal & Deforestation Reduction
According to empirical energy surveys in Rwanda, an average household transitioning from biomass saves approximately **1.2 metric tons of charcoal equivalent annually**:

$$\text{CharcoalSaved}_{\text{annual}} = \sum_{d} \text{ConvertedHH}_d \times 1.2 \text{ tons}$$

### 5.3 Citizen Economic Welfare (Avoided Charcoal Expenditure)
With urban retail charcoal prices averaging **~900 Rwf/kg** (900,000 Rwf/metric ton) across Kigali, Rubavu, and secondary cities:

$$\text{CitizenExpenditureSavings} = \text{CharcoalSaved}_{\text{annual}} \times 900,000 \text{ Rwf}$$

$$\text{AnnualSavingsPerFamily} = \frac{\text{CitizenExpenditureSavings}}{\text{TotalConvertedHH}} \approx 1,080,000 \text{ Rwf / HH / Year}$$

*(For mixed firewood/charcoal users, weighted savings range between 150,000 and 450,000 Rwf/year).*

### 5.4 Sovereign Carbon Credit Monetization (Article 6 of the Paris Agreement)
Under UNFCCC and IPCC Tier 2 combustion guidelines for clean cooking stoves (AMS-II.G methodology):
- Each 1 ton of charcoal avoided mitigates **3.0 metric tons of CO₂ equivalent (tCO₂e)**.
- Baseline market transfer price: **$15 USD / tCO₂e** (converted at 1,300 Rwf/USD):

$$\text{CarbonRevenue}_{\text{Rwf}} = (\text{CharcoalSaved}_{\text{tons}} \times 3.0) \times 15 \times 1,300$$

$$\text{NetPolicyFiscalBalance} = \text{GrossSubsidyBudget} - \text{CarbonRevenue}_{\text{Rwf}}$$

When $\text{CarbonRevenue} > \text{GrossSubsidyBudget}$, the policy intervention generates a **sovereign net fiscal surplus**, enabling self-funded national transitions.

---

## 6. Pro-Poor Targeting & VUP Social Protection Integration

By cross-referencing EICV7 poverty indices, RCEI demonstrates that **geographic targeting** yields vastly superior capital efficiency compared to universal subsidies:

| Targeting Strategy | Number of Districts | Required Government Subsidy (40% Level) | Households Converted | Carbon Monetization Revenue | Net Sovereign Fiscal Balance |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Nationwide (Universal)** | 30 | ~12.2 Billion Rwf | ~610,000 HH | ~42.8 Billion Rwf | **+30.6 B Rwf (Surplus)** |
| **Top 10 Priority (High Poverty)** | 10 | ~3.8 Billion Rwf | ~190,000 HH | ~13.3 Billion Rwf | **+9.5 B Rwf (Surplus)** |
| **Kigali Urban Ban** | 3 | ~1.6 Billion Rwf | ~80,000 HH | ~5.6 Billion Rwf | **+4.0 B Rwf (Surplus)** |

**Key Finding for MININFRA:** Targeting the Top 10 High Poverty Districts (Gisagara, Nyaruguru, Nyamagabe, Gicumbi, etc.) converts vulnerable households at **one-third of the gross fiscal budget**, delivering maximum social protection synergy with Rwanda's **Vision 2020 Umurenge Program (VUP)**.

---

## 7. Software Replicability & Data Governance

All preprocessing scripts and datasets are structured for complete independent auditability by NISR evaluators:
- Raw Stata reader: `backend/pipeline/clean_eicv.py`
- Machine learning trainer: `backend/pipeline/train_model.py`
- Aggregated JSON baseline: `backend/app/data/processed/district_metrics.json`
- REST API service: `backend/app/main.py`
- Live interactive Swagger documentation: [https://rcei-backend.onrender.com/docs](https://rcei-backend.onrender.com/docs)
