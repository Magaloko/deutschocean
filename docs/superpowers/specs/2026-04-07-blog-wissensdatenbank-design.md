# Blog / Wissensdatenbank — Design Spec
**Datum:** 2026-04-07  
**Projekt:** DeutschOcean  
**Status:** Approved

---

## Überblick

Ein öffentlicher Blog mit Wissensdatenbank unter `/blog`, integriert in die bestehende DeutschOcean-App. Inhalte (Artikel, Studien, Tipps) werden in Firestore gespeichert und über ein Admin-Panel mit TipTap-Block-Editor verwaltet. Öffentliche Nutzer sehen Vorschau + Excerpt; voller Zugriff nur für eingeloggte User. Das Dashboard empfiehlt automatisch passende Artikel via Tag-Matching.

---

## Entscheidungen

| Frage | Entscheidung |
|-------|-------------|
| Editor | TipTap (Block-Editor, Notion-ähnlich) |
| Storage | Firestore `posts/{id}` |
| Auth | Bestehende Firebase Auth + `isAdmin: true` in `users/{uid}` |
| Öffentlich vs. Login | Excerpt öffentlich, voller Artikel nur eingeloggt |
| Empfehlungen | Tag-Matching in `useRecommendedPosts` Hook (kein KI-Backend) |
| Neue Dependency | `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-*` |

---

## Section 1: Datenmodell (Firestore)

### Collection: `posts/{id}`

```js
{
  id:           string,        // auto Firestore ID
  slug:         string,        // URL-freundlich, einzigartig, z.B. "lesen-lernen-tipps"
  title:        string,
  excerpt:      string,        // max 200 Zeichen, öffentlich sichtbar
  content:      object,        // TipTap JSON output { type: 'doc', content: [...] }
  contentType:  'artikel' | 'studie' | 'tipp',
  audience:     'eltern' | 'kinder' | 'lehrer' | 'alle',
  tags:         string[],      // z.B. ["grammatik", "lesen", "mathe"]
  coverImage:   string,        // URL (optional)
  author:       string,        // Anzeigename
  published:    boolean,
  publishedAt:  timestamp | null,
  createdAt:    timestamp,
  updatedAt:    timestamp,
  // Nur für contentType === 'studie':
  sourceUrl:    string | null,
  sourceAuthor: string | null,
  sourceYear:   number | null,
}
```

### Firestore Security Rules (Ergänzung)

```
match /posts/{postId} {
  allow read: if resource.data.published == true
              || (request.auth != null &&
                  get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true);
  allow write: if request.auth != null &&
                  get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
}
```

---

## Section 2: Routen

```
/blog                    → BlogListPage (öffentlich, nur Vorschau)
/blog/:slug              → BlogPostPublicPage (Excerpt + Login-CTA für vollen Inhalt)
/app/blog                → BlogListPage (eingeloggt, voller Zugriff)
/app/blog/:slug          → BlogPostPage (voller TipTap-Content)
/admin                   → AdminLayout (isAdmin Guard)
/admin/blog              → AdminBlogListPage (alle Posts, publish/delete)
/admin/blog/neu          → BlogEditorPage (neuer Artikel)
/admin/blog/:id          → BlogEditorPage (bearbeiten)
```

`AdminLayout` prüft `profile.isAdmin === true`. Wenn nicht: redirect zu `/app`.

---

## Section 3: Neue Seiten & Komponenten

### Datei-Übersicht

```
src/
├── hooks/
│   └── useRecommendedPosts.js       ← NEU (Tag-Matching Hook)
├── lib/
│   └── blogData.js                  ← NEU (Firestore CRUD: getPosts, getPost, etc.)
├── pages/
│   ├── blog/
│   │   ├── BlogListPage.jsx         ← NEU
│   │   ├── BlogListPage.module.css  ← NEU
│   │   ├── BlogPostPublicPage.jsx   ← NEU (öffentlich, mit Login-CTA)
│   │   └── BlogPostPage.jsx         ← NEU (eingeloggt, voller Content)
│   └── admin/
│       ├── AdminLayout.jsx          ← NEU (isAdmin Guard)
│       ├── AdminLayout.module.css   ← NEU
│       ├── AdminBlogListPage.jsx    ← NEU
│       ├── AdminBlogListPage.module.css ← NEU
│       ├── BlogEditorPage.jsx       ← NEU (TipTap Editor)
│       └── BlogEditorPage.module.css ← NEU
├── components/
│   ├── blog/
│   │   ├── PostCard.jsx             ← NEU (Vorschau-Karte)
│   │   ├── PostCard.module.css      ← NEU
│   │   ├── PostContent.jsx          ← NEU (TipTap JSON → React)
│   │   └── PostContent.module.css   ← NEU
│   └── editor/
│       ├── TipTapEditor.jsx         ← NEU (Editor-Wrapper)
│       └── TipTapEditor.module.css  ← NEU
└── App.jsx                          ← UPDATE (neue Routen)
```

### LandingPage Update

- "Blog" Link im Header-Nav
- Sektion "Aus unserem Blog" mit 3 neuesten published Posts (PostCard-Komponente)

### NavBar Update

- "Blog" Link für eingeloggte User → `/app/blog`

---

## Section 4: BlogListPage

**Öffentlich** (`/blog`): Zeigt alle `published: true` Posts als Grid von PostCards.  
**Eingeloggt** (`/app/blog`): Selbe Ansicht, aber Link führt zu `/app/blog/:slug` (voller Inhalt).

**Filter-Bar:** Alle | Artikel | Studien | Tipps — clientseitig gefiltert.

**PostCard** enthält: CoverImage (optional), ContentType-Badge, Titel, Excerpt (150 Zeichen), Audience-Tag, Datum, "Weiterlesen →"-Button.

---

## Section 5: BlogPostPublicPage (`/blog/:slug`)

- Zeigt: CoverImage, Titel, Autor, Datum, ContentType-Badge, Tags
- Zeigt: Excerpt als voller Text + erste 200 Wörter des Inhalts
- Danach: Login-CTA-Banner „Melde dich an um den vollen Artikel zu lesen" → Link zu `/registrieren` und `/login`
- Falls Nutzer bereits eingeloggt → redirect zu `/app/blog/:slug`

---

## Section 6: BlogPostPage (`/app/blog/:slug`)

- Voller TipTap-Content via `PostContent` Komponente gerendert
- `PostContent` rendert TipTap JSON in semantic HTML mit CSS-Styling
- Unterstützte Blöcke: Paragraph, Heading (H1-H3), Bold, Italic, Blockquote, Code, BulletList, OrderedList, Image (URL), Link, HorizontalRule
- Für Studien: Quellen-Box am Ende (sourceAuthor, sourceYear, sourceUrl)
- "← Zurück zum Blog" Button
- Verwandte Artikel (selbe Tags) als 2-3 PostCards am Seitenende

---

## Section 7: Admin-Panel

### AdminLayout

- Prüft `profile.isAdmin === true` — redirect zu `/app` wenn nicht Admin
- Einfache Sidebar: "Blog-Artikel" Link
- Nur zugänglich über direkte URL-Eingabe (kein Link in der normalen App-Navigation)

### AdminBlogListPage (`/admin/blog`)

- Tabelle: Titel, ContentType, Status (Draft/Published), Datum, Aktionen
- Aktionen: Bearbeiten, Publish-Toggle, Löschen (mit Bestätigungs-Dialog)
- "+ Neuer Artikel" Button → `/admin/blog/neu`

### BlogEditorPage (`/admin/blog/neu` und `/admin/blog/:id`)

**Formular-Felder:**
- Titel (Input)
- Slug (auto-generiert aus Titel, editierbar)
- Excerpt (Textarea, max 200 Zeichen mit Counter)
- ContentType (Select: Artikel / Studie / Tipp)
- Audience (Select: Eltern / Kinder / Lehrer / Alle)
- Tags (Komma-getrennte Eingabe → wird zu Array)
- CoverImage URL (optional)
- Author (Input)
- TipTap-Editor (Block-Editor, Hauptinhalt)
- Studien-Felder (nur wenn contentType === 'studie'): sourceUrl, sourceAuthor, sourceYear

**Aktionen:**
- "Speichern als Entwurf" → `published: false`
- "Veröffentlichen" → `published: true`, setzt `publishedAt` auf jetzt
- "Vorschau" → öffnet `/blog/:slug` in neuem Tab

**TipTap-Toolbar:** Bold, Italic, H1, H2, H3, Blockquote, Code, BulletList, OrderedList, HorizontalRule, Link, Image

---

## Section 8: Empfehlungs-System (`useRecommendedPosts`)

```js
// Matching-Logik (keine KI):
// 1. Hole alle published Posts
// 2. Filtere nach audience === 'alle' || audience === userAudience
// 3. Score: +2 pro übereinstimmendem Tag mit completedMissions-Typen
// 4. Neue User (xp === 0): zeige Posts mit tag 'onboarding' oder 'anfänger'
// 5. Gib top 2 Posts zurück

// Audience-Mapping:
// kindergarten → 'kinder'
// volksschule  → 'kinder' (Schüler) oder 'eltern' — zeige audience 'alle' + 'kinder'
// hauptschule  → 'kinder' (ältere Schüler) — zeige audience 'alle' + 'kinder'
// Lehrer-Inhalte nur wenn audience === 'lehrer' explizit angefragt
const userAudiences = ['alle', profile.schoolModule === 'kindergarten' ? 'kinder' : 'kinder']
```

**Integration im DashboardPage:**  
Neuer Abschnitt "📚 Für dich empfohlen" zwischen Tagesaufgabe und Tabs — zeigt 1-2 PostCards (horizontal scrollbar auf Mobile).

---

## Section 9: Neue npm Dependencies

```bash
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit \
  @tiptap/extension-image @tiptap/extension-link \
  @tiptap/extension-placeholder @tiptap/extension-character-count
```

---

## Nicht im Scope

- Kommentar-Funktion
- Newsletter/E-Mail-Benachrichtigungen
- Volltextsuche (Firestore hat keine native Volltextsuche)
- Mehrsprachige Inhalte
- Bild-Upload (nur URL-Eingabe)
- SEO-Metadaten (später, nach `react-helmet` Integration)
