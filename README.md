# Rwanda CleanEnergy Insights (RCEI)

NST2 decision platform for household cooking fuel. Track 3, Open Innovation, 2026 NISR Big Data Hackathon.

The measured baseline is the household-weighted EICV7 result in `backend/app/data/processed/district_metrics.json`:

- **93.95%** of households use biomass as their main cooking fuel
- **5.42%** use a clean fuel
- **23.37%** are poor
- **3,289,805** households

Census 2022 biomass is **94.84%** (public-use census sample). EICV5 (2017) biomass is **97.88%**. NST2's goal is biomass under **50%** by 2029/30, on the way to Vision 2050. The 2017, 2022, and 2024 points are measured. Business as usual continues the measured 2017–2024 decline of **0.56 points per year**, which lands at about **90.6%** in 2030. Anything the subsidy slider adds on top of that is a scenario, and no subsidy-only scenario reaches 50%.

Clean fuel is almost entirely among non-poor households: **7.06%** clean for non-poor, **0.04%** for moderate poor, and **0.00%** for extreme poor (weighted).

## Live links

| Resource | URL |
| :--- | :--- |
| Demo video (screen recording) | [Google Drive video](https://docs.google.com/videos/d/1-6hXJuDeyGuPRFvjF4AF14Dn_c_eq1X5ppPNqJmLRy0/edit?usp=sharing) |
| Frontend (Vercel) | [https://rcei-platform.vercel.app](https://rcei-platform.vercel.app) |
| Frontend custom domain | [https://rwanda-cleanenergy-insights-nisr.fistonuz.me](https://rwanda-cleanenergy-insights-nisr.fistonuz.me) |
| Backend (Render) | [https://rcei-backend.onrender.com](https://rcei-backend.onrender.com) |
| Swagger | [https://rcei-backend.onrender.com/docs](https://rcei-backend.onrender.com/docs) |
| GitHub | [https://github.com/fistonuzabumwana/rcei-platform](https://github.com/fistonuzabumwana/rcei-platform) |
| Methodology | [docs/EICV7_METHODOLOGY_REPORT.md](docs/EICV7_METHODOLOGY_REPORT.md) |
| Data dictionary | [docs/DATA_DICTIONARY.md](docs/DATA_DICTIONARY.md) |
| API reference | [docs/API_REFERENCE.md](docs/API_REFERENCE.md) |

## What the app does

- Choropleth of all 30 districts from the processed survey file.
- District scorecard with clean-fuel rate for non-poor, moderate poor, and extreme poor households.
- Subsidy scenario (0–100%) for all districts or a chosen cluster. The shift rule is `min((subsidy/10) * (0.02 + poverty_rate/100 * 0.03), 1)`. It is not a model prediction.
- Carbon price of $10, $15, or $25, sent to the API. The PDF uses the same price.
- SAS 2024 cattle and harvest figures, with the 0.75, ×12, ×1.15, and ×0.50 multipliers labeled as assumptions. Current JSON: **390,320** biogas-viable households, **4,683,840** tonnes of slurry, **6,163,552** tonnes of residue.
- CSV export and a two-page PDF brief.

A national 40% scenario at $15 converts **336,331** households, displaces **74,442 tonnes** of charcoal, and returns a **net cost of about 2.37 billion RWF**. Carbon revenue does not cover the subsidy budget at that price.

## Data

| Source | Role |
| :--- | :--- |
| EICV7 `CS_S01_S5_S7_Household.dta` | Weighted fuel, poverty, household counts, clean fuel by poverty |
| EICV7 household file `s5cq14`, `quintile` | Grid connection and consumption quintile (classifier features) |
| EICV7 `CS_S5F_access_to_services.dta` `s5fq3a`/`s5fq3b` | Minutes to the nearest food market (classifier feature) |
| EICV7 person file `s6cq4` | Wood-collection hours |
| EICV7 expenditure file, charcoal cooking | Annual charcoal spend |
| RPHC-2022 public-use microdata `h16` (household-head rows) | 2022 cooking-fuel anchor |
| EICV5 `s5cq18` | 2017 cooking-fuel anchor |
| SAS 2024 livestock `s9q2` / `s9q4` | Households with at least 2 cattle |
| SAS 2024 `s3_q20_1`–`s3_q20_7` | Plot harvest kilograms |

### Submitted data artifact and microdata sources

**Submitted data file in this repository:** [`backend/app/data/processed/district_metrics.json`](backend/app/data/processed/district_metrics.json) (district-level rates the API serves). Classifier scores are in [`backend/app/core/model_metrics.json`](backend/app/core/model_metrics.json).

Raw NISR `.dta` microdata is **not** redistributed here (`dataset/` is gitignored). The files are large (~4 GB) and access is through the [NISR Microdata Catalog](https://microdata.statistics.gov.rw/index.php/catalog). Register, log in, and use **Get Microdata** for each study. Official catalog entries and downloads:

| Study | Reference ID | Catalog / download |
| :--- | :--- | :--- |
| Integrated Household Living Conditions Survey (EICV7), 2023–2024, Cross-Sectional Sample | `RWA-NISR-EICV7-2023-2024-v01` | [Catalog 119](https://microdata.statistics.gov.rw/index.php/catalog/119) · [Download](https://microdata.statistics.gov.rw/index.php/catalog/119/download/1083) |
| Rwanda Population and Housing Census 2022 | `RWA-NISR-RPHC-2022-v0.1` | [Catalog 109](https://microdata.statistics.gov.rw/index.php/catalog/109) · [Download](https://microdata.statistics.gov.rw/index.php/catalog/109/download/1029) |
| Integrated Household Living Conditions Survey (EICV5), 2016–2017, Cross-Sectional Sample | `RWA-NISR-EICV5-CS-2016-2017-V0.1` | [Catalog 82](https://microdata.statistics.gov.rw/index.php/catalog/82) · [Stata](https://microdata.statistics.gov.rw/index.php/catalog/82/download/794) · [SPSS](https://microdata.statistics.gov.rw/index.php/catalog/82/download/795) |
| Agriculture Household Survey 2024 | `RWA-NISR-RAHS-2024-V0.1` | [Catalog 123](https://microdata.statistics.gov.rw/index.php/catalog/123) · [Download](https://microdata.statistics.gov.rw/index.php/catalog/123/download/1107) |

Producer for all four: National Institute of Statistics of Rwanda (NISR), Ministry of Finance and Economic Planning. After download, place files at:

| Dataset | Expected path |
| :--- | :--- |
| EICV7 (2023/24) cross-section | `dataset/IECV7/Microdata/Cross_Section/CS_S01_S5_S7_Household.dta`, `CS_S0_S1_S2_S3_S4_S6A_S6B_S6C_Person.dta`, `CS_S8A3_Expenditure.dta`, `CS_S5F_access_to_services.dta` |
| RPHC-2022 public-use microdata | `dataset/RPHC-2022/PHC5_Public_microdata/PHC5_Public_microdata.dta` |
| EICV5 (2016/17) Stata release | `dataset/EICV5/EICV5-data_STATA/cs_S0_S5_Household.dta` |
| Agricultural Household Survey 2024 | `dataset/Agricultural Survey (SAS) 2024/Microdata/AHS2024_Section0.dta`, `AHS2024_Section9_10_12_LIVESTOCK AND ANIMAL INPUTS EXPENDITURES,.dta`, `AHS2024_Section3_4_CROP GROWN, SEEDS AND PRODUCTION & AGRICULTURAL INPUTS AND PRACTICES.dta` |

Then run `python backend/pipeline/clean_eicv.py` to rebuild `district_metrics.json` and `python backend/pipeline/train_model.py` to rebuild the classifier and `model_metrics.json`.

Fuel codes used in code: biomass `1, 2, 4, 8, 12, 13`; clean `3, 6, 7, 10, 11`. Kerosene (`7`) is counted as clean for continuity with the survey grouping; it is not WHO-clean, but it is 0.006% of weighted households and does not change any reported rate. Poverty is `pov_jan == 1`. Extreme poverty is `epov_jan == 1`.

## Classifier

`backend/pipeline/train_model.py` fits a balanced `RandomForestClassifier` on observed `s5cq22a`. Six measured EICV7 features: urban/rural (`ur`), moderate poverty (`pov_jan`), extreme poverty (`epov_jan`), grid connection (`s5cq14`), consumption quintile (`quintile`), and minutes to the nearest food market (`s5fq3a`/`s5fq3b` from `CS_S5F_access_to_services.dta`, 1,026 missing filled with the 40-minute median). It does not take a price and it does not run inside the subsidy endpoint.

From `backend/app/core/model_metrics.json`:

- Sample: **14,966** (clean-fuel base rate **5.12%**, unweighted)
- Test ROC-AUC: **0.9452** (three-flag baseline on the same split: 0.8759)
- Balanced accuracy: **0.8856**
- 5-fold CV ROC-AUC: **0.9368 (± 0.0117)**
- Importance: consumption quintile **49.5%**, urban **25.0%**, grid connection **14.6%**, market minutes **8.0%**, moderate poor **2.5%**, extreme poor **0.3%**

The measured cross-tabs behind those features (household-weighted): clean fuel is **10.65%** among grid-connected households and **0.12%** among the rest; by consumption quintile it is Q1 **0.0%**, Q2 **0.1%**, Q3 **0.4%**, Q4 **1.3%**, Q5 **22.3%**.

## API

| Method | Path | Role |
| :--- | :--- | :--- |
| GET | `/health` | Model loaded, 30 districts |
| GET | `/api/v1/metrics/districts` | Measured district file |
| GET | `/api/v1/model/info` | Classifier metrics |
| POST | `/api/v1/simulate/subsidy` | Scenario. Body: `subsidy_percentage` (0–100), `target_districts`, optional `carbon_price_usd` (0–100, default 15) |

Out-of-range subsidy or carbon price returns 422. The response includes `provenance` (measured versus assumption), `forecast_slopes` (the measured business-as-usual slope and the assumed policy slope), and `forecast_note`. The forecast band is a scenario band, not a 95% confidence interval.

```json
{
  "subsidy_percentage": 40.0,
  "target_districts": [],
  "carbon_price_usd": 15
}
```

## Run locally

Two options: native Node/Python, or Docker Compose.

### Option 1 — Node.js and Python

Node.js 18+ and Python 3.10–3.12.

```bash
git clone https://github.com/fistonuzabumwana/rcei-platform.git
cd rcei-platform/backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m pytest tests/ -v
uvicorn app.main:app --reload --port 8000
```

```bash
cd frontend
npm install
npm run dev
```

App: `http://localhost:5173`. Swagger: `http://localhost:8000/docs`.

### Option 2 — Docker Compose

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Compose plugin). Uses the committed `district_metrics.json` and classifier pickle; raw NISR `.dta` files are not needed.

```bash
git clone https://github.com/fistonuzabumwana/rcei-platform.git
cd rcei-platform
docker compose up --build
```

| Service | URL |
| :--- | :--- |
| App (nginx + React) | [http://localhost:8080](http://localhost:8080) |
| API / Swagger | [http://localhost:8000/docs](http://localhost:8000/docs) |

The frontend container proxies `/api/v1` and `/health` to the backend container, so the browser stays on one origin. Stop with `Ctrl+C`, or `docker compose down`.

The public frontend is on Vercel and the public API is on Render. Those links are in the table above.

## Team

- **Adeline Tuyizere**: data, the classifier, scenario design and full-stack engineering
- **Fiston Uzabumwana**: full-stack engineering, map, and deployment

## Intellectual property and declarations

### Assignment to NISR

In accordance with the official rules of the 2026 NISR Big Data Hackathon, the participants (Adeline Tuyizere and Fiston Uzabumwana) assign and transfer all intellectual property rights in this submitted work, including copyright and patent, to the National Institute of Statistics of Rwanda (NISR). NISR may use, reproduce, modify, publish, and distribute the submitted work in any form and for any purpose.

### Originality

This submission is our own original work. It has not been submitted to another competition or entity. Sources are acknowledged in the methodology report.

### AI assistance

AI coding assistants (Google Antigravity / Gemini, and Cursor) were used for scaffolding, documentation, and UI edits, including this trust-layer review. The team chose the question, cleaned the NISR microdata, trained the classifier on observed fuel, and is responsible for the submitted work.
