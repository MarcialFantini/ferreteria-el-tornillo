/**
 * RecentStrip — tira de productos vistos recientemente.
 *
 * Lee del signal `recent` (localStorage) y muestra hasta N tarjetas
 * minimalistas. Si no hay nada visto, no renderiza.
 *
 * Para ahorrar markup, las "tarjetas" son links inline con imagen, título,
 * SKU y precio — más editorial, menos ruido visual.
 */

import { useEffect, useState } from "preact/hooks";
import { recent } from "../lib/cart";
import { formatPrice } from "../lib/format";

export interface RecentProduct {
  slug: string;
  name: string;
  category: string;
  brand?: string;
  price: number;
  stock: number;
  sku: string;
  image: string;
  imageAlt: string;
}

interface Props {
  products: RecentProduct[];
  /** Slug actual — se excluye del listado. */
  currentSlug?: string;
  /** Cuántos productos mostrar. */
  limit?: number;
}

function stockLabel(stock: number): { label: string; tone: "out" | "low" | "ok" } {
  if (stock <= 0) return { label: "Sin stock", tone: "out" };
  if (stock < 10) return { label: `Últimas ${stock}`, tone: "low" };
  return { label: "En stock", tone: "ok" };
}

export default function RecentStrip({ products, currentSlug, limit = 6 }: Props) {
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    setSlugs(recent.value);
    const unsub = recent.subscribe((next) => setSlugs(next));
    return () => unsub();
  }, []);

  // Hidratamos el slug actual al montar (un visit acaba de ocurrir).
  useEffect(() => {
    if (currentSlug && !slugs.includes(currentSlug)) {
      // No necesario en detalle (la página ya lo hizo), pero por seguridad.
    }
  }, [currentSlug, slugs]);

  const items = slugs
    .filter((slug) => slug !== currentSlug)
    .map((slug) => products.find((p) => p.slug === slug))
    .filter((p): p is RecentProduct => Boolean(p))
    .slice(0, limit);

  if (items.length === 0) return null;

  return (
    <section
      aria-label="Productos vistos recientemente"
      class="border-t border-[var(--color-line)] bg-[var(--color-cream-deep)] py-10 md:py-14"
    >
      <div class="mx-auto max-w-[1400px] px-4 md:px-8">
        <div class="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-[var(--color-navy)] pb-3">
          <div>
            <p class="mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-mustard-deep)]">
              Tu recorrido
            </p>
            <h2 class="mt-1 font-display text-2xl font-bold tracking-tight text-[var(--color-navy)] md:text-3xl">
              Viste hace un rato
            </h2>
          </div>
          <a
            href="/productos"
            class="mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-navy-muted)] hover:text-[var(--color-navy)]"
          >
            Limpiar y volver al catálogo
          </a>
        </div>

        <ul class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {items.map((p) => {
            const stock = stockLabel(p.stock);
            return (
              <li key={p.slug}>
                <a
                  href={`/productos/${p.slug}`}
                  class="crosshair group relative flex h-full flex-col border border-[var(--color-navy)] bg-[var(--color-cream)] transition-colors hover:border-[var(--color-mustard)]"
                >
                  <span class="ch-bl" aria-hidden="true" />
                  <span class="ch-br" aria-hidden="true" />
                  <div class="aspect-square overflow-hidden bg-[var(--color-cream-deep)]">
                    <img
                      src={p.image}
                      alt={p.imageAlt}
                      width="200"
                      height="200"
                      loading="lazy"
                      class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  </div>
                  <div class="flex flex-1 flex-col gap-1 p-3">
                    <p class="mono text-[9px] uppercase tracking-[0.16em] text-[var(--color-navy-muted)]">
                      {p.category}
                    </p>
                    <p class="font-display text-[13px] font-semibold leading-tight text-[var(--color-navy)] line-clamp-2">
                      {p.name}
                    </p>
                    <div class="mt-auto flex items-baseline justify-between gap-2 pt-1">
                      <span class="mono text-[12px] font-bold tabular-nums text-[var(--color-navy)]">
                        {formatPrice(p.price)}
                      </span>
                      <span
                        class={`mono text-[9px] uppercase tracking-[0.16em] ${
                          stock.tone === "out"
                            ? "text-[var(--color-mark)]"
                            : stock.tone === "low"
                              ? "text-[var(--color-mustard-deep)]"
                              : "text-[var(--color-sage)]"
                        }`}
                      >
                        {stock.label}
                      </span>
                    </div>
                  </div>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}