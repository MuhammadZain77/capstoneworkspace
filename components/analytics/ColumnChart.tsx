'use client';

import * as React from 'react';

export interface ColumnChartItem {
  label: string;
  value: number;
  color?: string;
  secondaryValue?: number;
}

interface ColumnChartProps {
  data: ColumnChartItem[];
  title?: string;
  subtitle?: string;
  height?: number;
  onBarClick?: (item: ColumnChartItem) => void;
}

export function ColumnChart({
  data,
  title,
  subtitle,
  height = 220,
  onBarClick,
}: ColumnChartProps) {
  const [hoveredIdx, setHoveredIdx] = React.useState<number | null>(null);

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const chartHeight = height - 60; // Leave room for labels & header

  const defaultColors = [
    '#3b82f6', // Electric Blue
    '#f59e0b', // Amber
    '#8b5cf6', // Purple
    '#10b981', // Emerald
    '#06b6d4', // Cyan
    '#f43f5e', // Rose
  ];

  return (
    <div className="rounded-xl border border-border/90 bg-card p-5 shadow-sm transition-all hover:border-primary/40 flex flex-col">
      {(title || subtitle) && (
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && <h3 className="text-sm font-bold tracking-tight text-foreground">{title}</h3>}
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
          {hoveredIdx !== null && (
            <div className="px-2.5 py-1 rounded-md bg-muted/80 border border-border text-[11px] font-semibold text-foreground animate-in fade-in-50">
              <span className="text-muted-foreground mr-1.5">{data[hoveredIdx].label}:</span>
              <span className="font-bold text-primary">{data[hoveredIdx].value} tasks</span>
            </div>
          )}
        </div>
      )}

      {/* Chart Canvas */}
      <div className="relative flex-1 flex items-end justify-between gap-3 pt-6 pb-2 px-2" style={{ minHeight: `${chartHeight}px` }}>
        {/* Horizontal grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
          <div className="border-b border-border w-full" />
          <div className="border-b border-border w-full" />
          <div className="border-b border-border w-full" />
          <div className="border-b border-border w-full" />
        </div>

        {data.map((item, idx) => {
          const barHeightPercent = Math.max(Math.round((item.value / maxValue) * 100), 6);
          const color = item.color || defaultColors[idx % defaultColors.length];
          const isHovered = hoveredIdx === idx;

          return (
            <div
              key={item.label}
              className="relative flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              onClick={() => onBarClick && onBarClick(item)}
            >
              {/* Value floating tag */}
              <span
                className={`text-[11px] font-bold mb-1.5 transition-all ${
                  isHovered ? 'text-foreground scale-110 font-extrabold' : 'text-muted-foreground'
                }`}
              >
                {item.value}
              </span>

              {/* Bar column */}
              <div
                className="w-full max-w-[42px] rounded-t-lg transition-all duration-300 relative overflow-hidden"
                style={{
                  height: `${barHeightPercent}%`,
                  backgroundColor: color,
                  boxShadow: isHovered
                    ? `0 0 16px ${color}80, 0 4px 12px ${color}60`
                    : `0 2px 8px ${color}30`,
                  filter: isHovered ? 'brightness(1.2)' : 'brightness(1)',
                }}
              >
                {/* Gradient shine highlight */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/25 opacity-70" />
              </div>

              {/* Column label */}
              <span
                className={`text-[11px] font-medium mt-2 truncate w-full text-center transition-colors ${
                  isHovered ? 'text-primary font-bold' : 'text-muted-foreground'
                }`}
                title={item.label}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
