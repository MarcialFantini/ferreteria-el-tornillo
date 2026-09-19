/**
 * ProductActions — botones Add to Cart + Compare/Favorite.
 *
 * Se renderiza como <ProductActions client:load product={...} /> dentro
 * del ProductCard. Usa el cart store global (signals cross-isla).
 *
 * El botón "Añadir al carrito" muestra un toast al confirmarse.
 */

import { useState } from "preact/hooks";
import { add, isInCart } from "../lib/cart";
import CompareButton from "./CompareButton";
import Toast from "./Toast";

interface Props {
  product: {
    slug: string;
    name: string;
    sku: string;
    category: string;
    price: number;
    image: string;
  };
  variant?: "row" | "compact";
}

export default function ProductActions({ product, variant = "row" }: Props) {
  const [toast, setToast] = useState<string | null>(null);
  const inCart = isInCart(product.slug);

  function onAdd(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    add(product, 1);
    setToast(`Agregado · ${product.name.split(" ")[0]}`);
  }

  if (variant === "compact") {
    return (
      <div class="flex items-center gap-1">
        <button
          type="button"
          onClick={onAdd}
          aria-label="Añadir al carrito"
          class={`mono inline-flex h-9 w-9 items-center justify-center border transition-colors ${
            inCart
              ? "border-[var(--color-mustard)] bg-[var(--color-mustard)] text-[var(--color-navy)]"
              : "border-[var(--color-navy)] bg-[var(--color-cream)] text-[var(--color-navy)] hover:bg-[var(--color-navy)] hover:text-[var(--color-cream)]"
          }`}
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="square" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
        <CompareButton slug={product.slug} variant="icon" />
        {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
      </div>
    );
  }

  return (
    <div class="flex items-center gap-2">
      <button
        type="button"
        onClick={onAdd}
        class={`mono flex-1 inline-flex items-center justify-center gap-2 border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] transition-colors ${
          inCart
            ? "border-[var(--color-mustard)] bg-[var(--color-mustard)] text-[var(--color-navy)]"
            : "border-[var(--color-navy)] bg-[var(--color-navy)] text-[var(--color-cream)] hover:bg-[var(--color-mustard)] hover:text-[var(--color-navy)]"
        }`}
      >
        {inCart ? "En carrito" : "Añadir"}
      </button>
      <CompareButton slug={product.slug} variant="icon" />
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}