"use client";

import { useState } from "react";

const DISCIPLINES = [
  "Boxen",
  "Kickboxen",
  "BJJ",
  "Muay Thai",
  "MMA",
  "Kindertraining",
] as const;

const LEVELS = ["Anfänger", "Fortgeschritten", "Profi"] as const;

const PLANS = [
  { id: "1_monat", label: "1 Monat", price: "€225 / Monat", note: "flexibel, jederzeit kündbar" },
  { id: "6_monate", label: "6 Monate", price: "€175 / Monat", note: "beliebtester Tarif" },
  { id: "12_monate", label: "12 Monate", price: "€150 / Monat", note: "bester Preis pro Monat" },
  { id: "24_monate", label: "24 Monate", price: "€125 / Monat", note: "maximale Ersparnis" },
] as const;

type Status = "idle" | "submitting" | "error";

export default function SignupForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>("6_monate");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg(null);

    const form = e.currentTarget;
    const fd = new FormData(form);

    const payload = {
      firstName: fd.get("firstName"),
      lastName: fd.get("lastName"),
      email: fd.get("email"),
      phone: fd.get("phone"),
      discipline: fd.get("discipline"),
      experienceLevel: fd.get("experienceLevel"),
      plan: selectedPlan,
    };

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Etwas ist schiefgelaufen. Bitte versuch es erneut.");
        setStatus("error");
        return;
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch {
      setErrorMsg("Verbindung fehlgeschlagen. Bitte versuch es erneut.");
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {/* Persönliche Daten */}
      <fieldset className="space-y-4">
        <legend className="font-display text-2xl tracking-wide text-[var(--paper)] mb-2">
          Deine Daten
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Vorname" name="firstName" required />
          <Field label="Nachname" name="lastName" required />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="E-Mail" name="email" type="email" required />
          <Field label="Telefon (optional)" name="phone" type="tel" />
        </div>
      </fieldset>

      {/* Kampfsport-Kontext */}
      <fieldset className="space-y-4">
        <legend className="font-display text-2xl tracking-wide text-[var(--paper)] mb-2">
          Dein Training
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField label="Disziplin" name="discipline" options={DISCIPLINES} required />
          <SelectField label="Erfahrung" name="experienceLevel" options={LEVELS} required />
        </div>
      </fieldset>

      {/* Laufzeit-Auswahl */}
      <fieldset className="space-y-4">
        <legend className="font-display text-2xl tracking-wide text-[var(--paper)] mb-2">
          Mitgliedschaft wählen
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PLANS.map((plan) => (
            <button
              type="button"
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`text-left rounded-none border px-5 py-4 transition-colors ${
                selectedPlan === plan.id
                  ? "border-[var(--accent)] bg-[var(--accent)]/10"
                  : "border-[var(--line)] hover:border-[var(--paper)]/40"
              }`}
            >
              <div className="flex items-baseline justify-between">
                <span className="font-display text-xl tracking-wide">{plan.label}</span>
                <span className="text-sm text-[var(--paper)]/70">{plan.price}</span>
              </div>
              <p className="text-xs text-[var(--paper)]/50 mt-1">{plan.note}</p>
            </button>
          ))}
        </div>
      </fieldset>

      {errorMsg && (
        <p className="text-sm text-[var(--accent)]" role="alert">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full bg-[var(--accent)] hover:bg-[var(--accent-dim)] disabled:opacity-60 text-[var(--paper)] font-display text-xl tracking-wide py-4 transition-colors"
      >
        {status === "submitting" ? "Weiter zur Zahlung …" : "Weiter zur Zahlung"}
      </button>

      <p className="text-xs text-[var(--paper)]/40 text-center">
        Du wirst zu unserem sicheren Zahlungsanbieter weitergeleitet. Die Mitgliedschaft
        verlängert sich automatisch entsprechend der gewählten Laufzeit.
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wider text-[var(--paper)]/60 mb-1.5">
        {label}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full bg-transparent border border-[var(--line)] focus:border-[var(--accent)] outline-none px-4 py-3 text-[var(--paper)] placeholder:text-[var(--paper)]/30 transition-colors"
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  options,
  required = false,
}: {
  label: string;
  name: string;
  options: readonly string[];
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wider text-[var(--paper)]/60 mb-1.5">
        {label}
      </span>
      <select
        name={name}
        required={required}
        defaultValue=""
        className="w-full bg-[var(--ink)] border border-[var(--line)] focus:border-[var(--accent)] outline-none px-4 py-3 text-[var(--paper)] transition-colors"
      >
        <option value="" disabled>
          Bitte wählen
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}
