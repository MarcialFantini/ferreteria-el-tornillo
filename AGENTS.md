# AGENTS.md — Ferretería El Tornillo

Notas operativas para sub-agentes que toquen este proyecto.

## Stack
- **Astro 7** + **Preact 10** + **`@preact/signals`** (islas interactivas).
- **Tailwind CSS v4** con `@tailwindcss/vite` y design tokens en `@theme` (no PostCSS).
- **TypeScript 6**, output static, content collections con `glob()` + Zod.
- **Bunny Fonts** (mirror libre de Google Fonts) — `fonts.bunny.net`, sin tracking.

## Comandos
- `pnpm install` — instalar dependencias (exclusivamente pnpm).
- `pnpm dev` — dev server (puerto libre, default 4321).
- `pnpm build` — build de producción a `dist/`.
- `pnpm preview` — servir el build.
- `pnpm astro sync` — regenerar tipos de content collections si cambia el schema.
- `pnpm astro check` — typecheck + diagnostics de `.astro`.

## Single sources of truth
- **Número de WhatsApp**: `src/lib/whatsapp.ts` exporta `PHONE`, `PHONE_FORMATTED`, `PHONE_TEL`. Cualquier `<a href="https://wa.me/...">` o `<a href="tel:...">` DEBE usar estos. Nunca hardcodear `5491145678900` ni `+54 9 11 4567-8900`.
- **Mensajes pre-armados**: `whatsappLink(message)` y `productMessage(p)` viven en el mismo archivo.
- **Estado global (carrito / favoritos / comparador / vistos)**: `src/lib/cart.ts` exporta signals (`items`, `count`, `subtotal`, `favorites`, `compareList`, `recent`) y helpers (`add`, `remove`, `setQty`, `clear`, `toggleFavorite`, `toggleCompare`, `markViewed`). Las islas Preact los consumen directo (sin Context.Provider).
- **Schema de productos**: `src/content.config.ts`. Si cambia el schema, correr `pnpm astro sync`.

## Identidad visual — Design System v2
- **Paleta**: navy `#1A2B4A` (texto/CTAs), mustard `#D4A04C` (acentos), cream `#F5F0E6` (fondo), mark `#B83A1E` (alertas), sage `#4A6741` (éxito).
- **Tipografía**: Inter pesos 400-900 (sans única, también display), JetBrains Mono pesos 400-700 (precios/SKUs).
- **NO usar**: Fraunces, gradientes, cream+brass premium-DTC, emojis decorativos.
- Tokens definidos en `src/styles/global.css` bajo `@theme`. Aliases legacy (`--color-rivet`, `--color-steel`, `--color-kraft`, etc.) apuntan a los nuevos tokens — mantener para compatibilidad.
