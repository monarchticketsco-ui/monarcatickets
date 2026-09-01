// Monarca Tickets — visuales por categoria de evento.
//
// No agregamos una columna image_url a la base de datos (todavia no
// tenemos como correr una migracion contra Postgres desde aqui), asi
// que en vez de subir una imagen por evento, cada categoria tiene un
// pequeno set de fotos curadas y elegimos una de forma determinista
// segun el id del evento — asi la imagen no "salta" entre renders pero
// hay variedad dentro de una misma categoria.

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

const UNSPLASH_IDS: Record<Categoria, string[]> = {
  Concierto: ["1470229722913-7c0e2dbbafd3", "1459749411175-04bf5292ceea", "1493225457124-a3eb161ffa5f"],
  Festival: ["1501281668745-f7f57925c3b4", "1524368535928-5b5e00ddc76b", "1540039155733-5bb30b53aa14", "1533174072545-7a4b6ad7a6c3"],
  Teatro: ["1516307365426-bea591f05011", "1580809361436-42a7ec204889", "1503095396549-807759245b35"],
  Comedia: ["1585699324551-f6c309eedeca", "1475721027785-f74eccf877e2"],
  Deportivo: ["1461896836934-ffe607ba8211", "1517466787929-bc90951d0974", "1560272564-c83b66b1ad12"],
  Conferencia: ["1540575467063-178a50c2df87", "1591115765373-5207764f72e7"],
  Familiar: ["1517649763962-0c623066013b", "1543269865-cbf427effbad"],
};

const FALLBACK_IDS = UNSPLASH_IDS.Concierto;

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
 * ninguna conocida). `width` ajusta el tamano pedido a Unsplash.
 */
export function imagenDeEvento(eventoId: string, categoria: string | null | undefined, width = 1200): string {
  const cat = normalizarCategoria(categoria);
  const ids = cat ? UNSPLASH_IDS[cat] : FALLBACK_IDS;
  const id = ids[hashString(eventoId) % ids.length];
  return `https://images.unsplash.com/photo-${id}?w=${width}&q=70&auto=format&fit=crop`;
}
