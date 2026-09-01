import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cancelaciones y cambios — Monarca Tickets",
};

export default function CancelacionesPage() {
  return (
    <main className="container">
      <h1>Cancelaciones y cambios</h1>
      <p className="legal-meta">Última actualización: 1 de septiembre de 2026.</p>
      <p className="legal-disclaimer">
        Plantilla inicial basada en el Estatuto del Consumidor colombiano (Ley 1480 de 2011). Los espectáculos
        públicos están exceptuados del derecho de retracto general de comercio electrónico cuando la venta indica
        una fecha o periodo de ejecución específico, como es el caso de los boletos para eventos; aun así, aplican
        las reglas de cancelación por parte del organizador descritas abajo. Recomendamos validar este texto con un
        abogado antes de publicarlo como versión definitiva.
      </p>

      <div className="prose">
        <h2>1. Evento cancelado por el organizador</h2>
        <p>
          Si un evento es cancelado definitivamente por su organizador, tienes derecho al reembolso del valor pagado
          por tus boletos. Monarca Tickets notificará la cancelación a los compradores por correo electrónico y
          coordinará con el organizador el proceso de reembolso, que se realizará por el mismo medio de pago
          utilizado en la compra, dentro de los plazos que establece la ley.
        </p>

        <h2>2. Evento aplazado o reprogramado</h2>
        <p>
          Si el organizador aplaza o reprograma la fecha del evento, tu boleto sigue siendo válido para la nueva
          fecha. Si no puedes asistir en la nueva fecha, tienes derecho a solicitar el reembolso dentro del plazo
          que se comunique junto con el aviso de reprogramación.
        </p>

        <h2>3. Cambio de lugar o condiciones sustanciales</h2>
        <p>
          Si el organizador cambia el lugar del evento u otra condición sustancial anunciada al momento de la
          compra, puedes solicitar el reembolso de tu boleto siguiendo el mismo procedimiento de esta política.
        </p>

        <h2>4. Compra por error o duplicada</h2>
        <p>
          Si realizaste una compra duplicada por un error técnico de la plataforma (por ejemplo, dos cobros por una
          misma orden), contáctanos a través de{" "}
          <a href="/soporte">Solicitud de soporte de compra</a> con el número de referencia de tu orden; validaremos
          el caso y gestionaremos el reembolso del cobro duplicado.
        </p>

        <h2>5. Cambio de titular del boleto</h2>
        <p>
          Algunos organizadores permiten la transferencia de boletos a otra persona antes del evento. Esta opción
          depende de cada organizador y, cuando esté disponible, podrás gestionarla desde tu cuenta en{" "}
          <a href="/mi-cuenta">Mi cuenta</a>.
        </p>

        <h2>6. Boletos ya utilizados</h2>
        <p>
          Un boleto cuyo código QR ya fue escaneado en el ingreso al evento se considera utilizado y no es elegible
          para reembolso.
        </p>

        <h2>7. Cómo solicitar un reembolso</h2>
        <p>
          Escríbenos desde <a href="/soporte">Solicitud de soporte de compra</a> indicando el evento, la referencia
          de tu orden y el motivo de la solicitud. Evaluaremos cada caso según esta política y la información
          suministrada por el organizador del evento.
        </p>
      </div>
    </main>
  );
}
