import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getFourvenuesEventById, getFourvenuesTicketsByEvent, type FVEvent, type FVTicket } from "@/lib/fourvenues";

// Helper compartido por las paginas del panel: exige sesion y perfil de
// organizador completo, o redirige al paso que falte.
//
// Un organizador puede tener VARIOS eventos de FourVenues asignados (tabla
// organizer_events). `eventIds` los trae todos y `organizer.fourvenues_event_id`
// es el evento ACTIVO: el que eligio en el selector del panel (cookie) o, si
// no ha elegido, el primero. Asi las paginas del panel siguen leyendo un solo
// evento sin cambios. Puede ser null si todavia no le asignaron ninguno (el
// panel muestra "sin evento asignado", nunca datos de otro organizador).
export const COOKIE_EVENTO_ACTIVO = "mq_evento";

export async function requireOrganizer() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: organizer } = await supabase
    .from("organizers")
    .select("id, legal_name, nit, commission_rate, fourvenues_event_id")
    .eq("owner_user_id", user.id)
    .single();

  if (!organizer) redirect("/panel/completar-perfil");

  // El organizador ya quedo verificado por owner_user_id; con el cliente de
  // servicio solo leemos las filas de ESE organizador.
  const { data: filas } = await createAdminClient()
    .from("organizer_events")
    .select("fourvenues_event_id")
    .eq("organizer_id", organizer.id)
    .order("created_at", { ascending: true });

  const eventIds = (filas ?? []).map((f) => f.fourvenues_event_id as string);
  // Respaldo: el campo viejo, por si la migracion 0014 no lo copio.
  if (organizer.fourvenues_event_id && !eventIds.includes(organizer.fourvenues_event_id)) {
    eventIds.unshift(organizer.fourvenues_event_id);
  }

  const elegido = (await cookies()).get(COOKIE_EVENTO_ACTIVO)?.value;
  const activo = elegido && eventIds.includes(elegido) ? elegido : (eventIds[0] ?? null);

  return {
    supabase,
    user,
    organizer: { ...organizer, fourvenues_event_id: activo },
    eventIds,
  };
}

/**
 * Trae el evento de FourVenues asignado a este organizador y todos sus
 * tickets, en paralelo. Si todavia no tiene evento asignado (Management
 * no lo ha configurado), devuelve evento null y tickets vacios — cada
 * pagina del Panel Polinizador debe mostrar un aviso en ese caso, no un
 * error.
 */
export async function getEventoYTicketsDelOrganizador(
  fourvenuesEventId: string | null
): Promise<{ evento: FVEvent | null; tickets: FVTicket[] }> {
  if (!fourvenuesEventId) return { evento: null, tickets: [] };

  const [evento, tickets] = await Promise.all([
    getFourvenuesEventById(fourvenuesEventId),
    getFourvenuesTicketsByEvent(fourvenuesEventId),
  ]);

  return { evento, tickets: evento ? tickets : [] };
}
