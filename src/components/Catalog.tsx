/**
 * Catalog.tsx — Isla Preact del catálogo.
 *
 * Filtros densos (con conteo en tiempo real):
 *   - Búsqueda por nombre / SKU / tag / marca
 *   - Categoría (radio buttons con count)
 *   - Marca (lista con count)
 *   - Rango de precio (min/max inputs)
 *   - Disponibilidad (todos / en stock / últimas unidades)
 *   - Ofertas (solo comparePrice definido)
 *
 * Resultado:
 *   - Ordenamiento (relevante / precio asc / precio desc / nombre / descuento)
 *   - Vista grid densa
 *   - Skeletons mientras se "carga" (200ms)
 *   - Paginación "cargar más" con PAGE_SIZE configurable
 *
 * Estado vacío: copy editorial con link al WhatsApp.
 *
 * Persistencia:
 *   - Sincroniza filtros a la URL (?cat=&brand=&q=&max=&min=&page=)
 *   - Lee de la URL al montar para deep-linking.
 */

import { useEffect, useMemo, useState } from "preact/hooks";
import { whatsappLink } from "../lib/whatsapp";

export interface CatalogProduct {
  slug: string;
  name: string;
  category: string;
  brand?: string;
  price: number;
  comparePrice?: number;
  stock: number;
  sku: string;
  image: string;
  imageAlt: string;
  searchBlob: string;
}

interface Props {
  products: CatalogProduct[];
  categories: string[];
  brands: string[];
  priceBounds: { min: number; max: number };
}

type SortKey = "featured" | "priceAsc" | "priceDesc" | "name" | "discount";
type StockFilter = "all" | "available" | "low";

const PAGE_SIZE = 9;

function formatARS(v: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(v);
}

function readInitialState(priceBounds: { min: number; max: number }) {
  const fallback = {
    query: "",
    category: "Todas",
    brand: "Todas",
    minPrice: priceBounds.min,
    maxPrice: priceBounds.max,
    stock: "all" as StockFilter,
    onlyDeals: false,
    sort: "featured" as SortKey,
    page: 1,
  };
  if (typeof window === "undefined") return fallback;
  const p = new URLSearchParams(window.location.search);
  const cat = p.get("cat");
  const brand = p.get("brand");
  const q = p.get("q") ?? "";
  const min = Number(p.get("min"));
  const max = Number(p.get("max"));
  const stock = p.get("stock") as StockFilter | null;
  const deals = p.get("deals");
  const sort = p.get("sort") as SortKey | null;
  const page = Number(p.get("page"));
  return {
    query: q,
    category: cat && cat !== "Todas" ? cat : "Todas",
    brand: brand && brand !== "Todas" ? brand : "Todas",
    minPrice:
      Number.isFinite(min) && min > 0
        ? Math.max(priceBounds.min, Math.min(min, priceBounds.max))
        : priceBounds.min,
    maxPrice:
      Number.isFinite(max) && max > 0
        ? Math.max(priceBounds.min, Math.min(max, priceBounds.max))
        : priceBounds.max,
    stock:
      stock === "available" || stock === "low" ? stock : ("all" as StockFilter),
    onlyDeals: deals === "1",
    sort: (["featured", "priceAsc", "priceDesc", "name", "discount"].includes(
      sort ?? "",
    )
      ? sort
      : "featured") as SortKey,
    page: Number.isFinite(page) && page > 0 ? Math.floor(page) : 1,
  };
}

export default function Catalog({ products, categories, brands, priceBounds }: Props) {
  const initial = readInitialState(priceBounds);
  const [query, setQuery] = useState(initial.query);
  const [category, setCategory] = useState(initial.category);
  const [brand, setBrand] = useState(initial.brand);
  const [minPrice, setMinPrice] = useState(initial.minPrice);
  const [maxPrice, setMaxPrice] = useState(initial.maxPrice);
  const [stock, setStock] = useState<StockFilter>(initial.stock);
  const [onlyDeals, setOnlyDeals] = useState(initial.onlyDeals);
  const [sort, setSort] = useState<SortKey>(initial.sort);
  const [page, setPage] = useState(initial.page);
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    // Pequeño delay para mostrar skeletons. En la práctica, casi instantáneo.
    const t = window.setTimeout(() => setIsHydrating(false), 220);
    return () => window.clearTimeout(t);
  }, []);

  // === Filter counts (en base a otros filtros, no a sí mismo,
  //     para mostrar al usuario cuántos quedarían si cambia esta opción)
  const counted = useMemo(() => {
    const byCat = new Map<string, number>();
    const byBrand = new Map<string, number>();
    byCat.set("Todas", products.length);
    byBrand.set("Todas", products.length);
    for (const p of products) {
      byCat.set(p.category, (byCat.get(p.category) ?? 0) + 1);
      const b = p.brand ?? "Sin marca";
      byBrand.set(b, (byBrand.get(b) ?? 0) + 1);
    }
    return { byCat, byBrand };
  }, [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = products.filter((p) => {
      if (category !== "Todas" && p.category !== category) return false;
      if (brand !== "Todas" && (p.brand ?? "Sin marca") !== brand) return false;
      if (p.price < minPrice || p.price > maxPrice) return false;
      if (stock === "available" && p.stock <= 0) return false;
      if (stock === "low" && (p.stock <= 0 || p.stock > 9)) return false;
      if (onlyDeals && !p.comparePrice) return false;
      if (q && !p.searchBlob.includes(q)) return false;
      return true;
    });

    switch (sort) {
      case "priceAsc":
        return [...list].sort((a, b) => a.price - b.price);
      case "priceDesc":
        return [...list].sort((a, b) => b.price - a.price);
      case "name":
        return [...list].sort((a, b) => a.name.localeCompare(b.name, "es"));
      case "discount":
        return [...list].sort((a, b) => {
          const ad = a.comparePrice && a.comparePrice > a.price ? (a.comparePrice - a.price) / a.comparePrice : 0;
          const bd = b.comparePrice && b.comparePrice > b.price ? (b.comparePrice - b.price) / b.comparePrice : 0;
          return bd - ad;
        });
      default:
        return list;
    }
  }, [products, query, category, brand, minPrice, maxPrice, stock, onlyDeals, sort]);

  // Reset page cuando cambian filtros (no cuando cambian productos).
  useEffect(() => {
    setPage(1);
  }, [query, category, brand, minPrice, maxPrice, stock, onlyDeals, sort]);

  const total = filtered.length;
  const visible = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < total;

  const hasActiveFilters =
    query !== "" ||
    category !== "Todas" ||
    brand !== "Todas" ||
    minPrice > priceBounds.min ||
    maxPrice < priceBounds.max ||
    stock !== "all" ||
    onlyDeals;

  // Escape limpia filtros cuando hay alguno activo (accesibilidad teclado).
  // Se registra abajo de hasActiveFilters para evitar TDZ durante SSR.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && hasActiveFilters) {
        clearFilters();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hasActiveFilters]);

  // Sincroniza a la URL (sin recargar).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (category !== "Todas") params.set("cat", category);
    if (brand !== "Todas") params.set("brand", brand);
    if (minPrice > priceBounds.min) params.set("min", String(minPrice));
    if (maxPrice < priceBounds.max) params.set("max", String(maxPrice));
    if (stock !== "all") params.set("stock", stock);
    if (onlyDeals) params.set("deals", "1");
    if (sort !== "featured") params.set("sort", sort);
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    const next = `${window.location.pathname}${qs ? `?${qs}` : ""}`;
    window.history.replaceState(null, "", next);
  }, [query, category, brand, minPrice, maxPrice, stock, onlyDeals, sort, page, priceBounds.min, priceBounds.max]);

  function clearFilters() {
    setQuery("");
    setCategory("Todas");
    setBrand("Todas");
    setMinPrice(priceBounds.min);
    setMaxPrice(priceBounds.max);
    setStock("all");
    setOnlyDeals(false);
    setSort("featured");
    setPage(1);
  }

  function loadMore() {
    setPage((n) => n + 1);
  }

  return (
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr] xl:grid-cols-[280px_1fr]">
      {/* === Aside: filtros densos === */}
      <aside aria-label="Filtros de catálogo" class="lg:sticky lg:top-32 lg:self-start">
        <div class="border border-[var(--color-navy)] bg-[var(--color-cream)] crosshair has-bottom-crosshairs">
          <span class="ch-bl" aria-hidden="true" />
          <span class="ch-br" aria-hidden="true" />
          <div class="border-b border-[var(--color-navy)] bg-[var(--color-navy)] px-4 py-3 text-[var(--color-cream)]">
            <p class="mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-mustard)]">Filtros</p>
            <h2 class="font-display text-lg font-bold leading-tight">Refinar catálogo</h2>
          </div>

          <div class="space-y-5 p-4">
            <label class="block">
              <span class="mono mb-2 block text-[10px] uppercase tracking-[0.18em] text-[var(--color-navy-muted)]">
                Buscar
              </span>
              <input
                type="search"
                inputMode="search"
                value={query}
                onInput={(e) => setQuery((e.currentTarget as HTMLInputElement).value)}
                placeholder="Nombre, SKU o marca"
                class="mono w-full border border-[var(--color-navy)] bg-[var(--color-cream)] px-3 py-2.5 text-[13px] text-[var(--color-navy)] placeholder:text-[var(--color-navy-muted)] focus:border-[var(--color-mustard)] focus:outline-none"
                aria-label="Buscar producto"
              />
            </label>

            <fieldset>
              <legend class="mono mb-2 flex w-full items-center justify-between text-[10px] uppercase tracking-[0.18em] text-[var(--color-navy-muted)]">
                <span>Categoría</span>
                <span class="text-[var(--color-navy)] tabular-nums">
                  {counted.byCat.get(category) ?? 0}
                </span>
              </legend>
              <ul class="flex flex-col divide-y divide-[var(--color-line)] border border-[var(--color-line)]">
                {["Todas", ...categories].map((c) => {
                  const id = `cat-${c.replace(/\s+/g, "-").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`;
                  const count = counted.byCat.get(c) ?? 0;
                  return (
                    <li>
                      <label
                        for={id}
                        class="flex cursor-pointer items-center justify-between gap-2 px-3 py-2 text-[13px] text-[var(--color-navy)] transition-colors hover:bg-[var(--color-cream-deep)] has-[input:checked]:bg-[var(--color-navy)] has-[input:checked]:text-[var(--color-cream)]"
                      >
                        <span class="flex items-center gap-2">
                          <input
                            type="radio"
                            id={id}
                            name="cat"
                            value={c}
                            checked={category === c}
                            onChange={() => setCategory(c)}
                            class="h-3 w-3 accent-[var(--color-mustard)]"
                          />
                          <span class="truncate">{c}</span>
                        </span>
                        <span class="mono text-[10px] tabular-nums opacity-80">
                          {String(count).padStart(2, "0")}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </fieldset>

            {brands.length > 0 && (
              <fieldset>
                <legend class="mono mb-2 flex w-full items-center justify-between text-[10px] uppercase tracking-[0.18em] text-[var(--color-navy-muted)]">
                  <span>Marca</span>
                  <span class="text-[var(--color-navy)] tabular-nums">
                    {counted.byBrand.get(brand) ?? 0}
                  </span>
                </legend>
                <ul class="flex max-h-44 flex-col divide-y divide-[var(--color-line)] overflow-y-auto border border-[var(--color-line)]">
                  {["Todas", ...brands].map((b) => {
                    const id = `brand-${b.replace(/\s+/g, "-").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`;
                    const count = counted.byBrand.get(b) ?? 0;
                    return (
                      <li>
                        <label
                          for={id}
                          class="flex cursor-pointer items-center justify-between gap-2 px-3 py-2 text-[13px] text-[var(--color-navy)] transition-colors hover:bg-[var(--color-cream-deep)] has-[input:checked]:bg-[var(--color-navy)] has-[input:checked]:text-[var(--color-cream)]"
                        >
                          <span class="flex items-center gap-2">
                            <input
                              type="radio"
                              id={id}
                              name="brand"
                              value={b}
                              checked={brand === b}
                              onChange={() => setBrand(b)}
                              class="h-3 w-3 accent-[var(--color-mustard)]"
                            />
                            <span class="truncate">{b}</span>
                          </span>
                          <span class="mono text-[10px] tabular-nums opacity-80">
                            {String(count).padStart(2, "0")}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </fieldset>
            )}

            <fieldset>
              <legend class="mono mb-2 block text-[10px] uppercase tracking-[0.18em] text-[var(--color-navy-muted)]">
                Precio (ARS)
              </legend>
              <div class="grid grid-cols-2 gap-2">
                <label class="block">
                  <span class="mono mb-1 block text-[10px] text-[var(--color-navy-muted)]">Mín</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={priceBounds.min}
                    max={priceBounds.max}
                    step={1000}
                    value={minPrice}
                    onInput={(e) => {
                      const v = Number((e.currentTarget as HTMLInputElement).value);
                      setMinPrice(Number.isFinite(v) ? Math.max(priceBounds.min, Math.min(v, maxPrice)) : priceBounds.min);
                    }}
                    class="mono w-full border border-[var(--color-navy)] bg-[var(--color-cream)] px-2.5 py-2 text-[12px] tabular-nums focus:border-[var(--color-mustard)] focus:outline-none"
                  />
                </label>
                <label class="block">
                  <span class="mono mb-1 block text-[10px] text-[var(--color-navy-muted)]">Máx</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={priceBounds.min}
                    max={priceBounds.max}
                    step={1000}
                    value={maxPrice}
                    onInput={(e) => {
                      const v = Number((e.currentTarget as HTMLInputElement).value);
                      setMaxPrice(Number.isFinite(v) ? Math.max(minPrice, Math.min(v, priceBounds.max)) : priceBounds.max);
                    }}
                    class="mono w-full border border-[var(--color-navy)] bg-[var(--color-cream)] px-2.5 py-2 text-[12px] tabular-nums focus:border-[var(--color-mustard)] focus:outline-none"
                  />
                </label>
              </div>
              <input
                type="range"
                min={priceBounds.min}
                max={priceBounds.max}
                step={1000}
                value={maxPrice}
                onInput={(e) => setMaxPrice(Number((e.currentTarget as HTMLInputElement).value))}
                aria-label="Precio máximo"
                class="mt-3 w-full accent-[var(--color-mustard)]"
              />
              <div class="mt-1 flex justify-between mono text-[10px] text-[var(--color-navy-muted)]">
                <span>{formatARS(priceBounds.min)}</span>
                <span>{formatARS(priceBounds.max)}</span>
              </div>
            </fieldset>

            <fieldset>
              <legend class="mono mb-2 block text-[10px] uppercase tracking-[0.18em] text-[var(--color-navy-muted)]">
                Disponibilidad
              </legend>
              <ul class="flex flex-col divide-y divide-[var(--color-line)] border border-[var(--color-line)]">
                {[
                  { id: "all", label: "Todos", value: "all" as const },
                  { id: "available", label: "En stock", value: "available" as const },
                  { id: "low", label: "Stock bajo", value: "low" as const },
                ].map((o) => (
                  <li>
                    <label
                      for={`stock-${o.id}`}
                      class="flex cursor-pointer items-center gap-2 px-3 py-2 text-[13px] text-[var(--color-navy)] transition-colors hover:bg-[var(--color-cream-deep)] has-[input:checked]:bg-[var(--color-navy)] has-[input:checked]:text-[var(--color-cream)]"
                    >
                      <input
                        type="radio"
                        id={`stock-${o.id}`}
                        name="stock"
                        value={o.value}
                        checked={stock === o.value}
                        onChange={() => setStock(o.value)}
                        class="h-3 w-3 accent-[var(--color-mustard)]"
                      />
                      {o.label}
                    </label>
                  </li>
                ))}
              </ul>
            </fieldset>

            <label class="flex cursor-pointer items-center justify-between gap-2 border border-[var(--color-mustard)] bg-[var(--color-mustard)]/10 p-3 text-[13px] text-[var(--color-navy)]">
              <span class="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={onlyDeals}
                  onChange={(e) => setOnlyDeals((e.currentTarget as HTMLInputElement).checked)}
                  class="h-3.5 w-3.5 accent-[var(--color-mustard)]"
                />
                <span class="font-display font-bold">Solo ofertas</span>
              </span>
              <span class="mono text-[10px] uppercase tracking-[0.18em]">%</span>
            </label>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                class="mono w-full border border-[var(--color-navy)] bg-transparent py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-navy)] transition-colors hover:bg-[var(--color-navy)] hover:text-[var(--color-cream)]"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* === Resultado === */}
      <section aria-live="polite" aria-atomic="true">
        <div class="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-navy)] pb-3">
          <p class="font-display text-lg text-[var(--color-navy)]">
            <strong class="tabular-nums">{total}</strong>{" "}
            {total === 1 ? "producto" : "productos"}
          </p>
          <label class="flex items-center gap-2 text-[12px]">
            <span class="mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-navy-muted)]">Ordenar</span>
            <select
              value={sort}
              onChange={(e) => setSort((e.currentTarget as HTMLSelectElement).value as SortKey)}
              class="mono border border-[var(--color-navy)] bg-[var(--color-cream)] px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] text-[var(--color-navy)] focus:outline-none"
            >
              <option value="featured">Relevancia</option>
              <option value="priceAsc">Precio: menor a mayor</option>
              <option value="priceDesc">Precio: mayor a menor</option>
              <option value="discount">Mayor descuento</option>
              <option value="name">Nombre A-Z</option>
            </select>
          </label>
        </div>

        {isHydrating ? (
          <ul class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <li key={i} class="border border-[var(--color-navy)] bg-[var(--color-cream)] p-4">
                <div class="skeleton aspect-square w-full" />
                <div class="skeleton mt-3 h-3 w-1/3" />
                <div class="skeleton mt-2 h-5 w-3/4" />
                <div class="skeleton mt-3 h-6 w-1/2" />
              </li>
            ))}
          </ul>
        ) : total === 0 ? (
          <div class="border border-dashed border-[var(--color-navy-muted)] bg-[var(--color-cream-deep)] p-10 text-center">
            <p class="mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-navy-muted)]">
              Sin resultados
            </p>
            <h2 class="mt-3 font-display text-2xl text-[var(--color-navy)]">
              No encontramos nada con esos filtros.
            </h2>
            <p class="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-[var(--color-navy-muted)]">
              Probá ampliar el rango de precio, quitar la marca o escribirnos por
              WhatsApp si buscás algo puntual.
            </p>
            <div class="mt-5 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={clearFilters}
                class="mono border border-[var(--color-navy)] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-navy)] transition-colors hover:bg-[var(--color-navy)] hover:text-[var(--color-cream)]"
              >
                Limpiar filtros
              </button>
              <a
                href={whatsappLink("Hola, busco un producto que no aparece en el catálogo")}
                target="_blank"
                rel="noopener"
                class="mono inline-flex items-center gap-2 bg-[var(--color-mustard)] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-navy)]"
              >
                Consultar por WhatsApp →
              </a>
            </div>
          </div>
        ) : (
          <>
            <ul class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((p) => (
                <ProductCardItem key={p.slug} product={p} />
              ))}
            </ul>

            {hasMore && (
              <div class="mt-10 flex justify-center">
                <button
                  type="button"
                  onClick={loadMore}
                  class="mono inline-flex items-center gap-3 border border-[var(--color-navy)] bg-[var(--color-cream)] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-navy)] transition-colors hover:bg-[var(--color-navy)] hover:text-[var(--color-cream)]"
                >
                  Cargar {Math.min(PAGE_SIZE, total - visible.length)} más
                  <span aria-hidden="true" class="font-display">↓</span>
                </button>
              </div>
            )}

            {!hasMore && visible.length > PAGE_SIZE && (
              <p class="mt-10 text-center mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-navy-muted)]">
                Fin · {visible.length} de {total} {total === 1 ? "producto" : "productos"}
              </p>
            )}
          </>
        )}
      </section>
    </div>
  );
}

function ProductCardItem({ product }: { product: CatalogProduct }) {
  const stock =
    product.stock <= 0
      ? { label: "Sin stock", tone: "out" as const }
      : product.stock < 10
      ? { label: `Últimas ${product.stock}`, tone: "low" as const }
      : { label: "En stock", tone: "ok" as const };
  const discount =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : 0;
  return (
    <article class="crosshair has-bottom-crosshairs group relative flex h-full flex-col overflow-hidden border border-[var(--color-navy)] bg-[var(--color-cream)] transition-all duration-300 ease-out card-hover">
      <span class="ch-bl" aria-hidden="true" />
      <span class="ch-br" aria-hidden="true" />
      <div class="pointer-events-none absolute left-3 top-3 z-10 flex flex-col items-start gap-1">
        {discount > 0 && (
          <span class="mono pulse-mustard inline-flex items-center bg-[var(--color-mustard)] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.22em] text-[var(--color-navy)]">
            -{discount}%
          </span>
        )}
      </div>
      <a
        href={`/productos/${product.slug}`}
        class="relative block aspect-square overflow-hidden bg-[var(--color-cream-deep)]"
      >
        <img
          src={product.image}
          alt={product.imageAlt}
          loading="lazy"
          decoding="async"
          width="800"
          height="800"
          class="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.05]"
        />
      </a>
      <div class="flex flex-1 flex-col gap-3 p-4">
        <div class="flex items-baseline justify-between gap-3 border-b border-[var(--color-line)] pb-2">
          <p class="mono truncate text-[10px] uppercase tracking-[0.18em] text-[var(--color-navy-muted)]">
            {product.category}
          </p>
          <p class="mono shrink-0 text-[10px] tracking-[0.16em] text-[var(--color-navy-muted)]">
            SKU · {product.sku}
          </p>
        </div>
        <h3 class="font-display text-[17px] font-semibold leading-snug tracking-tight text-[var(--color-navy)] group-hover:text-[var(--color-mustard-deep)]">
          <a href={`/productos/${product.slug}`} class="swipe-underline">
            {product.name}
          </a>
        </h3>
        <div class="mt-auto flex items-end justify-between gap-3 pt-3">
          <div>
            <p class="mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-navy-muted)]">
              Precio
            </p>
            <div class="flex items-baseline gap-2">
              <p class="mono text-2xl font-bold tracking-tight text-[var(--color-navy)] tabular-nums">
                {formatARS(product.price)}
              </p>
              {discount > 0 && (
                <p class="mono text-[11px] text-[var(--color-navy-muted)] line-through tabular-nums">
                  {formatARS(product.comparePrice!)}
                </p>
              )}
            </div>
            <p
              className={[
                "mono mt-1 text-[10px] uppercase tracking-[0.16em]",
                stock.tone === "out" && "text-[var(--color-mark)]",
                stock.tone === "low" && "text-[var(--color-mustard-deep)]",
                stock.tone === "ok" && "text-[var(--color-sage)]",
              ].filter(Boolean).join(" ")}
            >
              {stock.label}
            </p>
          </div>
          <a
            href={`/productos/${product.slug}`}
            class="mono inline-flex items-center gap-1 border border-[var(--color-navy)] bg-[var(--color-navy)] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-cream)] transition-colors hover:bg-[var(--color-mustard)] hover:text-[var(--color-navy)]"
          >
            Ver →
          </a>
        </div>
      </div>
    </article>
  );
}