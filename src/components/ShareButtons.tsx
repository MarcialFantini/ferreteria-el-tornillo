/**
 * ShareButtons — share por WhatsApp + copiar link.
 *
 * Botones accesibles que construyen el link de share on-the-fly.
 * client:load → usa navigator.share cuando esté disponible, fallback a copy.
 */

import { useState } from "preact/hooks";

interface Props {
  url: string;
  title: string;
  whatsappMessage?: string;
}

export default function ShareButtons({ url, title, whatsappMessage }: Props) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const message = whatsappMessage ?? `Mirá "${title}" en el catálogo de El Tornillo: ${url}`;
  const waHref = `https://wa.me/?text=${encodeURIComponent(message)}`;
  const twitterHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodedUrl}`;

  async function onCopy(e: Event) {
    e.preventDefault();
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback para navegadores antiguos.
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.setAttribute("readonly", "");
        ta.style.position = "absolute";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      window.setTimeout(() => setCopied((c) => (c ? false : c)), 1800);
    } catch {
      // ignore
    }
  }

  return (
    <div class="flex flex-wrap items-center gap-2" role="group" aria-label="Compartir producto">
      <span class="mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-navy-muted)]">
        Compartir
      </span>

      <a
        href={waHref}
        target="_blank"
        rel="noopener"
        aria-label="Compartir por WhatsApp"
        class="mono inline-flex h-9 items-center gap-1.5 border border-[var(--color-navy)] bg-[var(--color-cream)] px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-navy)] transition-colors hover:bg-[var(--color-navy)] hover:text-[var(--color-cream)]"
      >
        <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true">
          <path d="M20.52 3.48A11.94 11.94 0 0 0 12.04 0C5.46 0 .12 5.34.12 11.92c0 2.1.55 4.16 1.6 5.96L0 24l6.28-1.64a11.92 11.92 0 0 0 5.76 1.47h.01c6.58 0 11.92-5.34 11.92-11.92 0-3.18-1.24-6.18-3.45-8.43zM12.04 21.8h-.01a9.9 9.9 0 0 1-5.05-1.39l-.36-.21-3.73.97 1-3.64-.24-.37a9.88 9.88 0 0 1-1.51-5.24c0-5.46 4.45-4.45 9.91-9.91 2.65 0 5.14 1.03 7.01 2.9a9.86 9.86 0 0 1 2.9 7.01c0 5.46-4.45 9.91-9.91 9.91z" />
        </svg>
        WhatsApp
      </a>

      <button
        type="button"
        onClick={onCopy}
        aria-label={copied ? "Link copiado" : "Copiar link"}
        class={`mono inline-flex h-9 items-center gap-1.5 border px-3 text-[10px] font-bold uppercase tracking-[0.14em] transition-colors ${
          copied
            ? "border-[var(--color-sage)] bg-[var(--color-sage)] text-[var(--color-cream)]"
            : "border-[var(--color-navy)] bg-[var(--color-cream)] text-[var(--color-navy)] hover:bg-[var(--color-navy)] hover:text-[var(--color-cream)]"
        }`}
      >
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square" aria-hidden="true">
          {copied ? (
            <path d="M5 12 L10 17 L19 7" />
          ) : (
            <>
              <rect x="8" y="8" width="12" height="12" />
              <path d="M16 8 V6 a2 2 0 0 0 -2 -2 H6 a2 2 0 0 0 -2 2 v8 a2 2 0 0 0 2 2 h2" />
            </>
          )}
        </svg>
        {copied ? "Copiado" : "Copiar link"}
      </button>

      <a
        href={twitterHref}
        target="_blank"
        rel="noopener"
        aria-label="Compartir en Twitter"
        class="mono inline-flex h-9 items-center gap-1.5 border border-[var(--color-navy)] bg-[var(--color-cream)] px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-navy)] transition-colors hover:bg-[var(--color-navy)] hover:text-[var(--color-cream)]"
      >
        <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true">
          <path d="M22 5.8c-.7.3-1.5.6-2.4.7.9-.5 1.5-1.3 1.8-2.3-.8.5-1.7.8-2.6 1-.8-.8-1.9-1.4-3.2-1.4-2.4 0-4.4 2-4.4 4.4 0 .3 0 .7.1 1C7.7 8.9 4.6 7 2.6 4.2c-.4.7-.6 1.5-.6 2.4 0 1.5.8 2.9 2 3.7-.7 0-1.4-.2-2-.5v.1c0 2.1 1.5 3.9 3.5 4.3-.4.1-.8.2-1.2.2-.3 0-.6 0-.9-.1.6 1.7 2.2 3 4.1 3-1.5 1.2-3.4 1.9-5.5 1.9H1c2 1.3 4.4 2.1 6.9 2.1 8.3 0 12.9-6.9 12.9-12.9v-.6c.9-.7 1.7-1.5 2.2-2.4z" />
        </svg>
        Twitter
      </a>
    </div>
  );
}