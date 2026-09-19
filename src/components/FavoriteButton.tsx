/**
 * FavoriteButton — botón de wishlist (corazón).
 *
 * Toggle persistido vía signal store. Estados:
 *   - vacío: outline navy
 *   - activo: relleno rojo industrial con check breve
 *   - feedback "Agregado / Quitado" durante 1.6s
 *
 * variant="icon" para chips compactos en grilla; variant="row" para detalle.
 */

import { useState } from "preact/hooks";
import { favorites, toggleFavorite } from "../lib/cart";

interface Props {
  slug: string;
  variant?: "icon" | "row";
  label?: string;
}

export default function FavoriteButton({ slug, variant = "icon", label }: Props) {
  const [flash, setFlash] = useState<"added" | "removed" | null>(null);
  const isFav = favorites.value.includes(slug);

  function onClick(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    const next = toggleFavorite(slug);
    setFlash(next ? "added" : "removed");
    window.setTimeout(() => {
      setFlash((cur) => (cur === (next ? "added" : "removed") ? null : cur));
    }, 1600);
  }

  const activeLabel =
    flash === "added" ? "Guardado" : flash === "removed" ? "Quitado" : label ?? "Favorito";

  if (variant === "row") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={isFav}
        aria-label={isFav ? "Quitar de favoritos" : "Agregar a favoritos"}
        class={`mono inline-flex items-center gap-2 border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] transition-colors ${
          isFav
            ? "border-[var(--color-mark)] bg-[var(--color-mark)] text-[var(--color-cream)] hover:bg-transparent hover:text-[var(--color-mark)]"
            : "border-[var(--color-navy)] bg-[var(--color-cream)] text-[var(--color-navy)] hover:bg-[var(--color-mark)] hover:text-[var(--color-cream)]"
        }`}
      >
        <svg viewBox="0 0 24 24" width="13" height="13" fill={isFav ? "currentColor" : "none"} stroke="currentColor" stroke-width="2" stroke-linecap="square" aria-hidden="true">
          <path d="M12 21s-7-4.5-9.5-9C0.5 8 3 4 6.5 4c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3 3.5 0 6 4 4 8-2.5 4.5-9.5 9-9.5 9z" />
        </svg>
        {isFav ? "Guardado" : activeLabel}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isFav}
      aria-label={isFav ? "Quitar de favoritos" : "Agregar a favoritos"}
      title={isFav ? "Quitar de favoritos" : "Agregar a favoritos"}
      class={`inline-flex h-9 w-9 items-center justify-center border transition-colors ${
        isFav
          ? "border-[var(--color-mark)] bg-[var(--color-mark)] text-[var(--color-cream)]"
          : "border-[var(--color-navy)] bg-[var(--color-cream)] text-[var(--color-navy)] hover:bg-[var(--color-mark)] hover:text-[var(--color-cream)]"
      }`}
    >
      <svg viewBox="0 0 24 24" width="14" height="14" fill={isFav ? "currentColor" : "none"} stroke="currentColor" stroke-width="2.2" stroke-linecap="square" aria-hidden="true">
        <path d="M12 21s-7-4.5-9.5-9C0.5 8 3 4 6.5 4c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3 3.5 0 6 4 4 8-2.5 4.5-9.5 9-9.5 9z" />
      </svg>
    </button>
  );
}