'use client';

import * as React from 'react';

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutSegment[];
  title?: string;
  subtitle?: string;
  size?: number;
  thickness?: number;
  centerTitle?: string;
  centerSubtitle?: string;
}

export function DonutChart({
  data,
  title,
  subtitle,
  size = 180,
  thickness = 24,
  centerTitle,
  centerSubtitle,
}: DonutChartProps) {
  const [hoveredSegment, setHoveredSegment] = React.useState<DonutSegment | null>(null);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  // Compute stroke dash offsets
  let accumulatedOffset = 0;
  const segmentsWithAngles = data.map((seg) => {
    const fraction = total > 0 ? seg.value / total : 0;
    const strokeDasharray = `${fraction * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedOffset;
    accumulatedOffset += fraction * circumference;
    return {
      ...seg,
      percentage: Math.round(fraction * 100),
      strokeDasharray,
      strokeDashoffset,
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
        {/* SVG Donut Ring */}
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="rotate-[-90deg]">
            {/* Background track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="currentColor"
              className="text-border/40"
              strokeWidth={thickness}
            />

            {/* Segment arcs */}
            {segmentsWithAngles.map((seg) => {
              const isHovered = hoveredSegment?.label === seg.label;
              return (
                <circle
                  key={seg.label}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth={isHovered ? thickness + 4 : thickness}
                  strokeDasharray={seg.strokeDasharray}
                  strokeDashoffset={seg.strokeDashoffset}
                  className="transition-all duration-300 cursor-pointer"
                  style={{
                    filter: isHovered ? `drop-shadow(0 0 10px ${seg.color})` : undefined,
                  }}
                  onMouseEnter={() => setHoveredSegment(seg)}
                  onMouseLeave={() => setHoveredSegment(null)}
                />
              );
            })}
          </svg>

          {/* Dynamic Center Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2">
            {hoveredSegment ? (
              <>
                <span className="text-lg font-extrabold text-foreground leading-none">
                  {hoveredSegment.value}
                </span>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-1 truncate max-w-[90px]">
                  {hoveredSegment.label}
                </span>
                <span className="text-[10px] font-mono text-primary font-bold mt-0.5">
                  {total > 0 ? Math.round((hoveredSegment.value / total) * 100) : 0}%
                </span>
              </>
            ) : (
              <>
                <span className="text-2xl font-black text-foreground tracking-tight">
                  {total}
                </span>
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5">
                  {centerSubtitle || 'Total Tasks'}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2 min-w-[130px]">
          {segmentsWithAngles.map((seg) => {
            const isHovered = hoveredSegment?.label === seg.label;
            return (
              <div
                key={seg.label}
                className={`flex items-center justify-between gap-2 text-xs p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isHovered ? 'bg-muted/80' : 'hover:bg-muted/40'
                }`}
                onMouseEnter={() => setHoveredSegment(seg)}
                onMouseLeave={() => setHoveredSegment(null)}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{
                      backgroundColor: seg.color,
                      boxShadow: isHovered ? `0 0 8px ${seg.color}` : undefined,
                    }}
                  />
                  <span className={`capitalize ${isHovered ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
                    {seg.label}
                  </span>
                </div>
                <div className="flex items-center gap-1 font-mono text-[11px]">
                  <span className="font-bold text-foreground">{seg.value}</span>
                  <span className="text-muted-foreground text-[10px]">({seg.percentage}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
