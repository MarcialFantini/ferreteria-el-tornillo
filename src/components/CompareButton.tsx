/**
 * CompareButton — botón para añadir/quitar un producto del comparador.
 *
 * Estado visual:
 *   - inactivo: outline navy
 *   - ya en lista: relleno navy con "En comparador"
 *   - lleno (3 ítems): disabled con mensaje
 *   - feedback transitorio (1.6s) tras click: Añadido / Quitado / Lleno
 *
 * client:load → persistencia vía signal store.
 */

import { useState } from "preact/hooks";
import { compare, toggleCompare, COMPARE_LIMIT } from "../lib/cart";

interface Props {
  slug: string;
  variant?: "icon" | "full";
}

export default function CompareButton({ slug, variant = "full" }: Props) {
  const [feedback, setFeedback] = useState<"added" | "removed" | "limit" | null>(null);

  const inList = compare.value.includes(slug);
  const full = compare.value.length >= COMPARE_LIMIT && !inList;

  function flash(next: "added" | "removed" | "limit", ms = 1600) {
    setFeedback(next);
    window.setTimeout(() => {
      setFeedback((cur) => (cur === next ? null : cur));
    }, ms);
  }

  function onClick(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    if (full) {
      flash("limit", 1800);
      return;
    }
    const result = toggleCompare(slug);
    if (result === "added") flash("added");
    else if (result === "removed") flash("removed");
  }

  const label =
    feedback === "limit"
      ? "Lleno"
      : feedback === "added"
        ? "Añadido"
        : feedback === "removed"
          ? "Quitado"
          : inList
            ? "En comparador"
            : full
              ? "Comparador lleno"
              : "Comparar";

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={onClick}
        title={inList ? "Quitar del comparador" : full ? "Comparador lleno" : "Añadir al comparador"}
        aria-label={inList ? "Quitar del comparador" : "Añadir al comparador"}
        class={`inline-flex h-9 w-9 items-center justify-center border transition-colors ${
          inList
            ? "border-[var(--color-navy)] bg-[var(--color-navy)] text-[var(--color-cream)]"
            : "border-[var(--color-navy)] bg-[var(--color-cream)] text-[var(--color-navy)] hover:bg-[var(--color-mustard)] hover:text-[var(--color-navy)]"
        } ${full ? "cursor-not-allowed opacity-50" : ""}`}
      >
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" aria-hidden="true">
          <path d="M4 8h6v12H4zM14 4h6v16h-6zM10 12h4M12 10v4" />
        </svg>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={full && !inList}
      aria-label={label}
      class={`mono inline-flex items-center gap-2 border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] transition-colors ${
        inList
          ? "border-[var(--color-navy)] bg-[var(--color-navy)] text-[var(--color-cream)]"
          : full
          ? "cursor-not-allowed border-[var(--color-line)] bg-transparent text-[var(--color-navy-muted)]"
          : "border-[var(--color-navy)] text-[var(--color-navy)] hover:bg-[var(--color-mustard)] hover:text-[var(--color-navy)]"
      }`}
    >
      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" aria-hidden="true">
        <path d="M4 8h6v12H4zM14 4h6v16h-6zM10 12h4M12 10v4" />
      </svg>
      {label}
    </button>
  );
}