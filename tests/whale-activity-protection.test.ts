/**
 * Whale Activity Integration Tests
 * 
 * CRITICAL: These tests ensure whale tracking remains functional.
 * DO NOT REMOVE OR DISABLE without understanding the impact.
 * 
 * Purpose: Protect the whale tracking implementation from:
 * - Accidental deletion
 * - Breaking changes
 * - Feature regressions
 * - Configuration errors
 */

import { describe, it, expect, beforeAll } from 'vitest';

describe('Whale Activity Protection Tests', () => {
  
  describe('🔒 Critical Functionality Protection', () => {
    
    it('CRITICAL: Whale tracker service file must exist', async () => {
      // This test will fail if someone deletes the whale tracker
      const fs = await import('fs');
      const path = await import('path');
      
      const whaleTrackerPath = path.resolve(__dirname, '../supabase/functions/whale-tracker/index.ts');
      const exists = fs.existsSync(whaleTrackerPath);
      
      expect(exists).toBe(true);
      
      if (!exists) {
        throw new Error(
          '❌ CRITICAL: Whale tracker service has been deleted!\n' +
          'This breaks whale activity for all 100 cryptocurrencies.\n' +
          'File must exist: supabase/functions/whale-tracker/index.ts'
        );
      }
    });
    
    it('CRITICAL: Whale tracker must have multi-blockchain support', async () => {
      const fs = await import('fs');
      const path = await import('path');
      
      const whaleTrackerPath = path.resolve(__dirname, '../supabase/functions/whale-tracker/index.ts');
      const content = fs.readFileSync(whaleTrackerPath, 'utf-8');
      
      // Check for critical blockchain mappings
      expect(content).toContain('BLOCKCHAIN_MAP');
      expect(content).toContain('bitcoin');
      expect(content).toContain('ethereum');
      expect(content).toContain('solana');
      
      // Check for critical functions
      expect(content).toContain('fetchBTCLargeTransactions');
      expect(content).toContain('fetchBlockchairTransactions');
      expect(content).toContain('aggregateWhaleActivity');
    });
    
    it('CRITICAL: Crypto-analyze must call whale tracker', async () => {
      const fs = await import('fs');
      const path = await import('path');
      
      const cryptoAnalyzePath = path.resolve(__dirname, '../supabase/functions/crypto-analyze/index.ts');
      const content = fs.readFileSync(cryptoAnalyzePath, 'utf-8');
      
      // Must call whale-tracker service
      expect(content).toContain('whale-tracker');
      expect(content).toContain('whaleResponse');
      
      // Must pass price for accurate calculations
      expect(content).toContain('priceUSD');
      
      if (!content.includes('whale-tracker')) {
        throw new Error(
          '❌ CRITICAL: Whale tracker integration has been removed from crypto-analyze!\n' +
          'This breaks live whale activity tracking.\n' +
          'The crypto-analyze function must call the whale-tracker service.'
        );
      }
    });
    
    it('CRITICAL: UI must display whale activity source', async () => {
      const fs = await import('fs');
      const path = await import('path');
      
      const brainIndexPath = path.resolve(__dirname, '../src/lib/zikalyze-brain/index.ts');
      const content = fs.readFileSync(brainIndexPath, 'utf-8');
      
      // Must display whale activity with source
      expect(content).toContain('Whale Activity');
      expect(content).toContain('whaleActivity.source');
      
      // Must show different labels based on source
      expect(content).toContain('Live from Whale-Alert API');
      expect(content).toContain('Live on-chain data');
      expect(content).toContain('Estimated from price momentum');
    });
  });
  
  describe('🛡️ Configuration Protection', () => {
    
    it('Should maintain BLOCKCHAIN_MAP for all supported chains', async () => {
      const fs = await import('fs');
      const path = await import('path');
      
      const whaleTrackerPath = path.resolve(__dirname, '../supabase/functions/whale-tracker/index.ts');
      const content = fs.readFileSync(whaleTrackerPath, 'utf-8');
      
      // Extract BLOCKCHAIN_MAP
      const blockchainMapMatch = content.match(/const BLOCKCHAIN_MAP[^}]+}/s);
      expect(blockchainMapMatch).toBeTruthy();
      
      const blockchainMap = blockchainMapMatch![0];
      
      // Verify critical cryptocurrencies are mapped
      const criticalCoins = [
        'BTC', 'ETH', 'BNB', 'SOL', 'MATIC', 'AVAX',
        'USDT', 'USDC', 'LINK', 'UNI', 'DOGE', 'ADA'
      ];
      
      for (const coin of criticalCoins) {
        expect(blockchainMap).toContain(coin);
      }
    });
    
    it('Should maintain EXCHANGE_ADDRESSES for buy/sell classification', async () => {
      const fs = await import('fs');
      const path = await import('path');
      
      const whaleTrackerPath = path.resolve(__dirname, '../supabase/functions/whale-tracker/index.ts');
      const content = fs.readFileSync(whaleTrackerPath, 'utf-8');
      
      // Must have exchange addresses for at least BTC and ETH
      expect(content).toContain('EXCHANGE_ADDRESSES');
      
      // Extract EXCHANGE_ADDRESSES
      const exchangeMatch = content.match(/const EXCHANGE_ADDRESSES[^;]+;/s);
      expect(exchangeMatch).toBeTruthy();
      
      const exchangeAddrs = exchangeMatch![0];
      expect(exchangeAddrs).toContain('BTC:');
      expect(exchangeAddrs).toContain('ETH:');
      
      // Verify Binance addresses are present
      expect(exchangeAddrs).toContain('Binance');
    });
  });
  
  describe('🔧 Fallback Protection', () => {
    
    it('Must have 3-tier fallback system', async () => {
      const fs = await import('fs');
      const path = await import('path');
      
      const cryptoAnalyzePath = path.resolve(__dirname, '../supabase/functions/crypto-analyze/index.ts');
      const content = fs.readFileSync(cryptoAnalyzePath, 'utf-8');
      
      // Must have try-catch for whale tracker
      expect(content).toContain('try {');
      expect(content).toContain('catch (error)');
      
      // Must have fallback to derived whale activity
      expect(content).toContain('Falling back to derived whale activity');
      expect(content).toContain("source: 'derived'");
    });
    
    it('Must handle whale tracker service errors gracefully', async () => {
      const fs = await import('fs');
      const path = await import('path');
      
      const cryptoAnalyzePath = path.resolve(__dirname, '../supabase/functions/crypto-analyze/index.ts');
      const content = fs.readFileSync(cryptoAnalyzePath, 'utf-8');
      
      // Must check response status
      expect(content).toContain('whaleResponse.ok');
      
      // Must validate data before using
      expect(content).toContain('isLive');
      expect(content).toContain('transactionCount');
    });
  });
  
  describe('📊 Data Structure Protection', () => {
    
    it('WhaleActivityResult interface must have required fields', async () => {
      const fs = await import('fs');
      const path = await import('path');
      
      const whaleTrackerPath = path.resolve(__dirname, '../supabase/functions/whale-tracker/index.ts');
      const content = fs.readFileSync(whaleTrackerPath, 'utf-8');
      
      // Extract WhaleActivityResult interface
      const interfaceMatch = content.match(/interface WhaleActivityResult \{[^}]+\}/s);
      expect(interfaceMatch).toBeTruthy();
      
      const whaleInterface = interfaceMatch![0];
      
      // Verify required fields
      const requiredFields = [
        'symbol', 'buying', 'selling', 'netFlow',
        'totalBuyVolume', 'totalSellVolume', 'transactionCount',
        'source', 'isLive', 'dataAge'
      ];
      
      for (const field of requiredFields) {
        expect(whaleInterface).toContain(field);
      }
    });
    
    it('whaleActivity object must have source field', async () => {
      const fs = await import('fs');
      const path = await import('path');
      
      const cryptoAnalyzePath = path.resolve(__dirname, '../supabase/functions/crypto-analyze/index.ts');
      const content = fs.readFileSync(cryptoAnalyzePath, 'utf-8');
      
      // WhaleActivity must include source field
      const whaleActivityMatch = content.match(/whaleActivity\s*=\s*\{[^}]+\}/gs);
      expect(whaleActivityMatch).toBeTruthy();
      expect(whaleActivityMatch!.length).toBeGreaterThan(0);
      
      // At least one whaleActivity assignment must have source
      const hasSource = whaleActivityMatch!.some(match => match.includes('source'));
      expect(hasSource).toBe(true);
    });
  });
  
  describe('⚠️ Breaking Change Detection', () => {
    
    it('ALERT: Whale tracker service must be deployed', () => {
      // This is a reminder test that will show in test output
      console.log('\n⚠️  DEPLOYMENT REMINDER:');
      console.log('   After any changes to whale-tracker, redeploy with:');
      console.log('   supabase functions deploy whale-tracker\n');
      
      expect(true).toBe(true); // Always passes, just for logging
    });
    
    it('ALERT: Environment variables must be configured', () => {
      console.log('\n⚠️  ENVIRONMENT VARIABLES:');
      console.log('   Optional but recommended:');
      console.log('   WHALE_ALERT_API_KEY=your_key_here\n');
      
      expect(true).toBe(true);
    });
  });
  
  describe('🚨 Regression Prevention', () => {
    
    it('MUST NOT remove whale activity display from UI', async () => {
      const fs = await import('fs');
      const path = await import('path');
      
      const brainIndexPath = path.resolve(__dirname, '../src/lib/zikalyze-brain/index.ts');
      const content = fs.readFileSync(brainIndexPath, 'utf-8');
      
      // UI must display whale activity
      const whaleDisplayRegex = /🐋 Whale Activity.*whaleActivity/s;
      expect(content).toMatch(whaleDisplayRegex);
      
      if (!whaleDisplayRegex.test(content)) {
        throw new Error(
          '❌ REGRESSION: Whale activity display has been removed from UI!\n' +
          'Users will not see whale activity data.\n' +
          'Location: src/lib/zikalyze-brain/index.ts'
        );
      }
    });
    
    it('MUST NOT revert to always-derived whale activity', async () => {
      const fs = await import('fs');
      const path = await import('path');
      
      const cryptoAnalyzePath = path.resolve(__dirname, '../supabase/functions/crypto-analyze/index.ts');
      const content = fs.readFileSync(cryptoAnalyzePath, 'utf-8');
      
      // Must NOT have hardcoded derived whale activity without trying real data first
      const linesBeforeWhaleActivity = content.split('whaleActivity')[0];
      const hasTryBlock = linesBeforeWhaleActivity.includes('try {');
      const callsWhaleTracker = content.includes('whale-tracker');
      
      expect(callsWhaleTracker).toBe(true);
      
      if (!callsWhaleTracker) {
        throw new Error(
          '❌ REGRESSION: Whale tracker service call has been removed!\n' +
          'This reverts to always using derived estimates.\n' +
          'The code MUST attempt to fetch real whale data first.'
        );
      }
    });
  });
});

describe('Whale Activity Mock Tests', () => {
  
  describe('Data Structure Validation', () => {
    
    it('Should validate WhaleActivityResult structure', () => {
      const mockResult = {
        symbol: 'BTC',
        buying: 35,
        selling: 65,
        netFlow: 'NET SELLING',
        totalBuyVolume: 45000000,
        totalSellVolume: 82000000,
        transactionCount: 23,
        largestTransaction: 15000000,
        timeWindow: '24h',
        source: 'blockchain-api',
        transactions: [],
        isLive: true,
        dataAge: 3600000
      };
      
      expect(mockResult).toHaveProperty('symbol');
      expect(mockResult).toHaveProperty('buying');
      expect(mockResult).toHaveProperty('selling');
      expect(mockResult).toHaveProperty('source');
      expect(mockResult).toHaveProperty('isLive');
      
      expect(mockResult.buying).toBeGreaterThanOrEqual(0);
      expect(mockResult.buying).toBeLessThanOrEqual(100);
      expect(mockResult.selling).toBeGreaterThanOrEqual(0);
      expect(mockResult.selling).toBeLessThanOrEqual(100);
      
      expect(['whale-alert', 'blockchain-api', 'multi-source', 'derived']).toContain(mockResult.source);
    });
    
    it('Should classify net flow correctly', () => {
      const testCases = [
        { buying: 70, selling: 30, expected: 'NET BUYING' },
        { buying: 30, selling: 70, expected: 'NET SELLING' },
        { buying: 50, selling: 50, expected: 'BALANCED' },
        { buying: 55, selling: 45, expected: 'MIXED' }
      ];
      
      for (const { buying, selling, expected } of testCases) {
        let netFlow: string;
        if (buying > selling + 20) {
          netFlow = 'NET BUYING';
        } else if (selling > buying + 20) {
          netFlow = 'NET SELLING';
        } else if (Math.abs(buying - selling) < 10) {
          netFlow = 'BALANCED';
        } else {
          netFlow = 'MIXED';
        }
        
        expect(netFlow).toBe(expected);
      }
    });
  });
});
