import { formatPrice } from "@/lib/utils";

export type ChartPoint = { label: string; value: number };

/**
 * Hand-crafted SVG revenue chart — no charting library.
 * A smooth cubic-Bézier curve through the daily totals, filled with an
 * accent gradient at 15% opacity. All colors come from the design tokens.
 */
export function SalesChart({ points }: { points: ChartPoint[] }) {
  const W = 720;
  const H = 240;
  const TOP = 16;
  const BOTTOM = 200;
  const LEFT = 10;
  const RIGHT = 710;

  const max = Math.max(...points.map((p) => p.value), 1);
  const n = points.length;

  const x = (i: number) => (n === 1 ? (LEFT + RIGHT) / 2 : LEFT + (i * (RIGHT - LEFT)) / (n - 1));
  const y = (v: number) => BOTTOM - (v / max) * (BOTTOM - TOP);

  // Smooth curve: cubic Béziers with horizontal control points at the
  // midpoint between samples (classic dashboard-style easing).
  let line = `M ${x(0)} ${y(points[0].value)}`;
  for (let i = 1; i < n; i++) {
    const cx = (x(i - 1) + x(i)) / 2;
    line += ` C ${cx} ${y(points[i - 1].value)}, ${cx} ${y(points[i].value)}, ${x(i)} ${y(points[i].value)}`;
  }
  const area = `${line} L ${x(n - 1)} ${BOTTOM} L ${x(0)} ${BOTTOM} Z`;

  // Show roughly 5 x-axis labels.
  const labelStep = Math.max(1, Math.ceil(n / 5));

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Grafic vânzări">
        <defs>
          <linearGradient id="sales-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.15" />
            <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0.25, 0.5, 0.75, 1].map((t) => (
          <line
            key={t}
            x1={LEFT}
            x2={RIGHT}
            y1={BOTTOM - t * (BOTTOM - TOP)}
            y2={BOTTOM - t * (BOTTOM - TOP)}
            stroke="hsl(var(--border))"
            strokeDasharray="4 6"
            strokeWidth="1"
          />
        ))}
        <line x1={LEFT} x2={RIGHT} y1={BOTTOM} y2={BOTTOM} stroke="hsl(var(--border))" strokeWidth="1" />

        {/* Area fill + Bézier line */}
        <path d={area} fill="url(#sales-gradient)" />
        <path d={line} fill="none" stroke="hsl(var(--accent))" strokeWidth="2.5" strokeLinecap="round" />

        {/* Data points */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={x(i)}
            cy={y(p.value)}
            r={i === n - 1 ? 5 : 3}
            fill="hsl(var(--background))"
            stroke="hsl(var(--accent))"
            strokeWidth="2"
          />
        ))}

        {/* X-axis labels */}
        {points.map((p, i) =>
          i % labelStep === 0 || i === n - 1 ? (
            <text
              key={`label-${i}`}
              x={x(i)}
              y={H - 14}
              textAnchor="middle"
              fontSize="12"
              fill="hsl(var(--muted-foreground))"
            >
              {p.label}
            </text>
          ) : null
        )}

        {/* Max value marker */}
        <text x={LEFT} y={TOP - 4} fontSize="12" fill="hsl(var(--muted-foreground))">
          max {formatPrice(max)}
        </text>
      </svg>
    </div>
  );
}
