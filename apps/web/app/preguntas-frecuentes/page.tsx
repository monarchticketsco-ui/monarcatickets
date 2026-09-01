import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Preguntas frecuentes — Monarca Tickets",
};

const PREGUNTAS = [
  {
    q: "¿Cómo compro un boleto?",
    a: "Busca el evento desde la portada o /eventos, entra al detalle del evento, elige el tipo de boleto y cantidad, y completa el pago con Bold. Tu boleto queda asociado a tu cuenta apenas el pago se confirma.",
  },
  {
    q: "¿Con qué medios de pago puedo pagar?",
    a: "El pago se procesa a través de Bold, una pasarela de pagos autorizada en Colombia que acepta tarjetas y otros medios habilitados en su plataforma.",
  },
  {
    q: "¿Dónde encuentro mis boletos después de comprar?",
    a: "En tu cuenta, dentro de Mi cuenta, verás el historial de tus órdenes y el estado de cada una.",
  },
  {
    q: "¿Qué pasa si el evento se cancela o cambia de fecha?",
    a: "Revisa nuestra política de cancelaciones y cambios: si el organizador cancela el evento tienes derecho a reembolso, y si lo reprograma tu boleto sigue siendo válido para la nueva fecha.",
  },
  {
    q: "¿Puedo pedir un reembolso si cambio de opinión?",
    a: "Los boletos para espectáculos con fecha determinada no tienen derecho de retracto general, salvo cancelación, reprogramación o cambio sustancial del evento por parte del organizador. Ver /legal/cancelaciones para el detalle.",
  },
  {
    q: "¿Cómo recibo la factura de mi compra?",
    a: "La factura electrónica es emitida por el organizador del evento una vez esté habilitado ante la DIAN para facturación electrónica.",
  },
  {
    q: "¿Cómo publico mi propio evento en Monarca Tickets?",
    a: "Crea una cuenta de organizador desde /signup, completa tu perfil y espera a que tu estado ante la DIAN quede habilitado; luego podrás crear eventos y ponerlos en venta desde tu panel.",
  },
  {
    q: "¿Es seguro comprar en Monarca Tickets?",
    a: "Sí. Usamos conexión cifrada (HTTPS), no almacenamos los datos completos de tu tarjeta (los procesa directamente la pasarela de pago) y cada boleto tiene un código QR único para prevenir duplicados.",
  },
  {
    q: "¿Qué hago si tengo un problema con mi compra?",
    a: "Escríbenos desde /soporte contándonos qué pasó, con la referencia de tu orden. Si necesitas radicar una petición, queja o reclamo formal, usa el módulo de /pqrs.",
  },
];

export default function FaqPage() {
  return (
    <main className="container">
      <h1>Preguntas frecuentes</h1>
      <p className="page-lede">Todo lo que necesitas saber antes y después de comprar tus boletos.</p>
      <div>
        {PREGUNTAS.map((p) => (
          <div className="faq-item" key={p.q}>
            <h3>{p.q}</h3>
            <p>{p.a}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
