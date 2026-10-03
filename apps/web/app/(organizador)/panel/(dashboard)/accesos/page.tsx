export default function AccesosPage() {
  return (
    <>
      <div className="eyebrow">ACCESOS</div>
      <h1 style={{ marginBottom: 4 }}>Control de accesos</h1>
      <div className="card" style={{ marginTop: 20, maxWidth: 560 }}>
        <span className="badge badge-blue">Próximamente</span>
        <p style={{ marginTop: 12 }}>El escaneo de QR en puerta (control de aforo en vivo) todavia no esta integrado. Cuando se conecte una app o dispositivo de escaneo al evento, aqui veras el aforo y los ingresos en tiempo real.</p>
      </div>
    </>
  );
}
