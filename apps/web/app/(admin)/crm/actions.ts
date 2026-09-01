"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

// organizers no tiene politica RLS de escritura para admin (solo el dueno
// puede hacer update de su propia fila) — por diseno, las escrituras de
// negocio del CRM se hacen con la service role key una vez requireAdmin()
// confirmo la sesion y el rol contra la fila propia del usuario (eso si
// respeta RLS: profiles_select_own_or_admin).
export async function actualizarDianStatus(
  organizerId: string,
  nuevoEstado: "no_habilitado" | "en_proceso" | "habilitado"
) {
  await requireAdmin();

  const admin = createAdminClient();
  const { error } = await admin
    .from("organizers")
    .update({ dian_status: nuevoEstado })
    .eq("id", organizerId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/crm");
}
