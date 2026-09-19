/**
 * CartDrawer — drawer lateral con scroll-lock y ESC para cerrar.
 *
 * Lista items del cart store, permite +/-/eliminar. Pie con total
 * formateado y CTA WhatsApp que arma el link con el pedido completo.
 *
 * Sin pasarela real: el botón arma wa.me/<número>?text=<pedido>.
 */

import { useEffect } from "preact/hooks";
import {
  items,
  subtotal,
  remove,
  setQty,
  clear,
  whatsappCartLink,
  formatARS,
  count,
  type CartItem,
} from "../lib/cart";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: Props) {
  // Scroll-lock + ESC
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;
  const list = items.value;
  const total = subtotal.value;
  const totalQty = count.value;
  const wa = list.length > 0 ? whatsappCartLink() : null;

  return (
    <div
      class="fixed inset-0 z-50 flex"
      role="dialog"
      aria-modal="true"
      aria-label="Carrito"
    >
      <button
        type="button"
        aria-label="Cerrar carrito"
        onClick={onClose}
        class="flex-1 cursor-default bg-[var(--color-navy-deep)]/60 fade-in"
      />
      <aside class="flex h-full w-full max-w-[420px] flex-col border-l border-[var(--color-navy)] bg-[var(--color-cream)] text-[var(--color-navy)] shadow-[var(--shadow-ticket)]">
        <header class="flex items-center justify-between border-b border-[var(--color-navy)] px-5 py-4">
          <div>
            <p class="mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-mustard-deep)]">
              Carrito · {totalQty} {totalQty === 1 ? "ítem" : "ítems"}
            </p>
            <h2 class="font-display text-2xl font-bold tracking-tight">
              Tu pedido
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            class="mono inline-flex h-9 w-9 items-center justify-center border border-[var(--color-navy)] text-[var(--color-navy)] transition-colors hover:bg-[var(--color-navy)] hover:text-[var(--color-cream)]"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" aria-hidden="true">
              <path d="M6 6 L18 18 M18 6 L6 18" />
            </svg>
          </button>
        </header>

        <div class="flex-1 overflow-y-auto">
          {list.length === 0 ? (
            <div class="flex h-full flex-col items-center justify-center gap-3 px-6 py-16 text-center">
              <p class="mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-navy-muted)]">
                Vacío
              </p>
              <p class="font-display text-xl text-[var(--color-navy)]">
                Todavía no agregaste nada al carrito.
              </p>
              <p class="text-sm leading-relaxed text-[var(--color-navy-muted)]">
                Agregá productos desde el catálogo y armamos el pedido por
                WhatsApp.
              </p>
              <a
                href="/productos"
                onClick={onClose}
                class="mono mt-2 inline-flex items-center gap-2 border border-[var(--color-navy)] bg-[var(--color-navy)] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-cream)] transition-colors hover:bg-[var(--color-mustard)] hover:text-[var(--color-navy)]"
              >
                Ir al catálogo →
              </a>
            </div>
          ) : (
            <ul class="divide-y divide-[var(--color-line)]">
              {list.map((it) => (
                <CartLine key={it.slug} item={it} />
              ))}
            </ul>
          )}
        </div>

        {list.length > 0 && (
          <footer class="border-t border-[var(--color-navy)] bg-[var(--color-cream-soft)] px-5 py-5">
            <dl class="mb-4 space-y-1">
              <div class="flex items-baseline justify-between">
                <dt class="mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-navy-muted)]">
                  Subtotal estimado
                </dt>
                <dd class="mono text-2xl font-bold tracking-tight text-[var(--color-navy)]">
                  {formatARS(total)}
                </dd>
              </div>
              <p class="mono text-[10px] leading-relaxed text-[var(--color-navy-muted)]">
                * El precio final se confirma por WhatsApp antes de retirar.
              </p>
            </dl>
            <div class="flex flex-col gap-2">
              {wa && (
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener"
                  class="mono inline-flex items-center justify-center gap-2 bg-[var(--color-mustard)] px-4 py-3 text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--color-navy)] transition-colors hover:bg-[var(--color-mustard-deep)]"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                    <path d="M20.52 3.48A11.94 11.94 0 0 0 12.04 0C5.46 0 .12 5.34.12 11.92c0 2.1.55 4.16 1.6 5.96L0 24l6.28-1.64a11.92 11.92 0 0 0 5.76 1.47h.01c6.58 0 11.92-5.34 11.92-11.92 0-3.18-1.24-6.18-3.45-8.43zM12.04 21.8h-.01a9.9 9.9 0 0 1-5.05-1.39l-.36-.21-3.73.97 1-3.64-.24-.37a9.88 9.88 0 0 1-1.51-5.24c0-5.46 4.45-9.91 9.91-9.91 2.65 0 5.14 1.03 7.01 2.9a9.86 9.86 0 0 1 2.9 7.01c0 5.46-4.45 9.91-9.91 9.91z" />
                  </svg>
                  Enviar pedido por WhatsApp
                </a>
              )}
              <button
                type="button"
                onClick={() => clear()}
                class="mono inline-flex items-center justify-center gap-2 border border-[var(--color-navy)] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-navy)] transition-colors hover:bg-[var(--color-navy)] hover:text-[var(--color-cream)]"
              >
                Vaciar carrito
              </button>
            </div>
          </footer>
        )}
      </aside>
    </div>
  );
}

function CartLine({ item }: { item: CartItem }) {
  const lineTotal = item.price * item.qty;
  return (
    <li class="flex gap-3 px-5 py-4">
      <a
        href={`/productos/${item.slug}`}
        class="block h-20 w-20 shrink-0 overflow-hidden border border-[var(--color-line)] bg-[var(--color-cream-deep)]"
      >
        <img
          src={item.image}
          alt=""
          width="80"
          height="80"
          loading="lazy"
          class="h-full w-full object-cover"
        />
      </a>
      <div class="min-w-0 flex-1">
        <a
          href={`/productos/${item.slug}`}
          class="block truncate font-display text-base font-semibold leading-tight text-[var(--color-navy)] hover:text-[var(--color-mustard-deep)]"
        >
          {item.name}
        </a>
        <p class="mono mt-1 text-[10px] uppercase tracking-[0.16em] text-[var(--color-navy-muted)]">
          {item.category} · SKU {item.sku}
        </p>
        <div class="mt-2 flex items-center justify-between gap-2">
          <div class="flex items-center border border-[var(--color-navy)]">
            <button
              type="button"
              onClick={() => setQty(item.slug, item.qty - 1)}
              aria-label="Restar"
              class="mono inline-flex h-7 w-7 items-center justify-center text-[var(--color-navy)] transition-colors hover:bg-[var(--color-navy)] hover:text-[var(--color-cream)]"
            >
              −
            </button>
            <span class="mono inline-flex h-7 w-8 items-center justify-center border-x border-[var(--color-navy)] text-[11px] tabular-nums">
              {item.qty}
            </span>
            <button
              type="button"
              onClick={() => setQty(item.slug, item.qty + 1)}
              aria-label="Sumar"
              class="mono inline-flex h-7 w-7 items-center justify-center text-[var(--color-navy)] transition-colors hover:bg-[var(--color-navy)] hover:text-[var(--color-cream)]"
            >
              +
            </button>
          </div>
          <div class="text-right">
            <p class="mono text-sm font-bold tabular-nums text-[var(--color-navy)]">
              {formatARS(lineTotal)}
            </p>
            <button
              type="button"
              onClick={() => remove(item.slug)}
              class="mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-navy-muted)] hover:text-[var(--color-mark)]"
            >
              Quitar
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}