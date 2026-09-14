interface Props {
  cells: [number, number][];
  gridSize: number;
}

/** Líneas animadas entre celdas seleccionadas en la matriz Breach. */
export function BreachPathOverlay({ cells, gridSize }: Props) {
  if (cells.length < 2) return null;

  const cellPct = 100 / gridSize;

  const points = cells.map(([row, col]) => ({
    x: (col + 0.5) * cellPct,
    y: (row + 0.5) * cellPct,
  }));

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  return (
    <svg className="breach-path-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id="breachPathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#56cfe1" />
          <stop offset="50%" stopColor="#6c8cff" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
      <path
        d={pathD}
        className="breach-path-line breach-path-line--glow"
        fill="none"
        stroke="url(#breachPathGrad)"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={pathD}
        className="breach-path-line breach-path-line--dash"
        fill="none"
        stroke="#56cfe1"
        strokeWidth="0.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="3 2"
      />
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="1.8"
          className="breach-path-dot"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </svg>
  );
}
