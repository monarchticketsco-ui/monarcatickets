import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { CrearClienteForm } from "./crear-cliente-form";

export default async function NuevoClientePage() {
  await requireAdmin();

  return (
    <>
      <p>
        <Link href="/crm/clientes" className="nav-link" style={{ padding: 0 }}>
          ← Volver a clientes
        </Link>
      </p>
      <h1>Crear cliente</h1>
      <p className="page-lede">
        Crea el acceso de un comprador. La contrasena temporal solo se muestra una vez — copiala y entregasela al
        cliente por un canal privado.
      </p>
      <CrearClienteForm />
    </>
  );
}
