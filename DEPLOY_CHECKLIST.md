# MedAid Deployment Checklist

This checklist summarizes the minimal steps and configuration required to deploy the MedAid frontend (Vite + React) and backend (Express + MongoDB) plus optional Supabase Edge Functions for full AI features.

## 1. Repository Preparation
- [ ] Pull latest `main`
- [ ] Confirm no uncommitted secrets (`git grep VITE_SUPABASE | ensure .env not committed`)
- [ ] Run `npm install` in root and `backend-modules/`
- [ ] Lint (optional): `npm run lint`

## 2. Environment Variables

Frontend (set in hosting platform or build environment):
- `VITE_SUPABASE_PROJECT_ID`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_URL`

Backend (`backend-modules/.env` or host environment):
- `MONGODB_URI` (MongoDB Atlas connection string)
- `PORT` (optional; default 5000)
- `NODE_ENV=production`
- `JWT_SECRET` (strong, >= 32 chars)
- `ENCRYPTION_KEY` (32-char symmetric key)
- `FRONTEND_URL` (https://your-frontend-domain) for CORS
- Optional feature keys:
  - `OPENAI_API_KEY`
  - `PUBMED_API_KEY`
  - `MAX_FILE_SIZE` (default 10485760)
  - `UPLOAD_PATH` (consider using external storage instead of local)

Supabase Secrets (for Edge Functions):
- `LOVABLE_API_KEY`
  - Set via: `supabase secrets set LOVABLE_API_KEY=...`

## 3. Build & Artifacts
- Frontend: `npm run build` produces `dist/`
- Backend: No build step; Node runtime.
- Docker images (optional):
  - Frontend: `docker build -t medaid-frontend .`
  - Backend: `docker build -t medaid-backend ./backend-modules`

## 4. Databases & Storage
- Provision MongoDB Atlas cluster.
- Update `MONGODB_URI` with user/password and SRV connection string.
- Consider using S3 (or Supabase Storage) for uploads instead of local `UPLOAD_PATH`.

## 5. Supabase Setup (Optional Advanced AI)
- `supabase login`
- `supabase link --project-ref <project-id>`
- `supabase db push` (migrations)
- `supabase functions deploy analyze-symptoms`
- `supabase secrets set LOVABLE_API_KEY=...`
- Verify: `supabase functions invoke analyze-symptoms --body '{"symptoms":"headache"}'`

## 6. Security Hardening
- Enable RLS on all relevant tables (see `DEPLOYMENT.md`).
- Use long random values for `JWT_SECRET` and `ENCRYPTION_KEY`.
- Enforce HTTPS (hosting provider or reverse proxy).
- Rate limiting is enabled (`express-rate-limit`). Verify thresholds.
- Monitor dependencies for CVEs (GitHub Dependabot).

## 7. Observability (Recommended)
- Add logging aggregation (e.g., Logtail, Datadog, or CloudWatch).
- Add uptime health check to `/api/health`.
- Plan error tracking (Sentry or similar).

## 8. Deployment Paths

Option A: Managed host (Vercel + Render)
- Frontend: Connect repo to Vercel; set env vars; auto-build.
- Backend: Deploy to Render (Node service) or Railway; set backend env vars + build command `npm install` and start `node server.js`.

Option B: Containers (Docker)
- Build both images.
- Run with docker-compose (future improvement) or separate services.
- Provide env file to backend container.

Option C: Single VM
- Install Node 20.
- Clone repo & set up PM2 for backend: `pm2 start backend-modules/server.js --name medaid-api`.
- Serve frontend `dist/` via nginx.

## 9. Post-Deploy Verification
- [ ] Frontend loads and offline analysis works.
- [ ] Backend `/api/health` returns status OK.
- [ ] MongoDB shows new documents upon test operations.
- [ ] CORS requests succeed from frontend domain.
- [ ] JWT auth flows function (login/logout where implemented).
- [ ] Edge function (if deployed) returns enhanced analysis.
- [ ] No 404s for expected routes.

## 10. Future Enhancements
- Docker Compose file to orchestrate frontend + backend + reverse proxy.
- Automated CI/CD GitHub Actions workflow.
- Integration tests for API endpoints.
- Secrets manager (AWS Secrets Manager / GCP Secret Manager) instead of environment files.

---
Maintainer quick command reference:
```
supabase functions list
supabase secrets list
```

If you need further automation, create an issue to add CI/CD or container orchestration.
