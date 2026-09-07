import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  sendPaymentConfirmation,
  sendPaymentFailedNotice,
  sendInternalPaymentFailedAlert,
} from "@/lib/email";
import Stripe from "stripe";

// Stripe braucht den rohen Request-Body für die Signaturprüfung —
// Next.js' automatisches Body-Parsing muss dafür deaktiviert sein.
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET fehlt in .env.local");
    return NextResponse.json({ error: "Server-Konfigurationsfehler" }, { status: 500 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    if (!signature) throw new Error("Keine stripe-signature Header vorhanden");
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook-Signaturprüfung fehlgeschlagen:", err);
    return NextResponse.json({ error: "Ungültige Signatur" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Idempotenz: Stripe kann dasselbe Event mehrfach senden.
  // stripe_event_id hat einen unique constraint — zweiter Versuch schlägt fehl, wir ignorieren das dann bewusst.
  const { error: dedupeError } = await supabase
    .from("payment_events")
    .insert({
      stripe_event_id: event.id,
      event_type: event.type,
      raw_payload: event as unknown as Record<string, unknown>,
    });

  if (dedupeError) {
    if (dedupeError.code === "23505") {
      // unique_violation -> Event wurde bereits verarbeitet, sauber abbrechen
      return NextResponse.json({ received: true, duplicate: true });
    }
    console.error("Fehler beim Loggen des Events:", dedupeError);
    // Trotzdem weitermachen — Logging-Fehler soll die Kernlogik nicht blockieren
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const memberId = session.metadata?.member_id;
      if (!memberId) break;

      await supabase
        .from("members")
        .update({
          status: "active",
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
        })
        .eq("id", memberId);

      const { data: member } = await supabase
        .from("members")
        .select("email, first_name")
        .eq("id", memberId)
        .single();

      if (member) {
        await sendPaymentConfirmation(member.email, member.first_name);
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId =
        typeof invoice.parent?.subscription_details?.subscription === "string"
          ? invoice.parent.subscription_details.subscription
          : undefined;
      if (!subscriptionId) break;

      const { data: member } = await supabase
        .from("members")
        .select("id, email, first_name, last_name")
        .eq("stripe_subscription_id", subscriptionId)
        .single();

      if (!member) break;

      await supabase
        .from("members")
        .update({ status: "payment_failed" })
        .eq("id", member.id);

      await sendPaymentFailedNotice(member.email, member.first_name);

      const internalTo = process.env.INTERNAL_NOTIFY_EMAIL;
      if (internalTo) {
        await sendInternalPaymentFailedAlert(
          internalTo,
          `${member.first_name} ${member.last_name}`
        );
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await supabase
        .from("members")
        .update({ status: "canceled" })
        .eq("stripe_subscription_id", subscription.id);
      break;
    }

    default:
      // Andere Events bewusst ignorieren
      break;
  }

  return NextResponse.json({ received: true });
}
