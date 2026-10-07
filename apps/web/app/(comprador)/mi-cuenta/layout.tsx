import { requireComprador } from "@/lib/admin";
import { DashboardShell } from "@/components/dashboard-shell";

export default async function MiCuentaLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user } = await requireComprador();
  const { data: perfil } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();

  return (
    <DashboardShell
      role="comprador"
      titulo="Mi cuenta"
      etiqueta="MI CUENTA MONARCA"
      inicial={perfil?.full_name?.trim() || user.email || "M"}
    >
      {children}
    </DashboardShell>
  );
}
