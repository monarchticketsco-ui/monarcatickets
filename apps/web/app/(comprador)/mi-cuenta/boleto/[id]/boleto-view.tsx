"use client";

import { useRef, useState } from "react";
import Link from "next/link";

const ESTADO_LABEL: Record<string, string> = {
  valido: "Valido",
  usado: "Usado",
  cancelado: "Cancelado",
  transferido: "Transferido",
};

const ESTADO_BADGE: Record<string, string> = {
  valido: "badge badge-green",
  usado: "badge",
  cancelado: "badge badge-danger",
  transferido: "badge badge-warning",
};

export function BoletoView({
  evento,
  tipoBoleto,
  precio,
  titular,
  estado,
  serial,
  qrDataUrl,
  ordenId,
}: {
  evento: { name: string; venue: string; city: string; starts_at: string } | null;
  tipoBoleto: string;
  precio: number;
  titular: string;
  estado: string;
  serial: string;
  qrDataUrl: string;
  ordenId: string;
}) {
  const passRef = useRef<HTMLDivElement>(null);
  const [descargando, setDescargando] = useState(false);
  const [errorDescarga, setErrorDescarga] = useState(false);

  const fecha = evento ? new Date(evento.starts_at) : null;
  const dia = fecha ? fecha.toLocaleDateString("es-CO", { day: "2-digit" }) : "--";
  const mes = fecha
    ? fecha.toLocaleDateString("es-CO", { month: "short" }).replace(".", "").toUpperCase()
    : "";
  const horaFecha = fecha
    ? fecha.toLocaleString("es-CO", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

  async function descargar() {
    if (!passRef.current) return;
    setDescargando(true);
    setErrorDescarga(false);
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(passRef.current, {
        backgroundColor: "#070b16",
        scale: 2,
        useCORS: true,
      });
      const enlace = document.createElement("a");
      enlace.download = `boleto-${serial}.png`;
      enlace.href = canvas.toDataURL("image/png");
      enlace.click();
    } catch {
      setErrorDescarga(true);
    } finally {
      setDescargando(false);
    }
  }

  return (
    <div className="boleto-page">
      <Link href="/mi-cuenta" className="boleto-back">
        ← Volver a mi cuenta
      </Link>

      <div className="ticket-pass" ref={passRef}>
        <div className="ticket-pass-bar" />
        <div className="ticket-pass-top">
          <div className="ticket-pass-date">
            <span className="ticket-pass-date-day">{dia}</span>
            <span className="ticket-pass-date-month">{mes}</span>
          </div>
          <div className="ticket-pass-info">
            <h1>{evento?.name ?? "Evento"}</h1>
            {evento && (
              <p>
                {evento.venue}, {evento.city}
              </p>
            )}
            {horaFecha && <p className="ticket-pass-time">{horaFecha}</p>}
          </div>
        </div>

        <div className="ticket-pass-tags">
          <span className="badge badge-blue">{tipoBoleto.toUpperCase()}</span>
          <span className={ESTADO_BADGE[estado] ?? "badge"}>{ESTADO_LABEL[estado] ?? estado}</span>
        </div>

        <div className="ticket-pass-perf" aria-hidden="true" />

        <div className="ticket-pass-qr">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrDataUrl} alt="Codigo QR del boleto" width={220} height={220} />
          <p className="ticket-pass-serial">{serial}</p>
        </div>

        <div className="ticket-pass-footer">
          <div>
            <span className="ticket-pass-footer-label">Titular</span>
            <span className="ticket-pass-footer-value">{titular}</span>
          </div>
          <div style={{ textAlign: "right" }}>
            <span className="ticket-pass-footer-label">Valor</span>
            <span className="ticket-pass-footer-value">${precio.toLocaleString("es-CO")}</span>
          </div>
        </div>

        <p className="ticket-pass-order">Orden #{ordenId.split("-")[0].toUpperCase()} · Monarca Tickets</p>
      </div>

      <div className="boleto-actions">
        <button type="button" className="btn btn-primary" onClick={descargar} disabled={descargando}>
          {descargando ? "Generando…" : "Descargar boleto"}
        </button>
        <button type="button" className="btn" onClick={() => window.print()}>
          Imprimir
        </button>
      </div>
      {errorDescarga && (
        <p role="alert" className="muted boleto-hint">
          No se pudo generar la imagen. Intenta de nuevo o usa "Imprimir → Guardar como PDF".
        </p>
      )}
      <p className="muted boleto-hint">
        Guarda esta imagen en tu celular o imprimela — el codigo QR es lo unico que te piden en la entrada.
      </p>
    </div>
  );
}
