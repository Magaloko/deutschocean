# DeutschOcean — Deploy-Checkliste

Schritt-für-Schritt für das erste produktive Go-Live.
Reihenfolge einhalten — jeder Schritt hat eine Verifikation.

---

## 1. Firebase — Einmalig einrichten

### 1.1 Projekt: `kinderspiel-20032022`
Console: <https://console.firebase.google.com>

### 1.2 Authentication aktivieren
**Authentication → Sign-in method:**
- [x] Anonymous — aktiviert? (für „Als Gast spielen")
- [ ] Email/Password — aktivieren für Registrierung
- [ ] Google — aktivieren für Google Sign-In

**Authentication → Settings → Authorized domains:**
- [ ] `localhost` (schon drin)
- [ ] `deutschocean.at` hinzufügen
- [ ] `deutschocean.vercel.app` hinzufügen (Vercel-Preview)

### 1.3 Firestore-Security-Rules
Die Regeln liegen jetzt im Repo als [`firestore.rules`](./firestore.rules).

**Vor dem Deploy:** öffne die Datei, ersetze den Admin-UID-Platzhalter
durch deine echte Firebase-UID (findest du unter
`Authentication → Users → Nutzer-UID`).

Dann **Firestore → Rules** öffnen, den Inhalt einfügen, **Veröffentlichen**.

**Ohne diese Regeln** kann jeder beliebige User jedes fremde Profil lesen
und schreiben — **Sicherheitslücke.**

### 1.4 Firestore-Indices
Bisher nicht erforderlich — alle Abfragen lesen nur Einzeldokumente per UID.

---

## 2. Vercel — Environment Variables

**Vercel Dashboard → deutschocean → Settings → Environment Variables**

Folgende 7 Keys müssen für **alle** Environments (Production, Preview, Development) gesetzt sein:

```
VITE_FIREBASE_API_KEY=AIzaSyAnCk-g5Y8MlsQJQb-4dwH1no3tBZe-hGU
VITE_FIREBASE_AUTH_DOMAIN=kinderspiel-20032022.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=kinderspiel-20032022
VITE_FIREBASE_STORAGE_BUCKET=kinderspiel-20032022.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=117632047930
VITE_FIREBASE_APP_ID=1:117632047930:web:3d27aa605664e057fc8e03
VITE_FIREBASE_MEASUREMENT_ID=G-3376N03PW1
```

**Verifikation:** Nach Deploy auf der Landing-Seite die Browser-Console öffnen, sollte **kein**
`Firebase not configured` erscheinen.

**Optional** (wenn KI-Chat produktiv laufen soll):
```
VITE_CHAT_FUNCTION_URL=<Cloud-Function-URL>
```

---

## 3. Custom Domain `deutschocean.at`

1. Vercel → deutschocean → Settings → Domains → `deutschocean.at` hinzufügen
2. Bei deinem Domain-Registrar DNS-Records setzen (Vercel zeigt die Werte)
3. SSL-Zertifikat wird automatisch ausgestellt
4. **Firebase → Authorized domains** um `deutschocean.at` ergänzen (siehe 1.2)

---

## 4. SEO-Assets (noch offen)

Folgende Dateien fehlen noch und sollten **vor dem Launch** ergänzt werden:

- [ ] `public/og-image.png` (1200×630 px) — Social-Share-Bild für Facebook/Twitter
- [ ] `public/apple-touch-icon.png` (180×180 px) — iOS Homescreen-Icon
- [ ] `public/og-image.png` auf Domain verfügbar — teste: <https://deutschocean.at/og-image.png>

**Bereits vorhanden:**
- ✅ `public/favicon.svg` — Wellen-Logo SVG
- ✅ `public/robots.txt` — Google-Bot-Regeln (App-UI nicht indexieren)
- ✅ `public/sitemap.xml` — Sitemap mit Landing + Blog

Nach Go-Live:
- [ ] Google Search Console: Eigentum hinzufügen + Sitemap einreichen
- [ ] Meta-Tag `google-site-verification` in `index.html` einfügen (von Search Console)

---

## 5. Pre-Deploy Checks (lokal)

```bash
# 1. Tests müssen grün sein
npm test                 # erwartet: 13/13 passed

# 2. Production-Build muss durchlaufen
npm run build            # erwartet: ✓ built in ~8s

# 3. Lint: 0 Errors (Warnings OK)
npm run lint             # erwartet: 0 errors

# 4. Production-Preview lokal testen
npm run preview          # öffnet http://localhost:4173
#   → Lande auf / → Gast-Login → Dashboard → 1 Spiel spielen
#   → Kampagne öffnen → erster Schritt klickbar
```

---

## 6. Deploy

```bash
# Push auf main → Vercel deployt automatisch
git checkout main
git merge claude/fervent-mirzakhani-0f6a3a
git push origin main
```

**Oder** per Vercel CLI:
```bash
vercel --prod
```

---

## 7. Post-Deploy Smoke-Test (auf deutschocean.at)

- [ ] Landing lädt, keine 404s (Network-Tab checken)
- [ ] Gast-Login funktioniert (Dashboard erscheint)
- [ ] Ein Spiel starten + abschließen → XP wird gespeichert
- [ ] Kampagne „Park-Dieb" öffnen → erster Schritt klickbar
- [ ] Logout → zurück zur Landing
- [ ] Google Sign-In funktioniert (wenn in 1.2 aktiviert)
- [ ] Auf Handy testen (responsive)

---

## 8. Bekannte Einschränkungen

Kein Blocker, aber gut zu wissen:

- **ESLint 9** Migration gemacht, aber 24 Warnings (pre-existing hooks-deps +
  unused imports) — separater Cleanup-Sprint empfohlen.
- **12 npm-Audit Vulns** (11 moderate, 1 high) — alle transitiv über Firebase.
  Fix nur durch Firebase 11 Major-Upgrade (breaking). Separater Sprint.
- **KI-Chat** läuft im Demo-Mode, bis `VITE_CHAT_FUNCTION_URL` gesetzt wird.
- **Admin-Blog** sichtbar unter `/admin/blog`, Admin-UID muss in
  `firestore.rules` eingetragen werden.
- **Kein Analytics** — fürs Go-Live OK, aber ohne Daten keine datengetriebenen
  Entscheidungen nachträglich. Empfehlung: Plausible oder eigene Firestore-
  Events im nächsten Sprint.

---

## 9. Rollback

Vercel hat automatisches Rollback:
`Vercel → Deployments → [vorige Version] → ⋯ → Promote to Production`

Dauer: ~30 Sekunden.

---

🌊 **Gutes Launchen!**
