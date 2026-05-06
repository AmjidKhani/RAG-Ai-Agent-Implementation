DEPLOYMENT - Extended guide (Railway / Render / Replit / Netlify)

This document gives step-by-step commands and checks to deploy the backend (FastAPI) to a free host and the frontend (Next.js) to Netlify.

Prereqs (local):
- Git and a GitHub account
- Node 18+/npm (for frontend)
- Python 3.11+ and pip (for backend)
- (Optional) Docker if you want to build and push container images

Quick checklist before deploying:
- Commit & push your repo to GitHub (root contains `frontend/` and `backend/`).
- Set the backend `ALLOWED_ORIGINS` env var to your frontend URL once known.
- Set `NEXT_PUBLIC_API_BASE` in Netlify to your backend URL.

1) Deploy backend to Railway (recommended for quick free deploy)

- Create a Railway account and install Railway CLI (optional):
  - https://railway.app
  - `npm i -g railway`

- From your repo root (you must have pushed code to GitHub or use local git):
  - `railway login`
  - `railway init` (choose to create a new project)
  - `railway up` (this will detect Python and use `requirements.txt`; it may ask for the entrypoint — use `backend` folder)

Railway notes:
- If Railway asks for the start command, use:
  - `uvicorn main:app --host 0.0.0.0 --port $PORT`
- In Railway > Settings > Variables, add:
  - `ALLOWED_ORIGINS` = `https://<your-netlify-site>.netlify.app` (or a comma-separated list if you have multiple domains)

2) Deploy backend to Render (alternative)
- Push repo to GitHub.
- In Render dashboard click "New Web Service" → Connect to GitHub repo → select branch.
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Set `ALLOWED_ORIGINS` in Environment > Environment Variables.

3) Deploy backend to Replit (fastest, simple free)
- Create a new Replit, import from GitHub and set run command to:
  - `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Add `ALLOWED_ORIGINS` to Secrets.

4) Deploy frontend to Netlify (recommended)
- Push `frontend/` directory to GitHub.
- On Netlify: "New site from Git" → select repo and branch.
- Build command: `npm run build`
- Publish directory: `.next`
- Under Site settings -> Build & deploy -> Environment, add:
  - `NEXT_PUBLIC_API_BASE` = `https://<your-backend-host>`

Netlify caveats for Next.js App Router:
- Netlify supports Next.js; if you see issues with app router features, Vercel is the most compatible platform for Next.js app router features.
- If Netlify build fails due to unsupported features, try deploying on Vercel (it is free for hobby projects and handles Next.js app router natively).

5) Test everything locally before final deploy
- Start backend locally:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

- Start frontend locally:

```bash
cd frontend
npm install
npm run dev
```

- Open `http://localhost:3000` and make sure pages load and fetch calls return data from `http://localhost:8000`.

6) Quick curl tests (replace HOST with your deployed backend URL):

```bash
curl -s https://HOST/ | jq
curl -s https://HOST/doctors | jq '.total'
curl -s -X POST https://HOST/suggest-doctor -H "Content-Type: application/json" -d '{"symptoms":"fever and cough"}' | jq
```

7) After deploy
- Copy the backend public URL and set it as `NEXT_PUBLIC_API_BASE` in Netlify site settings.
- Update `ALLOWED_ORIGINS` in backend service settings to include your Netlify frontend URL.

If you'd like, I can:
- Produce exact Railway CLI commands and show the sequence to run locally, or
- Generate a GitHub Actions workflow (requires NETLIFY_AUTH_TOKEN and NETLIFY_SITE_ID) to auto-deploy the frontend, or
- Help you connect the repo to Railway/Netlify through step-by-step UI instructions with exact fields to fill.

