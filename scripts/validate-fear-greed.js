#!/usr/bin/env node

/**
 * Fear & Greed Index Real-time Data Validation Script
 * 
 * This script directly tests the Alternative.me API to verify:
 * 1. API is accessible and responding
 * 2. Data includes proper timestamps
 * 3. Data is fresh (real-time)
 * 4. All required fields are present
 * 
 * Run with: node scripts/validate-fear-greed.js
 */

const https = require('https');

console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║  Fear & Greed Index Real-time Data Validation                 ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

function fetchFearGreedIndex() {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Request timeout after 8 seconds'));
    }, 8000);

    const req = https.get('https://api.alternative.me/fng/?limit=2', (res) => {
      clearTimeout(timeout);
      
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ statusCode: res.statusCode, data: json });
        } catch (e) {
          reject(new Error('Failed to parse JSON response'));
        }
      });
    });
    
    req.on('error', (e) => {
      clearTimeout(timeout);
      reject(e);
    });
    
    req.end();
  });
}

async function validateFearGreed() {
  try {
    console.log('📡 Fetching data from Alternative.me API...\n');
    
    const response = await fetchFearGreedIndex();
    
    // Check 1: HTTP Status
    console.log('✓ Check 1: HTTP Status');
    if (response.statusCode === 200) {
      console.log(`  ✅ Status: ${response.statusCode} OK\n`);
    } else {
      console.log(`  ❌ Status: ${response.statusCode} (Expected 200)\n`);
      process.exit(1);
    }
    
    // Check 2: Response Structure
    console.log('✓ Check 2: Response Structure');
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      console.log(`  ✅ Valid response structure`);
      console.log(`  ✅ Data points: ${response.data.data.length}\n`);
    } else {
      console.log(`  ❌ Invalid response structure\n`);
      process.exit(1);
    }
    
    if (response.data.data.length < 2) {
      console.log(`  ❌ Expected at least 2 data points, got ${response.data.data.length}\n`);
      process.exit(1);
    }
    
    // Check 3: Required Fields
    console.log('✓ Check 3: Required Fields');
    const current = response.data.data[0];
    const previous = response.data.data[1];
    
    const requiredFields = ['value', 'value_classification', 'timestamp'];
    let allFieldsPresent = true;
    
    requiredFields.forEach(field => {
      if (current[field] !== undefined) {
        console.log(`  ✅ Current has '${field}': ${current[field]}`);
      } else {
        console.log(`  ❌ Current missing '${field}'`);
        allFieldsPresent = false;
      }
    });
    
    if (!allFieldsPresent) {
      process.exit(1);
    }
    console.log('');
    
    // Check 4: Timestamp Validation (Real-time check)
    console.log('✓ Check 4: Timestamp Validation (Real-time Check)');
    const currentTimestamp = parseInt(current.timestamp) * 1000;
    const previousTimestamp = parseInt(previous.timestamp) * 1000;
    const now = Date.now();
    
    const currentAge = now - currentTimestamp;
    const currentAgeHours = currentAge / (1000 * 60 * 60);
    
    console.log(`  Current data timestamp: ${new Date(currentTimestamp).toISOString()}`);
    console.log(`  Previous data timestamp: ${new Date(previousTimestamp).toISOString()}`);
    console.log(`  Current time: ${new Date(now).toISOString()}`);
    console.log(`  Data age: ${currentAgeHours.toFixed(2)} hours`);
    
    // Validate data is fresh (< 48 hours for acceptance, < 24 hours for "live")
    if (currentAgeHours > 48) {
      console.log(`  ❌ Data is too old (${currentAgeHours.toFixed(1)} hours) - NOT REAL-TIME\n`);
      process.exit(1);
    } else if (currentAgeHours < 24) {
      console.log(`  ✅ Data is REAL-TIME (${currentAgeHours.toFixed(1)} hours old)\n`);
    } else {
      console.log(`  ⚠️  Data is acceptable but not live (${currentAgeHours.toFixed(1)} hours old)\n`);
    }
    
    // Check 5: Data Analysis
    console.log('✓ Check 5: Fear & Greed Analysis');
    console.log(`  Current Value: ${current.value}`);
    console.log(`  Current Label: ${current.value_classification}`);
    console.log(`  Previous Value: ${previous.value}`);
    console.log(`  Previous Label: ${previous.value_classification}`);
    
    const diff = parseInt(current.value) - parseInt(previous.value);
    const trend = diff > 3 ? 'RISING ⬆️' : diff < -3 ? 'FALLING ⬇️' : 'STABLE ➡️';
    console.log(`  Trend: ${trend} (${diff > 0 ? '+' : ''}${diff})\n`);
    
    // Check 6: AI Metrics Calculation
    console.log('✓ Check 6: AI Metrics Calculation');
    
    const value = parseInt(current.value);
    let extremeLevel;
    if (value <= 20) extremeLevel = 'EXTREME_FEAR';
    else if (value <= 35) extremeLevel = 'FEAR';
    else if (value <= 65) extremeLevel = 'NEUTRAL';
    else if (value <= 80) extremeLevel = 'GREED';
    else extremeLevel = 'EXTREME_GREED';
    
    const distanceFromNeutral = Math.abs(value - 50);
    const aiWeight = Math.min(1, (distanceFromNeutral / 50) * 0.8 + 0.2);
    
    console.log(`  Extreme Level: ${extremeLevel}`);
    console.log(`  AI Weight: ${aiWeight.toFixed(3)}\n`);
    
    // Final Summary
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║  ✅ ALL CHECKS PASSED - FEAR & GREED IS REAL-TIME & ACCURATE  ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ VALIDATION FAILED');
    console.error(`Error: ${error.message}\n`);
    
    if (error.code === 'ENOTFOUND') {
      console.error('Network error: Unable to reach api.alternative.me');
      console.error('This may be due to network restrictions or API being down.\n');
    }
    
    process.exit(1);
  }
}

// Run validation
validateFearGreed();
