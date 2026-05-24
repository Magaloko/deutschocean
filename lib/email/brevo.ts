const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'

interface EmailOptions {
  to: string
  toName?: string
  subject: string
  htmlContent: string
}

async function sendEmail(opts: EmailOptions): Promise<void> {
  const res = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': process.env.BREVO_API_KEY!,
    },
    body: JSON.stringify({
      sender: { name: 'DeutschOcean', email: process.env.BREVO_FROM_EMAIL },
      to: [{ email: opts.to, name: opts.toName ?? opts.to }],
      subject: opts.subject,
      htmlContent: opts.htmlContent,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Brevo Fehler ${res.status}: ${body}`)
  }
}

// ─── Templates ────────────────────────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  await sendEmail({
    to,
    toName: name,
    subject: `Willkommen bei DeutschOcean, ${name}! 🐋`,
    htmlContent: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px">
        <h1 style="color:#1a6fc4">Hallo ${name}! 👋</h1>
        <p>Dein Abenteuer auf <strong>DeutschOcean</strong> kann jetzt beginnen.</p>
        <p>Entdecke Spiele, sammle XP und werde zum Deutsch-Meister!</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
           style="display:inline-block;margin-top:24px;padding:12px 24px;background:#1a6fc4;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold">
          Jetzt loslegen
        </a>
        <p style="margin-top:32px;color:#888;font-size:12px">
          Du erhältst diese E-Mail, weil du dich auf DeutschOcean registriert hast.
        </p>
      </div>
    `,
  })
}

export async function sendStreakReminderEmail(
  to: string,
  name: string,
  streakDays: number
): Promise<void> {
  await sendEmail({
    to,
    toName: name,
    subject: `${name}, dein Streak von ${streakDays} Tagen braucht dich! 🔥`,
    htmlContent: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px">
        <h1 style="color:#e85d04">🔥 ${streakDays}-Tage-Streak in Gefahr!</h1>
        <p>Hallo ${name},</p>
        <p>Du hast heute noch nicht gelernt. Nur ein kurzes Spiel reicht, um deinen Streak zu retten!</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
           style="display:inline-block;margin-top:24px;padding:12px 24px;background:#e85d04;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold">
          Streak retten →
        </a>
      </div>
    `,
  })
}

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string
): Promise<void> {
  await sendEmail({
    to,
    subject: 'DeutschOcean – Passwort zurücksetzen',
    htmlContent: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px">
        <h1 style="color:#1a6fc4">Passwort zurücksetzen</h1>
        <p>Jemand hat eine Passwort-Zurücksetzung für dein Konto angefragt.</p>
        <p>Klick auf den Button, um ein neues Passwort zu setzen. Der Link ist 1 Stunde gültig.</p>
        <a href="${resetUrl}"
           style="display:inline-block;margin-top:24px;padding:12px 24px;background:#1a6fc4;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold">
          Passwort zurücksetzen
        </a>
        <p style="margin-top:32px;color:#888;font-size:12px">
          Falls du das nicht warst, kannst du diese E-Mail ignorieren.
        </p>
      </div>
    `,
  })
}
