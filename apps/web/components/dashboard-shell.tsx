import { DashboardSidebar } from "@/components/dashboard-sidebar";

// Estructura comun de Mi cuenta, Panel Polinizador y Admin: menu lateral +
// barra superior + contenido, con el diseno del prototipo (app-shell).
export function DashboardShell({
  role,
  titulo,
  evento,
  eventos,
  eventoActivo,
  etiqueta,
  inicial,
  children,
}: {
  role: "admin" | "organizador" | "comprador";
  titulo: string;
  evento?: string | null;
  eventos?: { id: string; nombre: string }[];
  eventoActivo?: string | null;
  etiqueta: string;
  inicial?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mq-scope mq-shell">
      <DashboardSidebar role={role} titulo={titulo} evento={evento ?? undefined} eventos={eventos} eventoActivo={eventoActivo} />
      <div className="dashboard-main">
        <div className="mq-topbar">
          <span>{etiqueta}</span>
          <div className="mq-avatar" aria-hidden="true">
            {(inicial || "M").slice(0, 1).toUpperCase()}
          </div>
        </div>
        {children}
      </div>
    </main>
  );
}
