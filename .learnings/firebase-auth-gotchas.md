# Firebase Auth Gotchas

## 1. `linkWithEmailAndPassword` does not exist in the installed Firebase package

**Symptom:** Build error / runtime crash when importing `linkWithEmailAndPassword` from `firebase/auth`.

**Root cause:** The function name in Firebase v9+ modular SDK is NOT `linkWithEmailAndPassword`. The available export is `linkWithCredential`.

**Fix:**
```js
import { EmailAuthProvider, linkWithCredential } from 'firebase/auth'

// Instead of: await linkWithEmailAndPassword(fbUser, email, password)
const credential = EmailAuthProvider.credential(email, password)
await linkWithCredential(fbUser, credential)
```

Available link exports: `linkWithCredential`, `linkWithPhoneNumber`, `linkWithPopup`, `linkWithRedirect`.

---

## 2. `auth/configuration-not-found` = Sign-in provider not enabled in Firebase Console

**Symptom:** `signInAnonymously()` (or any sign-in method) throws `FirebaseError: auth/configuration-not-found`.

**Root cause:** The authentication provider (Anonymous, Email/Password, Google, etc.) has not been enabled in Firebase Console → Authentication → Sign-in method.

**Fix:** Go to Firebase Console → project → Authentication → Sign-in method → enable the required provider(s):
- Anonymous → for "Als Gast spielen"
- Email/Password → for email+pw login/register
- Google → for Google Sign-In

**Note:** `.env.local` credentials being correct is NOT sufficient — each provider must also be explicitly enabled in the console.

---

## 3. Vite `.env.local` requires full dev server restart

**Symptom:** After creating `.env.local`, env vars like `VITE_FIREBASE_API_KEY` are still undefined.

**Root cause:** Vite reads `.env.*` files only at server startup, not via HMR. A running `npm run dev` process does NOT pick up new `.env.local` files.

**Fix:** Stop and restart the dev server (or use `preview_stop` + `preview_start` in Claude Code).
