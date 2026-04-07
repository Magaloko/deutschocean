# Vercel + Firebase Deployment Checklist

## Firebase env vars are NOT auto-deployed to Vercel

**Symptom:** App works locally but fails on Vercel — all Firebase auth methods show "Fehler beim Starten" or silent errors. `FIREBASE_CONFIGURED` is false on the deployed app.

**Root cause:** Vite's `.env.local` file is gitignored and never pushed. Vercel has no knowledge of these vars.

**Fix:**
1. Go to Vercel project → Settings → Environment Variables
2. Add all 6 `VITE_FIREBASE_*` vars (select "All Environments")
3. Redeploy (Deployments → latest → Redeploy)

---

## Google Sign-In fails on deployed domain

**Symptom:** `signInWithPopup(googleProvider)` fails on production URL but works on localhost.

**Root cause:** Firebase blocks OAuth popups from domains not in the Authorized Domains list.

**Fix:** Firebase Console → Authentication → Settings → Authorized domains → Add `<your-app>.vercel.app`

---

## Vercel project may be under a different team than MCP token

If `list_projects` doesn't show the expected project, the Vercel deployment is likely under a different team account (e.g. `magalokos-projects` vs `dadakaevs-projects`). MCP tools will return 403 for that team — env vars must be set manually in the Vercel dashboard.
