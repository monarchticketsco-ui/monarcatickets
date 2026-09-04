import type { ReactElement } from "react";
import Link from "next/link";
import { NewsletterForm } from "./newsletter-form";

const CORREO_CONTACTO = "monarchpasstickets@gmail.com";

const REDES = [
  { nombre: "WhatsApp", href: "#" },
  { nombre: "TikTok", href: "#" },
  { nombre: "YouTube", href: "#" },
  { nombre: "Instagram", href: "#" },
  { nombre: "X", href: "#" },
  { nombre: "Facebook", href: "#" },
];

const ICONOS: Record<string, ReactElement> = {
  WhatsApp: (
    <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20Zm4.4-5.9c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1-.7-.3-1.4-.7-2-1.3-.5-.5-1-1.1-1.4-1.8-.1-.2 0-.4.1-.5l.4-.5c.1-.1.2-.3.2-.4.1-.1.1-.3 0-.4-.1-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-.9.9-.9 2.2s1 2.6 1.1 2.7c.1.2 2 3 4.7 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.6-.1 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1-.1-.1-.2-.2-.4-.3Z" />
  ),
  TikTok: (
    <path d="M16.6 2h-3.2v13.4a2.6 2.6 0 1 1-2.1-2.6v-3.3a5.9 5.9 0 1 0 5.3 5.9V8.6a7.9 7.9 0 0 0 4.4 1.4V6.8a4.6 4.6 0 0 1-4.4-4.8Z" />
  ),
  YouTube: (
    <path d="M21.6 7.2a2.7 2.7 0 0 0-1.9-1.9C18 5 12 5 12 5s-6 0-7.7.3A2.7 2.7 0 0 0 2.4 7.2 28 28 0 0 0 2 12a28 28 0 0 0 .4 4.8 2.7 2.7 0 0 0 1.9 1.9C6 19 12 19 12 19s6 0 7.7-.3a2.7 2.7 0 0 0 1.9-1.9A28 28 0 0 0 22 12a28 28 0 0 0-.4-4.8ZM10 15V9l5 3-5 3Z" />
  ),
  Instagram: (
    <path d="M12 2.2c2.7 0 3 0 4 .1 1 0 1.7.2 2.1.4.5.2.9.5 1.3.9.4.4.7.8.9 1.3.2.4.3 1.1.4 2.1.1 1 .1 1.3.1 4s0 3-.1 4c0 1-.2 1.7-.4 2.1-.2.5-.5.9-.9 1.3-.4.4-.8.7-1.3.9-.4.2-1.1.3-2.1.4-1 .1-1.3.1-4 .1s-3 0-4-.1c-1 0-1.7-.2-2.1-.4a3.5 3.5 0 0 1-1.3-.9 3.5 3.5 0 0 1-.9-1.3c-.2-.4-.3-1.1-.4-2.1-.1-1-.1-1.3-.1-4s0-3 .1-4c0-1 .2-1.7.4-2.1.2-.5.5-.9.9-1.3.4-.4.8-.7 1.3-.9.4-.2 1.1-.3 2.1-.4 1-.1 1.3-.1 4-.1Zm0 1.8c-2.6 0-2.9 0-4 .1-.8 0-1.3.2-1.6.3-.4.1-.7.3-1 .6-.3.3-.5.6-.6 1-.1.3-.3.8-.3 1.6-.1 1.1-.1 1.4-.1 4s0 2.9.1 4c0 .8.2 1.3.3 1.6.1.4.3.7.6 1 .3.3.6.5 1 .6.3.1.8.3 1.6.3 1.1.1 1.4.1 4 .1s2.9 0 4-.1c.8 0 1.3-.2 1.6-.3.4-.1.7-.3 1-.6.3-.3.5-.6.6-1 .1-.3.3-.8.3-1.6.1-1.1.1-1.4.1-4s0-2.9-.1-4c0-.8-.2-1.3-.3-1.6a2.6 2.6 0 0 0-.6-1 2.6 2.6 0 0 0-1-.6c-.3-.1-.8-.3-1.6-.3-1.1-.1-1.4-.1-4-.1Zm0 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4Zm5.2-2a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Z" />
  ),
  X: (
    <path d="M18.9 2H22l-7.2 8.2L23 22h-6.6l-5.2-6.8L5.2 22H2l7.7-8.8L1.5 2h6.8l4.7 6.2L18.9 2Zm-1.2 18h1.7L7.4 3.9H5.6L17.7 20Z" />
  ),
  Facebook: (
    <path d="M13.5 22v-8.4h2.8l.4-3.3h-3.2V8.1c0-1 .3-1.6 1.7-1.6h1.6V3.5C16.5 3.4 15.4 3.3 14.3 3.3c-2.4 0-4 1.5-4 4.2v2.8H7.5v3.3h2.8V22h3.2Z" />
  ),
};

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container site-footer-grid">
        <div className="footer-col">
          <h4>Información</h4>
          <ul>
            <li>
              <Link href="/legal/condiciones">Condiciones, privacidad y seguridad</Link>
            </li>
            <li>
              <Link href="/legal/cancelaciones">Cancelaciones y cambios</Link>
            </li>
            <li>
              <Link href="/soporte">Solicitud soporte de compra</Link>
            </li>
            <li>
              <Link href="/legal/consentimiento">Preferencias de consentimiento</Link>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Contáctenos</h4>
          <ul>
            <li>
              <Link href="/nosotros">Sobre nosotros</Link>
            </li>
            <li>
              <Link href="/pqrs">PQRS</Link>
            </li>
            <li>
              <Link href="/empresas">Venda su evento</Link>
            </li>
            <li>
              <Link href="/personas">Compre boletos</Link>
            </li>
            <li>
              <Link href="/preguntas-frecuentes">Preguntas frecuentes</Link>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Opciones del sitio</h4>
          <p className="footer-label">Su ubicación</p>
          <p className="footer-value">Colombia</p>
          <p className="footer-label" style={{ marginTop: 14 }}>
            Idioma
          </p>
          <p className="footer-value">Español</p>
        </div>

        <div className="footer-col">
          <h4>Síguenos</h4>
          <NewsletterForm correoContacto={CORREO_CONTACTO} />
          <div className="footer-social">
            {REDES.map((r) => (
              <a key={r.nombre} href={r.href} aria-label={r.nombre} className="footer-social-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                  {ICONOS[r.nombre]}
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} Monarch Tickets S.A.S. (Monarca Tickets) · NIT 902095040-4 · Cali, Colombia ·
          Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
