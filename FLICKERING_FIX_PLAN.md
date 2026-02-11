# Flickering Fix Implementation Plan

## Problem
Entire list re-renders every time one price changes, causing flickering.

## Root Cause
Current implementation (line 317-400+):
```tsx
{filteredPrices.map((crypto, index) => {
  // Entire row JSX is inline - re-renders on ANY price change
  return <tr>...</tr>
})}
```

## Solution

### 1. Create Memoized CryptoRow Component
- Extract row logic into separate component
- Use React.memo with custom comparison
- Only re-render when THIS crypto's data changes

### 2. Create Memoized PriceCell Component  
- Extract price cell into separate component
- Use React.memo
- Throttle price state updates (500ms-1s)

### 3. Throttle UI Updates (Not WebSocket)
- WebSocket sends data immediately (good)
- Batch UI updates every 500ms-1s
- Use requestAnimationFrame for smooth updates

## Implementation

### Step 1: Memoized PriceCell
```tsx
const PriceCell = React.memo(({ 
  price, 
  flash, 
  formatPrice 
}: { 
  price: number; 
  flash: PriceFlash; 
  formatPrice: (p: number) => string;
}) => {
  return (
    <span className={`... ${
      flash === "up" ? "animate-price-flash-up" :
      flash === "down" ? "animate-price-flash-down" :
      "text-foreground"
    }`}>
      {formatPrice(price)}
    </span>
  );
}, (prevProps, nextProps) => {
  // Only re-render if price or flash changed
  return prevProps.price === nextProps.price && 
         prevProps.flash === nextProps.flash;
});
```

### Step 2: Memoized CryptoRow
```tsx
const CryptoRow = React.memo(({ 
  crypto, 
  isSelected, 
  hasAlert, 
  flash,
  onSelect,
  onOpenAlert,
  formatPrice,
  currencySymbol
}: CryptoRowProps) => {
  const isPositive = crypto.price_change_percentage_24h >= 0;
  
  return (
    <tr onClick={() => onSelect(crypto.symbol.toUpperCase())} ...>
      {/* Row content */}
      <td className="...">
        <PriceCell 
          price={crypto.current_price}
          flash={flash}
          formatPrice={formatPrice}
        />
      </td>
      {/* Other cells */}
    </tr>
  );
}, (prevProps, nextProps) => {
  // Only re-render if this crypto's data changed
  return (
    prevProps.crypto.id === nextProps.crypto.id &&
    prevProps.crypto.current_price === nextProps.crypto.current_price &&
    prevProps.crypto.price_change_percentage_24h === nextProps.crypto.price_change_percentage_24h &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.hasAlert === nextProps.hasAlert &&
    prevProps.flash === nextProps.flash
  );
});
```

### Step 3: Throttled Price Updates
```tsx
// Add throttling to price flash updates
const throttleTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
const RENDER_THROTTLE_MS = 500; // UI updates max every 500ms

useEffect(() => {
  if (prices.length === 0) return;

  prices.forEach((crypto) => {
    const prevPrice = prevPricesRef.current.get(crypto.symbol);
    if (prevPrice !== undefined && prevPrice !== crypto.current_price) {
      
      // Check if we should throttle this update
      const existingTimeout = throttleTimeoutRef.current.get(crypto.symbol);
      if (existingTimeout) {
        return; // Skip this update, still throttled
      }
      
      // Apply the update
      const flash = crypto.current_price > prevPrice ? "up" : "down";
      setPriceFlashes(prev => new Map(prev).set(crypto.symbol, flash));
      
      // Set throttle timeout
      const throttleId = setTimeout(() => {
        throttleTimeoutRef.current.delete(crypto.symbol);
      }, RENDER_THROTTLE_MS);
      
      throttleTimeoutRef.current.set(crypto.symbol, throttleId);
    }
    prevPricesRef.current.set(crypto.symbol, crypto.current_price);
  });
  
  return () => {
    throttleTimeoutRef.current.forEach(timeout => clearTimeout(timeout));
  };
}, [prices]);
```

### Step 4: Update Main Component
```tsx
// In render:
{filteredPrices.map((crypto) => (
  <CryptoRow
    key={crypto.id}
    crypto={crypto}
    isSelected={crypto.symbol.toUpperCase() === selected}
    hasAlert={alerts.some(a => a.symbol === crypto.symbol.toUpperCase())}
    flash={priceFlashes.get(crypto.symbol) || null}
    onSelect={onSelect}
    onOpenAlert={handleOpenAlertDialog}
    formatPrice={formatPrice}
    currencySymbol={currencySymbol}
  />
))}
```

## Expected Results

### Before:
- Price changes 10x/sec → 10 full list re-renders
- All 100 rows re-render → Flickering
- Poor performance

### After:
- Price changes 10x/sec → 1 cell update every 500ms
- Only 1 price cell re-renders → No flickering  
- 90%+ performance improvement

## Files to Modify
1. `src/components/dashboard/Top100CryptoList.tsx` - Add memoization
2. `src/components/dashboard/CryptoTicker.tsx` - Verify/update if needed
