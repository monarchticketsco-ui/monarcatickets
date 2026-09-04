// Monarca Tickets — visuales por categoria de evento.
//
// No agregamos una columna image_url a la base de datos (todavia no
// tenemos como correr una migracion contra Postgres desde aqui), asi
// que en vez de subir una imagen por evento, cada categoria tiene un
// pequeno set de fotos curadas y elegimos una de forma determinista
// segun el id del evento — asi la imagen no "salta" entre renders pero
// hay variedad dentro de una misma categoria.
//
// Las fotos viven en /public/img/eventos (autohospedadas, no enlazadas
// en caliente a Unsplash) para que no dependan de la disponibilidad de
// un CDN externo en cada carga de pagina.

export const CATEGORIAS = [
  "Concierto",
  "Festival",
  "Teatro",
  "Comedia",
  "Deportivo",
  "Conferencia",
  "Familiar",
] as const;

export type Categoria = (typeof CATEGORIAS)[number];

const IMAGENES: Record<Categoria, string[]> = {
  Concierto: ["/img/eventos/concierto-1.jpg", "/img/eventos/concierto-2.jpg", "/img/eventos/concierto-3.jpg"],
  Festival: [
    "/img/eventos/festival-1.jpg",
    "/img/eventos/festival-2.jpg",
    "/img/eventos/festival-3.jpg",
    "/img/eventos/festival-4.jpg",
  ],
  Teatro: ["/img/eventos/teatro-1.jpg", "/img/eventos/teatro-2.jpg", "/img/eventos/teatro-3.jpg"],
  Comedia: ["/img/eventos/comedia-1.jpg", "/img/eventos/comedia-2.jpg"],
  Deportivo: ["/img/eventos/deportivo-1.jpg", "/img/eventos/deportivo-2.jpg", "/img/eventos/deportivo-3.jpg"],
  Conferencia: ["/img/eventos/conferencia-1.jpg", "/img/eventos/conferencia-2.jpg"],
  Familiar: ["/img/eventos/familiar-1.jpg", "/img/eventos/familiar-2.jpg"],
};

const FALLBACK_IMAGENES = IMAGENES.Concierto;

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function normalizarCategoria(categoria?: string | null): Categoria | null {
  if (!categoria) return null;
  const match = CATEGORIAS.find((c) => c.toLowerCase() === categoria.trim().toLowerCase());
  return match ?? null;
}

/**
 * Devuelve una URL de imagen para un evento, eligiendo entre las fotos
 * curadas de su categoria (o de "Concierto" si la categoria no matchea
 * ninguna conocida). Las imagenes son locales (/public), asi que no
 * dependen de un CDN externo.
 */
export function imagenDeEvento(eventoId: string, categoria: string | null | undefined, _width?: number): string {
  const cat = normalizarCategoria(categoria);
  const imagenes = cat ? IMAGENES[cat] : FALLBACK_IMAGENES;
  return imagenes[hashString(eventoId) % imagenes.length];
}
