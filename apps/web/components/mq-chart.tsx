// Grafica de linea con degradado Monarca (la del prototipo de diseno), pero con datos reales.
export function MqChart({ valores, vacio = "Aún no hay ventas en este período." }: { valores: number[] | null; vacio?: string }) {
  const hayDatos = valores && valores.length > 1 && valores.some((v) => v > 0);
  if (!hayDatos) {
    return (
      <div className="mq-chart">
        <div className="mq-chart-empty">{vacio}</div>
      </div>
    );
  }
  const W = 700;
  const H = 180;
  const max = Math.max(...valores);
  const paso = W / (valores.length - 1);
  const pts = valores.map((v, i) => [i * paso, H - 20 - (v / max) * (H - 50)] as const);
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const mx = (x0 + x1) / 2;
    d += ` C${mx} ${y0},${mx} ${y1},${x1} ${y1}`;
  }
  return (
    <div className="mq-chart" role="img" aria-label="Boletos vendidos por día, últimos 30 días">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="mqg">
            <stop stopColor="#176bff" />
            <stop offset=".55" stopColor="#1ed7dd" />
            <stop offset="1" stopColor="#35e27b" />
          </linearGradient>
        </defs>
        <path d={`${d} L${W} ${H} L0 ${H}Z`} fill="url(#mqg)" opacity=".1" />
        <path d={d} fill="none" stroke="url(#mqg)" strokeWidth="3.5" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}
