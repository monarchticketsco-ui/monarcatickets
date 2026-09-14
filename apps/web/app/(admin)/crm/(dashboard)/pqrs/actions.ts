"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function actualizarEstadoPqrs(id: string, estado: "abierta" | "en_proceso" | "cerrada") {
  await requireAdmin();

  const admin = createAdminClient();
  const { error } = await admin.from("pqrs_solicitudes").update({ estado }).eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/crm/pqrs");
}
