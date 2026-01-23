import React from 'react';

interface Props {
  heatmap: number[]; // values in [0..1]
  labels?: string[]; // optional labels per entry (e.g., ['15m','1h','4h','1d'])
  width?: number; // px
  height?: number; // px per row
}

const clamp = (v: number) => Math.max(0, Math.min(1, v));

function colorForValue(v: number): string {
  // Blue (low) -> Yellow -> Red (high)
  const t = clamp(v);
  const r = Math.round(Math.min(255, 255 * Math.max(0, (t - 0.5) * 2)));
  const g = Math.round(200 * (1 - Math.abs(t - 0.5) * 2));
  const b = Math.round(Math.min(255, 255 * Math.max(0, (0.5 - t) * 2)));
  return `rgb(${r},${g},${b})`;
}

export const AttentionHeatmap: React.FC<Props> = ({ heatmap, labels, width = 420, height = 28 }) => {
  if (!heatmap || heatmap.length === 0) return null;
  const entries = heatmap.map(v => clamp(v));
  const labelList = labels && labels.length === entries.length ? labels : entries.map((_, i) => String(i));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {entries.map((v, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              title={`${labelList[i]}: ${(v * 100).toFixed(1)}%`}
              style={{
                width: Math.floor(width / entries.length) - 4,
                height,
                background: colorForValue(v),
                borderRadius: 4,
                boxShadow: 'inset 0 -6px rgba(0,0,0,0.12)'
              }}
            />
            <div style={{ fontSize: 11, color: '#666', marginTop: 6 }}>{labelList[i]}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 12, color: '#444' }}>Attention heatmap (darker = higher importance)</div>
    </div>
  );
};

export default AttentionHeatmap;
