import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Condiciones, privacidad y seguridad — Monarca Tickets",
};

export default function CondicionesPage() {
  return (
    <main className="container">
      <h1>Condiciones, privacidad y seguridad</h1>
      <p className="legal-meta">Última actualización: 1 de septiembre de 2026.</p>
      <p className="legal-disclaimer">
        Este documento fue redactado como plantilla inicial a partir de la información de constitución de Monarch
        Tickets S.A.S. y de las normas colombianas aplicables (Ley 1480 de 2011, Ley 1581 de 2012, Decreto 1377 de
        2013 y Ley 527 de 1999). Antes de publicarlo como versión definitiva, recomendamos que sea revisado por un
        abogado, ya que no reemplaza asesoría legal profesional.
      </p>

      <div className="prose">
        <h2>1. Quiénes somos</h2>
        <p>
          Monarca Tickets es la marca comercial bajo la cual opera <strong>Monarch Tickets S.A.S.</strong>, sociedad
          por acciones simplificada de nacionalidad colombiana, identificada con NIT 902095040-4, con domicilio
          principal en la Cra 83 # 15-94, Cali, Valle del Cauca, Colombia, y correo de contacto{" "}
          <a href="mailto:monarchpasstickets@gmail.com">monarchpasstickets@gmail.com</a>. Su objeto social incluye
          la intermediación, promoción, venta, distribución, emisión y reserva de entradas y boletería para
          espectáculos públicos, así como el diseño y operación de plataformas digitales de venta y control de
          acceso a eventos.
        </p>

        <h2>2. Aceptación de estos términos</h2>
        <p>
          Al registrarte, navegar o comprar boletos en Monarca Tickets (el &quot;Sitio&quot;), aceptas estas
          Condiciones de Uso, la Política de Privacidad y las demás políticas referenciadas en este documento. Si no
          estás de acuerdo con alguna de ellas, no debes usar el Sitio.
        </p>

        <h2>3. Nuestro rol como intermediarios</h2>
        <p>
          Monarca Tickets es una plataforma tecnológica que conecta a <strong>organizadores</strong> de eventos con{" "}
          <strong>compradores</strong> de boletos. Cada evento publicado en el Sitio es responsabilidad exclusiva del
          organizador que lo crea: la realización, fecha, contenido, cambios de lugar u horario, calidad del evento
          y cumplimiento de los permisos y licencias correspondientes son responsabilidad del organizador, no de
          Monarca Tickets. Monarca Tickets verifica el estado de habilitación tributaria de cada organizador antes
          de permitir la venta de boletos, pero no garantiza el contenido ni la realización del evento.
        </p>

        <h2>4. Cuentas de usuario</h2>
        <ul>
          <li>Debes registrarte con información veraz y mantenerla actualizada.</li>
          <li>Eres responsable de la confidencialidad de tu contraseña y de la actividad realizada desde tu cuenta.</li>
          <li>
            Existen tres tipos de cuenta: comprador, organizador y personal de puerta (staff), cada uno con
            funciones distintas dentro de la plataforma.
          </li>
          <li>Debes notificarnos de inmediato cualquier uso no autorizado de tu cuenta.</li>
        </ul>

        <h2>5. Compra de boletos y pagos</h2>
        <ul>
          <li>Los precios se muestran en pesos colombianos (COP) e incluyen los cargos que se indiquen antes del pago.</li>
          <li>
            El pago se procesa a través de <strong>Bold</strong>, pasarela de pagos autorizada en Colombia. Monarca
            Tickets no almacena los datos completos de tu tarjeta; estos son manejados directamente por la pasarela
            de pago bajo sus propios estándares de seguridad.
          </li>
          <li>El aforo de cada tipo de boleto es limitado; la compra queda confirmada únicamente cuando el pago es aprobado.</li>
          <li>El boleto digital (con código QR) se asocia a tu cuenta y es tu comprobante de acceso al evento.</li>
          <li>La factura electrónica ante la DIAN es emitida por el organizador habilitado para tal efecto.</li>
        </ul>

        <h2>6. Cancelaciones, cambios y reembolsos</h2>
        <p>
          Las condiciones de cancelación, cambio y reembolso de boletos se describen en detalle en nuestra{" "}
          <a href="/legal/cancelaciones">Política de cancelaciones y cambios</a>.
        </p>

        <h2>7. Uso aceptable</h2>
        <p>Al usar el Sitio, te comprometes a no:</p>
        <ul>
          <li>Usar bots, scrapers o medios automatizados para comprar boletos o extraer información del Sitio.</li>
          <li>Revender boletos a través de canales no autorizados por el organizador o suplantando a Monarca Tickets.</li>
          <li>Falsificar, duplicar o manipular boletos o códigos QR.</li>
          <li>Publicar contenido falso, ofensivo o que infrinja derechos de terceros.</li>
          <li>Intentar vulnerar la seguridad de la plataforma o acceder a cuentas de otros usuarios.</li>
        </ul>

        <h2>8. Propiedad intelectual</h2>
        <p>
          La marca Monarca Tickets, el logotipo, el diseño del Sitio y su software son propiedad de Monarch Tickets
          S.A.S. o se usan bajo licencia. El contenido de cada evento (nombre, imágenes, descripciones) es
          responsabilidad del organizador que lo publica.
        </p>

        <h2>9. Limitación de responsabilidad</h2>
        <p>
          Monarca Tickets no será responsable por la cancelación, aplazamiento o modificación de un evento por parte
          del organizador, ni por daños indirectos derivados del uso del Sitio, en la medida permitida por la ley
          colombiana. Nada en esta cláusula limita los derechos que te asisten como consumidor bajo la Ley 1480 de
          2011.
        </p>

        <h2>10. Seguridad de la información</h2>
        <p>
          Implementamos medidas técnicas y organizativas razonables para proteger tu información: conexiones
          cifradas (HTTPS), autenticación de usuarios, control de acceso por roles y procesamiento de pagos a través
          de una pasarela certificada. Ningún sistema es 100% infalible; si detectas una vulnerabilidad o actividad
          sospechosa, escríbenos a{" "}
          <a href="mailto:monarchpasstickets@gmail.com">monarchpasstickets@gmail.com</a>.
        </p>

        <h2>11. Política de tratamiento de datos personales</h2>
        <p>
          De conformidad con la Ley 1581 de 2012 y el Decreto 1377 de 2013, Monarch Tickets S.A.S. actúa como
          responsable del tratamiento de los datos personales que recolecta a través del Sitio.
        </p>
        <h3>11.1 Datos que recolectamos</h3>
        <ul>
          <li>Datos de registro: nombre, correo electrónico, teléfono.</li>
          <li>Datos de compra: eventos e historial de órdenes asociados a tu cuenta.</li>
          <li>
            Datos de organizadores: razón social, NIT, información de contacto y estado de habilitación tributaria.
          </li>
          <li>Datos técnicos básicos de navegación necesarios para el funcionamiento del Sitio.</li>
        </ul>
        <p>
          No solicitamos ni almacenamos el número completo de tu tarjeta de pago; ese dato lo procesa directamente
          la pasarela de pago.
        </p>
        <h3>11.2 Finalidad del tratamiento</h3>
        <ul>
          <li>Gestionar tu cuenta, tus compras y la entrega de tus boletos.</li>
          <li>Validar tu acceso a los eventos comprados.</li>
          <li>Comunicarnos contigo sobre tus órdenes, cambios de estado de un evento o soporte solicitado.</li>
          <li>Cumplir obligaciones legales y tributarias.</li>
          <li>Enviarte novedades sobre próximos eventos, solo si te suscribiste voluntariamente a nuestro boletín.</li>
        </ul>
        <h3>11.3 Tus derechos (derechos ARCO)</h3>
        <p>
          Como titular de tus datos personales tienes derecho a conocer, actualizar, rectificar y suprimir tu
          información, así como a revocar la autorización otorgada, en los términos de la Ley 1581 de 2012. Puedes
          ejercer estos derechos escribiendo a{" "}
          <a href="mailto:monarchpasstickets@gmail.com">monarchpasstickets@gmail.com</a> desde el correo asociado a
          tu cuenta. Más detalle sobre tus opciones de consentimiento está en nuestras{" "}
          <a href="/legal/consentimiento">Preferencias de consentimiento</a>.
        </p>

        <h2>12. Modificaciones</h2>
        <p>
          Podemos actualizar estas condiciones para reflejar cambios en la plataforma o en la normativa aplicable.
          Publicaremos la fecha de la última actualización en la parte superior de esta página.
        </p>

        <h2>13. Ley aplicable y jurisdicción</h2>
        <p>
          Estas condiciones se rigen por las leyes de la República de Colombia. Cualquier controversia se someterá a
          los jueces competentes del domicilio del consumidor, sin perjuicio de tu derecho a acudir a la
          Superintendencia de Industria y Comercio.
        </p>
      </div>
    </main>
  );
}
