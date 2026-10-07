export default function CashlessCompradorPage() {
  return (
    <>
      <div className="mq-dash-title">
        <div className="eyebrow">CASHLESS</div>
        <h1>Cashless</h1>
        <p className="page-lede">Tu saldo y tus manillas para cada evento.</p>
      </div>

      <div className="mq-panel-card mq-soon-card">
        <span className="mq-badge mq-badge-blue">Próximamente</span>
        <h3>Estamos conectando Cashless.</h3>
        <p>
          Pronto vas a poder vincular tu manilla a tu cuenta, recargar saldo antes del evento y ver tus consumos
          después, todo desde aquí. Te avisamos apenas esté disponible.
        </p>
      </div>

      <div className="mq-wrist-preview" aria-hidden="true">
        <div className="mq-panel-card">
          <small style={{ color: "#7f8da2", letterSpacing: ".1em", fontSize: 11 }}>MANILLA 01</small>
          <strong>$ —</strong>
          <span style={{ color: "#8492a6", fontSize: 13 }}>Saldo disponible · COP</span>
        </div>
        <div className="mq-panel-card">
          <small style={{ color: "#7f8da2", letterSpacing: ".1em", fontSize: 11 }}>MOVIMIENTOS</small>
          <strong>—</strong>
          <span style={{ color: "#8492a6", fontSize: 13 }}>Recargas y consumos del evento</span>
        </div>
      </div>
    </>
  );
}
