"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ICONS = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" />
    </svg>
  ),
  clientes: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="3.4" />
      <path d="M4.5 20c.9-4 3.8-6 7.5-6s6.6 2 7.5 6" />
    </svg>
  ),
  organizadores: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 21V6l7-3 7 3v15" />
      <path d="M4 21h16M9 9h1.4M13.6 9H15M9 13h1.4M13.6 13H15M10 21v-4h4v4" />
    </svg>
  ),
  eventos: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" />
    </svg>
  ),
  ordenes: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12l1 4H5l1-4Z" />
      <path d="M5 7v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7M9.5 11a2.5 2.5 0 0 0 5 0" />
    </svg>
  ),
  pqrs: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5h16v11H8l-4 4V5Z" />
      <path d="M12 10.4v.1M12 8.6c0-.9.7-1.2 1-1.4.5-.3.9-.6.9-1.2 0-.8-.8-1.3-1.7-1.3-.7 0-1.3.3-1.7.9" />
    </svg>
  ),
  integraciones: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3v4M15 3v4M6 7h12l-1 4a5 5 0 0 1-10 0L6 7Z" />
      <path d="M12 15v3M9 21h6" />
    </svg>
  ),
  home: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 11 12 4l8 7" />
      <path d="M6 9.5V20h12V9.5" />
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" />
      <path d="M15 16l4-4-4-4M19 12H9" />
    </svg>
  ),
  password: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="15" r="4" />
      <path d="M11 12l9-9M17 3l3 3M14 6l2.5 2.5" />
    </svg>
  ),
} as const;

type IconKey = keyof typeof ICONS;

const NAV: Record<"admin" | "organizador", { href: string; label: string; icon: IconKey; exact?: boolean }[]> = {
  admin: [
    { href: "/crm", label: "Dashboard", icon: "dashboard", exact: true },
    { href: "/crm/clientes", label: "Clientes", icon: "clientes" },
    { href: "/crm/organizadores", label: "Organizadores", icon: "organizadores" },
    { href: "/crm/eventos", label: "Eventos", icon: "eventos" },
    { href: "/crm/ordenes", label: "Ordenes de compra", icon: "ordenes" },
    { href: "/crm/pqrs", label: "PQRS", icon: "pqrs" },
    { href: "/crm/integraciones", label: "Integraciones", icon: "integraciones" },
  ],
  organizador: [
    { href: "/panel", label: "Dashboard", icon: "dashboard", exact: true },
    { href: "/panel/eventos", label: "Mis eventos", icon: "eventos" },
    { href: "/panel/ordenes", label: "Ordenes de venta", icon: "ordenes" },
  ],
};

export function DashboardSidebar({ role, titulo }: { role: "admin" | "organizador"; titulo: string }) {
  const pathname = usePathname();
  const items = NAV[role];

  return (
    <aside className="dashboard-sidebar">
      <div className="dashboard-sidebar-title">{titulo}</div>
      <nav className="dashboard-sidebar-nav">
        {items.map((item) => {
          const activo = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href} className={`dashboard-nav-link${activo ? " is-active" : ""}`}>
              {ICONS[item.icon]}
              <span className="label-text">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="dashboard-sidebar-foot">
        <Link href="/cuenta/contrasena" className="dashboard-nav-link">
          {ICONS.password}
          <span className="label-text">Cambiar contraseña</span>
        </Link>
        <Link href="/" className="dashboard-nav-link">
          {ICONS.home}
          <span className="label-text">Volver al sitio</span>
        </Link>
        <form action="/logout" method="post">
          <button type="submit" className="dashboard-nav-link">
            {ICONS.logout}
            <span className="label-text">Salir</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
