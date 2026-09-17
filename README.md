# Ferretería El Tornillo — Catálogo online

Catálogo online para una ferretería familiar de zona oeste de GBA. Muestra stock, precios y categorías, y deriva cada consulta a WhatsApp.

## Problema

La ferretería no tiene e-commerce pero quiere exhibir su stock online. Los clientes revisan el catálogo y, antes de ir al local, mandan una consulta por WhatsApp con el producto ya cargado. Así se evita el viaje perdido por algo que se agotó en la mañana o cambió de precio.

## Solución

Tres páginas estáticas con Astro + Tailwind:

- **Home** con hero, categorías destacadas, métricas del local y CTA a WhatsApp.
- **Catálogo** (`/productos`) con grilla de los 19 productos, filtros por categoría, rango de precio y buscador — todo del lado del cliente en una isla Preact (`client:load`).
- **Ficha de producto** (`/productos/[slug]`) con galería, descripción en markdown, metadata estructurada y botón directo a WhatsApp con el mensaje pre-armado por producto.

Todo el stock vive en una Content Collection con schema validado en build. Los placeholders de imagen son SVGs generados por script con la misma paleta que la UI para que el sistema se vea coherente hasta tener fotografía real.

## Stack

- [Astro 7](https://astro.build/) — generador estático, islas con `client:load` solo donde hace falta.
- [Tailwind CSS v4](https://tailwindcss.com/) con el plugin oficial de Vite (`@tailwindcss/vite`) y design tokens en `@theme`.
- [Preact](https://preactjs.com/) para la isla del catálogo (más liviano que React).
- Content Collections de Astro con `glob()` + Zod para validar frontmatter.
- pnpm como package manager único. Lockfile `pnpm-lock.yaml` versionado.

## Cómo correrlo

```bash
# 1) Instalar dependencias (pnpm exclusivamente)
pnpm install

# 2) Regenerar tipos si tocás el schema de la colección
pnpm astro sync

# 3) Levantar el dev server
pnpm dev
# Astro elige el puerto libre — por defecto 4321

# 4) Build de producción
pnpm build
pnpm preview
```

### Scripts auxiliares

Hay dos generadores idempotentes en `scripts/`. Si agregás un producto nuevo al array, volvé a correrlos:

```bash
node scripts/generate-product-content.mjs   # crea el .md en src/content/products/
node scripts/generate-product-images.mjs    # crea el .svg en public/images/products/
```

## Estructura

```
src/
  content.config.ts              # schema Zod de la colección 'products'
  content/products/*.md          # 19 productos seed
  components/
    Brand.astro                  # isologotipo del tornillo
    Header.astro                 # nav sticky + búsqueda futura + menú mobile
    Footer.astro                 # horarios, dirección, WhatsApp
    ProductCard.astro            # tarjeta reutilizable (grilla, listas, relacionados)
    Catalog.tsx                  # isla Preact: filtros + búsqueda + orden
  layouts/Layout.astro           # layout base, skip link, meta
  lib/
    format.ts                    # formatPrice, stockLabel
    whatsapp.ts                  # construcción de wa.me/?text=...
  pages/
    index.astro                  # home
    productos/index.astro        # catálogo
    productos/[slug].astro       # ficha dinámica por slug
  styles/global.css              # tokens + reset + utilities base
public/
  images/products/*.svg          # placeholders generados
  favicon.svg
scripts/
  generate-product-content.mjs
  generate-product-images.mjs
```

## Decisiones técnicas relevantes

- **Astro + Preact (no React):** la isla del catálogo es liviana (~3 KB gzipped de runtime), no justifica React. Tailwind v4 con `@tailwindcss/vite` reemplaza el plugin de PostCSS.
- **Content Collections con markdown:** la descripción del producto se beneficia de un cuerpo de markdown. El metadata estructurado (precio, stock, SKU) queda en el frontmatter, validado con Zod al build.
- **Sin e-commerce real:** cada producto tiene un link directo a `wa.me/` con un mensaje pre-armado por producto. La URL se construye desde `src/lib/whatsapp.ts` para tener un único punto de cambio si se actualiza el número o el template.
- **Mobile-first:** los filtros viven en un panel lateral en desktop (`lg:sticky`) y apilados en mobile. El header colapsa a hamburguesa bajo `md`. Todo el grid colapsa a una columna bajo `sm` y dos bajo `sm:grid-cols-2`.
- **Diseño honesto, no premium-DTC:** paleta papel cálido (`#F5F2EA`) + tinta casi negro (`#171513`) + rojo industrial (`#B63828`) + ámbar (`#C28E3F`). Mono (`JetBrains Mono`) para precios y SKUs. Evita el cliché cream+brass del consumer premium.
- **Placeholders SVG generados:** los 19 placeholders son SVGs con estética "pliego técnico" (corners con crosshair marks), no son fotos de stock. Cuando se reemplacen por fotos reales, alcanza con pisar el archivo y el frontmatter no cambia.

## Accesibilidad

- Skip link al contenido principal desde el layout.
- Atributos `aria-label`, `aria-current`, `aria-controls`, `aria-expanded` en navegación y menú mobile.
- Inputs con `<label>` real (no placeholder-as-label).
- Imágenes con `alt` específico por producto, no decorativas sin descripción.
- Foco visible con outline de contraste (`var(--color-rivet)` sobre `var(--color-paper)`).
- Respeta `prefers-reduced-motion`: anula todas las transiciones/animaciones globales.
- Contraste de texto: `#171513` sobre `#F5F2EA` mide ~16:1 (AAA).

## Performance

- Static output: cada producto es un HTML pre-renderizado.
- Una sola isla Preact en `/productos` (~3 KB runtime).
- Sin imágenes raster — los placeholders son SVG inline-friendly (3-4 KB cada uno).
- Imágenes con `loading="lazy"` (excepto hero) y `decoding="async"`.
- Sin Google Fonts en producción: el `@font-face` referencia `local()` con fallback a `system-ui`.

## Criterio de aceptación

| Criterio | Estado |
|---|---|
| Productos vienen de Content Collections (`src/content/products/`) | PASS |
| Filtros de categoría/precio funcionan sin recargar (isla Preact `client:load`) | PASS |
| 12+ productos seed con datos realistas | PASS (19) |
| Mobile-first: filtros usables en mobile | PASS |
| Sin dependencias de npm/yarn | PASS (solo pnpm) |
