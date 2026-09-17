// src/lib/format.ts
// Helpers compartidos: formateo de precio en ARS, labels de stock, slugs.

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

export function stockLabel(stock: number): {
  label: string;
  tone: "ok" | "low" | "out";
} {
  if (stock <= 0) return { label: "Sin stock", tone: "out" };
  if (stock < 10) return { label: `Últimas ${stock} unidades`, tone: "low" };
  return { label: "En stock", tone: "ok" };
}
