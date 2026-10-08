"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { requireOrganizer, COOKIE_EVENTO_ACTIVO } from "@/lib/organizer";

// Guarda el evento que el Polinizador esta mirando en su panel. Solo acepta
// eventos que de verdad tiene asignados.
export async function seleccionarEventoActivo(formData: FormData) {
  const { eventIds } = await requireOrganizer();
  const id = String(formData.get("evento") || "");
  if (!eventIds.includes(id)) return;

  (await cookies()).set(COOKIE_EVENTO_ACTIVO, id, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
  });
  revalidatePath("/panel", "layout");
}
