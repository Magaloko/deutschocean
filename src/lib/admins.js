// Admin-Konfiguration
//
// Wer ist Admin? → Zwei Wege:
//
// 1. **E-Mail-Match**: Jeder User, dessen Firebase-Auth-Adresse in ADMIN_EMAILS
//    steht, wird automatisch als Admin erkannt. Einfach neue E-Mails unten
//    eintragen — kein Firestore-Update nötig.
//
// 2. **Firestore-Flag**: Falls jemand im User-Doc `isAdmin: true` gesetzt hat
//    (z.B. manuell in der Firebase Console), gilt er ebenfalls als Admin.
//
// Anonyme Gäste haben keine E-Mail → können NIE Admin sein.
//
// Wichtig: Für die App-Schutzschicht reicht Variante 1. Die Firestore-Rules
// müssen die gleiche Liste spiegeln (siehe firestore.rules), damit ein
// manipulierter Browser nicht auf fremde Daten zugreifen kann.

export const ADMIN_EMAILS = [
  'dadakaev10@gmail.com',
]

export function isAdminEmail(email) {
  if (!email) return false
  const normalized = String(email).trim().toLowerCase()
  return ADMIN_EMAILS.some((a) => a.toLowerCase() === normalized)
}
