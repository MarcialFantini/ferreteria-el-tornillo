// src/components/SearchBar.tsx
// Isla Preact — buscador con autocompletar que vive en el Header.
//
// Funcionalidad:
//  - Filtrado client-side contra los productos del content collection.
//  - Top 5 resultados en dropdown con nombre, SKU, precio y link al producto.
//  - Teclado: ArrowDown / ArrowUp navegan, Enter abre el producto resaltado
//    (o el primero si no hay selección), Esc cierra y limpia el foco.
//  - Si no hay coincidencias: mensaje explícito en el dropdown.
//  - Mobile: el input se reemplaza por un botón que abre un panel overlay
//    a pantalla completa con el mismo buscador.
//
// Diseño: tokens existentes (--color-rivet, --color-steel, --color-kraft, etc.),
// tipografía mono para SKU / precio, industrial y directo.

import { useEffect, useMemo, useRef, useState } from "preact/hooks";

export interface SearchProduct {
  slug: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  sku: string;
  image: string;
  // Texto pre-computado en el servidor para búsqueda rápida sin re-indexar.
  // Contiene: nombre + sku + categoría + tags + brand, todo en minúsculas.
  searchBlob: string;
}

interface Props {
  products: SearchProduct[];
}

const MAX_RESULTS = 5;
const MIN_CHARS = 2;

function formatPrice(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function SearchBar({ products }: Props) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [desktopOpen, setDesktopOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const desktopInputRef = useRef<HTMLInputElement | null>(null);
  const mobileInputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  const trimmed = query.trim().toLowerCase();

  const results = useMemo<SearchProduct[]>(() => {
    if (trimmed.length < MIN_CHARS) return [];
    const list: SearchProduct[] = [];
    for (const p of products) {
      if (p.searchBlob.includes(trimmed)) {
        list.push(p);
        if (list.length >= MAX_RESULTS) break;
      }
    }
    return list;
  }, [products, trimmed]);

  const hasQuery = trimmed.length >= MIN_CHARS;
  const noResults = hasQuery && results.length === 0;

  // Reset índice cuando cambia la query.
  useEffect(() => {
    setActiveIndex(0);
  }, [trimmed]);

  // Cierra el dropdown desktop al hacer click fuera.
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setDesktopOpen(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  // Esc global cierra panel móvil y desktop.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (mobileOpen) {
          setMobileOpen(false);
          setQuery("");
        } else {
          setDesktopOpen(false);
          desktopInputRef.current?.blur();
        }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  // Al abrir el panel móvil, foco automático en el input.
  useEffect(() => {
    if (mobileOpen) {
      // pequeño delay para asegurar que el input ya está montado
      const t = window.setTimeout(() => mobileInputRef.current?.focus(), 30);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [mobileOpen]);

  // Bloquea scroll del body cuando el panel móvil está abierto.
  useEffect(() => {
    if (!mobileOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  // Mantiene visible el item activo al navegar con teclado.
  useEffect(() => {
    if (!listRef.current) return;
    const item = listRef.current.querySelector<HTMLLIElement>(
      `[data-result-index="${activeIndex}"]`,
    );
    if (item) {
      item.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  function navigateTo(slug: string) {
    window.location.assign(`/productos/${slug}`);
  }

  function handleSelect(index: number) {
    const item = results[index];
    if (item) {
      navigateTo(item.slug);
    }
  }

  function handleEnter() {
    if (results.length > 0) {
      const idx = activeIndex >= 0 && activeIndex < results.length ? activeIndex : 0;
      handleSelect(idx);
    } else if (hasQuery) {
      // Sin matches → llevar al catálogo con la query como filtro.
      window.location.assign(`/productos?q=${encodeURIComponent(trimmed)}`);
    }
  }

  function onInputKeyDown(e: KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (results.length === 0 ? -1 : (i + 1) % results.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) =>
        results.length === 0 ? -1 : (i - 1 + results.length) % results.length,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleEnter();
    } else if (e.key === "Escape") {
      setDesktopOpen(false);
      (e.currentTarget as HTMLInputElement).blur();
    }
  }

  function highlight(text: string, q: string) {
    if (!q) return text;
    const lower = text.toLowerCase();
    const idx = lower.indexOf(q);
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark class="bg-[var(--color-rivet)]/30 text-[var(--color-steel)]">
          {text.slice(idx, idx + q.length)}
        </mark>
        {text.slice(idx + q.length)}
      </>
    );
  }

  return (
    <div ref={containerRef} class="relative">
      {/* Desktop: input inline */}
      <div class="hidden md:block">
        <label class="sr-only" for="site-search">
          Buscar productos
        </label>
        <div
          class={`flex items-center gap-2 border border-[var(--color-steel)] bg-[var(--color-kraft)] px-3 transition-colors focus-within:border-[var(--color-rivet)] ${
            desktopOpen ? "w-[320px]" : "w-[220px]"
          }`}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="square"
            class="shrink-0 text-[var(--color-steel-muted)]"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="16.5" y1="16.5" x2="21" y2="21" />
          </svg>
          <input
            ref={desktopInputRef}
            id="site-search"
            type="search"
            value={query}
            autoComplete="off"
            spellcheck={false}
            placeholder="Buscar productos (SKU o nombre)…"
            onInput={(e) => {
              setQuery((e.currentTarget as HTMLInputElement).value);
              setDesktopOpen(true);
            }}
            onFocus={() => setDesktopOpen(true)}
            onKeyDown={onInputKeyDown}
            role="combobox"
            aria-expanded={desktopOpen && (results.length > 0 || noResults)}
            aria-controls="search-results-desktop"
            aria-autocomplete="list"
            aria-activedescendant={
              results.length > 0 && activeIndex >= 0
                ? `search-result-${activeIndex}`
                : undefined
            }
            class="mono w-full bg-transparent py-2 text-sm text-[var(--color-steel)] placeholder:text-[var(--color-steel-muted)] focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                desktopInputRef.current?.focus();
              }}
              aria-label="Limpiar búsqueda"
              class="shrink-0 text-[var(--color-steel-muted)] hover:text-[var(--color-steel)]"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square">
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Dropdown desktop */}
        {desktopOpen && hasQuery && (
          <SearchDropdown
            id="search-results-desktop"
            listRef={listRef}
            query={trimmed}
            results={results}
            noResults={noResults}
            activeIndex={activeIndex}
            onHover={setActiveIndex}
            onSelect={handleSelect}
            highlight={highlight}
          />
        )}
      </div>

      {/* Mobile: botón que abre overlay */}
      <div class="md:hidden">
        <button
          type="button"
          onClick={() => {
            setMobileOpen(true);
            setQuery("");
          }}
          aria-label="Abrir buscador"
          class="inline-flex h-10 w-10 items-center justify-center border border-[var(--color-steel)] bg-[var(--color-kraft)] text-[var(--color-steel)]"
        >
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="square"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="16.5" y1="16.5" x2="21" y2="21" />
          </svg>
        </button>

        {mobileOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Buscar productos"
            class="fixed inset-0 z-50 flex flex-col bg-[var(--color-kraft)]"
          >
            <div class="flex items-center gap-3 border-b border-[var(--color-line)] px-4 py-3">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="square"
                class="shrink-0 text-[var(--color-steel-muted)]"
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="16.5" y1="16.5" x2="21" y2="21" />
              </svg>
              <input
                ref={mobileInputRef}
                type="search"
                value={query}
                autoComplete="off"
                spellcheck={false}
                placeholder="Buscar productos (SKU o nombre)…"
                onInput={(e) => setQuery((e.currentTarget as HTMLInputElement).value)}
                onKeyDown={onInputKeyDown}
                role="combobox"
                aria-expanded={results.length > 0 || noResults}
                aria-controls="search-results-mobile"
                aria-autocomplete="list"
                aria-activedescendant={
                  results.length > 0 && activeIndex >= 0
                    ? `search-result-mobile-${activeIndex}`
                    : undefined
                }
                class="mono w-full bg-transparent py-2 text-base text-[var(--color-steel)] placeholder:text-[var(--color-steel-muted)] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  setQuery("");
                }}
                aria-label="Cerrar buscador"
                class="mono shrink-0 text-[11px] uppercase tracking-[0.12em] text-[var(--color-steel-soft)] hover:text-[var(--color-steel)]"
              >
                Cerrar
              </button>
            </div>

            <div class="flex-1 overflow-y-auto">
              {!hasQuery && (
                <p class="mono px-4 py-6 text-[11px] uppercase tracking-[0.18em] text-[var(--color-steel-muted)]">
                  Tipeá al menos 2 letras para buscar.
                </p>
              )}

              {hasQuery && (
                <SearchDropdown
                  id="search-results-mobile"
                  listRef={listRef}
                  query={trimmed}
                  results={results}
                  noResults={noResults}
                  activeIndex={activeIndex}
                  onHover={setActiveIndex}
                  onSelect={(i) => {
                    handleSelect(i);
                  }}
                  highlight={highlight}
                  idPrefix="search-result-mobile"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface DropdownProps {
  id: string;
  listRef: { current: HTMLUListElement | null };
  query: string;
  results: SearchProduct[];
  noResults: boolean;
  activeIndex: number;
  onHover: (i: number) => void;
  onSelect: (i: number) => void;
  highlight: (text: string, q: string) => preact.ComponentChildren;
  idPrefix?: string;
}

function SearchDropdown({
  id,
  listRef,
  query,
  results,
  noResults,
  activeIndex,
  onHover,
  onSelect,
  highlight,
  idPrefix = "search-result",
}: DropdownProps) {
  if (noResults) {
    return (
      <div
        id={id}
        role="listbox"
        class="absolute left-0 right-0 top-full z-30 mt-2 border border-[var(--color-steel)] bg-[var(--color-kraft)] p-4 shadow-[var(--shadow-ticket)] md:absolute"
      >
        <p class="mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-steel-muted)]">
          Sin resultados
        </p>
        <p class="mt-2 text-sm text-[var(--color-steel-soft)]">
          No encontramos nada para <span class="mono text-[var(--color-steel)]">“{query}”</span>.
          Probá con SKU o nombre más corto.
        </p>
      </div>
    );
  }

  return (
    <ul
      id={id}
      ref={listRef}
      role="listbox"
      class="absolute left-0 right-0 top-full z-30 mt-2 max-h-[420px] overflow-y-auto border border-[var(--color-steel)] bg-[var(--color-kraft)] shadow-[var(--shadow-ticket)] md:absolute"
    >
      {results.map((p, i) => {
        const isActive = i === activeIndex;
        return (
          <li
            key={p.slug}
            id={`${idPrefix}-${i}`}
            role="option"
            aria-selected={isActive}
            data-result-index={i}
          >
            <a
              href={`/productos/${p.slug}`}
              onMouseEnter={() => onHover(i)}
              onClick={(e) => {
                e.preventDefault();
                onSelect(i);
              }}
              class={`flex items-center gap-3 border-b border-[var(--color-line)] px-3 py-2.5 transition-colors last:border-b-0 ${
                isActive
                  ? "bg-[var(--color-kraft-deep)]"
                  : "bg-[var(--color-kraft)] hover:bg-[var(--color-kraft-deep)]"
              }`}
            >
              <img
                src={p.image}
                alt=""
                width="44"
                height="44"
                loading="lazy"
                class="h-11 w-11 shrink-0 border border-[var(--color-line)] object-cover"
              />
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-semibold text-[var(--color-steel)]">
                  {highlight(p.name, query)}
                </p>
                <p class="mono mt-0.5 text-[10px] uppercase tracking-[0.16em] text-[var(--color-steel-muted)]">
                  {highlight(p.sku, query)} · {p.category}
                </p>
              </div>
              <div class="shrink-0 text-right">
                <p class="mono text-sm font-bold text-[var(--color-steel)]">
                  {formatPrice(p.price)}
                </p>
                <p
                  class={`mono mt-0.5 text-[9px] uppercase tracking-[0.16em] ${
                    p.stock <= 0
                      ? "text-[var(--color-mark)]"
                      : p.stock < 10
                        ? "text-[var(--color-rivet-deep)]"
                        : "text-[var(--color-steel-muted)]"
                  }`}
                >
                  {p.stock <= 0 ? "Sin stock" : p.stock < 10 ? `Últimas ${p.stock}` : "En stock"}
                </p>
              </div>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
