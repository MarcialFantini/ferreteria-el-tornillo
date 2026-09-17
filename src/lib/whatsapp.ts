// src/lib/whatsapp.ts
// Helper para construir el enlace wa.me con mensaje pre-armado
// según producto. Centraliza el número y el formato del mensaje.

const PHONE = "5491145678900";

export function whatsappLink(message: string): string {
  const params = new URLSearchParams({ text: message });
  return `https://wa.me/${PHONE}?${params.toString()}`;
}

export function productMessage(p: {
  name: string;
  sku: string;
  category: string;
}): string {
  return (
    `Hola, vi "${p.name}" (SKU ${p.sku}) en el catálogo online ` +
    `y quiero consultar disponibilidad y precio final. ` +
    `¿Lo tienen en stock?`
  );
}
