export function EventSearchBar({
  ciudades,
  defaultValues,
}: {
  ciudades: string[];
  defaultValues?: { q?: string; ciudad?: string; fecha?: string };
}) {
  return (
    <form className="mq-searchbox mq-searchbox-page" action="/eventos" method="get">
      <input
        name="q"
        type="search"
        placeholder="Evento, artista o lugar"
        aria-label="Evento, artista o lugar"
        defaultValue={defaultValues?.q ?? ""}
      />
      <select name="ciudad" aria-label="Ciudad" defaultValue={defaultValues?.ciudad ?? ""}>
        <option value="">Ciudad</option>
        {ciudades.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <input name="fecha" type="date" aria-label="Fecha" defaultValue={defaultValues?.fecha ?? ""} />
      <button type="submit" className="mq-btn mq-primary">
        Buscar
      </button>
    </form>
  );
}
