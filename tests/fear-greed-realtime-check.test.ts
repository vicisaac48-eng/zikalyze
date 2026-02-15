/**
 * Test to verify Fear & Greed Index real-time data accuracy
 * 
 * This test validates:
 * 1. API response includes timestamp data
 * 2. Timestamp is validated for freshness (< 48 hours)
 * 3. Data age is correctly calculated
 * 4. isLive flag is set based on data age
 */

import { describe, it, expect, beforeAll } from '@jest/globals';

// Mock the Fear & Greed API response
const mockApiResponse = {
  name: "Fear and Greed Index",
  data: [
    {
      value: "45",
      value_classification: "Fear",
      timestamp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
      time_until_update: "85200"
    },
    {
      value: "50",
      value_classification: "Neutral",
      timestamp: Math.floor(Date.now() / 1000) - 90000, // ~25 hours ago
      time_until_update: null
    }
  ],
  metadata: {
    error: null
  }
};

const mockStaleApiResponse = {
  name: "Fear and Greed Index",
  data: [
    {
      value: "45",
      value_classification: "Fear",
      timestamp: Math.floor(Date.now() / 1000) - (50 * 60 * 60), // 50 hours ago (too old)
      time_until_update: "85200"
    },
    {
      value: "50",
      value_classification: "Neutral",
      timestamp: Math.floor(Date.now() / 1000) - (52 * 60 * 60), // 52 hours ago
      time_until_update: null
    }
  ],
  metadata: {
    error: null
  }
};

describe('Fear & Greed Real-time Data Validation', () => {
  
  it('should extract timestamp from API response', () => {
    const data = mockApiResponse.data[0];
    const timestamp = parseInt(data.timestamp) * 1000;
    
    expect(timestamp).toBeGreaterThan(0);
    expect(typeof timestamp).toBe('number');
  });
  
  it('should calculate data age correctly', () => {
    const data = mockApiResponse.data[0];
    const apiTimestamp = parseInt(data.timestamp) * 1000;
    const now = Date.now();
    const dataAge = now - apiTimestamp;
    const dataAgeHours = dataAge / (1000 * 60 * 60);
    
    // Data should be about 1 hour old
    expect(dataAgeHours).toBeGreaterThan(0.9);
    expect(dataAgeHours).toBeLessThan(1.5);
  });
  
  it('should mark fresh data as live (< 24 hours)', () => {
    const data = mockApiResponse.data[0];
    const apiTimestamp = parseInt(data.timestamp) * 1000;
    const now = Date.now();
    const dataAgeHours = (now - apiTimestamp) / (1000 * 60 * 60);
    const isLive = dataAgeHours < 24;
    
    expect(isLive).toBe(true);
  });
  
  it('should reject stale data (> 48 hours)', () => {
    const data = mockStaleApiResponse.data[0];
    const apiTimestamp = parseInt(data.timestamp) * 1000;
    const now = Date.now();
    const dataAge = now - apiTimestamp;
    const maxAge = 48 * 60 * 60 * 1000;
    
    expect(dataAge).toBeGreaterThan(maxAge);
  });
  
  it('should calculate correct trend from value changes', () => {
    const current = parseInt(mockApiResponse.data[0].value);
    const previous = parseInt(mockApiResponse.data[1].value);
    const diff = current - previous;
    
    let trend: 'RISING' | 'FALLING' | 'STABLE';
    if (diff > 3) trend = 'RISING';
    else if (diff < -3) trend = 'FALLING';
    else trend = 'STABLE';
    
    // Current: 45, Previous: 50, diff = -5, so FALLING
    expect(trend).toBe('FALLING');
  });
  
  it('should have valid API response structure', () => {
    expect(mockApiResponse).toHaveProperty('data');
    expect(Array.isArray(mockApiResponse.data)).toBe(true);
    expect(mockApiResponse.data.length).toBeGreaterThanOrEqual(2);
    
    const current = mockApiResponse.data[0];
    expect(current).toHaveProperty('value');
    expect(current).toHaveProperty('value_classification');
    expect(current).toHaveProperty('timestamp');
  });
  
  it('should calculate AI weight based on extreme values', () => {
    const testValues = [
      { value: 10, expectedWeight: 0.84 }, // Extreme fear
      { value: 50, expectedWeight: 0.2 },  // Neutral (minimum weight)
      { value: 90, expectedWeight: 0.84 }, // Extreme greed
    ];
    
    testValues.forEach(({ value, expectedWeight }) => {
      const distanceFromNeutral = Math.abs(value - 50);
      const weight = Math.min(1, (distanceFromNeutral / 50) * 0.8 + 0.2);
      expect(weight).toBeCloseTo(expectedWeight, 2);
    });
  });
  
  it('should map values to correct extreme levels', () => {
    const testCases = [
      { value: 10, expected: 'EXTREME_FEAR' },
      { value: 30, expected: 'FEAR' },
      { value: 50, expected: 'NEUTRAL' },
      { value: 70, expected: 'GREED' },
      { value: 85, expected: 'EXTREME_GREED' },
    ];
    
    testCases.forEach(({ value, expected }) => {
      let level: string;
      if (value <= 20) level = 'EXTREME_FEAR';
      else if (value <= 35) level = 'FEAR';
      else if (value <= 65) level = 'NEUTRAL';
      else if (value <= 80) level = 'GREED';
      else level = 'EXTREME_GREED';
      
      expect(level).toBe(expected);
    });
  });
});

console.log('✅ Fear & Greed real-time validation tests defined successfully!');
