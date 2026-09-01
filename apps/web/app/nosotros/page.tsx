import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sobre nosotros — Monarca Tickets",
};

const VALORES = [
  {
    nombre: "Innovación",
    texto: "Incorporamos de forma continua nuevas tecnologías, incluyendo inteligencia artificial y automatización, para mejorar la experiencia de organizadores y asistentes.",
  },
  {
    nombre: "Seguridad y confianza",
    texto: "Protegemos la información de organizadores y asistentes con estándares altos en cada transacción y validación de acceso.",
  },
  {
    nombre: "Transparencia",
    texto: "Promovemos procesos claros, reportes verificables y comunicación honesta con nuestros aliados comerciales.",
  },
  {
    nombre: "Compromiso con el cliente",
    texto: "Acompañamos a organizadores y productores en cada etapa de su evento, desde la planeación hasta el cierre.",
  },
  {
    nombre: "Excelencia operativa",
    texto: "Buscamos la mejora continua de nuestros procesos internos y de la calidad de nuestra plataforma.",
  },
  {
    nombre: "Escalabilidad",
    texto: "Diseñamos nuestra tecnología para crecer junto con las necesidades de nuestros clientes, desde eventos pequeños hasta grandes producciones.",
  },
];

const SERVICIOS = [
  "Venta de entradas físicas y digitales, adaptada a distintos formatos de evento y canales de venta.",
  "Emisión de boletos mediante códigos QR, para dificultar la falsificación y duplicación.",
  "Gestión de eventos y administración de aforos, con disponibilidad en tiempo real.",
  "Control de acceso y validación de entradas en punto de ingreso.",
  "Reportes y visibilidad sobre ventas e ingresos para cada organizador.",
  "Integración con pasarela de pago (Bold) para el cobro en línea.",
  "Soluciones a la medida para productores, empresas y organizadores de eventos.",
];

export default function NosotrosPage() {
  return (
    <main className="container">
      <h1>Sobre nosotros</h1>
      <p className="page-lede">
        Monarca Tickets es la plataforma de venta y control de acceso a eventos operada por{" "}
        <strong>Monarch Tickets S.A.S.</strong>, sociedad colombiana con domicilio en Cali, Valle del Cauca.
      </p>

      <div className="prose">
        <h2>¿Quiénes somos?</h2>
        <p>
          Monarch Tickets S.A.S. nace como una iniciativa enfocada en el desarrollo de soluciones tecnológicas para
          la industria del entretenimiento y los eventos en Colombia. Nuestro objetivo es ofrecer una plataforma de
          ticketing que permita a organizadores, promotores, empresas y productores gestionar integralmente la venta
          de entradas, el registro de asistentes y el control de acceso.
        </p>
        <p>
          Detrás de este proyecto hay un equipo comprometido con la excelencia operativa y con la construcción de
          una empresa sólida desde sus cimientos: procesos administrativos claros, cumplimiento normativo,
          infraestructura tecnológica robusta y una cultura de servicio orientada a generar confianza en cada etapa
          del ciclo de vida de un evento. Cada decisión de diseño de nuestra plataforma parte de una pregunta
          central: ¿cómo hacer que comprar, vender y controlar el acceso a un evento sea más simple, más seguro y
          más transparente?
        </p>

        <h2>Nuestra misión</h2>
        <p>
          Brindar a organizadores, promotores y productores de eventos en Colombia una plataforma tecnológica
          integral que simplifique la comercialización de entradas, fortalezca el control de acceso y aporte
          información confiable para la toma de decisiones, con altos estándares de seguridad, transparencia y
          servicio.
        </p>

        <h2>Nuestra visión</h2>
        <p>
          Consolidarnos como una de las plataformas de ticketing de referencia en Colombia, estableciendo nuevos
          estándares en innovación, confiabilidad y experiencia para organizadores y asistentes.
        </p>

        <h2>Nuestros valores</h2>
        <ul>
          {VALORES.map((v) => (
            <li key={v.nombre}>
              <strong>{v.nombre}</strong> — {v.texto}
            </li>
          ))}
        </ul>

        <h2>¿Qué hacemos?</h2>
        <ul>
          {SERVICIOS.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>

        <h2>Datos de la compañía</h2>
        <ul>
          <li>Razón social: Monarch Tickets S.A.S. (sigla MNTK S.A.S.)</li>
          <li>NIT: 902095040-4</li>
          <li>Domicilio principal: Cali, Valle del Cauca, Colombia</li>
          <li>Correo de contacto: monarchpasstickets@gmail.com</li>
        </ul>
      </div>
    </main>
  );
}
