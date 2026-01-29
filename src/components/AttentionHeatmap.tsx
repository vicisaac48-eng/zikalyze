import React from 'react';
import { cn } from '@/lib/utils';
import { Eye, TrendingUp, Clock } from 'lucide-react';

interface Props {
  heatmap: number[]; // values in [0..1]
  labels?: string[]; // optional labels per entry (e.g., ['15m','1h','4h','1d'])
  title?: string;    // optional title
  showValues?: boolean; // show percentage values
  compact?: boolean; // compact mode for mobile
}

const clamp = (v: number) => Math.max(0, Math.min(1, v));

/**
 * Maps attention weight to color using HSL
 * Low attention: Blue (cold)
 * Medium attention: Yellow/Green (warm)
 * High attention: Red/Orange (hot)
 */
function getAttentionColor(v: number): string {
  const t = clamp(v);
  // Hue: 240 (blue) -> 60 (yellow) -> 0 (red)
  const hue = 240 - t * 240;
  const saturation = 70 + t * 20; // More saturated for higher values
  const lightness = 50 + (1 - t) * 15; // Darker for higher attention
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Get text color that contrasts with background
 */
function getTextColor(v: number): string {
  const t = clamp(v);
  // White text for dark backgrounds (high attention), dark for light
  return t > 0.6 ? 'hsl(0, 0%, 100%)' : 'hsl(0, 0%, 20%)';
}

/**
 * Default timeframe labels for multi-timeframe analysis
 */
const DEFAULT_LABELS = ['15m', '1h', '4h', '1d'];

export const AttentionHeatmap: React.FC<Props> = ({ 
  heatmap, 
  labels, 
  title = "🧠 AI Attention Focus",
  showValues = true,
  compact = false
}) => {
  if (!heatmap || heatmap.length === 0) return null;
  
  const entries = heatmap.map(v => clamp(v));
  const labelList = labels && labels.length === entries.length 
    ? labels 
    : DEFAULT_LABELS.slice(0, entries.length);
  
  // Find the max attention for highlighting
  const maxAttention = Math.max(...entries);
  const maxIndex = entries.indexOf(maxAttention);
  
  // Calculate relative importance
  const sumAttention = entries.reduce((a, b) => a + b, 0);
  const relativeWeights = entries.map(v => sumAttention > 0 ? v / sumAttention : 1 / entries.length);

  return (
    <div className={cn(
      "rounded-xl border border-border/50 bg-gradient-to-br from-background to-secondary/20",
      compact ? "p-2" : "p-4"
    )}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/20">
          <Eye className="h-3.5 w-3.5 text-primary" />
        </div>
        <span className={cn(
          "font-medium text-foreground",
          compact ? "text-xs" : "text-sm"
        )}>
          {title}
        </span>
        <span className="text-xs text-muted-foreground ml-auto">
          Attention(Q,K,V)
        </span>
      </div>
      
      {/* Heatmap Bars */}
      <div className={cn(
        "grid gap-2",
        compact ? "gap-1" : "gap-2"
      )} style={{ gridTemplateColumns: `repeat(${entries.length}, 1fr)` }}>
        {entries.map((v, i) => {
          const isMax = i === maxIndex;
          const bgColor = getAttentionColor(v);
          const textColor = getTextColor(v);
          
          return (
            <div 
              key={i} 
              className="flex flex-col items-center"
            >
              {/* Bar */}
              <div
                title={`${labelList[i]}: ${(v * 100).toFixed(1)}% attention weight`}
                className={cn(
                  "w-full rounded-lg transition-all duration-300 relative overflow-hidden",
                  compact ? "h-8" : "h-12",
                  isMax && "ring-2 ring-primary ring-offset-1 ring-offset-background"
                )}
                style={{ 
                  background: bgColor,
                  boxShadow: `inset 0 -4px 8px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1)`
                }}
              >
                {/* Percentage inside bar */}
                {showValues && (
                  <div 
                    className={cn(
                      "absolute inset-0 flex items-center justify-center font-bold tabular-nums",
                      compact ? "text-xs" : "text-sm"
                    )}
                    style={{ color: textColor }}
                  >
                    {(v * 100).toFixed(0)}%
                  </div>
                )}
                
                {/* Highlight indicator for max */}
                {isMax && (
                  <div className="absolute top-0.5 right-0.5">
                    <TrendingUp className="h-3 w-3 text-primary" />
                  </div>
                )}
              </div>
              
              {/* Label */}
              <div className={cn(
                "mt-1.5 flex items-center gap-1",
                compact ? "text-[10px]" : "text-xs"
              )}>
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className={cn(
                  "font-medium",
                  isMax ? "text-primary" : "text-muted-foreground"
                )}>
                  {labelList[i]}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Footer explanation */}
      <div className={cn(
        "mt-3 pt-2 border-t border-border/30 flex items-center justify-between",
        compact ? "text-[10px]" : "text-xs"
      )}>
        <span className="text-muted-foreground">
          Higher % = AI focuses more on this timeframe
        </span>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div 
              className="w-3 h-3 rounded" 
              style={{ background: getAttentionColor(0.2) }} 
            />
            <span className="text-muted-foreground">Low</span>
          </div>
          <div className="flex items-center gap-1">
            <div 
              className="w-3 h-3 rounded" 
              style={{ background: getAttentionColor(0.8) }} 
            />
            <span className="text-muted-foreground">High</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttentionHeatmap;
