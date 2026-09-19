// src/lib/whatsapp.ts
// Single source of truth para el número de WhatsApp y los mensajes
// pre-armados. Cualquier cambio de número, formato o copy vive acá.
//
// `PHONE` es el número crudo en formato wa.me (sin `+`, sin espacios).
// `PHONE_FORMATTED` es el mismo número pero legible para mostrar al usuario.
// `whatsappLink(message)` arma el link wa.me/...?text=... listo para usar.
// `productMessage(p)` arma el mensaje específico para un producto.

export const PHONE = "5491145678900";
export const PHONE_FORMATTED = "+54 9 11 4567-8900";
export const PHONE_TEL = `+${PHONE}`;

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
