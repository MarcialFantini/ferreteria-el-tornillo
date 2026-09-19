/**
 * FavoriteChip — chip con contador de favoritos en el header.
 *
 * Suscrito al signal `favorites` para que cualquier toggle en
 * cualquier isla (catálogo, detalle) actualice el contador sin
 * recargar. Link directo a /favoritos.
 */

import { useEffect, useState } from "preact/hooks";
import { favorites } from "../lib/cart";

export default function FavoriteChip() {
  const [count, setCount] = useState(favorites.value.length);

  useEffect(() => {
    const unsub = favorites.subscribe((next) => setCount(next.length));
    return () => unsub();
  }, []);

  return (
    <a
      href="/favoritos"
      aria-label={`Favoritos (${count} ${count === 1 ? "producto" : "productos"})`}
      class={`relative z-10 inline-flex h-10 items-center gap-2 border border-[var(--color-navy)] bg-[var(--color-cream)] px-3 mono text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-navy)] transition-colors hover:bg-[var(--color-navy)] hover:text-[var(--color-cream)] ${
        count === 0 ? "" : "fav-pulse"
      }`}
    >
      <svg viewBox="0 0 24 24" width="14" height="14" fill={count > 0 ? "currentColor" : "none"} stroke="currentColor" stroke-width="2.2" stroke-linecap="square" aria-hidden="true">
        <path d="M12 21s-7-4.5-9.5-9C0.5 8 3 4 6.5 4c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3 3.5 0 6 4 4 8-2.5 4.5-9.5 9-9.5 9z" />
      </svg>
      <span class="hidden md:inline">Favoritos</span>
      <span
        aria-hidden="true"
        class={`mono inline-flex h-5 min-w-[20px] items-center justify-center border border-current px-1.5 text-[10px] tabular-nums ${
          count > 0 ? "" : "opacity-50"
        }`}
      >
        {count}
      </span>
    </a>
  );
}