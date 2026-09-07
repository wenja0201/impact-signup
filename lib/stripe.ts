import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (stripeInstance) return stripeInstance;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY fehlt in .env.local");
  }

  stripeInstance = new Stripe(key, {
    apiVersion: "2026-06-24.dahlia",
  });

  return stripeInstance;
}

// Preis-Mapping: Laufzeit -> Stripe Price ID
// Diese Price IDs müssen einmalig im Stripe Dashboard angelegt werden
// (Product "Impact Mitgliedschaft" mit mehreren wiederkehrenden Preisen).
// Siehe README für Schritt-für-Schritt-Anleitung.
export const PLAN_TO_STRIPE_PRICE: Record<string, string | undefined> = {
  "1_monat": process.env.STRIPE_PRICE_1_MONAT,
  "6_monate": process.env.STRIPE_PRICE_6_MONATE,
  "12_monate": process.env.STRIPE_PRICE_12_MONATE,
  "24_monate": process.env.STRIPE_PRICE_24_MONATE,
};

export const PLAN_LABELS: Record<string, string> = {
  "1_monat": "Monatlich (kein Rabatt)",
  "6_monate": "6-Monats-Laufzeit",
  "12_monate": "12-Monats-Laufzeit",
  "24_monate": "24-Monats-Laufzeit",
};
