/**
 * Cart store — Preact signal-based, persistido en localStorage.
 *
 * API:
 *   items()            → Signal con los productos en el carrito.
 *   count()            → Cantidad total de unidades.
 *   subtotal()         → Suma en ARS.
 *   add(p)             → Agrega (o suma qty si ya existe).
 *   remove(slug)       → Quita por slug.
 *   setQty(slug, n)    → Ajusta cantidad; n<=0 elimina.
 *   clear()            → Vacía el carrito.
 *   isInCart(slug)     → true si el slug está en el carrito.
 *
 * Persistencia: cada mutación guarda en "et:cart:v1". Si el navegador
 * lanza un error (SSR, cookies off, storage lleno), seguimos en memoria.
 *
 * ¿Por qué un signal global? Preact hooks / @preact/signals-core soportan
 * suscripción cross-isla y nos evitan un Context.Provider por árbol.
 */

import { signal, computed } from "@preact/signals";
import { PHONE } from "./whatsapp";

export interface CartItem {
  slug: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  image: string;
  qty: number;
}

const STORAGE_KEY = "et:cart:v1";

function loadFromStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x) =>
        x &&
        typeof x.slug === "string" &&
        typeof x.qty === "number" &&
        x.qty > 0,
    );
  } catch {
    return [];
  }
}

function saveToStorage(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

export const items = signal<CartItem[]>(loadFromStorage());

items.subscribe((next) => saveToStorage(next));

export const count = computed(() =>
  items.value.reduce((acc, item) => acc + item.qty, 0),
);

export const subtotal = computed(() =>
  items.value.reduce((acc, item) => acc + item.qty * item.price, 0),
);

export const compareList = signal<string[]>(loadCompare());

function loadCompare(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem("et:compare:v1");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function saveCompare(list: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem("et:compare:v1", JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

export const COMPARE_LIMIT = 3;

export const compare = computed(() => compareList.value);

compareList.subscribe((next) => saveCompare(next));

export const favorites = signal<string[]>(loadFavs());

function loadFavs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem("et:favs:v1");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function saveFavs(list: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem("et:favs:v1", JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

favorites.subscribe((next) => saveFavs(next));

// === Recently viewed =========================================================
// Lista de slugs visitados, más reciente primero. Limitada a RECENT_LIMIT.
// Persistida en localStorage y emitida como signal para que cualquier isla
// Preact pueda suscribirse y re-renderizar.

export const RECENT_LIMIT = 8;
const RECENT_KEY = "et:recent:v1";

function loadRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string").slice(0, RECENT_LIMIT);
  } catch {
    return [];
  }
}

function saveRecent(list: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

export const recent = signal<string[]>(loadRecent());
recent.subscribe((next) => saveRecent(next));

/** Empuja un slug al tope de la lista de vistos (deduplicado, capped). */
export function markViewed(slug: string): void {
  if (!slug) return;
  const list = recent.value.filter((s) => s !== slug);
  list.unshift(slug);
  if (list.length > RECENT_LIMIT) list.length = RECENT_LIMIT;
  recent.value = list;
}

export function add(item: Omit<CartItem, "qty">, qty = 1): void {
  const list = [...items.value];
  const idx = list.findIndex((x) => x.slug === item.slug);
  if (idx >= 0) {
    list[idx] = { ...list[idx], qty: list[idx].qty + qty };
  } else {
    list.push({ ...item, qty });
  }
  items.value = list;
}

export function remove(slug: string): void {
  items.value = items.value.filter((x) => x.slug !== slug);
}

export function setQty(slug: string, qty: number): void {
  if (qty <= 0) {
    remove(slug);
    return;
  }
  items.value = items.value.map((x) =>
    x.slug === slug ? { ...x, qty } : x,
  );
}

export function clear(): void {
  items.value = [];
}

export function isInCart(slug: string): boolean {
  return items.value.some((x) => x.slug === slug);
}

export function toggleCompare(slug: string): "added" | "removed" | "limit" {
  const list = [...compareList.value];
  const idx = list.indexOf(slug);
  if (idx >= 0) {
    list.splice(idx, 1);
    compareList.value = list;
    return "removed";
  }
  if (list.length >= COMPARE_LIMIT) {
    return "limit";
  }
  list.push(slug);
  compareList.value = list;
  return "added";
}

export function toggleFavorite(slug: string): boolean {
  const list = [...favorites.value];
  const idx = list.indexOf(slug);
  if (idx >= 0) {
    list.splice(idx, 1);
    favorites.value = list;
    return false;
  }
  list.push(slug);
  favorites.value = list;
  return true;
}

export function formatARS(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Arma el link de WhatsApp con el detalle del carrito.
 * El mensaje incluye productos, cantidades y total.
 */
export function whatsappCartLink(phone: string = PHONE): string {
  const lines = items.value.map((it) => {
    const total = it.price * it.qty;
    return `• ${it.qty}× ${it.name} (SKU ${it.sku}) — ${formatARS(total)}`;
  });
  const sub = subtotal.value;
  const body =
    `Hola, armé este pedido en el catálogo online:\n\n` +
    lines.join("\n") +
    `\n\nTotal estimado: ${formatARS(sub)}\n\n` +
    `¿Confirmás stock y precio final? Paso a retirarlo.`;
  const params = new URLSearchParams({ text: body });
  return `https://wa.me/${phone}?${params.toString()}`;
}