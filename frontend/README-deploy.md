Quick Netlify deploy steps for this Next.js app

1. Push your `frontend/` folder to GitHub.
2. On Netlify, create a new site from Git:
   - Repository: choose your repo
   - Branch: main (or relevant)
   - Build command: `npm run build`
   - Publish directory: `.next`
3. In Site Settings -> Environment -> Add variables:
   - `NEXT_PUBLIC_API_BASE` = `https://<your-backend-host>`
4. If your backend is still local during testing, set `NEXT_PUBLIC_API_BASE` to your backend's public URL once deployed.
5. If you prefer Vercel, it handles Next.js router natively and requires minimal configuration.

Notes:
- The frontend currently calls `http://localhost:8000` in many places; set `NEXT_PUBLIC_API_BASE` and update fetch calls to use that env var if you'd like runtime environment switching. I can update the code to read from `process.env.NEXT_PUBLIC_API_BASE` if you want.
