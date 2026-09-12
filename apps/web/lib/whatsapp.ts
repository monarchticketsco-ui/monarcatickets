// Numero de WhatsApp Business de Monarca Tickets, usado por el widget
// flotante, el footer y el CTA del portal empresas.
export const WHATSAPP_NUMBER = "573015601059";

export function whatsappLink(mensaje?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return mensaje ? `${base}?text=${encodeURIComponent(mensaje)}` : base;
}
