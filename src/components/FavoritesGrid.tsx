/**
 * FavoritesGrid — isla Preact para /favoritos.
 *
 * Lee del signal `favorites` (persiste en localStorage vía cart.ts)
 * y resuelve cada slug contra el set completo de productos que pasa
 * el padre Astro. Permite remover individualmente.
 *
 * Estado vacío: copy editorial con CTA al catálogo.
 */

import { useEffect, useState } from "preact/hooks";
import { favorites, toggleFavorite } from "../lib/cart";
import { formatPrice } from "../lib/format";
import { whatsappLink, productMessage } from "../lib/whatsapp";

export interface FavoriteProduct {
  slug: string;
  name: string;
  category: string;
  price: number;
  comparePrice?: number;
  stock: number;
  sku: string;
  image: string;
  imageAlt: string;
}

interface Props {
  products: FavoriteProduct[];
}

export default function FavoritesGrid({ products }: Props) {
  const [slugs, setSlugs] = useState<string[]>(() => favorites.value.slice());

  useEffect(() => {
    const unsub = favorites.subscribe((next) => setSlugs(next.slice()));
    return () => unsub();
  }, []);

  const list = slugs
    .map((slug) => products.find((p) => p.slug === slug))
    .filter((p): p is FavoriteProduct => Boolean(p));

  if (list.length === 0) {
    return <EmptyState />;
  }

  return (
    <div>
      <div class="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-navy)] pb-3">
        <p class="font-display text-lg text-[var(--color-navy)]">
          <strong class="tabular-nums">{list.length}</strong>{" "}
          {list.length === 1 ? "producto guardado" : "productos guardados"}
        </p>
        <a
          href="/productos"
          class="mono border border-[var(--color-navy)] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-navy)] transition-colors hover:bg-[var(--color-navy)] hover:text-[var(--color-cream)]"
        >
          Seguir explorando →
        </a>
      </div>

      <ul class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => {
          const discount =
            p.comparePrice && p.comparePrice > p.price
              ? Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100)
              : 0;
          return (
            <li
              key={p.slug}
              class="crosshair has-bottom-crosshairs relative flex h-full flex-col border border-[var(--color-navy)] bg-[var(--color-cream)] transition-all duration-300 card-hover"
            >
              <span class="ch-bl" aria-hidden="true" />
              <span class="ch-br" aria-hidden="true" />

              <button
                type="button"
                onClick={() => toggleFavorite(p.slug)}
                aria-label={`Quitar ${p.name} de favoritos`}
                class="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center border border-[var(--color-mark)] bg-[var(--color-mark)] text-[var(--color-cream)] transition-colors hover:bg-transparent hover:text-[var(--color-mark)]"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" stroke="currentColor" stroke-width="2.2" stroke-linecap="square" aria-hidden="true">
                  <path d="M12 21s-7-4.5-9.5-9C0.5 8 3 4 6.5 4c2 0 3.5 1 3.5 3 2-2 1.5-3 3.5-3 3.5 0 6 4 4 8-2.5 4.5-9.5 9-9.5 9z" />
                </svg>
              </button>

              <a href={`/productos/${p.slug}`} class="block aspect-square overflow-hidden bg-[var(--color-cream-deep)]">
                <img
                  src={p.image}
                  alt={p.imageAlt}
                  loading="lazy"
                  decoding="async"
                  width="800"
                  height="800"
                  class="h-full w-full object-cover"
                />
              </a>

              <div class="flex flex-1 flex-col gap-3 p-4">
                <div class="flex items-baseline justify-between gap-3 border-b border-[var(--color-line)] pb-2">
                  <p class="mono truncate text-[10px] uppercase tracking-[0.18em] text-[var(--color-navy-muted)]">
                    {p.category}
                  </p>
                  <p class="mono shrink-0 text-[10px] tracking-[0.16em] text-[var(--color-navy-muted)]">
                    SKU · {p.sku}
                  </p>
                </div>

                <h3 class="font-display text-[17px] font-semibold leading-snug tracking-tight text-[var(--color-navy)]">
                  <a href={`/productos/${p.slug}`} class="swipe-underline">
                    {p.name}
                  </a>
                </h3>

                <div class="mt-auto flex items-end justify-between gap-3 pt-3">
                  <div>
                    <p class="mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-navy-muted)]">
                      Precio
                    </p>
                    <div class="flex items-baseline gap-2">
                      <p class="mono text-2xl font-bold tracking-tight text-[var(--color-navy)] tabular-nums">
                        {formatPrice(p.price)}
                      </p>
                      {discount > 0 && (
                        <p class="mono text-[11px] text-[var(--color-navy-muted)] line-through tabular-nums">
                          {formatPrice(p.comparePrice!)}
                        </p>
                      )}
                    </div>
                    {p.stock <= 0 ? (
                      <p class="mono mt-1 text-[10px] uppercase tracking-[0.16em] text-[var(--color-mark)]">
                        Sin stock
                      </p>
                    ) : p.stock < 10 ? (
                      <p class="mono mt-1 text-[10px] uppercase tracking-[0.16em] text-[var(--color-mustard-deep)]">
                        Últimas {p.stock}
                      </p>
                    ) : (
                      <p class="mono mt-1 text-[10px] uppercase tracking-[0.16em] text-[var(--color-sage)]">
                        En stock
                      </p>
                    )}
                  </div>
                  <a
                    href={whatsappLink(productMessage(p))}
                    target="_blank"
                    rel="noopener"
                    class="mono inline-flex items-center gap-1 border border-[var(--color-navy)] bg-[var(--color-navy)] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-cream)] transition-colors hover:bg-[var(--color-mustard)] hover:text-[var(--color-navy)]"
                  >
                    Consultar →
                  </a>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function EmptyState() {
  return (
    <div class="crosshair has-bottom-crosshairs relative border border-dashed border-[var(--color-navy-muted)] bg-[var(--color-cream-deep)] p-10 text-center">
      <span class="ch-bl" aria-hidden="true" />
      <span class="ch-br" aria-hidden="true" />
      <p class="mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-navy-muted)]">
        Lista vacía
      </p>
      <h2 class="mt-3 font-display text-3xl leading-tight text-[var(--color-navy)]">
        No tenés favoritos todavía.
      </h2>
      <p class="mx-auto mt-3 max-w-xl text-[14px] leading-relaxed text-[var(--color-navy-muted)]">
        Explorá el catálogo y tocá el corazón en los productos que te
        interesen. Quedan guardados en este dispositivo para que vuelvas
        cuando quieras.
      </p>
      <div class="mt-6">
        <a
          href="/productos"
          class="mono inline-flex items-center gap-2 bg-[var(--color-mustard)] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-navy)] transition-colors hover:bg-[var(--color-mustard-deep)]"
        >
          Explorar catálogo →
        </a>
      </div>
    </div>
  );
}
