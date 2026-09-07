import SignupForm from "@/components/SignupForm";

export default function SignupPage() {
  return (
    <main className="flex-1 flex flex-col">
      <div className="mx-auto w-full max-w-xl px-6 py-14 sm:py-20">
        <header className="mb-12">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent)] mb-3">
            Impact Fight Academy · München
          </p>
          <h1 className="font-display text-5xl sm:text-6xl tracking-wide leading-[0.95]">
            Werde
            <br />
            Mitglied
          </h1>
          <p className="mt-4 text-[var(--paper)]/60 text-sm leading-relaxed">
            Boxen, Kickboxen, BJJ, Muay Thai und MMA — seit 2006. Melde dich in
            wenigen Minuten an und starte direkt durch.
          </p>
        </header>

        <SignupForm />
      </div>
    </main>
  );
}
