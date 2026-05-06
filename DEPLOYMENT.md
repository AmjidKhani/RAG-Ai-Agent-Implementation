Backend (FastAPI) — quick deploy

Options: Railway / Render / Replit / Fly / Heroku (limited free)

Steps (Railway / Render recommended):

1) Create a new project on Railway or Render and connect via GitHub (or push code manually).
2) Set the root directory to `backend/` (or create a new service pointing at that folder).
3) Configure build & start commands (Railway/Render auto-detects Python):
   - Build: pip install -r requirements.txt
   - Start: uvicorn main:app --host 0.0.0.0 --port $PORT
4) Set environment variables (in service settings):
   - ALLOWED_ORIGINS: set to your frontend URL(s), e.g. `https://your-site.netlify.app` (comma separated).
5) Deploy and note the generated backend URL (e.g., https://my-backend.up.railway.app). Update the frontend to call this host instead of http://localhost:8000.

Notes:
- The backend uses dummy data and prints booking/email confirmation to STDOUT. For production email/SMS integrate a provider.
- `requirements.txt` and `Procfile` are included for compatibility.


Frontend (Next.js) — Netlify

Netlify supports Next.js with the official adapter. Two quick approaches:

A) Deploy the `frontend/` repository on Netlify (recommended):
   1. Push your repo to GitHub.
   2. In Netlify, click "New site from Git" and connect your GitHub repo.
   3. Set the build command: `npm run build` and publish directory: `.next`.
   4. Set environment variables in Netlify (optional):
      - NEXT_PUBLIC_API_BASE: https://<your-backend-host>
   5. Add `_redirects` or `netlify.toml` if you need special rewrites.

B) If Netlify complains about the app router, use `netlify/next-on-netlify` or use Vercel (native for Next.js).

Minimal `netlify.toml` example (optional):

[build]
  command = "npm run build"
  publish = ".next"

[dev]
  command = "npm run dev"


Local dev: run backend with:

pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --port 8000

And frontend:

cd frontend
npm install
npm run dev
