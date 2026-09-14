import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(request: NextRequest) {
  await requireAdmin();

  const { searchParams } = new URL(request.url);
  const desde = searchParams.get("desde") || "";
  const hasta = searchParams.get("hasta") || "";

  const admin = createAdminClient();
  let query = admin
    .from("profiles")
    .select("id, full_name, phone, created_at")
    .eq("role", "comprador")
    .order("created_at", { ascending: false });

  if (desde) query = query.gte("created_at", `${desde}T00:00:00`);
  if (hasta) query = query.lte("created_at", `${hasta}T23:59:59`);

  const { data: perfiles } = await query;
  const clientes = perfiles ?? [];

  const { data: usersData } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const emailPorId = new Map((usersData?.users ?? []).map((u) => [u.id, u.email ?? ""]));

  const { data: ordenesPagadas } = await admin.from("orders").select("user_id, total_cop").eq("status", "pagada");
  const statsPorCliente = new Map<string, { pedidos: number; total: number }>();
  for (const o of ordenesPagadas ?? []) {
    const prev = statsPorCliente.get(o.user_id) ?? { pedidos: 0, total: 0 };
    prev.pedidos += 1;
    prev.total += o.total_cop;
    statsPorCliente.set(o.user_id, prev);
  }

  const encabezados = ["Nombre", "Correo", "Telefono", "Cliente desde", "Pedidos pagados", "Total gastado COP"];
  const filas = clientes.map((c) => {
    const stats = statsPorCliente.get(c.id) ?? { pedidos: 0, total: 0 };
    return [
      c.full_name ?? "",
      emailPorId.get(c.id) ?? "",
      c.phone ?? "",
      new Date(c.created_at).toLocaleDateString("es-CO", { timeZone: "America/Bogota" }),
      String(stats.pedidos),
      String(stats.total),
    ]
      .map(csvEscape)
      .join(",");
  });

  const csv = "﻿" + [encabezados.join(","), ...filas].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="clientes-monarca-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
