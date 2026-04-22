// =============================================
// FACH-DATEN: Roboter, Coden, Mini-Boss, Cool Bleiben
// Basiert auf 5 For Dummies Büchern (2026)
// =============================================

// ── ROBOTER-SCHULE (AI ChatBots + Agentic AI For Dummies) ────────────────
export const ROBOTER_FRAGEN = {
  0: [
    { q: 'Was ist ein Chatbot?', options: ['Ein Roboter aus Metall', 'Ein Computerprogramm das Fragen beantwortet', 'Ein Spielzeug', 'Ein Haustier'], a: 1, erklaerung: 'Ein Chatbot ist nur Software — er hat keinen Körper, antwortet aber wie ein Gespräch.' },
    { q: 'Was bedeutet "KI"?', options: ['Kleine Idee', 'Künstliche Intelligenz', 'Kinder Internet', 'Kreatives Institut'], a: 1, erklaerung: 'KI = Künstliche Intelligenz. "Künstlich" heißt: von Menschen gemacht, nicht echt natürlich.' },
    { q: 'Wie redet man mit einem Chatbot?', options: ['Man ruft ihn an', 'Man winkt ihm zu', 'Man tippt oder spricht mit ihm', 'Man schickt einen Brief'], a: 2, erklaerung: 'Die meisten Chatbots verstehen Text (tippen) — moderne auch gesprochene Sprache.' },
    { q: 'Welches davon ist ein bekannter KI-Assistent?', options: ['Pikachu', 'Siri', 'Mario', 'Sonic'], a: 1, erklaerung: 'Siri ist Apples KI-Assistent. Pikachu und Mario sind Spiel-Figuren.' },
    { q: 'Was braucht eine KI um zu lernen?', options: ['Essen und Schlafen', 'Viele Beispiele und Daten', 'Einen Lehrer der aufpasst', 'Urlaub'], a: 1, erklaerung: 'KI lernt aus Beispielen — je mehr Daten, desto besser wird sie.' },
    { q: 'Kann eine KI Fehler machen?', options: ['Nein, KI ist immer perfekt', 'Ja, manchmal gibt sie falsche Antworten', 'Nur wenn man sie ärgert', 'Nein, sie weiß alles'], a: 1, erklaerung: 'KI rät oft richtig, aber nicht immer. Deshalb sollte man ihre Antworten prüfen.' },
    { q: 'Wo begegnest du täglich einer KI?', options: ['Nur im Raumschiff', 'Beim Suchen im Internet', 'Nur im Krankenhaus', 'Niemals'], a: 1, erklaerung: 'Google, YouTube-Empfehlungen, Sprachassistenten — überall steckt KI drin.' },
    { q: 'Was ist ein "Sprachassistent"?', options: ['Ein Lehrer für Sprachen', 'Eine KI die Sprachbefehle versteht', 'Ein Übersetzer-Buch', 'Ein Mikrofon'], a: 1, erklaerung: 'Sprachassistenten wie Siri oder Alexa erkennen deine Stimme und reagieren.' },
  ],
  1: [
    { q: 'Was ist ein "Prompt"?', options: ['Ein Frühstück', 'Eine Frage oder Anweisung an die KI', 'Ein Fehler im Programm', 'Ein Spielzeug-Bot'], a: 1 },
    { q: 'Was macht eine KI mit vielen Daten?', options: ['Sie löscht sie alle', 'Sie lernt Muster daraus', 'Sie druckt sie aus', 'Sie teilt sie mit Freunden'], a: 1 },
    { q: 'Was kann eine KI erstellen?', options: ['Nur Zahlen', 'Texte, Bilder und Musik', 'Nur rote Kreise', 'Nur Wettervorhersagen'], a: 1 },
    { q: 'Was ist ein "KI-Agent"?', options: ['Ein Geheimagent', 'Eine KI die selbst Aufgaben plant und erledigt', 'Ein Inspektor', 'Ein Roboter-Hund'], a: 1 },
    { q: 'Was ist wichtig bei KI-Regeln (Ethik)?', options: ['KI soll so schnell wie möglich sein', 'KI soll fair, sicher und ehrlich sein', 'KI soll immer Witze machen', 'KI soll teuer sein'], a: 1 },
    { q: 'Was kann KI besser als Menschen?', options: ['Echte Freundschaften aufbauen', 'Millionen Daten in Sekunden durchsuchen', 'Kochen und Backen', 'Fußball spielen'], a: 1 },
    { q: 'Wie nutzen Ärzte KI?', options: ['Um Patienten zu erschrecken', 'Um Krankheiten früher zu erkennen', 'Nur zum Spielen', 'Um Urlaub zu buchen'], a: 1 },
    { q: 'Was bedeutet KI "trainieren"?', options: ['KI in den Urlaub schicken', 'Ihr Tausende von Beispielen zeigen', 'Die KI ausschalten', 'Die KI streichen'], a: 1 },
  ],
  2: [
    { q: 'Was kann ein KI-Agent selbst planen?', options: ['Nur Witze erzählen', 'Mehrere Aufgaben nacheinander erledigen', 'Nur ein Wort sagen', 'Nur zuhören'], a: 1 },
    { q: 'Was ist "Datenschutz" bei KI?', options: ['Daten mit allen teilen', 'Deine persönlichen Infos werden geschützt', 'Daten vervielfältigen', 'Daten löschen'], a: 1 },
    { q: 'Was ist eine KI-"Halluzination"?', options: ['KI träumt nachts', 'KI erfindet falsche Antworten', 'KI malt Bilder', 'KI singt Lieder'], a: 1 },
    { q: 'Was macht KI in Schulen?', options: ['Schüler bestrafen', 'Lernhilfen und Erklärungen anbieten', 'Den Unterricht abbrechen', 'Hausaufgaben verbieten'], a: 1 },
    { q: 'Was kann KI noch NICHT so gut?', options: ['Schnell rechnen', 'Echte Gefühle haben', 'Texte schreiben', 'Bilder beschreiben'], a: 1 },
    { q: 'Warum braucht KI menschliche Aufsicht?', options: ['Weil sie immer schläft', 'Weil sie manchmal falsch liegen kann', 'Weil sie zu schnell ist', 'Weil sie immer Urlaub will'], a: 1 },
    { q: 'Was ist "maschinelles Lernen"?', options: ['Eine Maschine geht in die Schule', 'Computer lernt selbst aus Beispielen', 'Menschen lernen Maschinen reparieren', 'Maschinen lernen springen'], a: 1 },
    { q: 'Wie soll KI in 10 Jahren helfen?', options: ['Nur Spiele spielen', 'Bei Klimawandel, Medizin und Bildung helfen', 'Nur fernsehen', 'Nur kochen'], a: 1 },
  ],
}

// ── CODER-KIDS (Python Automation For Dummies) ───────────────────────────
export const CODER_FRAGEN = {
  0: [
    { q: 'Was ist ein Computerprogramm?', options: ['Ein Fernseher', 'Eine Liste von Befehlen für den Computer', 'Ein Spielzeug', 'Eine Schule'], a: 1 },
    { q: 'Was ist Python?', options: ['Eine Schlange im Zoo', 'Eine Programmiersprache', 'Ein Computerspiel', 'Eine Sportart'], a: 1 },
    { q: 'Was ist eine "Variable"?', options: ['Ein Fehler im Code', 'Ein Behälter der Informationen speichert', 'Ein Druckknopf', 'Ein Musikinstrument'], a: 1 },
    { q: 'Was macht eine Schleife (Loop)?', options: ['Der Computer schläft', 'Dieselben Befehle werden mehrmals wiederholt', 'Der Code löscht sich', 'Der Bildschirm dreht sich'], a: 1 },
    { q: 'Was ist ein "Bug"?', options: ['Ein Käfer im Zimmer', 'Ein Fehler im Programm', 'Ein neues Feature', 'Ein toller Code'], a: 1 },
    { q: 'Was bedeutet "Automatisierung"?', options: ['Alles von Hand machen', 'Der Computer macht Aufgaben selbst', 'Pause machen', 'Laut singen'], a: 1 },
    { q: 'Was kann Python automatisieren?', options: ['Nur Mathematik', 'Dateien sortieren, E-Mails senden und mehr', 'Nur Farben malen', 'Nur Musik spielen'], a: 1 },
    { q: 'Was ist VS Code?', options: ['Ein Computerspiel', 'Ein Programm um Code zu schreiben', 'Ein Musikplayer', 'Eine App für Bilder'], a: 1 },
  ],
  1: [
    { q: 'Was macht der Befehl "print" in Python?', options: ['Druckt ein Dokument', 'Zeigt Text auf dem Bildschirm', 'Löscht alles', 'Macht den Computer aus'], a: 1 },
    { q: 'Was ist eine "if-Anweisung"?', options: ['Eine Frage an den Lehrer', 'Code wird nur ausgeführt wenn eine Bedingung stimmt', 'Ein Musikstück', 'Ein Spielzug'], a: 1 },
    { q: 'Was ist ein "String" in Python?', options: ['Ein Faden', 'Text in Anführungszeichen', 'Eine Zahl', 'Ein Bild'], a: 1 },
    { q: 'Was macht "import" in Python?', options: ['Importiert Waren aus anderen Ländern', 'Lädt zusätzliche Werkzeuge in Python', 'Speichert eine Datei', 'Startet den Computer'], a: 1 },
    { q: 'Was ist eine Funktion in Python?', options: ['Ein mathematisches Symbol', 'Ein Codeblock den man immer wieder aufrufen kann', 'Eine Taste auf der Tastatur', 'Ein Ordner'], a: 1 },
    { q: 'Was ist "Debuggen"?', options: ['Käfer aus dem Zimmer jagen', 'Fehler im Code finden und beheben', 'Den Code schöner schreiben', 'Den Computer reinigen'], a: 1 },
    { q: 'Was speichert eine Liste in Python?', options: ['Nur eine Zahl', 'Mehrere Werte in einer Reihe', 'Nur Text', 'Nur Bilder'], a: 1 },
    { q: 'Was macht eine "for-Schleife"?', options: ['Macht eine Pause', 'Geht durch jedes Element einer Liste', 'Löscht Daten', 'Schreibt einen Brief'], a: 1 },
  ],
  2: [
    { q: 'Was ist eine "API"?', options: ['Eine Schulaufgabe', 'Eine Brücke die zwei Programme verbindet', 'Ein Spielzeug', 'Eine Sprache'], a: 1 },
    { q: 'Was kann "Web-Scraping"?', options: ['Webseiten löschen', 'Automatisch Infos von Webseiten sammeln', 'Neue Webseiten bauen', 'Bilder zeichnen'], a: 1 },
    { q: 'Was macht ein Internet-Bot?', options: ['Spielt nur Spiele', 'Führt automatisch Aufgaben im Internet aus', 'Macht den Computer langsam', 'Löscht E-Mails'], a: 1 },
    { q: 'Was ist "Machine Learning"?', options: ['Maschinen gehen in die Schule', 'Computer lernen selbst aus Beispielen', 'Menschen lernen Maschinen reparieren', 'Maschinen lernen laufen'], a: 1 },
    { q: 'Was kann Python mit Bildern machen?', options: ['Nur anzeigen', 'Größe ändern, Filter anwenden und mehr', 'Nur löschen', 'Nur drucken'], a: 1 },
    { q: 'Wofür nutzen Wissenschaftler Python?', options: ['Nur für Spiele', 'Für Datenanalyse und Forschung', 'Nur für E-Mails', 'Nur für Musik'], a: 1 },
    { q: 'Was macht ein "Scheduler" in Python?', options: ['Plant Partys', 'Führt Aufgaben zu bestimmten Zeiten aus', 'Macht Fotos', 'Schreibt Bücher'], a: 1 },
    { q: 'Wie kann KI in Python eingebunden werden?', options: ['Gar nicht', 'Über Bibliotheken wie HuggingFace', 'Nur durch Zauberei', 'Nur durch Experten'], a: 1 },
  ],
}

// ── MINI-BOSS (Starting a Business All-in-One For Dummies) ───────────────
export const MINIBOSS_FRAGEN = {
  0: [
    { q: 'Was ist ein Unternehmen?', options: ['Ein Gebäude', 'Eine Gruppe die Produkte oder Dienste anbietet', 'Ein Hobby', 'Eine Schule'], a: 1 },
    { q: 'Was braucht man zuerst für ein Business?', options: ['Viel Geld', 'Eine gute Idee', 'Einen großen Laden', 'Berühmte Freunde'], a: 1 },
    { q: 'Was ist eine "Zielgruppe"?', options: ['Ein Bogenschützen-Ziel', 'Die Menschen die dein Produkt kaufen sollen', 'Deine Familie', 'Alle Menschen der Welt'], a: 1 },
    { q: 'Was ist ein "Gewinn"?', options: ['Wenn du mehr ausgibst als eingenommen', 'Wenn du mehr verdienst als du ausgibst', 'Wenn du nichts verdienst', 'Wenn du einen Preis gewinnst'], a: 1 },
    { q: 'Was macht ein gutes Zeichen für eine Geschäftsidee aus?', options: ['Niemand braucht sie', 'Viele Menschen brauchen sie und zahlen dafür', 'Sie ist sehr teuer', 'Nur du findest sie gut'], a: 1 },
    { q: 'Was ist "Konkurrenz"?', options: ['Deine besten Freunde', 'Andere Firmen die Ähnliches anbieten', 'Dein Team', 'Deine Kunden'], a: 1 },
    { q: 'Was löst ein guter Unternehmer?', options: ['Mathematikaufgaben', 'Probleme für andere Menschen', 'Kreuzworträtsel', 'Puzzles'], a: 1 },
    { q: 'Was ist ein "Produkt"?', options: ['Ein Lebensmittel', 'Etwas das du verkaufst', 'Ein Schulfach', 'Ein Haushaltsgerät'], a: 1 },
  ],
  1: [
    { q: 'Was ist ein "Businessplan"?', options: ['Ein Urlaubsplan', 'Ein schriftlicher Plan für dein Unternehmen', 'Ein Stundenplan', 'Ein Kochrezept'], a: 1 },
    { q: 'Was sind "Kosten"?', options: ['Geld das du verdienst', 'Geld das du für das Geschäft ausgibst', 'Geld das du sparst', 'Geld das du verlierst'], a: 1 },
    { q: 'Was sind "Einnahmen"?', options: ['Was du ausgibst', 'Geld das Kunden dir bezahlen', 'Dein Taschengeld', 'Was du schuldest'], a: 1 },
    { q: 'Was ist "Marketing"?', options: ['Einkaufen gehen', 'Wie du Kunden von deinem Produkt erzählst', 'Buchhaltung machen', 'Personal einstellen'], a: 1 },
    { q: 'Was ist eine "Investition"?', options: ['Geld ausgeben um später mehr zu verdienen', 'Geld weggeben', 'Geld sparen und nicht ausgeben', 'Geld zählen'], a: 1 },
    { q: 'Was ist ein "Budget"?', options: ['Ein leckeres Essen', 'Wie viel Geld du ausgeben kannst', 'Ein Büro', 'Eine Buchhaltungssoftware'], a: 1 },
    { q: 'Warum ist ein Businessplan wichtig?', options: ['Er ist nicht wichtig', 'Er zeigt den Weg und hilft bei Entscheidungen', 'Er ist nur für die Bank', 'Er macht das Unternehmen berühmt'], a: 1 },
    { q: 'Was ist eine "Rechnung"?', options: ['Eine Schulaufgabe', 'Ein Dokument das zeigt was jemand bezahlen muss', 'Ein Einkaufszettel', 'Ein Brief'], a: 1 },
  ],
  2: [
    { q: 'Was macht guten Kundenservice aus?', options: ['Kunden ignorieren', 'Schnelle freundliche Hilfe', 'Teuer sein', 'Langsam antworten'], a: 1 },
    { q: 'Was ist "Delegieren"?', options: ['Alles selbst machen', 'Aufgaben an andere weitergeben', 'Urlaub machen', 'Nichts tun'], a: 1 },
    { q: 'Was ist "Content Marketing"?', options: ['Waren einkaufen', 'Nützliche Inhalte teilen um Kunden anzuziehen', 'TV-Werbung schalten', 'Flyer drucken'], a: 1 },
    { q: 'Was ist "Feedback"?', options: ['Musik die widerhallt', 'Meinungen von Kunden über dein Produkt', 'Eine Fehleranalyse', 'Ein Firmenprojekt'], a: 1 },
    { q: 'Was macht ein Unternehmen langfristig erfolgreich?', options: ['Viel Werbung schalten', 'Zufriedene Kunden und gute Produkte', 'Ein schönes Logo', 'Berühmte Mitarbeiter'], a: 1 },
    { q: 'Was ist "Social Media Marketing"?', options: ['Nur für Erwachsene', 'Werbung über Instagram, TikTok und Co.', 'Zeitung lesen', 'Radio hören'], a: 1 },
    { q: 'Was ist ein "Franchise"?', options: ['Ein französisches Wort', 'Ein Geschäftsmodell das man lizenzieren kann', 'Ein Spielzeug', 'Ein Restaurant'], a: 1 },
    { q: 'Wie nutzt man KI im Business?', options: ['Gar nicht', 'Für Kundensupport, Analysen und mehr', 'Nur für Spielereien', 'Nur Experten dürfen das'], a: 1 },
  ],
}

// ── COOL BLEIBEN (Stress Management For Dummies) ─────────────────────────
export const COOL_FRAGEN = {
  0: [
    { q: 'Was ist Stress?', options: ['Ein Sportspiel', 'Ein Gefühl wenn uns zu viel auf einmal passiert', 'Eine Schulaufgabe', 'Eine Krankheit'], a: 1 },
    { q: 'Was passiert im Körper bei Stress?', options: ['Du schläfst sofort ein', 'Herz schlägt schneller, Muskeln spannen sich an', 'Du bekommst Hunger', 'Nichts passiert'], a: 1 },
    { q: 'Was hilft sofort gegen Stress?', options: ['Schreien', 'Tief und langsam atmen', 'Mehr essen', 'Rennen'], a: 1 },
    { q: 'Ist ein bisschen Stress manchmal gut?', options: ['Nein, nie', 'Ja, er kann uns anspornen und wach halten', 'Nur für Erwachsene', 'Nur beim Sport'], a: 1 },
    { q: 'Was ist "Technostress"?', options: ['Stress beim Technik-Unterricht', 'Stress durch zu viel Bildschirmzeit', 'Stress beim Programmieren', 'Stress mit dem WLAN'], a: 1 },
    { q: 'Was macht guter Schlaf mit Stress?', options: ['Er macht mehr Stress', 'Er hilft den Körper zu erholen und Stress zu reduzieren', 'Er ändert nichts', 'Er macht uns müder'], a: 1 },
    { q: 'Was sind häufige Stress-Auslöser bei Kindern?', options: ['Zu viel Eis essen', 'Schule, Tests, Streit mit Freunden', 'Zu viel schlafen', 'Zu viele Ferien'], a: 1 },
    { q: 'Was ist "Entspannung"?', options: ['Nichts tun', 'Wenn Körper und Geist sich erholen und ausruhen', 'Schlafen gehen', 'Pause vom Lernen'], a: 1 },
  ],
  1: [
    { q: 'Wie atmet man richtig um sich zu beruhigen?', options: ['Schnell und flach', 'Langsam und tief in den Bauch', 'Durch den Mund, so schnell wie möglich', 'Einhalten solange man kann'], a: 1 },
    { q: 'Was ist "progressive Muskelentspannung"?', options: ['Muskeln beim Sport trainieren', 'Muskeln bewusst anspannen dann loslassen', 'Muskeln massieren', 'Einen Marathon laufen'], a: 1 },
    { q: 'Was macht Bewegung mit Stresshormonen?', options: ['Sie vermehrt sie', 'Sie baut sie ab', 'Sie ändert nichts', 'Sie blockiert sie'], a: 1 },
    { q: 'Was ist Meditation?', options: ['Eine Sportart', 'Ruhig sitzen und auf den Atem achten ohne zu urteilen', 'Schlafen während des Tages', 'Ein Gebet'], a: 1 },
    { q: 'Was ist Achtsamkeit (Mindfulness)?', options: ['Sehr aufmerksam sein in der Schule', 'Im gegenwärtigen Moment leben ohne zu urteilen', 'Vorsichtig sein', 'Angst haben'], a: 1 },
    { q: 'Wie viele Stunden Schlaf brauchen Kinder?', options: ['4–6 Stunden', '9–11 Stunden', '3–4 Stunden', '12–15 Stunden'], a: 1 },
    { q: 'Was gibt dem Körper Energie ohne Stress?', options: ['Viel Zucker und Cola', 'Obst, Gemüse und Vollkornprodukte', 'Fastfood täglich', 'Kein Frühstück'], a: 1 },
    { q: 'Wie hilft Natur gegen Stress?', options: ['Gar nicht', 'Draußen sein senkt Stresshormone und hebt die Stimmung', 'Nur im Sommer', 'Nur wenn man joggt'], a: 1 },
  ],
  2: [
    { q: 'Was sind negative "Denkmuster"?', options: ['Gedanken beim Mathe-Rechnen', 'Gedanken die uns ohne Grund schlecht fühlen lassen', 'Fantasie-Geschichten', 'Träume'], a: 1 },
    { q: 'Was ist "Dankbarkeit"?', options: ['Jemandem danken', 'Sich bewusst über schöne Dinge im Leben freuen', 'Höflich sein', 'Ein Tagebuch führen'], a: 1 },
    { q: 'Was ist "Resilienz"?', options: ['Elastisches Material', 'Die Kraft sich von Schwierigkeiten zu erholen', 'Sehr hart sein', 'Nie weinen'], a: 1 },
    { q: 'Was macht Lachen mit dem Körper?', options: ['Es macht Stress', 'Es reduziert Stresshormone und hebt die Stimmung', 'Es ermüdet', 'Es ändert nichts'], a: 1 },
    { q: 'Was hilft wenn man sich sehr ärgert?', options: ['Sofort losschreien', 'Durchatmen und bis 10 zählen', 'Weglaufen', 'Das Problem ignorieren'], a: 1 },
    { q: 'Was ist "Optimismus"?', options: ['Alles gut finden auch wenn es nicht gut ist', 'Schwierigkeiten als lösbar sehen und das Beste erwarten', 'Keine Probleme haben', 'Andere ignorieren'], a: 1 },
    { q: 'Was sind persönliche "Werte"?', options: ['Preise in einem Geschäft', 'Was dir im Leben wirklich wichtig ist', 'Schulnoten', 'Regeln'], a: 1 },
    { q: 'Was ist ein guter Umgang mit Sorgen?', options: ['Tag und Nacht daran denken', 'Sich fragen: Kann ich etwas tun? Dann tue es!', 'Anderen alles erzählen', 'Schlafen und vergessen'], a: 1 },
  ],
}

// ── FACH-METADATEN ────────────────────────────────────────────────────────
export const FAECHER = [
  {
    id: 'roboter',
    tab: 'roboter',
    label: 'Roboter',
    emoji: '🤖',
    color: '#6366f1',
    title: 'Roboter-Schule',
    subtitle: 'Wie denken und arbeiten KIs?',
    levels: {
      0: { label: 'Anfänger', emoji: '🤖', desc: 'Was ist ein Chatbot?' },
      1: { label: 'Forscher', emoji: '🧠', desc: 'Wie lernen KIs?' },
      2: { label: 'KI-Profi', emoji: '🦾', desc: 'KI-Agenten & Ethik' },
    },
    data: null, // wird in der Komponente über Import gesetzt
    missionPrefix: 'roboter-quiz',
    route: '/app/fach/roboter',
    bookSource: 'AI ChatBots + Agentic AI For Dummies (2026)',
  },
  {
    id: 'coden',
    tab: 'coden',
    label: 'Coden',
    emoji: '🐍',
    color: '#22c55e',
    title: 'Coder-Kids',
    subtitle: 'Programmieren spielerisch lernen',
    levels: {
      0: { label: 'Anfänger', emoji: '🐍', desc: 'Was ist Code?' },
      1: { label: 'Entwickler', emoji: '💻', desc: 'Python-Befehle' },
      2: { label: 'Code-Profi', emoji: '🚀', desc: 'Automatisierung' },
    },
    data: null,
    missionPrefix: 'coden-quiz',
    route: '/app/fach/coden',
    bookSource: 'Python Automation For Dummies (2026)',
  },
  {
    id: 'miniboss',
    tab: 'miniboss',
    label: 'Mini-Boss',
    emoji: '💼',
    color: '#f59e0b',
    title: 'Mini-Boss',
    subtitle: 'Mein erstes Unternehmen',
    levels: {
      0: { label: 'Träumer', emoji: '💡', desc: 'Meine Geschäftsidee' },
      1: { label: 'Planer', emoji: '📋', desc: 'Plan & Geld' },
      2: { label: 'Boss', emoji: '👑', desc: 'Kunden & Team' },
    },
    data: null,
    missionPrefix: 'miniboss-quiz',
    route: '/app/fach/miniboss',
    bookSource: 'Starting a Business All-in-One For Dummies (2026)',
  },
  {
    id: 'cool',
    tab: 'cool',
    label: 'Cool Bleiben',
    emoji: '🧘',
    color: '#14b8a6',
    title: 'Cool Bleiben',
    subtitle: 'Gefühle & Stress meistern',
    levels: {
      0: { label: 'Entdecker', emoji: '🌊', desc: 'Was ist Stress?' },
      1: { label: 'Atmer', emoji: '💨', desc: 'Atem & Körper' },
      2: { label: 'Zen-Meister', emoji: '🧘', desc: 'Gedanken & Gefühle' },
    },
    data: null,
    missionPrefix: 'cool-quiz',
    route: '/app/fach/cool',
    bookSource: 'Stress Management For Dummies, 3rd Ed. (2026)',
  },
]
