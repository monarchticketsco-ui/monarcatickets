// Lista de scopes disponibles para credenciales de la API publica
// (app/api/v1/*). Vive fuera de actions.ts porque un archivo "use server"
// solo puede exportar funciones async — esta constante la usan tanto el
// server action (crearApiCliente) como el formulario cliente.
export const SCOPES_DISPONIBLES = [
  { value: "eventos:leer", label: "Leer eventos y disponibilidad" },
  { value: "ordenes:crear", label: "Crear ordenes (checkout)" },
  { value: "ordenes:leer", label: "Consultar estado de ordenes" },
  { value: "pqrs:crear", label: "Radicar PQRS" },
] as const;
