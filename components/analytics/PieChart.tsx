'use client';

import * as React from 'react';

export interface PieSlice {
  label: string;
  value: number;
  color: string;
  avatar?: string;
}

interface PieChartProps {
  data: PieSlice[];
  title?: string;
  subtitle?: string;
  size?: number;
}

export function PieChart({
  data,
  title,
  subtitle,
  size = 180,
}: PieChartProps) {
  const [hoveredIdx, setHoveredIdx] = React.useState<number | null>(null);

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 10;

  let currentAngle = -Math.PI / 2; // Start from top

  const slices = data.map((d) => {
    const angleSpan = total > 0 ? (d.value / total) * 2 * Math.PI : 0;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angleSpan;
    currentAngle += angleSpan;

    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);

    const largeArcFlag = angleSpan > Math.PI ? 1 : 0;

    // SVG path definition
    const pathD =
      angleSpan >= 2 * Math.PI - 0.001
        ? `M ${cx} ${cy - radius} A ${radius} ${radius} 0 1 1 ${cx - 0.001} ${cy - radius} Z`
        : `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

    const percentage = total > 0 ? Math.round((d.value / total) * 100) : 0;

    return {
      ...d,
      pathD,
      percentage,
    };
  });

  return (
    <div className="rounded-xl border border-border/90 bg-card p-5 shadow-sm transition-all hover:border-primary/40 flex flex-col">
      {(title || subtitle) && (
        <div className="mb-3">
          {title && <h3 className="text-sm font-bold tracking-tight text-foreground">{title}</h3>}
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-around gap-4 flex-1">
        {/* SVG Pie */}
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="overflow-visible">
            {slices.map((s, idx) => {
              const isHovered = hoveredIdx === idx;
              return (
                <path
                  key={s.label}
                  d={s.pathD}
                  fill={s.color}
                  stroke="var(--card)"
                  strokeWidth="2"
                  className="transition-all duration-300 cursor-pointer"
                  style={{
                    transformOrigin: `${cx}px ${cy}px`,
                    transform: isHovered ? 'scale(1.06)' : 'scale(1)',
                    filter: isHovered ? `drop-shadow(0 0 12px ${s.color}) brightness(1.2)` : undefined,
                  }}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2 min-w-[140px]">
          {slices.map((s, idx) => {
            const isHovered = hoveredIdx === idx;
            return (
              <div
                key={s.label}
                className={`flex items-center justify-between gap-2 text-xs p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isHovered ? 'bg-muted/80' : 'hover:bg-muted/40'
                }`}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{
                      backgroundColor: s.color,
                      boxShadow: isHovered ? `0 0 8px ${s.color}` : undefined,
                    }}
                  />
                  <span className={`truncate max-w-[100px] ${isHovered ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
                    {s.label}
                  </span>
                </div>
                <div className="flex items-center gap-1 font-mono text-[11px]">
                  <span className="font-bold text-foreground">{s.value}</span>
                  <span className="text-muted-foreground text-[10px]">({s.percentage}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
