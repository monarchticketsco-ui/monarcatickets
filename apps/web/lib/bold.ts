// Cliente minimo para la API de Pagos en Linea de Bold.
// Confirmar con developers.bold.co (en sandbox) los nombres exactos de
// endpoints y el esquema de la firma de webhooks antes de completar esto
// — la documentacion publica no lo detalla (ver blueprint seccion 03).
//
// TODO (Fase 2): crearIntentoDePago(), verificarFirmaWebhook(), reembolsar()

const BOLD_API_KEY = process.env.BOLD_API_KEY;

export async function crearIntentoDePago(params: {
  ordenId: string;
  montoCop: number;
  descripcion: string;
}) {
  throw new Error("not_implemented — confirmar contrato de la API con Bold");
}
