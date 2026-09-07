export default function SuccessPage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent)] mb-4">
        Anmeldung erfolgreich
      </p>
      <h1 className="font-display text-4xl sm:text-5xl tracking-wide mb-6">
        Willkommen bei Impact
      </h1>
      <p className="text-[var(--paper)]/60 text-sm max-w-md leading-relaxed">
        Deine Zahlung war erfolgreich und deine Mitgliedschaft ist jetzt aktiv.
        Du bekommst in Kürze eine Bestätigung per E-Mail. Wir freuen uns auf
        dich im Training!
      </p>
    </main>
  );
}
