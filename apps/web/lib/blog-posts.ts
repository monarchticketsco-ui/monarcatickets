// Monarca Tickets — contenido de ejemplo para el blog del home. Estatico
// por ahora (sin tabla en la base de datos); cuando exista un panel de
// contenido esto se puede migrar a Supabase sin tocar las paginas.

export type BlogPost = {
  slug: string;
  titulo: string;
  extracto: string;
  categoria: string;
  fecha: string;
  minutosLectura: number;
  imagenId: string;
  cuerpo: string[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "como-comprar-boletos-seguros",
    titulo: "Cómo comprar boletos seguros: guía rápida",
    extracto: "Cinco señales para reconocer una compra segura y evitar reventa o boletos falsos en Colombia.",
    categoria: "Para compradores",
    fecha: "2026-08-12",
    minutosLectura: 4,
    imagenId: "1540575467063-178a50c2df87",
    cuerpo: [
      "Comprar un boleto debería ser lo más sencillo de ir a un evento — pero la reventa y los boletos falsos siguen siendo un dolor de cabeza en Colombia. Aquí van cinco señales para comprar tranquilo.",
      "Primero, verifica que la página de venta pertenezca al organizador oficial o a una plataforma reconocida. En Monarca Tickets, cada evento publicado pasa por la cuenta verificada de su organizador — puedes ver el nombre legal y el NIT del responsable en la ficha del evento.",
      "Segundo, desconfía de precios muy por debajo del valor oficial fuera de canales autorizados: es la señal más común de reventa irregular. El precio real siempre está en la página del evento, con el desglose de localidades disponibles.",
      "Tercero, confirma que el pago se procese por una pasarela reconocida (en nuestro caso, Bold) y no por transferencia directa a una persona natural. Un pago seguro siempre te da un comprobante inmediato.",
      "Cuarto, tu boleto digital debe llegar a tu correo y quedar disponible en tu cuenta antes del evento — no minutos antes de la puerta. Si alguien te ofrece un boleto sin poder mostrártelo con anticipación, es una alerta.",
      "Y quinto: guarda siempre tu código de compra. Ante cualquier duda, el equipo de soporte puede verificar tu boleto contra el aforo del evento en segundos.",
    ],
  },
  {
    slug: "pulep-que-es-y-por-que-lo-necesitas",
    titulo: "PULEP: qué es y por qué tu evento lo necesita",
    extracto: "El código PULEP es obligatorio para espectáculos públicos en Colombia. Te contamos qué es y cómo tramitarlo.",
    categoria: "Para organizadores",
    fecha: "2026-08-05",
    minutosLectura: 5,
    imagenId: "1493225457124-a3eb161ffa5f",
    cuerpo: [
      "PULEP significa Boletería Única Electrónica para Espectáculos Públicos, y es el sistema con el que el Ministerio del Interior controla la boletería de conciertos, obras de teatro, eventos deportivos y espectáculos públicos en Colombia.",
      "Si vas a cobrar entrada por un evento abierto al público, la ley exige registrar el aforo y la boletería ante este sistema antes de empezar a vender. El código PULEP que obtienes debe quedar visible en la publicidad y en los boletos del evento.",
      "En Monarca Tickets dejamos un campo específico para tu código PULEP en la ficha técnica del evento, junto con los datos del responsable legal (razón social, NIT y contacto), para que tu página pública cumpla con lo que piden las autoridades.",
      "El trámite se hace directamente en la plataforma del Ministerio del Interior y normalmente toma unos días, así que te recomendamos iniciarlo apenas confirmes fecha y venue — no esperes a tener todo el arte gráfico listo.",
      "Tener el PULEP en regla no solo te evita sanciones: también le da confianza al público. Un evento con su información legal completa se ve — y es — más serio.",
    ],
  },
  {
    slug: "5-tips-primer-evento-colombia",
    titulo: "5 tips para organizar tu primer evento en Colombia",
    extracto: "De la fecha al aforo: lo esencial antes de abrir la venta de boletos de tu primer evento.",
    categoria: "Para organizadores",
    fecha: "2026-07-22",
    minutosLectura: 6,
    imagenId: "1459749411175-04bf5292ceea",
    cuerpo: [
      "Organizar tu primer evento propio es emocionante y abrumador al mismo tiempo. Estos son los cinco puntos que más impacto tienen antes de abrir la venta.",
      "1. Define el aforo real del venue, no el ideal. Habla con el lugar sobre su capacidad certificada por bomberos y déjate un margen — vender de más es el error más costoso que puedes cometer.",
      "2. Escoge bien tus localidades y precios. Empieza con dos o tres tipos de boleto máximo (por ejemplo general y VIP) — demasiadas opciones confunden más de lo que ayudan a vender.",
      "3. Publica la ficha completa desde el día uno: dirección exacta, hora de apertura de puertas, edad mínima, si se vende comida o licor, y accesibilidad. Esa información reduce muchísimo las preguntas de soporte el día del evento.",
      "4. Planea el ingreso con anticipación. Define cuántos puntos de acceso vas a tener y cuánto tiempo toma escanear cada boleto — para un aforo de 1000 personas, un solo punto de acceso casi siempre se queda corto.",
      "5. Tramita tu PULEP con tiempo. No es un trámite instantáneo, y sin él no puedes vender boletería legalmente en Colombia.",
    ],
  },
  {
    slug: "aforo-y-seguridad-lo-que-debes-saber",
    titulo: "Aforo y seguridad: lo que todo organizador debe saber",
    extracto: "Cómo el control de aforo en tiempo real protege tu evento — y a tu público — de la sobreventa.",
    categoria: "Para organizadores",
    fecha: "2026-07-09",
    minutosLectura: 5,
    imagenId: "1461896836934-ffe607ba8211",
    cuerpo: [
      "El aforo no es solo un número en un permiso: es la base de la seguridad de tu evento. Superarlo pone en riesgo a tu público y puede cerrar tu evento a mitad de la noche.",
      "Cada boleto vendido en Monarca Tickets descuenta cupo en tiempo real contra el aforo que configuraste por localidad. Eso significa que, si vendes por varios canales o tienes preventa y venta general, nunca vas a vender más entradas de las que caben.",
      "Además del aforo total, vale la pena pensar el aforo por zona: no es lo mismo el límite del recinto completo que el de una tarima VIP o una zona de acceso preferencial. Configurar localidades separadas te da ese control fino.",
      "El día del evento, el control de acceso con lectura de boletos digitales evita que un mismo boleto entre dos veces — un problema clásico con boletos impresos o capturas de pantalla compartidas.",
      "Si tu evento vende licor o tiene zonas con restricción de edad, súmalo a tu ficha técnica: esa transparencia previa reduce fricción en la puerta y protege a tu equipo de seguridad de decisiones difíciles de último minuto.",
    ],
  },
  {
    slug: "categorias-de-eventos-mas-buscadas",
    titulo: "Las categorías de eventos más buscadas en la plataforma",
    extracto: "Un vistazo a qué tipo de planes está buscando la gente — y qué significa para tu próximo evento.",
    categoria: "Tendencias",
    fecha: "2026-06-18",
    minutosLectura: 3,
    imagenId: "1501281668745-f7f57925c3b4",
    cuerpo: [
      "Conciertos y festivales siguen siendo la categoría con más búsquedas, pero el crecimiento más interesante últimamente está en los planes familiares y los eventos deportivos de ciudad — torneos amateur, carreras y clásicos regionales.",
      "El teatro y la comedia en vivo mantienen un público fiel y muy activo en ciudades como Bogotá y Medellín, mientras que los festivales al aire libre dominan la temporada de mitad de año.",
      "Para un organizador, esto se traduce en algo simple: la categoría que le pongas a tu evento en la ficha técnica no es un detalle menor — es cómo la gente te va a encontrar cuando explore por categoría en vez de buscar por nombre.",
      "Si tu evento cruza dos mundos (por ejemplo, un festival con zona familiar), vale la pena describirlo bien en el detalle del evento, aunque tengas que elegir una sola categoría principal para clasificarlo.",
    ],
  },
];

export function obtenerPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
