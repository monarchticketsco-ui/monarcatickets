import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Monarca Tickets",
  description: "Venta de boletos para eventos en Colombia.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
