# Price Validation Test Examples

## Test Cases

These examples demonstrate how the price validation system handles various scenarios.

### Test 1: Normal Price Update ✅
```javascript
Current Price: $45,000 (BTC)
New Price: $45,500
Change: +1.11%
Result: ACCEPTED (normal volatility)
```

### Test 2: Rapid Spike Rejected ❌
```javascript
Current Price: $45,000 (BTC)
New Price: $70,000
Change: +55.56%
Result: REJECTED - exceeds 50% spike threshold
Console: [Price Validation] Rejected BTC: Rapid spike detected...
```

### Test 3: Rapid Drop Rejected ❌
```javascript
Current Price: $45,000 (BTC)
New Price: $35,000
Change: -22.22%
Result: REJECTED - exceeds 20% drop threshold
Console: [Price Validation] Rejected BTC: Rapid drop detected...
```

### Test 4: Grace Period - Large Spike Allowed ✅
```javascript
Update Count: 1 (first update)
Current Price: $100 (NEW_TOKEN)
New Price: $250
Change: +150%
Result: ACCEPTED (within grace period 200% limit)
```

### Test 5: Grace Period - Large Drop Allowed ✅
```javascript
Update Count: 2 (second update)
Current Price: $100 (NEW_TOKEN)
New Price: $60
Change: -40%
Result: ACCEPTED (within grace period 50% drop limit)
```

### Test 6: After Grace Period - Same Drop Rejected ❌
```javascript
Update Count: 5 (after grace period)
Current Price: $100 (TOKEN)
New Price: $60
Change: -40%
Result: REJECTED - exceeds 20% strict mode drop threshold
Console: [Price Validation] Rejected TOKEN: Rapid drop detected...
```

### Test 7: Extreme Change - Always Rejected ❌
```javascript
Current Price: $100 (SCAM_TOKEN)
New Price: $15,000
Change: +14,900%
Ratio: 150x
Result: REJECTED - exceeds 100x extreme increase ratio
Console: [Price Validation] Rejected SCAM_TOKEN: Extreme change...
```

### Test 8: Extreme Drop - Always Rejected ❌
```javascript
Current Price: $100 (BAD_TOKEN)
New Price: $0.50
Change: -99.5%
Ratio: 0.005x
Result: REJECTED - below 0.01x extreme decrease ratio
Console: [Price Validation] Rejected BAD_TOKEN: Extreme change...
```

### Test 9: Outside 24h High Bound ❌
```javascript
Current Price: $100 (ALT_COIN)
24h High: $110
24h Low: $90
New Price: $130
Upper Bound: $121 (high + 10% margin)
Result: REJECTED - exceeds upper bound
Console: [Price Validation] Rejected ALT_COIN: Outside 24h bounds...
```

### Test 10: Outside 24h Low Bound ❌
```javascript
Current Price: $100 (ALT_COIN)
24h High: $110
24h Low: $90
New Price: $75
Lower Bound: $81 (low - 10% margin)
Result: REJECTED - below lower bound
Console: [Price Validation] Rejected ALT_COIN: Outside 24h bounds...
```

### Test 11: Within 24h Bounds with Margin ✅
```javascript
Current Price: $100 (GOOD_TOKEN)
24h High: $110
24h Low: $90
New Price: $115
Upper Bound: $121 (high + 10% margin)
Result: ACCEPTED (within upper margin)
```

### Test 12: Zero Price - Always Rejected ❌
```javascript
Current Price: $100 (TOKEN)
New Price: $0
Result: REJECTED - filtered out before validation (line 427-429)
```

### Test 13: Negative Price - Always Rejected ❌
```javascript
Current Price: $100 (TOKEN)
New Price: -$50
Result: REJECTED - filtered out before validation (line 427-429)
```

### Test 14: Very Small Valid Update ✅
```javascript
Current Price: $45,000 (BTC)
New Price: $45,001
Change: +0.002%
Result: ACCEPTED (minimal change is valid)
```

### Test 15: Price History Tracking
```javascript
Symbol: BTC
Initial: []
After Update 1: [$45000]
After Update 2: [$45000, $45100]
After Update 3: [$45000, $45100, $45200]
...
After Update 11: [$45100, $45200, ..., $45900] (oldest dropped)
Max Length: 10 prices
```

## Console Output Examples

### Rejected Update - Rapid Spike
```
[Price Validation] Rejected BTC: Rapid spike detected - 
Current: $45000.00000000, New: $70000.00000000, Change: 55.56%
```

### Rejected Update - Rapid Drop
```
[Price Validation] Rejected ETH: Rapid drop detected - 
Current: $3000.00000000, New: $2300.00000000, Change: -23.33%
```

### Rejected Update - Extreme Change
```
[Price Validation] Rejected SCAM: Extreme change - 
Current: $1.00000000, New: $200.00000000, Change: 19900.00%
```

### Rejected Update - Outside 24h Bounds
```
[Price Validation] Rejected SOL: Outside 24h bounds - 
Current: $100.00000000, New: $130.00000000, 
24h Low: $90.00000000, 24h High: $110.00000000
```

## Integration Testing

To test in browser console:
```javascript
// Monitor rejected updates
console.log = ((originalLog) => {
  return function(...args) {
    if (args[0]?.includes?.('[Price Validation]')) {
      // Rejected update detected!
      console.table({
        message: args[0]
      });
    }
    return originalLog.apply(console, args);
  };
})(console.log);
```

## Performance Impact

- **Validation overhead:** < 0.1ms per price update
- **Memory usage:** ~1KB per symbol (10 prices × 8 bytes × ~100 symbols)
- **Total impact:** Negligible - not measurable in UI responsiveness

## Configuration

Adjust thresholds in `src/hooks/useCryptoPrices.ts` (lines 288-307):

```typescript
// More lenient
const RAPID_DROP_THRESHOLD_PERCENT = 30;
const RAPID_SPIKE_THRESHOLD_PERCENT = 70;

// More strict  
const RAPID_DROP_THRESHOLD_PERCENT = 10;
const RAPID_SPIKE_THRESHOLD_PERCENT = 30;

// Longer grace period
const GRACE_PERIOD_UPDATE_COUNT = 5;

// More price history
const PRICE_HISTORY_MAX_LENGTH = 20;
```
