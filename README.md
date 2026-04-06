# AI Car Damage Claim Assessment

End-to-end system for **vehicle damage detection** (YOLOv8 instance segmentation), **repair-oriented cost summaries**, **LLM-generated insurance-style narrative reports** (via [Groq](https://groq.com/)), and a **React** web app with **JWT auth**, history, charts, and **PDF** downloads. Jupyter notebooks cover data work and model training.

> **Disclaimer:** Cost figures and LLM text are **assistive only** and are not a substitute for professional inspection or insurer adjudication.

## Features

- **Computer vision:** YOLOv8 predicts damage classes, draws masks on an annotated image, and aggregates area/confidence metrics (`backend/inference.py`, `backend/cost_model.py`).
- **REST API:** FastAPI exposes signup/login/refresh, password reset (dev returns reset token in JSON), image analysis, per-user history, and PDF report download (`backend/main.py`, `backend/auth.py`).
- **Reports:** Narrative report through Groq’s OpenAI-compatible API with a deterministic fallback if the key is missing (`backend/llm_report.py`); PDFs via ReportLab (`backend/pdf_generator.py`).
- **Frontend:** React 18 + React Router + Tailwind + Chart.js/Recharts; calls API with `REACT_APP_API_URL` (`frontend/`).
- **Optional Streamlit demo:** Standalone CPU UI in `app.py` (expects its own `MODEL_PATH`; useful for quick experiments).

## Tech stack

| Layer | Technologies |
|--------|----------------|
| API | FastAPI, Uvicorn, SQLAlchemy, PyJWT, bcrypt |
| ML | Ultralytics YOLOv8, OpenCV, NumPy, Pillow (+ AVIF plugin) |
| DB | PostgreSQL (e.g. Supabase) with SSL |
| LLM | Groq (`openai` client, Llama 3 70B) |
| Web | React, Axios, Tailwind, Chart.js |
| Notebooks | pandas, seaborn, MLflow (optional, for training workflows) |

## Repository layout

```
├── backend/           # FastAPI app, inference, auth, PDF, uploads & reports dirs
├── frontend/          # React SPA (Create React App)
├── models/            # Trained weights (e.g. epoch80.pt) — large; see Git note below
├── templates/         # Legacy/simple HTML
├── app.py             # Optional Streamlit demo
├── requirements.txt   # Includes: -r backend/requirements.txt
├── Data_Exploration(damaged).ipynb
├── Data_Preparation(damaged+clean).ipynb
└── Model_Building.ipynb
```

## Prerequisites

- **Python 3.12+** (matches notebook/kernel notes in the project)
- **Node.js 18+** (for the React app)
- **PostgreSQL** connection string (project is wired for **Supabase**-style URLs with SSL)

## Environment variables

Create a **`.env`** file in the **project root** (same folder as `backend/`). It is gitignored.

**Meaning of “setup”:** **Required** means the backend will not run correctly (or will be insecure) without it. **Recommended** means the app has a fallback default, but you should normally set it for real use (LLM reports, correct CORS, explicit prod/dev behavior, custom weights path). **Optional** means a sensible default exists; only set these if you need different token lifetimes.

| Variable | Setup | Description |
|----------|--------|-------------|
| `DATABASE_URL` | **Required** | PostgreSQL URL (e.g. Supabase). Used by `backend/db.py`. |
| `JWT_SECRET` | **Required** (production) | Secret for signing access/refresh tokens. |
| `GROQ_API_KEY` | **Recommended** | Groq API key for LLM insurance-style reports. If omitted, the API still runs but uses the built-in template fallback in `llm_report.py`. |
| `CORS_ORIGINS` | **Recommended** | Comma-separated browser origins allowed to call the API. Default in code: `http://localhost:3000`. Set this when your React app uses another URL (e.g. production domain). |
| `MODEL_PATH` | **Recommended** | Absolute or relative path to the YOLO `.pt` file. Default: `<project_root>/models/epoch80.pt`. Set if your weights live elsewhere. |
| `APP_ENV` | **Recommended** | Use `production` for deployed APIs. In non-production, `POST /auth/forgot-password` may return `reset_token` in JSON for local testing. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | **Optional** | Access token lifetime. Default: `1440` (24h). |
| `REFRESH_TOKEN_EXPIRE_DAYS` | **Optional** | Refresh token lifetime. Default: `7`. |
| `RESET_TOKEN_EXPIRE_MINUTES` | **Optional** | Password-reset link/token expiry. Default: `30`. |

**Example `.env` skeleton** (copy, rename values; do not commit real secrets):

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/postgres?sslmode=require
JWT_SECRET=change-this-to-a-long-random-string
GROQ_API_KEY=
CORS_ORIGINS=http://localhost:3000
MODEL_PATH=
APP_ENV=development
ACCESS_TOKEN_EXPIRE_MINUTES=1440
REFRESH_TOKEN_EXPIRE_DAYS=7
RESET_TOKEN_EXPIRE_MINUTES=30
```

Leave `GROQ_API_KEY` or `MODEL_PATH` empty to use the code defaults described above.

**Frontend:** set `REACT_APP_API_URL` when building or starting (e.g. `http://localhost:8000`).

## Install and run

### 1. Backend

```powershell
cd C:\MainProject\AI_Car_Damage_Detection
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

Ensure `models/epoch80.pt` exists or set `MODEL_PATH` in `.env`.

```powershell
# From project root (parent of package `backend`)
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

- API docs: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health: `GET /health` (checks DB, JWT secret, Groq key)

### 2. Frontend

```powershell
cd frontend
npm install
$env:REACT_APP_API_URL = "http://localhost:8000"
npm start
```

App runs at [http://localhost:3000](http://localhost:3000) by default.

### 3. Optional Streamlit (`app.py`)

Install Streamlit and Ultralytics separately if needed, set `MODEL_PATH` inside `app.py` or align paths, then:

```powershell
streamlit run app.py
```

## API overview (authenticated unless noted)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/auth/signup`, `/auth/login`, `/auth/refresh` | Auth tokens |
| POST | `/auth/forgot-password`, `/auth/reset-password` | Password reset |
| GET | `/auth/me` | Current user |
| GET | `/health` | Service health |
| POST | `/analyze` | Upload image → detection + DB + PDF + LLM text |
| GET | `/history` | User’s past analyses |
| GET | `/report/pdf/{id}` | Download generated PDF |

Static files: `/uploads/…`, `/reports/…`.

## Notebooks

- **Data_Exploration(damaged).ipynb** — EDA on damaged-vehicle data.
- **Data_Preparation(damaged+clean).ipynb** — Cleaning and splits.
- **Model_Building.ipynb** — YOLO training / MLflow (use **environment variables** for any remote tracking tokens; do not commit secrets).

## GitHub and large files

Weight files under `models/` can exceed GitHub’s per-file limit. If push fails, use [Git LFS](https://git-lfs.com/) or host weights separately and document `MODEL_PATH`.

## License

Add a `LICENSE` file if you want to specify terms; until then, all rights reserved unless you state otherwise.
