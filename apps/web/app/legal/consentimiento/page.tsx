import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Preferencias de consentimiento — Monarca Tickets",
};

export default function ConsentimientoPage() {
  return (
    <main className="container">
      <h1>Preferencias de consentimiento</h1>
      <p className="legal-meta">Última actualización: 1 de septiembre de 2026.</p>
      <p className="legal-disclaimer">
        Plantilla inicial conforme a la Ley 1581 de 2012 y el Decreto 1377 de 2013 (protección de datos personales
        y habeas data). Recomendamos revisión legal antes de publicarla como versión definitiva.
      </p>

      <div className="prose">
        <h2>1. Tu autorización</h2>
        <p>
          Al crear una cuenta en Monarca Tickets, autorizas a Monarch Tickets S.A.S. a tratar tus datos personales
          (nombre, correo, teléfono, historial de compras) para los fines descritos en nuestra{" "}
          <a href="/legal/condiciones">Política de privacidad</a>: gestionar tu cuenta, procesar tus compras,
          validar tu acceso a los eventos y contactarte sobre el estado de tus órdenes.
        </p>

        <h2>2. Boletín de novedades (opcional)</h2>
        <p>
          Si dejas tu correo en el formulario de suscripción del sitio, nos autorizas adicionalmente a escribirte
          con información sobre próximos eventos. Esta autorización es independiente y puedes retirarla en cualquier
          momento respondiendo &quot;cancelar suscripción&quot; a cualquiera de nuestros correos, o escribiendo a{" "}
          <a href="mailto:monarchpasstickets@gmail.com">monarchpasstickets@gmail.com</a>.
        </p>

        <h2>3. Datos que no compartimos con terceros para fines comerciales</h2>
        <p>
          No vendemos ni alquilamos tu información personal a terceros. Compartimos únicamente lo estrictamente
          necesario con: (i) la pasarela de pagos Bold, para procesar tu compra; (ii) el organizador del evento al
          que compraste boletos, para efectos de validación de acceso y, cuando aplique, facturación; y (iii)
          autoridades, cuando exista un requerimiento legal.
        </p>

        <h2>4. Cookies y tecnologías similares</h2>
        <p>
          Hoy el Sitio utiliza únicamente las cookies técnicas necesarias para mantener tu sesión iniciada
          (autenticación) — no usamos cookies de publicidad ni de rastreo de terceros. Si en el futuro
          incorporamos herramientas de analítica o publicidad, actualizaremos esta sección antes de activarlas.
        </p>

        <h2>5. Cómo ejercer tus derechos ARCO</h2>
        <p>Como titular de tus datos, en cualquier momento puedes solicitar:</p>
        <ul>
          <li><strong>Acceso</strong> — conocer qué datos tuyos tenemos.</li>
          <li><strong>Rectificación</strong> — corregir datos inexactos o incompletos.</li>
          <li><strong>Cancelación</strong> — suprimir tus datos cuando ya no sean necesarios o retires tu autorización.</li>
          <li><strong>Oposición</strong> — oponerte a un tratamiento específico de tus datos.</li>
        </ul>
        <p>
          Para ejercer cualquiera de estos derechos, escríbenos a{" "}
          <a href="mailto:monarchpasstickets@gmail.com">monarchpasstickets@gmail.com</a> desde el correo asociado a
          tu cuenta, indicando el derecho que deseas ejercer. Responderemos dentro de los términos que establece la
          Ley 1581 de 2012.
        </p>

        <h2>6. Revocar tu autorización</h2>
        <p>
          Puedes revocar la autorización para el tratamiento de tus datos en cualquier momento. Ten en cuenta que
          esto puede implicar la imposibilidad de mantener tu cuenta activa o de acceder a boletos ya comprados
          desde la plataforma, por lo que te recomendamos guardar tus boletos antes de solicitar la eliminación de
          tu cuenta.
        </p>
      </div>
    </main>
  );
}
