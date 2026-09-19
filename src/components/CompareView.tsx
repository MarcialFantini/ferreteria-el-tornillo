/**
 * CompareView — isla Preact que arma la tabla comparativa.
 *
 * Lee del signal `compareList` los slugs seleccionados. El padre (Astro)
 * pasa la lista completa de productos para resolver los slugs.
 *
 * Máximo 3 productos. La tabla usa CSS grid (no <table>) para que las
 * filas se puedan apilar limpio en mobile.
 */

import { useState, useEffect } from "preact/hooks";
import {
  compareList,
  toggleCompare,
  clear as clearCompare,
  COMPARE_LIMIT,
} from "../lib/cart";
import { formatPrice } from "../lib/format";

export interface CompareProduct {
  slug: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  comparePrice?: number;
  stock: number;
  sku: string;
  image: string;
  imageAlt: string;
  rating?: number;
  tags: string[];
}

interface Props {
  products: CompareProduct[];
}

export default function CompareView({ products }: Props) {
  // Hidratamos desde el store. Como el store ya usa signal global,
  // simplemente lo leemos y suscribimos.
  const [slugs, setSlugs] = useState<string[]>(() => compareList.value.slice(0, COMPARE_LIMIT));

  useEffect(() => {
    const unsub = compareList.subscribe((next) => {
      setSlugs(next.slice(0, COMPARE_LIMIT));
    });
    return () => unsub();
  }, []);

  const list = slugs
    .map((slug) => products.find((p) => p.slug === slug))
    .filter((p): p is CompareProduct => Boolean(p));

  // Hidratado inicial (cuando el usuario viene por primera vez sin haber
  // seleccionado nada). Mostramos un picker directo desde la página.
  if (list.length === 0) {
    return <CompareEmpty allProducts={products} />;
  }

  // Para que el grid funcione con N columnas fijas (1..3),
  // armamos un set de "slots" con posibles espacios vacíos.
  const slots: (CompareProduct | null)[] = [...list];
  while (slots.length < COMPARE_LIMIT) slots.push(null);

  return (
    <div>
      <div class="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-navy)] pb-3">
        <p class="font-display text-lg text-[var(--color-navy)]">
          Comparando{" "}
          <strong class="tabular-nums">
            {list.length} de {COMPARE_LIMIT}
          </strong>{" "}
          {list.length === 1 ? "producto" : "productos"}
        </p>
        <div class="flex items-center gap-2">
          <a
            href="/productos"
            class="mono border border-[var(--color-navy)] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-navy)] transition-colors hover:bg-[var(--color-navy)] hover:text-[var(--color-cream)]"
          >
            Agregar más →
          </a>
          <button
            type="button"
            onClick={clearCompare}
            class="mono border border-[var(--color-navy)] bg-transparent px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-navy)] transition-colors hover:bg-[var(--color-mark)] hover:text-[var(--color-cream)]"
          >
            Vaciar
          </button>
        </div>
      </div>

      {/* Tabla grid: 1 col label + N cols productos */}
      <div class="overflow-x-auto border border-[var(--color-navy)] bg-[var(--color-cream)]">
        <div
          class="grid min-w-[760px]"
          style={{ gridTemplateColumns: `140px repeat(${slots.length}, minmax(180px, 1fr))` }}
        >
          <div class="border-b border-r border-[var(--color-navy)] bg-[var(--color-navy)] p-3 text-[var(--color-cream)] mono text-[10px] uppercase tracking-[0.18em]">
            Característica
          </div>
          {slots.map((_p, i) => (
            <div
              key={`slot-${i}`}
              class="border-b border-r border-[var(--color-navy)] last:border-r-0 bg-[var(--color-navy)] p-3 text-right mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-mustard)]"
            >
              Slot {String(i + 1).padStart(2, "0")}
            </div>
          ))}

          {/* Producto (imagen + nombre) */}
          <CellHeader label="Producto" />
          {slots.map((p, i) =>
            p ? (
              <div key={p.slug} class="border-b border-r border-[var(--color-line)] p-4 last:border-r-0">
                <a href={`/productos/${p.slug}`} class="block">
                  <img
                    src={p.image}
                    alt={p.imageAlt}
                    width="200"
                    height="200"
                    loading="lazy"
                    class="mb-2 aspect-square w-full border border-[var(--color-line)] object-cover"
                  />
                  <h3 class="font-display text-[15px] font-semibold leading-tight tracking-tight text-[var(--color-navy)] hover:text-[var(--color-mustard-deep)]">
                    {p.name}
                  </h3>
                </a>
                <button
                  type="button"
                  onClick={() => toggleCompare(p.slug)}
                  aria-label={`Quitar ${p.name}`}
                  class="mono mt-3 inline-flex w-full items-center justify-center gap-1 border border-[var(--color-navy)] px-2 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-navy)] transition-colors hover:bg-[var(--color-mark)] hover:text-[var(--color-cream)]"
                >
                  Quitar
                </button>
              </div>
            ) : (
              <EmptySlot key={`empty-${i}`} index={i} />
            ),
          )}

          {/* Precio */}
          <CellHeader label="Precio" />
          {slots.map((p, i) => (
            <div key={`price-${i}`} class="border-b border-r border-[var(--color-line)] p-4 last:border-r-0">
              {p ? (
                <div>
                  <p class="mono text-2xl font-bold tabular-nums text-[var(--color-navy)]">
                    {formatPrice(p.price)}
                  </p>
                  {p.comparePrice && p.comparePrice > p.price && (
                    <>
                      <p class="mono text-[12px] text-[var(--color-navy-muted)] line-through tabular-nums">
                        {formatPrice(p.comparePrice)}
                      </p>
                      <p class="mono mt-1 inline-block bg-[var(--color-mustard)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--color-navy)]">
                        -{Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100)}%
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <span class="mono text-[var(--color-navy-muted)]">—</span>
              )}
            </div>
          ))}

          {/* Stock */}
          <CellHeader label="Stock" />
          {slots.map((p, i) => (
            <div key={`stock-${i}`} class="border-b border-r border-[var(--color-line)] p-4 last:border-r-0">
              {p ? (
                <StockDisplay stock={p.stock} />
              ) : (
                <span class="mono text-[var(--color-navy-muted)]">—</span>
              )}
            </div>
          ))}

          {/* Marca */}
          <CellHeader label="Marca" />
          {slots.map((p, i) => (
            <div key={`brand-${i}`} class="border-b border-r border-[var(--color-line)] p-4 last:border-r-0 text-[14px] text-[var(--color-navy)]">
              {p ? p.brand : <span class="mono text-[var(--color-navy-muted)]">—</span>}
            </div>
          ))}

          {/* SKU */}
          <CellHeader label="SKU" />
          {slots.map((p, i) => (
            <div key={`sku-${i}`} class="border-b border-r border-[var(--color-line)] p-4 last:border-r-0">
              {p ? (
                <span class="mono text-[12px] tabular-nums text-[var(--color-navy)]">{p.sku}</span>
              ) : (
                <span class="mono text-[var(--color-navy-muted)]">—</span>
              )}
            </div>
          ))}

          {/* Categoría */}
          <CellHeader label="Categoría" />
          {slots.map((p, i) => (
            <div key={`cat-${i}`} class="border-b border-r border-[var(--color-line)] p-4 last:border-r-0 text-[14px] text-[var(--color-navy)]">
              {p ? p.category : <span class="mono text-[var(--color-navy-muted)]">—</span>}
            </div>
          ))}

          {/* Rating */}
          <CellHeader label="Rating" />
          {slots.map((p, i) => (
            <div key={`rating-${i}`} class="border-b border-r border-[var(--color-line)] p-4 last:border-r-0">
              {p ? (
                <span class="mono text-[14px] tabular-nums text-[var(--color-navy)]">
                  {p.rating ? `★ ${p.rating.toFixed(1)}` : "—"}
                </span>
              ) : (
                <span class="mono text-[var(--color-navy-muted)]">—</span>
              )}
            </div>
          ))}

          {/* Tags */}
          <CellHeader label="Tags" />
          {slots.map((p, i) => (
            <div key={`tags-${i}`} class="border-b border-r border-[var(--color-line)] p-4 last:border-r-0">
              {p ? (
                <p class="mono text-[11px] leading-relaxed text-[var(--color-navy-muted)]">
                  {p.tags.slice(0, 5).join(" · ")}
                </p>
              ) : (
                <span class="mono text-[var(--color-navy-muted)]">—</span>
              )}
            </div>
          ))}

          {/* Acción */}
          <CellHeader label="Acción" />
          {slots.map((p, i) => (
            <div key={`action-${i}`} class="border-r border-[var(--color-line)] p-4 last:border-r-0">
              {p ? (
                <a
                  href={`/productos/${p.slug}`}
                  class="mono inline-flex w-full items-center justify-center gap-2 bg-[var(--color-navy)] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-cream)] transition-colors hover:bg-[var(--color-mustard)] hover:text-[var(--color-navy)]"
                >
                  Ver producto →
                </a>
              ) : (
                <span class="mono text-[var(--color-navy-muted)]">—</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CompareEmpty({ allProducts }: { allProducts: CompareProduct[] }) {
  const featured = allProducts.slice(0, 6);
  return (
    <div>
      <div class="crosshair has-bottom-crosshairs relative border border-dashed border-[var(--color-navy-muted)] bg-[var(--color-cream-deep)] p-10 text-center">
        <span class="ch-bl" aria-hidden="true" />
        <span class="ch-br" aria-hidden="true" />
        <p class="mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-navy-muted)]">
          Comparador vacío
        </p>
        <h2 class="mt-3 font-display text-3xl leading-tight text-[var(--color-navy)]">
          Empezá agregando hasta {COMPARE_LIMIT} productos desde el catálogo.
        </h2>
        <p class="mx-auto mt-3 max-w-xl text-[14px] leading-relaxed text-[var(--color-navy-muted)]">
          Andá a <a href="/productos" class="font-bold text-[var(--color-navy)] underline-offset-4 hover:underline">/productos</a> y
          tocá el botón <em class="font-bold">Comparar</em> en cada producto que
          te interese. Esta página quedará guardada con tu selección.
        </p>
      </div>

      <div class="mt-10">
        <p class="mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-navy-muted)]">
          Sugeridos para empezar
        </p>
        <ul class="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <li
              key={p.slug}
              class="border border-[var(--color-navy)] bg-[var(--color-cream)] p-4 transition-colors hover:border-[var(--color-mustard)]"
            >
              <a href={`/productos/${p.slug}`} class="block">
                <img
                  src={p.image}
                  alt={p.imageAlt}
                  width="200"
                  height="200"
                  loading="lazy"
                  class="mb-3 aspect-square w-full object-cover"
                />
                <h3 class="font-display text-[16px] font-semibold leading-tight text-[var(--color-navy)]">
                  {p.name}
                </h3>
                <p class="mono mt-2 text-[11px] text-[var(--color-navy-muted)]">
                  {p.category} · {p.sku}
                </p>
                <p class="mono mt-1 text-lg font-bold tabular-nums text-[var(--color-navy)]">
                  {formatPrice(p.price)}
                </p>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function CellHeader({ label }: { label: string }) {
  return (
    <div class="border-b border-r border-[var(--color-navy)] bg-[var(--color-cream-deep)] p-3 mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-navy-muted)] last:border-r-0">
      {label}
    </div>
  );
}

function EmptySlot({ index }: { index: number }) {
  return (
    <div class="flex min-h-[140px] items-center justify-center border-b border-r border-[var(--color-line)] p-4 last:border-r-0">
      <a
        href="/productos"
        class="mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-navy-muted)] hover:text-[var(--color-navy)]"
      >
        + Slot {index + 1}
      </a>
    </div>
  );
}

function StockDisplay({ stock }: { stock: number }) {
  if (stock <= 0)
    return (
      <span class="mono text-[12px] uppercase tracking-[0.14em] text-[var(--color-mark)]">
        Sin stock
      </span>
    );
  if (stock < 10)
    return (
      <span class="mono text-[12px] uppercase tracking-[0.14em] text-[var(--color-mustard-deep)]">
        Últimas {stock}
      </span>
    );
  return (
    <span class="mono text-[12px] uppercase tracking-[0.14em] text-[var(--color-sage)]">
      En stock · {stock}
    </span>
  );
}