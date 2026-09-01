import type { Metadata } from "next";
import { Orbitron, Rajdhani } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["500", "700", "900"],
  variable: "--font-orbitron",
  display: "swap",
});

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-rajdhani",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Monarca Tickets",
  description: "Venta de boletos para eventos en Colombia.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${orbitron.variable} ${rajdhani.variable}`}>
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
