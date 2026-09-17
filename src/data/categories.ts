// src/data/categories.ts
// Mapeo de categorías: slug URL-friendly, nombre legible y descripción corta.
// La descripción es lo que ve el usuario en el index de categorías y al tope
// de la página de cada categoría. Tono directo, industrial, sin marketing.

// Lista canónica de categorías — coincide con el enum del schema en content.config.ts.
export const CATEGORIES = [
  {
    name: "Herramientas manuales",
    slug: "herramientas-manuales",
    description:
      "Martillos, llaves, alicates y todo lo que se opera a mano. Repasamos marcas y probamos el filo antes de vender.",
  },
  {
    name: "Herramientas eléctricas",
    slug: "herramientas-electricas",
    description:
      "Taladros, amoladoras y atornilladores con garantía oficial. Te asesoramos según el uso: obra, taller o doméstico.",
  },
  {
    name: "Plomería",
    slug: "plomeria",
    description:
      "Caños, conexiones, flexibles y accesorios para agua fría y caliente. Venta por unidad y por tira.",
  },
  {
    name: "Electricidad",
    slug: "electricidad",
    description:
      "Cables, llaves térmicas, disyuntores y bocas. Trabajamos con primeras marcas para evitar recambio a corto plazo.",
  },
  {
    name: "Pinturería",
    slug: "pintureria",
    description:
      "Látex interior y exterior, esmaltes sintéticos y accesorios. Te calculamos la cantidad según los metros que pintás.",
  },
  {
    name: "Construcción seca",
    slug: "construccion-seca",
    description:
      "Placas de yeso, perfiles metálicos, tornillería y masillas para tabiquería y cielorrasos.",
  },
  {
    name: "Fijaciones",
    slug: "fijaciones",
    description:
      "Tornillos, tarugos, bulones y anclajes. Caja cerrada y por unidad. Consultá medidas especiales.",
  },
  {
    name: "Gas",
    slug: "gas",
    description:
      "Flexibles, válvulas y conexiones certificadas para gas natural y envasado. Trabajamos con matriculados.",
  },
] as const;

export type CategoryName = (typeof CATEGORIES)[number]["name"];
export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

/** Slug URL-friendly a partir del nombre legible. */
export function categorySlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remover diacríticos
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Nombre legible a partir del slug. Devuelve undefined si no existe. */
export function categoryBySlug(slug: string): (typeof CATEGORIES)[number] | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

/** URL canónica de una categoría a partir de su nombre legible. */
export function categoryHref(name: string): string {
  return `/categorias/${categorySlug(name)}`;
}
