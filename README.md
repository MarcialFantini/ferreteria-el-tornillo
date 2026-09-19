# Ferretería El Tornillo — Catálogo online

Catálogo online para una ferretería familiar de zona oeste de GBA. Muestra stock, precios y categorías, y deriva cada consulta a WhatsApp.

## Problema

La ferretería no tiene e-commerce pero quiere exhibir su stock online. Los clientes revisan el catálogo y, antes de ir al local, mandan una consulta por WhatsApp con el producto ya cargado. Así se evita el viaje perdido por algo que se agotó en la mañana o cambió de precio.

## Solución

Nueve páginas estáticas con Astro + Tailwind + Preact como islas. La home exhibe lo más consultado y empuja a WhatsApp. El catálogo (`/productos`) filtra los 40 productos del lado del cliente con una isla Preact `client:load`. Cada ficha (`/productos/[slug]`) tiene galería, descripción en markdown, reseñas y botón directo a WhatsApp con el mensaje pre-armado por producto.

El cliente puede armar un carrito, marcar favoritos, comparar hasta tres productos lado a lado y consultar por WhatsApp desde cualquiera de esos flujos. Todo el stock vive en una Content Collection con schema validado en build. Los placeholders de imagen son SVGs generados por script con la misma paleta que la UI para que el sistema se vea coherente hasta tener fotografía real.

## Stack

- [Astro 7](https://astro.build/) — generador estático, islas con `client:load` solo donde hace falta.
- [Tailwind CSS v4](https://tailwindcss.com/) con el plugin oficial de Vite (`@tailwindcss/vite`) y design tokens en `@theme`.
- [Preact](https://preactjs.com/) + [`@preact/signals`](https://preactjs.com/guide/v10/signals/) para las islas interactivas (catálogo, carrito, favoritos, comparador). Preact pesa ~3 KB gzipped de runtime frente a los ~45 KB de React; para esta escala no se justifica React.
- Content Collections de Astro con `glob()` + Zod para validar frontmatter.
- [Bunny Fonts](https://fonts.bunny.net/) como mirror libre de Google Fonts, sin tracking ni requests a `fonts.googleapis.com`.
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
  content.config.ts                  # schema Zod de la colección 'products'
  content/products/*.md              # 40 productos seed (10 categorías)
  components/
    Brand.astro                      # isologotipo del tornillo
    Header.astro                     # nav sticky + SearchBar + Cart + Favoritos
    Footer.astro                     # horarios, dirección, WhatsApp
    ProductCard.astro                # tarjeta estática reutilizable
    ProductActions.tsx               # isla Preact: Add-to-Cart, favorite, compare
    ProductFilters.tsx               # filtros del catálogo
    Catalog.tsx                      # isla Preact: catálogo denso
    SearchBar.tsx                    # buscador con atajos de teclado
    CartButton.tsx                   # chip con conteo del carrito
    CartDrawer.tsx                   # drawer lateral del carrito
    FavoriteButton.tsx               # botón corazón (toggle wishlist)
    FavoriteChip.tsx                 # chip con conteo de favoritos
    FavoritesGrid.tsx                # grid de productos guardados
    CompareButton.tsx                # botón agregar/quitar del comparador
    CompareView.tsx                  # tabla comparativa (max 3)
    RecentStrip.tsx                  # strip de productos vistos recientemente
    Reviews.tsx                      # reseñas (signal-based)
    ShareButtons.tsx                 # compartir producto
    Toast.tsx                        # feedback ephemeral
  layouts/Layout.astro               # layout base, skip link, SEO meta
  lib/
    format.ts                        # formatPrice, stockLabel
    whatsapp.ts                      # PHONE, whatsappLink, productMessage (single source of truth)
    cart.ts                          # signals: items, count, subtotal, favorites, compareList, recent
  data/
    categories.ts                    # mapa de categorías y slugs
  pages/
    index.astro                      # home
    productos/index.astro            # catálogo
    productos/[slug].astro           # ficha dinámica por slug
    categorias/index.astro           # índice de categorías
    categorias/[slug].astro          # listado por categoría
    nosotros/index.astro             # historia de la ferretería
    envios/index.astro               # zonas, plazos y costos de envío
    donde-encontrarnos/index.astro   # dirección, horarios, mapa SVG
    contacto/index.astro             # canales de contacto
    comparar.astro                   # comparador de productos
    favoritos.astro                  # productos guardados
  styles/global.css                  # design tokens + reset + utilities
public/
  images/products/*.svg              # placeholders generados
  favicon.svg                        # isologotipo en paleta v2
  og-default.svg                     # OG image 1200×630 para SEO
scripts/
  generate-product-content.mjs
  generate-product-images.mjs
```

## Identidad visual

El proyecto migró del spec original (rivet/steel/kraft — `#F4B41A` / `#2A2D34` / `#E8DCC4`) a una paleta más editorial y consistente:

- **Navy** `#1A2B4A` — color principal (texto, headers, CTAs, separadores).
- **Mustard** `#D4A04C` — color de acento (CTAs secundarios, descuentos, badges).
- **Cream** `#F5F0E6` — fondo principal, papel cálido.
- **Mark** `#B83A1E` — rojo industrial para alertas (sin stock, quit).
- **Sage** `#4A6741` — verde sobrio para "en stock" / confirmaciones.
- **Line** `#D6CDB4` — bordes finos y divisorias.

Se mantienen aliases legacy (`--color-rivet`, `--color-steel`, `--color-kraft`, `--color-paper`, `--color-ink`) apuntando a los nuevos tokens para no romper componentes preexistentes.

Tipografía: **Inter** pesos 400-900 como sans única (UI + display + headings). **JetBrains Mono** para precios, SKUs y datos numéricos. Se sacó **Fraunces** del stack por inconsistente con el resto del portfolio.

Elementos distintivos:
- Grids técnicos visibles (estilo blueprint en hero y secciones de mapa).
- Crosshair marks en esquinas de tarjetas (`.crosshair` utility).
- SVGs planos estilo plano técnico / industrial.
- Tablas densas con líneas finas (`.spec-table`).
- Mono en precios y SKUs (no serif, no italic).

## Decisiones técnicas relevantes

- **Astro + Preact (no React):** las islas son livianas (~3 KB gzipped de runtime Preact + signals), no justifican React. Tailwind v4 con `@tailwindcss/vite` reemplaza el plugin de PostCSS y carga los `@theme` tokens nativamente.
- **Content Collections con markdown:** la descripción del producto se beneficia de un cuerpo de markdown. El metadata estructurado (precio, stock, SKU) queda en el frontmatter, validado con Zod al build.
- **Sin e-commerce real:** cada producto tiene un link directo a `wa.me/` con un mensaje pre-armado por producto. La URL se construye desde `src/lib/whatsapp.ts` (exporta `PHONE`, `PHONE_FORMATTED`, `whatsappLink`, `productMessage`) — único punto de cambio si se actualiza el número o el template.
- **Mobile-first:** los filtros viven en un panel lateral en desktop (`lg:sticky`) y apilados en mobile. El header colapsa a hamburguesa bajo `md`. Todo el grid colapsa a una columna bajo `sm` y dos bajo `sm:grid-cols-2`.
- **Catálogo de 40 productos (no 19):** se duplicó el seed original para cubrir las 10 categorías con datos más realistas (precios, stock, marcas, tags) y soportar mejor los flujos de búsqueda y filtros.
- **Bunny Fonts en vez de Google Fonts:** mirror libre sin tracking, sin requests a `fonts.googleapis.com` ni `fonts.gstatic.com`. Cumple mejor con RGPD y no afecta performance.
- **Signals globales:** `src/lib/cart.ts` exporta signals (`items`, `favorites`, `compareList`, `recent`) que cualquier isla Preact puede consumir sin necesidad de un Context.Provider por árbol. Eso permite que el chip de favoritos en el header se actualice al instante cuando el usuario toggle desde una card del catálogo.
- **SEO completo:** `Layout.astro` incluye Open Graph, Twitter Card y canonical link. Hay un `og-default.svg` 1200×630 en la paleta v2 para previews sociales.

## Accesibilidad

- Skip link al contenido principal desde el layout.
- Atributos `aria-label`, `aria-current`, `aria-controls`, `aria-expanded` en navegación y menú mobile.
- Inputs con `<label>` real (no placeholder-as-label).
- Imágenes con `alt` específico por producto, no decorativas sin descripción.
- Foco visible con outline de contraste (`var(--color-mustard)` sobre `var(--color-cream)`).
- Respeta `prefers-reduced-motion`: anula todas las transiciones/animaciones globales.
- Catálogo anuncia cambios de filtro a screen readers con `aria-live="polite"` en la región de resultados.
- Escape limpia los filtros activos del catálogo cuando hay alguno.
- Contraste de texto: `#1A2B4A` sobre `#F5F0E6` mide ~13:1 (AAA).

## Performance

- Static output: cada producto es un HTML pre-renderizado.
- Islas Preact aisladas (catálogo, comparador, favoritos, carrito, reseñas). El resto es HTML estático.
- Sin imágenes raster — los placeholders son SVG inline-friendly (3-4 KB cada uno).
- Imágenes con `loading="lazy"` (excepto hero) y `decoding="async"`.
- Bunny Fonts con `preconnect` para evitar round-trip en el primer paint.
- `@font-face` con `local()` para fallback a sistema si Bunny Fonts está bloqueado.

## Criterio de aceptación

| Criterio | Estado |
|---|---|
| Productos vienen de Content Collections (`src/content/products/`) | PASS |
| Filtros de categoría/precio funcionan sin recargar (isla Preact `client:load`) | PASS |
| 12+ productos seed con datos realistas | PASS (40) |
| Mobile-first: filtros usables en mobile | PASS |
| Sin dependencias de npm/yarn | PASS (solo pnpm) |
| Carrito, favoritos y comparador persistidos en localStorage | PASS |
| SEO meta + Open Graph + Twitter Card en cada página | PASS |
| Sin número de WhatsApp hardcodeado (single source of truth) | PASS |
