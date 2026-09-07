# Impact Fight Academy — Online-Mitgliedschaft

Anmeldeformular → Stripe-Checkout (wiederkehrende Zahlung) → automatische
Bestätigungs-/Fehlermails → Supabase-Backend. Gebaut für die Live-Demo.

## Was das System macht

1. Interessent scannt QR-Code oder besucht die Website → landet auf `/` (Anmeldeformular)
2. Formular ausfüllen, Laufzeit wählen (1/6/12/24 Monate) → "Weiter zur Zahlung"
3. Datensatz wird in Supabase angelegt (Status `pending_payment`), Bestätigungsmail raus, interne Benachrichtigung ans Team
4. Weiterleitung zu Stripe Checkout → Zahlungsdaten eingeben
5. Stripe schickt per Webhook Bescheid: Zahlung erfolgreich → Status wird `active`, Zahlungsbestätigung geht raus
6. Falls eine spätere Abbuchung fehlschlägt (Karte abgelaufen, Konto leer, SEPA-Rücklastschrift) → Status wird `payment_failed`, Mitglied bekommt automatisch eine Mail, Team bekommt eine interne Benachrichtigung zum Nachfassen

**Bewusst nicht automatisiert (siehe Gespräch):** automatische Sperrung oder Kündigung nach
X fehlgeschlagenen Versuchen. Das System erkennt und meldet Zahlungsausfälle zuverlässig —
die Entscheidung, was danach passiert, bleibt bei euch.

## Setup (ca. 15–20 Minuten)

### 1. Supabase-Projekt

1. Auf [supabase.com](https://supabase.com) ein neues Projekt anlegen (kostenloser Tier reicht)
2. SQL Editor öffnen → Inhalt von `supabase/schema.sql` einfügen → Run
3. Projekt-Einstellungen > API → `Project URL` und `service_role` Key kopieren

### 2. Stripe

1. [dashboard.stripe.com](https://dashboard.stripe.com) → sicherstellen, dass **Testmodus** aktiv ist (Schalter oben rechts)
2. Produkte > Neues Produkt: "Impact Mitgliedschaft"
   - 4 wiederkehrende Preise anlegen (monatlich abrechnend, unterschiedliche Beträge):
     - 1 Monat: €225 / Monat
     - 6 Monate: €175 / Monat (als Preis "monatlich", die Laufzeit selbst wird aktuell nicht technisch erzwungen — reine Anzeige/Vereinbarung)
     - 12 Monate: €150 / Monat
     - 24 Monate: €125 / Monat
   - Jede `price_...` ID kopieren → in `.env.local` eintragen
3. Entwickler > API-Schlüssel → geheimen Schlüssel (`sk_test_...`) kopieren

**Hinweis zu Laufzeiten:** Die aktuelle Version bildet unterschiedliche Preise pro Laufzeit ab,
aber noch keine harte Mindestlaufzeit-Bindung (also kein automatisches "darf erst nach 12 Monaten
kündigen"). Das ist ein Punkt für Phase 2, sobald geklärt ist, wie Impact das vertraglich handhaben will.

### 3. Stripe Webhook lokal testen

Stripe CLI installieren (falls noch nicht vorhanden): https://docs.stripe.com/stripe-cli

```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe-webhook
```

Das gibt dir ein `whsec_...` Secret aus — das kommt in `STRIPE_WEBHOOK_SECRET`.
**Dieses Terminal-Fenster muss während der Demo offen/laufend bleiben.**

### 4. Resend (E-Mail-Versand)

1. Auf [resend.com](https://resend.com) kostenlosen Account anlegen
2. API Key erstellen → in `RESEND_API_KEY` eintragen
3. Für die Demo reicht der Standard-Absender `onboarding@resend.dev`. Für den echten Betrieb später
   muss eine eigene Domain (z. B. `impact-fightacademy.de`) bei Resend verifiziert werden.

### 5. Environment-Datei

```bash
cp .env.example .env.local
# jetzt alle Werte aus Schritt 1–4 eintragen
```

### 6. Starten

```bash
npm install
npm run dev
```

→ `http://localhost:3000` — das Anmeldeformular
→ `http://localhost:3000/qr-code` — druckbarer QR-Code für die Demo (zeigt auf die Startseite)

## Testzahlung durchführen

Bei Stripe im Testmodus: Kartennummer `4242 4242 4242 4242`, beliebiges zukünftiges
Ablaufdatum, beliebiger CVC. Für eine simulierte fehlgeschlagene Zahlung:
`4000 0000 0000 0002`.

## Für die Live-Präsentation

- QR-Code-Seite (`/qr-code`) auf einem Tablet/Handy zeigen oder ausdrucken (Button "Zum Ausdrucken")
- Mit einem zweiten Handy den Code scannen → kompletten Flow einmal live durchklicken
- Supabase Table Editor offen haben, um zu zeigen, wie der Eintrag in Echtzeit erscheint und sich
  der Status nach Zahlung von `pending_payment` zu `active` ändert
- Terminal mit `stripe listen` sichtbar lassen, um zu zeigen, dass der Webhook tatsächlich ankommt

## Was für den produktiven Einsatz noch fehlt

- Eigene Domain für E-Mail-Versand (Resend-Domain-Verifizierung)
- Deployment (z. B. Vercel) statt localhost, damit der QR-Code auch außerhalb deines Rechners funktioniert
- Rechtliche Texte: AGB, Widerrufsbelehrung, Datenschutzerklärung im Checkout-Flow (kommt laut
  Absprache von Impact / einem Anwalt, ist bewusst nicht Teil dieses technischen Setups)
- Erinnerungs-/Follow-up-Mails rund ums Probetraining (separater Baustein, noch nicht enthalten)
- Mindestlaufzeit-Durchsetzung und Kündigungs-Workflow (Phase 2)
