"use client";

import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";

export default function QRCodePage() {
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(window.location.origin);
  }, []);

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center print:bg-white print:text-black">
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent)] mb-4 print:text-black">
        Impact Fight Academy
      </p>
      <h1 className="font-display text-4xl sm:text-5xl tracking-wide mb-8">
        Jetzt anmelden
      </h1>

      <div className="bg-white p-6 rounded">
        {url && <QRCodeSVG value={url} size={280} />}
      </div>

      <p className="mt-8 text-[var(--paper)]/60 text-sm max-w-xs print:text-black">
        QR-Code scannen und in wenigen Minuten Mitglied werden.
      </p>

      <button
        onClick={() => window.print()}
        className="mt-10 border border-[var(--line)] hover:border-[var(--paper)]/40 text-[var(--paper)] text-sm px-6 py-3 transition-colors print:hidden"
      >
        Zum Ausdrucken
      </button>
    </main>
  );
}
