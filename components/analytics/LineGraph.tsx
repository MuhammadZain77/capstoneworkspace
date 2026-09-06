'use client';

import * as React from 'react';

export interface LineGraphPoint {
  label: string;
  value: number;
  secondaryValue?: number;
}

interface LineGraphProps {
  data: LineGraphPoint[];
  title?: string;
  subtitle?: string;
  lineColor?: string;
  areaColor?: string;
  height?: number;
}

export function LineGraph({
  data,
  title,
  subtitle,
  lineColor = '#6366f1', // Electric Indigo
  areaColor = '#818cf8',
  height = 220,
}: LineGraphProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const width = 500;
  const graphHeight = height - 70;
  const paddingX = 35;
  const paddingY = 20;

  const maxValue = Math.max(...data.map((d) => d.value), 5);
  const minValue = 0;

  // Compute points
  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * (width - paddingX * 2);
    const y = graphHeight - paddingY - (d.value / maxValue) * (graphHeight - paddingY * 2);
    return { x, y, ...d };
  });

  // Build SVG path
  const pathD = points.reduce((acc, curr, idx, arr) => {
    if (idx === 0) return `M ${curr.x} ${curr.y}`;
    const prev = arr[idx - 1];
    const cX1 = prev.x + (curr.x - prev.x) / 2;
    const cY1 = prev.y;
    const cX2 = prev.x + (curr.x - prev.x) / 2;
    const cY2 = curr.y;
    return `${acc} C ${cX1} ${cY1}, ${cX2} ${cY2}, ${curr.x} ${curr.y}`;
  }, '');

  // Area path
  const areaD = `${pathD} L ${points[points.length - 1].x} ${graphHeight - paddingY} L ${points[0].x} ${graphHeight - paddingY} Z`;

  return (
    <div className="rounded-xl border border-border/90 bg-card p-5 shadow-sm transition-all hover:border-primary/40 flex flex-col">
      {(title || subtitle) && (
        <div className="flex items-center justify-between mb-3">
          <div>
            {title && <h3 className="text-sm font-bold tracking-tight text-foreground">{title}</h3>}
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
          {hoveredIndex !== null && (
            <div className="px-2.5 py-1 rounded-md bg-muted/80 border border-border text-[11px] font-semibold text-foreground animate-in fade-in-50">
              <span className="text-muted-foreground mr-1.5">{data[hoveredIndex].label}:</span>
              <span className="font-bold text-indigo-400">{data[hoveredIndex].value} completed</span>
            </div>
          )}
        </div>
      )}

      <div className="relative w-full overflow-hidden" style={{ height: `${graphHeight + 30}px` }}>
        <svg
          viewBox={`0 0 ${width} ${graphHeight + 30}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={areaColor} stopOpacity="0.35" />
              <stop offset="100%" stopColor={areaColor} stopOpacity="0.0" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor={lineColor} floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Grid horizontal lines */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={width - paddingX}
            y2={paddingY}
            stroke="currentColor"
            className="text-border/40"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={graphHeight / 2}
            x2={width - paddingX}
            y2={graphHeight / 2}
            stroke="currentColor"
            className="text-border/40"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={graphHeight - paddingY}
            x2={width - paddingX}
            y2={graphHeight - paddingY}
            stroke="currentColor"
            className="text-border/40"
          />

          {/* Area fill */}
          <path d={areaD} fill="url(#areaGrad)" />

          {/* Glowing Line */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#lineGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            filter="url(#glow)"
          />

          {/* Data Points */}
          {points.map((pt, idx) => {
            const isHovered = hoveredIndex === idx;
            return (
              <g
                key={idx}
                className="cursor-pointer transition-transform"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6 : 4}
                  className="transition-all duration-200"
                  fill="#ffffff"
                  stroke={lineColor}
                  strokeWidth={isHovered ? 3 : 2}
                  style={{
                    filter: isHovered ? `drop-shadow(0 0 8px ${lineColor})` : undefined,
                  }}
                />
                {/* X axis labels */}
                <text
                  x={pt.x}
                  y={graphHeight + 16}
                  textAnchor="middle"
                  className={`text-[10px] font-mono fill-current transition-colors ${
                    isHovered ? 'text-primary font-bold' : 'text-muted-foreground'
                  }`}
                >
                  {pt.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
