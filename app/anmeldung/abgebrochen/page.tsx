import Link from "next/link";

export default function CanceledPage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent)] mb-4">
        Zahlung abgebrochen
      </p>
      <h1 className="font-display text-4xl sm:text-5xl tracking-wide mb-6">
        Kein Problem
      </h1>
      <p className="text-[var(--paper)]/60 text-sm max-w-md leading-relaxed mb-8">
        Deine Anmeldung wurde noch nicht abgeschlossen. Du kannst es jederzeit
        erneut versuchen.
      </p>
      <Link
        href="/"
        className="inline-block bg-[var(--accent)] hover:bg-[var(--accent-dim)] text-[var(--paper)] font-display text-lg tracking-wide px-8 py-3 transition-colors"
      >
        Zurück zur Anmeldung
      </Link>
    </main>
  );
}
