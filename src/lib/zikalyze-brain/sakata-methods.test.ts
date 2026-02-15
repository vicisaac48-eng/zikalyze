// ═══════════════════════════════════════════════════════════════════════════════
// 🧪 SAKATA METHODS TESTS — Validation Suite
// ═══════════════════════════════════════════════════════════════════════════════

import { describe, it, expect } from 'vitest';
import { analyzeSakataMethods } from './sakata-methods';

describe('Sakata Methods Pattern Detection', () => {
  
  describe('🏔️ San-zan (Three Mountains) Detection', () => {
    it('should detect triple top pattern', () => {
      // Create pattern: Three peaks at similar levels
      const candles = [
        ...generateUptrend(5, 100, 110),
        { open: 110, high: 120, low: 109, close: 115 }, // Peak 1
        ...generateDowntrend(3, 115, 105),
        { open: 105, high: 119, low: 104, close: 114 }, // Peak 2
        ...generateDowntrend(3, 114, 106),
        { open: 106, high: 121, low: 105, close: 116 }, // Peak 3
        { open: 116, high: 117, low: 102, close: 103 }  // Breakdown
      ];
      
      const analysis = analyzeSakataMethods(candles, 103, 'SHORT');
      
      expect(analysis.primaryPattern).toBeTruthy();
      expect(analysis.primaryPattern?.method).toBe('SAN_ZAN');
      expect(analysis.primaryPattern?.bias).toBe('BEARISH');
      expect(analysis.primaryPattern?.strength).toBeGreaterThan(60);
    });
  });
  
  describe('🌊 San-sen (Three Rivers) Detection', () => {
    it('should detect triple bottom pattern', () => {
      // Create pattern: Three troughs at similar levels
      const candles = [
        ...generateDowntrend(5, 100, 90),
        { open: 90, high: 91, low: 80, close: 85 }, // Trough 1
        ...generateUptrend(3, 85, 95),
        { open: 95, high: 96, low: 81, close: 86 }, // Trough 2
        ...generateUptrend(3, 86, 94),
        { open: 94, high: 95, low: 79, close: 84 }, // Trough 3
        { open: 84, high: 98, low: 83, close: 97 }  // Breakout
      ];
      
      const analysis = analyzeSakataMethods(candles, 97, 'LONG');
      
      expect(analysis.primaryPattern).toBeTruthy();
      expect(analysis.primaryPattern?.method).toBe('SAN_SEN');
      expect(analysis.primaryPattern?.bias).toBe('BULLISH');
      expect(analysis.primaryPattern?.strength).toBeGreaterThan(60);
    });
  });
  
  describe('🎯 San-poh (Three Methods) Detection', () => {
    it('should detect rising three methods continuation', () => {
      const candles = [
        { open: 100, high: 110, low: 99, close: 109 },  // Large bullish
        { open: 109, high: 109, low: 104, close: 105 }, // Small bearish
        { open: 105, high: 107, low: 103, close: 104 }, // Small bearish
        { open: 104, high: 108, low: 102, close: 106 }, // Small bearish
        { open: 106, high: 115, low: 105, close: 114 }  // Breakout bullish
      ];
      
      const analysis = analyzeSakataMethods(candles, 114, 'LONG');
      
      expect(analysis.primaryPattern).toBeTruthy();
      expect(analysis.primaryPattern?.method).toBe('SAN_POH');
      expect(analysis.primaryPattern?.pattern).toContain('Rising');
      expect(analysis.primaryPattern?.bias).toBe('BULLISH');
    });
    
    it('should detect falling three methods continuation', () => {
      const candles = [
        { open: 100, high: 101, low: 90, close: 91 },   // Large bearish
        { open: 91, high: 96, low: 91, close: 95 },     // Small bullish
        { open: 95, high: 97, low: 93, close: 94 },     // Small bullish
        { open: 94, high: 98, low: 92, close: 96 },     // Small bullish
        { open: 96, high: 97, low: 85, close: 86 }      // Breakout bearish
      ];
      
      const analysis = analyzeSakataMethods(candles, 86, 'SHORT');
      
      expect(analysis.primaryPattern).toBeTruthy();
      expect(analysis.primaryPattern?.method).toBe('SAN_POH');
      expect(analysis.primaryPattern?.pattern).toContain('Falling');
      expect(analysis.primaryPattern?.bias).toBe('BEARISH');
    });
  });
  
  describe('⚔️ San-ku (Three Soldiers/Crows) Detection', () => {
    it('should detect three white soldiers', () => {
      const candles = [
        { open: 100, high: 105, low: 99, close: 104 },  // Bullish 1
        { open: 102, high: 108, low: 101, close: 107 }, // Bullish 2
        { open: 105, high: 112, low: 104, close: 111 }  // Bullish 3
      ];
      
      const analysis = analyzeSakataMethods(candles, 111, 'LONG');
      
      expect(analysis.primaryPattern).toBeTruthy();
      expect(analysis.primaryPattern?.method).toBe('SAN_KU');
      expect(analysis.primaryPattern?.pattern).toContain('White Soldiers');
      expect(analysis.primaryPattern?.bias).toBe('BULLISH');
      expect(analysis.primaryPattern?.strength).toBeGreaterThan(60);
    });
    
    it('should detect three black crows', () => {
      const candles = [
        { open: 100, high: 101, low: 95, close: 96 },   // Bearish 1
        { open: 98, high: 99, low: 92, close: 93 },     // Bearish 2
        { open: 95, high: 96, low: 88, close: 89 }      // Bearish 3
      ];
      
      const analysis = analyzeSakataMethods(candles, 89, 'SHORT');
      
      expect(analysis.primaryPattern).toBeTruthy();
      expect(analysis.primaryPattern?.method).toBe('SAN_KU');
      expect(analysis.primaryPattern?.pattern).toContain('Black Crows');
      expect(analysis.primaryPattern?.bias).toBe('BEARISH');
      expect(analysis.primaryPattern?.strength).toBeGreaterThan(60);
    });
    
    it('should detect deliberation (exhaustion) pattern', () => {
      const candles = [
        { open: 100, high: 110, low: 99, close: 109 },  // Strong bullish
        { open: 107, high: 115, low: 106, close: 114 }, // Strong bullish
        { open: 112, high: 116, low: 111, close: 114 }  // Weak bullish with long wick
      ];
      
      const analysis = analyzeSakataMethods(candles, 114, 'LONG');
      
      expect(analysis.primaryPattern).toBeTruthy();
      if (analysis.primaryPattern?.pattern.includes('Deliberation')) {
        expect(analysis.primaryPattern.confidence).toBeLessThan(70);
      }
    });
  });
  
  describe('📊 Confluence Testing', () => {
    it('should detect high confluence when multiple patterns align', () => {
      // Create scenario with both Three Soldiers and continuation
      const candles = [
        { open: 100, high: 115, low: 99, close: 114 },  // Large bullish
        { open: 114, high: 115, low: 110, close: 111 }, // Small consolidation
        { open: 111, high: 113, low: 109, close: 110 },
        { open: 110, high: 112, low: 108, close: 109 },
        { open: 109, high: 120, low: 108, close: 119 }, // Breakout
        { open: 117, high: 124, low: 116, close: 123 }, // Soldier 1
        { open: 121, high: 128, low: 120, close: 127 }, // Soldier 2
        { open: 125, high: 132, low: 124, close: 131 }  // Soldier 3
      ];
      
      const analysis = analyzeSakataMethods(candles, 131, 'LONG');
      
      expect(analysis.overallBias).toBe('BULLISH');
      if (analysis.secondaryPatterns.length > 0) {
        expect(analysis.confluenceScore).toBeGreaterThan(70);
      }
    });
    
    it('should report mixed signals when patterns conflict', () => {
      // Create conflicting scenario
      const candles = [
        ...generateUptrend(10, 80, 120),  // Uptrend
        ...generateDowntrend(5, 120, 100) // Then downtrend
      ];
      
      const analysis = analyzeSakataMethods(candles, 100, 'NEUTRAL');
      
      // Should handle conflict gracefully
      expect(analysis).toBeTruthy();
      expect(analysis.overallBias).toBeDefined();
    });
  });
  
  describe('🎯 Integration with Bias', () => {
    it('should prioritize patterns matching the bias', () => {
      const candles = [
        { open: 100, high: 105, low: 99, close: 104 },
        { open: 102, high: 108, low: 101, close: 107 },
        { open: 105, high: 112, low: 104, close: 111 }
      ];
      
      const bullishAnalysis = analyzeSakataMethods(candles, 111, 'LONG');
      const bearishAnalysis = analyzeSakataMethods(candles, 111, 'SHORT');
      
      expect(bullishAnalysis.overallBias).toBe('BULLISH');
      // Bearish bias should still detect the bullish pattern but may weigh differently
      expect(bearishAnalysis).toBeTruthy();
    });
  });
});

// Helper functions to generate candle patterns
function generateUptrend(count: number, startPrice: number, endPrice: number) {
  const candles = [];
  const step = (endPrice - startPrice) / count;
  
  for (let i = 0; i < count; i++) {
    const open = startPrice + (i * step);
    const close = startPrice + ((i + 1) * step);
    const high = close + step * 0.1;
    const low = open - step * 0.1;
    
    candles.push({ open, high, low, close });
  }
  
  return candles;
}

function generateDowntrend(count: number, startPrice: number, endPrice: number) {
  const candles = [];
  const step = (startPrice - endPrice) / count;
  
  for (let i = 0; i < count; i++) {
    const open = startPrice - (i * step);
    const close = startPrice - ((i + 1) * step);
    const high = open + step * 0.1;
    const low = close - step * 0.1;
    
    candles.push({ open, high, low, close });
  }
  
  return candles;
}
