# Rwanda CleanEnergy Insights (RCEI)

NST2 decision platform for household cooking fuel. Track 3, Open Innovation, 2026 NISR Big Data Hackathon.

The measured baseline is the household-weighted EICV7 result in `backend/app/data/processed/district_metrics.json`:

- **93.95%** of households use biomass as their main cooking fuel
- **5.42%** use a clean fuel
- **23.37%** are poor
- **3,289,805** households

Census 2022 biomass is **94.84%**. EICV5 (2017) biomass is **97.88%**. NST2's goal is biomass under **50%** by 2029/30, on the way to Vision 2050. The 2017, 2022, and 2024 points are measured. Anything the subsidy slider adds after that is a scenario.

Clean fuel is almost entirely among non-poor households: **7.06%** clean for non-poor, **0.04%** for moderate poor, and **0.00%** for extreme poor (weighted).

## Live links

| Resource | URL |
| :--- | :--- |
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
| EICV7 person file `s6cq4` | Wood-collection hours |
| EICV7 expenditure file, charcoal cooking | Annual charcoal spend |
| RPHC-2022 `h16` | 2022 cooking-fuel anchor |
| EICV5 `s5cq18` | 2017 cooking-fuel anchor |
| SAS 2024 livestock `s9q2` / `s9q4` | Households with at least 2 cattle |
| SAS 2024 `s3_q20_1`–`s3_q20_7` | Plot harvest kilograms |

Raw `.dta` files live in `dataset/`, which is gitignored. The committed artifact is `district_metrics.json`. Regenerate it with `python backend/pipeline/clean_eicv.py`.

Fuel codes used in code: biomass `1, 2, 4, 8, 12, 13`; clean `3, 6, 7, 10, 11`. Poverty is `pov_jan == 1`. Extreme poverty is `epov_jan == 1`.

## Classifier

`backend/pipeline/train_model.py` fits a balanced `RandomForestClassifier` on observed `s5cq22a`. Features are urban/rural, moderate poverty, and extreme poverty. It does not take a price and it does not run inside the subsidy endpoint.

From `backend/app/core/model_metrics.json`:

- Sample: **14,966** (clean-fuel base rate **5.12%**, unweighted)
- Test ROC-AUC: **0.8759**
- Balanced accuracy: **0.8677**
- 5-fold CV ROC-AUC: **0.8634 (± 0.0141)**
- Importance: urban **80.3%**, moderate poor **16.3%**, extreme poor **3.3%**

## API

| Method | Path | Role |
| :--- | :--- | :--- |
| GET | `/health` | Model loaded, 30 districts |
| GET | `/api/v1/metrics/districts` | Measured district file |
| GET | `/api/v1/model/info` | Classifier metrics |
| POST | `/api/v1/simulate/subsidy` | Scenario. Body: `subsidy_percentage` (0–100), `target_districts`, optional `carbon_price_usd` (0–100, default 15) |

Out-of-range subsidy or carbon price returns 422. The response includes `provenance` (measured versus assumption) and `forecast_note`. The forecast band is a scenario band, not a 95% confidence interval.

```json
{
  "subsidy_percentage": 40.0,
  "target_districts": [],
  "carbon_price_usd": 15
}
```

## Run locally

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

The public frontend is on Vercel and the public API is on Render. Those links are in the table above. These local commands serve the same app at `http://localhost:5173`, with Swagger at `http://localhost:8000/docs`.

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
