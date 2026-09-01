import { CATEGORIAS } from "@/lib/event-visuals";

export function EventSearchBar({
  ciudades,
  defaultValues,
}: {
  ciudades: string[];
  defaultValues?: { q?: string; ciudad?: string; fecha?: string; categoria?: string };
}) {
  return (
    <form className="search-bar" action="/eventos" method="get">
      <div className="search-field" style={{ flexBasis: 220 }}>
        <label htmlFor="q">Evento, artista o lugar</label>
        <input
          id="q"
          name="q"
          type="search"
          placeholder="Buscar..."
          defaultValue={defaultValues?.q ?? ""}
        />
      </div>
      <div className="search-field">
        <label htmlFor="ciudad">Ciudad</label>
        <select id="ciudad" name="ciudad" defaultValue={defaultValues?.ciudad ?? ""}>
          <option value="">Cualquier ciudad</option>
          {ciudades.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="search-field">
        <label htmlFor="fecha">Fecha</label>
        <input id="fecha" name="fecha" type="date" defaultValue={defaultValues?.fecha ?? ""} />
      </div>
      <div className="search-field">
        <label htmlFor="categoria">Categoría</label>
        <select id="categoria" name="categoria" defaultValue={defaultValues?.categoria ?? ""}>
          <option value="">Cualquier categoría</option>
          {CATEGORIAS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" className="btn btn-primary">
        Buscar
      </button>
    </form>
  );
}
