import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const products = defineCollection({
  // Markdown con frontmatter: descripción larga en el body,
  // metadata estructurada en el frontmatter.
  loader: glob({ pattern: '**/*.md', base: './src/content/products' }),
  schema: z.object({
    name: z.string(),
category: z.enum([
      'Herramientas manuales',
      'Herramientas eléctricas',
      'Plomería',
      'Electricidad',
      'Pinturería',
      'Construcción seca',
      'Fijaciones',
      'Gas',
      'Jardín',
      'Seguridad',
    ]),
    price: z.number().positive(),
    // Stock en unidades enteras; -1 = consultar (sin stock publicado).
    stock: z.number().int(),
    sku: z.string(),
    image: z.string(),
    imageAlt: z.string(),
    // Producto destacado: aparece en home y al tope del catálogo.
    featured: z.boolean().default(false),
    // Oferta: precio tachado anterior. Si está definido, el producto aparece en /#ofertas y muestra el descuento.
    comparePrice: z.number().positive().optional(),
    // Más vendido: indicador editorial.
    bestSeller: z.boolean().default(false),
    // Rating editorial promedio (1-5) para reseñas semilla.
    rating: z.number().min(1).max(5).optional(),
    // Tags cortos que se matchean en el buscador además del nombre.
    tags: z.array(z.string()).default([]),
    // Marca o fabricante.
    brand: z.string().optional(),
    publishedAt: z.coerce.date(),
  }),
});

export const collections = { products };


