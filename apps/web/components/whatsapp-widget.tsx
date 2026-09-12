"use client";

import { usePathname } from "next/navigation";
import { whatsappLink } from "@/lib/whatsapp";

// Boton flotante de WhatsApp, visible en todo el sitio publico. Se oculta
// en los paneles internos (CRM de admin y panel de organizador), donde un
// CTA comercial no aplica.
export function WhatsAppWidget() {
  const pathname = usePathname();

  if (pathname?.startsWith("/crm") || pathname?.startsWith("/panel")) {
    return null;
  }

  return (
    <a
      href={whatsappLink("Hola, quiero mas informacion sobre Monarca Tickets")}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-widget"
      aria-label="Escribenos por WhatsApp"
    >
      <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor" aria-hidden="true">
        <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20Zm4.4-5.9c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1-.7-.3-1.4-.7-2-1.3-.5-.5-1-1.1-1.4-1.8-.1-.2 0-.4.1-.5l.4-.5c.1-.1.2-.3.2-.4.1-.1.1-.3 0-.4-.1-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-.9.9-.9 2.2s1 2.6 1.1 2.7c.1.2 2 3 4.7 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.6-.1 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1-.1-.1-.2-.2-.4-.3Z" />
      </svg>
    </a>
  );
}
