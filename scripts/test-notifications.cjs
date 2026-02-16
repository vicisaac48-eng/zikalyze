#!/usr/bin/env node

/**
 * Push Notifications Testing Script
 * 
 * Interactive script to test all notification types
 * 
 * Usage: node scripts/test-notifications.js
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const NOTIFICATION_TYPES = {
  '1': {
    name: 'Price Alert',
    type: 'price_alert',
    example: 'BTC reached $50,000',
    testCommand: 'Test price crossing threshold'
  },
  '2': {
    name: 'Volume Spike',
    type: 'volume_spike',
    example: 'ETH volume up 200%',
    testCommand: 'Test volume exceeding threshold'
  },
  '3': {
    name: 'Whale Activity',
    type: 'whale_activity',
    example: '$10M BTC transaction detected',
    testCommand: 'Test large transaction detection'
  },
  '4': {
    name: 'Market Sentiment',
    type: 'sentiment_shift',
    example: 'Fear & Greed shifted from 20 to 50',
    testCommand: 'Test sentiment change detection'
  },
  '5': {
    name: 'News Event',
    type: 'news_event',
    example: 'Bitcoin ETF approved by SEC',
    testCommand: 'Test news event notification'
  },
  '6': {
    name: 'Price Surge',
    type: 'price_surge',
    example: 'SOL up 15% in 1 hour',
    testCommand: 'Test rapid price increase'
  },
  '7': {
    name: 'Price Drop',
    type: 'price_drop',
    example: 'BNB down 10% in 30 min',
    testCommand: 'Test rapid price decrease'
  }
};

console.log('\n🔔 Push Notifications Testing Tool\n');
console.log('This tool helps you test all notification types\n');
console.log('Available notification types:\n');

Object.entries(NOTIFICATION_TYPES).forEach(([key, info]) => {
  console.log(`  ${key}. ${info.name}`);
  console.log(`     Example: ${info.example}`);
  console.log('');
});

function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  const choice = await askQuestion('Select notification type to test (1-7) or Q to quit: ');
  
  if (choice.toLowerCase() === 'q') {
    console.log('\n👋 Goodbye!');
    rl.close();
    process.exit(0);
  }
  
  const notifType = NOTIFICATION_TYPES[choice];
  if (!notifType) {
    console.log('\n❌ Invalid choice. Please select 1-7.\n');
    return main();
  }
  
  console.log(`\n📋 Testing: ${notifType.name}`);
  console.log(`Action: ${notifType.testCommand}\n`);
  
  // Cryptocurrency selection
  const symbol = await askQuestion('Enter cryptocurrency symbol (e.g., BTC, ETH): ');
  
  console.log('\n🚀 Sending test notification...\n');
  console.log('Notification Details:');
  console.log(`  Type: ${notifType.type}`);
  console.log(`  Symbol: ${symbol.toUpperCase()}`);
  console.log(`  Title: [Would be generated based on type]`);
  console.log(`  Body: [Would be generated with real data]`);
  
  console.log('\n⚠️  NOTE: This is a simulation.');
  console.log('To actually send notifications, you need to:');
  console.log('1. Open the app in a browser or on device');
  console.log('2. Grant notification permission');
  console.log('3. Navigate to Settings → Notifications → Test');
  console.log('4. Select notification type and cryptocurrency');
  console.log('5. Click "Send Test Notification"\n');
  
  const another = await askQuestion('Test another notification type? (Y/n): ');
  if (another.toLowerCase() !== 'n') {
    console.log('\n' + '-'.repeat(60) + '\n');
    return main();
  }
  
  console.log('\n✅ Testing complete!');
  console.log('\nNext steps:');
  console.log('1. Run actual tests in the app');
  console.log('2. Check notification delivery');
  console.log('3. Verify notification content');
  console.log('4. Test on multiple devices/browsers\n');
  
  rl.close();
  process.exit(0);
}

main().catch(err => {
  console.error('\n❌ Error:', err.message);
  rl.close();
  process.exit(1);
});
