// src/components/Catalog.tsx
// Isla Preact para el catálogo interactivo:
//   - búsqueda por nombre / tag / SKU
//   - filtro por categoría (radio buttons)
//   - filtro por rango de precio (min/max)
//   - contador de resultados
//   - estado vacío amigable
// Toda la lógica corre client-side, sin recargar la página.

import { useMemo, useState } from "preact/hooks";

export interface CatalogProduct {
  slug: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  sku: string;
  image: string;
  imageAlt: string;
  searchBlob: string;
  wa: string;
}

interface Props {
  products: CatalogProduct[];
  categories: string[];
  priceBounds: { min: number; max: number };
}

function readInitialState(priceBounds: { min: number; max: number }) {
  if (typeof window === "undefined") {
    return { query: "", category: "Todas", maxPrice: priceBounds.max };
  }
  const params = new URLSearchParams(window.location.search);
  const cat = params.get("cat");
  const q = params.get("q") ?? "";
  const p = Number(params.get("max"));
  return {
    query: q,
    category: cat && cat !== "Todas" ? cat : "Todas",
    maxPrice: Number.isFinite(p) && p > 0 ? Math.min(p, priceBounds.max) : priceBounds.max,
  };
}

export default function Catalog({ products, categories, priceBounds }: Props) {
  const initial = readInitialState(priceBounds);
  const [query, setQuery] = useState(initial.query);
  const [category, setCategory] = useState<string>(initial.category);
  const [maxPrice, setMaxPrice] = useState<number>(initial.maxPrice);
  const [sort, setSort] = useState<"featured" | "priceAsc" | "priceDesc" | "name">(
    "featured",
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = products.filter((p) => {
      if (category !== "Todas" && p.category !== category) return false;
      if (p.price > maxPrice) return false;
      if (q && !p.searchBlob.toLowerCase().includes(q)) return false;
      return true;
    });

    switch (sort) {
      case "priceAsc":
        return [...list].sort((a, b) => a.price - b.price);
      case "priceDesc":
        return [...list].sort((a, b) => b.price - a.price);
      case "name":
        return [...list].sort((a, b) => a.name.localeCompare(b.name, "es"));
      default:
        return list;
    }
  }, [products, query, category, maxPrice, sort]);

  const hasFilters = query !== "" || category !== "Todas" || maxPrice < priceBounds.max;

  function clearFilters() {
    setQuery("");
    setCategory("Todas");
    setMaxPrice(priceBounds.max);
    setSort("featured");
  }

  return (
    <div class="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
      {/* Panel de filtros */}
      <aside
        aria-label="Filtros de catálogo"
        class="lg:sticky lg:top-24 lg:self-start"
      >
        <div class="crosshair has-bottom-crosshairs relative border border-[var(--color-steel)] bg-[var(--color-kraft)] p-5">
          <span class="ch-bl" aria-hidden="true" />
          <span class="ch-br" aria-hidden="true" />
          <div class="mb-5 flex items-center justify-between border-b border-[var(--color-line)] pb-3">
            <h2 class="mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-steel-muted)]">
              Filtros · Catálogo
            </h2>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                class="mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-mark)] hover:underline"
              >
                Limpiar
              </button>
            )}
          </div>

          <label class="block">
            <span class="mono mb-2 block text-[10px] uppercase tracking-[0.18em] text-[var(--color-steel-muted)]">
              Buscar
            </span>
            <input
              type="search"
              inputMode="search"
              value={query}
              onInput={(e) => setQuery((e.currentTarget as HTMLInputElement).value)}
              placeholder="Nombre, SKU o marca"
              class="mono w-full border border-[var(--color-steel)] bg-[var(--color-kraft)] px-3 py-2.5 text-sm text-[var(--color-steel)] placeholder:text-[var(--color-steel-muted)] focus:border-[var(--color-rivet)] focus:outline-none"
              aria-label="Buscar producto por nombre, SKU o marca"
            />
          </label>

          <fieldset class="mt-6">
            <legend class="mono mb-2 block text-[10px] uppercase tracking-[0.18em] text-[var(--color-steel-muted)]">
              Categoría
            </legend>
            <ul class="flex flex-col">
              {["Todas", ...categories].map((c) => {
                const id = `cat-${c.replace(/\s+/g, "-").toLowerCase()}`;
                const count =
                  c === "Todas"
                    ? products.length
                    : products.filter((p) => p.category === c).length;
                const checked = category === c;
                return (
                  <li>
                    <label
                      for={id}
                      class="flex cursor-pointer items-center justify-between border-b border-[var(--color-line)] px-1 py-2 text-sm hover:bg-[var(--color-kraft-deep)]"
                    >
                      <span class="flex items-center gap-2">
                        <input
                          id={id}
                          type="radio"
                          name="category"
                          value={c}
                          checked={checked}
                          onChange={() => setCategory(c)}
                          class="accent-[var(--color-rivet)]"
                        />
                        <span class={checked ? "font-semibold text-[var(--color-steel)]" : "text-[var(--color-steel-soft)]"}>
                          {c}
                        </span>
                      </span>
                      <span class="mono text-[11px] text-[var(--color-steel-muted)]">{count}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </fieldset>

          <div class="mt-6">
            <label class="mono mb-2 flex items-baseline justify-between text-[10px] uppercase tracking-[0.18em] text-[var(--color-steel-muted)]">
              <span>Precio máximo</span>
              <span class="mono text-[var(--color-steel)]">
                {new Intl.NumberFormat("es-AR", {
                  style: "currency",
                  currency: "ARS",
                  maximumFractionDigits: 0,
                }).format(maxPrice)}
              </span>
            </label>
            <input
              type="range"
              min={priceBounds.min}
              max={priceBounds.max}
              step={500}
              value={maxPrice}
              onInput={(e) => setMaxPrice(Number((e.currentTarget as HTMLInputElement).value))}
              class="w-full accent-[var(--color-rivet)]"
              aria-label="Precio máximo"
            />
            <div class="mt-1 flex justify-between text-[11px] text-[var(--color-steel-muted)]">
              <span class="mono">
                {new Intl.NumberFormat("es-AR").format(priceBounds.min)}
              </span>
              <span class="mono">
                {new Intl.NumberFormat("es-AR").format(priceBounds.max)}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Resultados */}
      <section aria-label="Resultados del catálogo">
        <div class="mb-4 flex flex-col gap-3 border-b border-[var(--color-line)] pb-3 sm:flex-row sm:items-center sm:justify-between">
          <p class="mono text-[12px] uppercase tracking-[0.12em] text-[var(--color-steel-soft)]">
            <span class="font-bold text-[var(--color-steel)]">{filtered.length}</span>
            {" / "}
            <span>{products.length}</span> Productos
          </p>
          <label class="flex items-center gap-2 text-sm text-[var(--color-steel-soft)]">
            <span class="mono text-[10px] uppercase tracking-[0.18em]">Ordenar</span>
            <select
              value={sort}
              onChange={(e) =>
                setSort((e.currentTarget as HTMLSelectElement).value as typeof sort)
              }
              class="mono border border-[var(--color-steel)] bg-[var(--color-kraft)] px-2.5 py-2 text-[12px] uppercase tracking-[0.08em] text-[var(--color-steel)] focus:border-[var(--color-rivet)] focus:outline-none"
            >
              <option value="featured">Destacados</option>
              <option value="priceAsc">$ ASC</option>
              <option value="priceDesc">$ DESC</option>
              <option value="name">A - Z</option>
            </select>
          </label>
        </div>

        {filtered.length === 0 ? (
          <div class="crosshair has-bottom-crosshairs relative border border-dashed border-[var(--color-steel-muted)] bg-[var(--color-kraft)] p-10 text-center">
            <span class="ch-bl" aria-hidden="true" />
            <span class="ch-br" aria-hidden="true" />
            <p class="mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-steel-muted)]">
              Sin coincidencias
            </p>
            <h3 class="mt-3 text-xl font-semibold text-[var(--color-steel)]">
              No hay productos con esos filtros.
            </h3>
            <p class="mt-2 text-sm text-[var(--color-steel-soft)]">
              Probá ampliar el rango de precio o cambiar la categoría.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              class="mono mt-5 inline-flex items-center justify-center bg-[var(--color-steel)] px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-kraft)] hover:bg-[var(--color-rivet)] hover:text-[var(--color-steel)]"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <ul class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((p) => (
              <li>
                <article class="crosshair has-bottom-crosshairs group relative flex h-full flex-col overflow-hidden border border-[var(--color-steel)] bg-[var(--color-kraft)] transition-colors hover:border-[var(--color-rivet)]">
                  <span class="ch-bl" aria-hidden="true" />
                  <span class="ch-br" aria-hidden="true" />
                  <a
                    href={`/productos/${p.slug}`}
                    class="relative block aspect-square overflow-hidden bg-[var(--color-kraft-deep)]"
                  >
                    <img
                      src={p.image}
                      alt={p.imageAlt}
                      loading="lazy"
                      decoding="async"
                      class="h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.03]"
                      width="800"
                      height="800"
                    />
                  </a>

                  <div class="flex flex-1 flex-col gap-3 p-5">
                    <div class="flex items-baseline justify-between gap-3 border-b border-[var(--color-line)] pb-2">
                      <p class="mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-steel-muted)]">
                        {p.category}
                      </p>
                      <p class="mono text-[10px] tracking-[0.18em] text-[var(--color-steel-muted)]">
                        SKU · {p.sku}
                      </p>
                    </div>

                    <h3 class="text-[16px] font-semibold leading-snug text-[var(--color-steel)]">
                      <a
                        href={`/productos/${p.slug}`}
                        class="after:absolute after:inset-0 hover:text-[var(--color-rivet)]"
                      >
                        {p.name}
                      </a>
                    </h3>

                    <div class="mt-auto flex items-end justify-between gap-3 pt-3">
                      <div>
                        <p class="mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-steel-muted)]">
                          Precio
                        </p>
                        <p class="mono text-2xl font-bold tracking-tight text-[var(--color-steel)]">
                          {new Intl.NumberFormat("es-AR", {
                            style: "currency",
                            currency: "ARS",
                            maximumFractionDigits: 0,
                          }).format(p.price)}
                        </p>
                        <p
                          class={`mono mt-1 text-[10px] uppercase tracking-[0.16em] ${
                            p.stock <= 0
                              ? "text-[var(--color-mark)]"
                              : p.stock < 10
                              ? "text-[var(--color-rivet-deep)]"
                              : "text-[var(--color-steel-muted)]"
                          }`}
                        >
                          {p.stock <= 0
                            ? "Sin stock"
                            : p.stock < 10
                            ? `Últimas ${p.stock} unidades`
                            : "En stock"}
                        </p>
                      </div>
                      <a
                        href={p.wa}
                        target="_blank"
                        rel="noopener"
                        aria-label={`Consultar por ${p.name} vía WhatsApp`}
                        class="relative z-10 inline-flex h-10 w-10 shrink-0 items-center justify-center bg-[var(--color-rivet)] text-[var(--color-steel)] transition-transform hover:bg-[var(--color-rivet-deep)] active:scale-[0.95]"
                      >
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          width="18"
                          height="18"
                          fill="currentColor"
                        >
                          <path d="M20.52 3.48A11.94 11.94 0 0 0 12.04 0C5.46 0 .12 5.34.12 11.92c0 2.1.55 4.16 1.6 5.96L0 24l6.28-1.64a11.92 11.92 0 0 0 5.76 1.47h.01c6.58 0 11.92-5.34 11.92-11.92 0-3.18-1.24-6.18-3.45-8.43zM12.04 21.8h-.01a9.9 9.9 0 0 1-5.05-1.39l-.36-.21-3.73.97 1-3.64-.24-.37a9.88 9.88 0 0 1-1.51-5.24c0-5.46 4.45-9.91 9.91-9.91 2.65 0 5.14 1.03 7.01 2.9a9.86 9.86 0 0 1 2.9 7.01c0 5.46-4.45 9.91-9.91 9.91z" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
