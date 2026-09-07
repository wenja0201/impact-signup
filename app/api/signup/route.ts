import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getStripe, PLAN_TO_STRIPE_PRICE } from "@/lib/stripe";
import { sendSignupConfirmation, sendInternalNewSignupAlert } from "@/lib/email";
import { signupSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Ungültige Eingabe", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const supabase = getSupabaseAdmin();

  // 1. Member-Datensatz anlegen (Status: pending_payment bis Stripe bestätigt)
  const { data: member, error: insertError } = await supabase
    .from("members")
    .insert({
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      phone: data.phone || null,
      discipline: data.discipline,
      experience_level: data.experienceLevel,
      plan: data.plan,
      status: "pending_payment",
    })
    .select()
    .single();

  if (insertError || !member) {
    console.error("Supabase insert error:", insertError);
    return NextResponse.json(
      { error: "Anmeldung konnte nicht gespeichert werden" },
      { status: 500 }
    );
  }

  // 2. Stripe Checkout Session erstellen (Subscription-Modus für wiederkehrende Zahlung)
  const priceId = PLAN_TO_STRIPE_PRICE[data.plan];
  if (!priceId) {
    return NextResponse.json(
      { error: `Kein Stripe-Preis für Plan "${data.plan}" konfiguriert` },
      { status: 500 }
    );
  }

  const stripe = getStripe();
  const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_BASE_URL;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: data.email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/anmeldung/erfolg?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/anmeldung/abgebrochen`,
    // member.id im Stripe-Metadata mitgeben, damit der Webhook den Datensatz wiederfindet
    metadata: { member_id: member.id },
    subscription_data: {
      metadata: { member_id: member.id },
    },
  });

  // 3. Bestätigungsmail an den Interessenten (unabhängig vom Zahlungsausgang)
  await sendSignupConfirmation(data.email, data.firstName);

  // 4. Interne Benachrichtigung ans Team
  const internalTo = process.env.INTERNAL_NOTIFY_EMAIL;
  if (internalTo) {
    await sendInternalNewSignupAlert(
      internalTo,
      `${data.firstName} ${data.lastName}`,
      data.discipline
    );
  }

  return NextResponse.json({ checkoutUrl: session.url });
}
