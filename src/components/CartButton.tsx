/**
 * CartButton — island Preact en el Header.
 *
 * Muestra contador del carrito y abre el CartDrawer. Diseño editorial:
 * botón-pastilla con borde fino navy, contador tabular mono, pulse sutil
 * al cambiar el número. client:load para que esté vivo en SSR.
 */

import { useState } from "preact/hooks";
import { count } from "../lib/cart";
import CartDrawer from "./CartDrawer";

export default function CartButton() {
  const [open, setOpen] = useState(false);
  const c = count.value;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Carrito (${c} ${c === 1 ? "producto" : "productos"})`}
        class="relative z-10 inline-flex h-10 items-center gap-2 border border-[var(--color-navy)] bg-[var(--color-cream)] px-3 mono text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-navy)] transition-colors hover:bg-[var(--color-navy)] hover:text-[var(--color-cream)]"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" aria-hidden="true">
          <path d="M3 4h3l2.6 11.4a2 2 0 0 0 2 1.6h7.4a2 2 0 0 0 1.95-1.55L21 8H6" />
          <circle cx="10" cy="20" r="1.4" fill="currentColor" />
          <circle cx="17" cy="20" r="1.4" fill="currentColor" />
        </svg>
        <span class="hidden md:inline">Carrito</span>
        <span
          aria-hidden="true"
          class="mono inline-flex h-5 min-w-[20px] items-center justify-center border border-current px-1.5 text-[10px] tabular-nums"
        >
          {c}
        </span>
      </button>

      <CartDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}