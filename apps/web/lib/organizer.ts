import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getFourvenuesEventById, getFourvenuesTicketsByEvent, type FVEvent, type FVTicket } from "@/lib/fourvenues";

// Helper compartido por las paginas del panel: exige sesion y perfil de
// organizador completo, o redirige al paso que falte.
//
// fourvenues_event_id: el evento de FourVenues que Management le asigno
// a este organizador/Polinizador. Puede ser null si todavia no se lo han
// asignado (el Panel Polinizador debe mostrar un estado "sin evento
// asignado" en ese caso, nunca datos de otro organizador).
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

  return { supabase, user, organizer };
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
