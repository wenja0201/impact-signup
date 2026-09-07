import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY fehlt in .env.local");
  return new Resend(key);
}

const FROM_ADDRESS =
  process.env.EMAIL_FROM || "Impact Fight Academy <onboarding@resend.dev>";

type SendResult = { ok: true } | { ok: false; error: string };

async function send(
  to: string,
  subject: string,
  html: string
): Promise<SendResult> {
  try {
    const resend = getResend();
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject,
      html,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "unknown" };
  }
}

export async function sendSignupConfirmation(to: string, firstName: string) {
  return send(
    to,
    "Deine Anmeldung bei Impact Fight Academy",
    `<p>Hi ${firstName},</p>
     <p>danke für deine Anmeldung bei der Impact Fight Academy! Wir haben deine Angaben erhalten und melden uns in Kürze bei dir, um alles Weitere zu klären.</p>
     <p>Sportliche Grüße<br/>Dein Impact Team</p>`
  );
}

export async function sendPaymentConfirmation(to: string, firstName: string) {
  return send(
    to,
    "Zahlung bestätigt — willkommen bei Impact!",
    `<p>Hi ${firstName},</p>
     <p>deine Zahlung ist eingegangen und deine Mitgliedschaft ist jetzt aktiv. Wir freuen uns auf dich im Training!</p>
     <p>Sportliche Grüße<br/>Dein Impact Team</p>`
  );
}

export async function sendPaymentFailedNotice(to: string, firstName: string) {
  return send(
    to,
    "Zahlung konnte nicht verarbeitet werden",
    `<p>Hi ${firstName},</p>
     <p>leider konnten wir deine letzte Zahlung nicht verarbeiten. Bitte überprüfe deine Zahlungsdaten, damit deine Mitgliedschaft aktiv bleibt.</p>
     <p>Bei Fragen melde dich einfach bei uns.</p>
     <p>Sportliche Grüße<br/>Dein Impact Team</p>`
  );
}

export async function sendInternalNewSignupAlert(
  to: string,
  memberName: string,
  discipline: string
) {
  return send(
    to,
    `Neue Anmeldung: ${memberName}`,
    `<p>Neue Mitgliedschafts-Anmeldung:</p>
     <p><b>${memberName}</b> — Interesse: ${discipline}</p>`
  );
}

export async function sendInternalPaymentFailedAlert(
  to: string,
  memberName: string
) {
  return send(
    to,
    `Zahlung fehlgeschlagen: ${memberName}`,
    `<p>Bei <b>${memberName}</b> ist eine Zahlung fehlgeschlagen. Ggf. manuell nachfassen.</p>`
  );
}
