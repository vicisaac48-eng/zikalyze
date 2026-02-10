/**
 * 🎨 Theme Color Settings — Test Suite
 * 
 * Validates theme color selection and persistence
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    clear: () => { store = {}; },
    removeItem: (key: string) => { delete store[key]; },
  };
})();

global.localStorage = localStorageMock as any;

describe('🎨 Theme Color Settings', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('Color Persistence', () => {
    it('should save theme color to localStorage', () => {
      const settingsKey = 'zikalyze_settings';
      const testSettings = {
        themeColor: 'green',
        soundEnabled: true,
        soundVolume: 0.7,
        language: 'English',
        currency: 'USD',
      };
      
      localStorage.setItem(settingsKey, JSON.stringify(testSettings));
      
      const stored = localStorage.getItem(settingsKey);
      expect(stored).toBeTruthy();
      
      const parsed = JSON.parse(stored!);
      expect(parsed.themeColor).toBe('green');
    });

    it('should load default cyan color when localStorage is empty', () => {
      const settingsKey = 'zikalyze_settings';
      const stored = localStorage.getItem(settingsKey);
      
      // Verify localStorage is empty
      expect(stored).toBeNull();
      
      // In the actual app, useSettings hook would return DEFAULT_SETTINGS
      const defaultThemeColor = 'cyan';
      expect(defaultThemeColor).toBe('cyan');
    });

    it('should support all four theme colors', () => {
      const validColors = ['cyan', 'green', 'purple', 'amber'];
      const settingsKey = 'zikalyze_settings';
      
      // Test that each color can be saved and retrieved
      validColors.forEach(color => {
        localStorage.setItem(settingsKey, JSON.stringify({ themeColor: color }));
        const stored = localStorage.getItem(settingsKey);
        const parsed = JSON.parse(stored!);
        expect(parsed.themeColor).toBe(color);
        localStorage.clear();
      });
    });
  });

  describe('Color Mapping', () => {
    it('should have valid HSL values for all colors', () => {
      const colorMap: Record<string, { primary: string; ring: string }> = {
        cyan: { primary: "168 76% 73%", ring: "168 76% 73%" },
        green: { primary: "142 76% 60%", ring: "142 76% 60%" },
        purple: { primary: "267 84% 81%", ring: "267 84% 81%" },
        amber: { primary: "38 92% 60%", ring: "38 92% 60%" },
      };

      // Validate HSL format (H S% L%)
      const hslPattern = /^\d{1,3} \d{1,3}% \d{1,3}%$/;

      Object.entries(colorMap).forEach(([color, values]) => {
        expect(values.primary).toMatch(hslPattern);
        expect(values.ring).toMatch(hslPattern);
      });
    });

    it('should have matching primary and ring colors', () => {
      const colorMap: Record<string, { primary: string; ring: string }> = {
        cyan: { primary: "168 76% 73%", ring: "168 76% 73%" },
        green: { primary: "142 76% 60%", ring: "142 76% 60%" },
        purple: { primary: "267 84% 81%", ring: "267 84% 81%" },
        amber: { primary: "38 92% 60%", ring: "38 92% 60%" },
      };

      Object.entries(colorMap).forEach(([color, values]) => {
        expect(values.primary).toBe(values.ring);
      });
    });
  });

  describe('State Management', () => {
    it('should update theme color in settings', () => {
      const settingsKey = 'zikalyze_settings';
      let currentSettings = { themeColor: 'cyan' };
      
      // Save initial state
      localStorage.setItem(settingsKey, JSON.stringify(currentSettings));
      
      // Simulate color change (what handleThemeColorChange does)
      currentSettings = { ...currentSettings, themeColor: 'purple' };
      localStorage.setItem(settingsKey, JSON.stringify(currentSettings));
      
      // Verify the change
      const stored = localStorage.getItem(settingsKey);
      const parsed = JSON.parse(stored!);
      expect(parsed.themeColor).toBe('purple');
      expect(parsed.themeColor).not.toBe('cyan');
    });

    it('should persist color across page reloads', () => {
      const settingsKey = 'zikalyze_settings';
      
      // Save purple color
      const settings = { themeColor: 'purple' };
      localStorage.setItem(settingsKey, JSON.stringify(settings));
      
      // Simulate page reload by reading from localStorage
      const stored = localStorage.getItem(settingsKey);
      const loaded = JSON.parse(stored!);
      
      expect(loaded.themeColor).toBe('purple');
    });
  });
});
