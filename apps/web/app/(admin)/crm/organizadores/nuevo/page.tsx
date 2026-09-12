import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { CrearOrganizadorForm } from "./crear-organizador-form";

export default async function NuevoOrganizadorPage({
  searchParams,
}: {
  searchParams: Promise<{ nombre?: string; empresa?: string; correo?: string; telefono?: string; leadId?: string }>;
}) {
  await requireAdmin();
  const { nombre, empresa, correo, telefono, leadId } = await searchParams;

  return (
    <main className="container">
      <p>
        <Link href="/crm" className="nav-link" style={{ padding: 0 }}>
          ← Volver al CRM
        </Link>
      </p>
      <h1>Crear cuenta de empresa</h1>
      <p className="page-lede">
        Crea el acceso de un organizador nuevo. La contrasena temporal solo se muestra una vez — copiala y
        entregasela al cliente por un canal privado.
      </p>
      <CrearOrganizadorForm
        defaults={{
          legalName: empresa ?? "",
          correo: correo ?? "",
          contactName: nombre ?? "",
          contactPhone: telefono ?? "",
          leadId: leadId ?? "",
        }}
      />
    </main>
  );
}
