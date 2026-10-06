import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mq-scope mq-footer">
      <div className="mq-container">
        <div className="mq-footer-grid">
          <div>
            <div className="mq-brand">
              <i className="mq-brand-mark" />
              <div>
                MONARCA
                <small>TICKETS</small>
              </div>
            </div>
            <p className="mq-footer-note">Acceso, movimiento, transformación, experiencia.</p>
          </div>
          <div>
            <b>Explora</b>
            <Link href="/eventos" className="mq-link">Eventos</Link>
            <Link href="/calendario-fourvenues" className="mq-link">Calendario</Link>
            <Link href="/empresas" className="mq-link">Organizadores</Link>
            <Link href="/blog" className="mq-link">Blog</Link>
          </div>
          <div>
            <b>Ayuda</b>
            <Link href="/soporte" className="mq-link">Soporte</Link>
            <Link href="/preguntas-frecuentes" className="mq-link">Preguntas frecuentes</Link>
            <Link href="/pqrs" className="mq-link">PQRS</Link>
            <Link href="/nosotros" className="mq-link">Sobre nosotros</Link>
          </div>
          <div>
            <b>Legal</b>
            <Link href="/legal/condiciones" className="mq-link">Condiciones, privacidad y seguridad</Link>
            <Link href="/legal/cancelaciones" className="mq-link">Cancelaciones y cambios</Link>
            <Link href="/legal/consentimiento" className="mq-link">Preferencias de consentimiento</Link>
          </div>
        </div>
        <p className="mq-footer-legal">
          © {new Date().getFullYear()} Monarch Tickets S.A.S. (Monarca Tickets) · NIT 902095040-4 · Cali, Colombia ·
          Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
