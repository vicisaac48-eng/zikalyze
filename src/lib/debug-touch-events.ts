/**
 * Debug utility to detect touch event interception.
 * 
 * This script helps diagnose scrolling issues on Android WebView by detecting
 * if any parent elements are calling e.preventDefault() on touchstart/touchmove events.
 * 
 * Usage:
 * 1. Import and call detectTouchInterception() in development
 * 2. Touch the screen on the problematic area
 * 3. Check console for "Touch event blocked" messages
 * 
 * To disable interception on a specific element:
 * - Add { passive: true } to addEventListener options
 * - Or add touch-action: pan-y CSS to the element
 */

interface TouchInterceptionResult {
  element: HTMLElement;
  eventType: 'touchstart' | 'touchmove';
  defaultPrevented: boolean;
  touchAction: string;
  overflow: string;
}

/**
 * Detects which elements are blocking touch events.
 * Logs to console when touch events are prevented.
 */
export function detectTouchInterception(): () => void {
  const results: TouchInterceptionResult[] = [];
  
  // Capture phase listener to detect preventDefault before it bubbles
  const captureHandler = (e: TouchEvent) => {
    const target = e.target as HTMLElement;
    if (!target) return;
    
    // Walk up the DOM tree to find all potential blockers
    let current: HTMLElement | null = target;
    while (current) {
      const style = window.getComputedStyle(current);
      const touchAction = style.touchAction;
      const overflow = style.overflow;
      
      // Check for potentially problematic CSS
      if (touchAction === 'none' || touchAction === 'manipulation') {
        console.warn(`[Touch Debug] Potential blocking CSS on element:`, {
          element: current,
          tagName: current.tagName,
          className: current.className,
          touchAction,
          id: current.id
        });
      }
      
      current = current.parentElement;
    }
  };
  
  // Bubble phase listener to detect if default was prevented
  const bubbleHandler = (e: TouchEvent) => {
    if (e.defaultPrevented) {
      const target = e.target as HTMLElement;
      console.error(`[Touch Debug] ❌ ${e.type} was BLOCKED (preventDefault called)`, {
        target: target,
        tagName: target?.tagName,
        className: target?.className,
        id: target?.id,
        touchAction: target ? window.getComputedStyle(target).touchAction : 'unknown'
      });
      
      // Try to identify which listener blocked it
      let current: HTMLElement | null = target;
      while (current) {
        console.log(`[Touch Debug]   - Checking ancestor:`, {
          element: current.tagName,
          className: current.className?.slice(0, 50),
          id: current.id
        });
        current = current.parentElement;
      }
    } else {
      console.log(`[Touch Debug] ✅ ${e.type} allowed to propagate normally`);
    }
  };
  
  // Add listeners
  document.addEventListener('touchstart', captureHandler, { capture: true, passive: true });
  document.addEventListener('touchmove', captureHandler, { capture: true, passive: true });
  document.addEventListener('touchstart', bubbleHandler, { passive: true });
  document.addEventListener('touchmove', bubbleHandler, { passive: true });
  
  console.log('[Touch Debug] 🔍 Touch event debugging enabled. Touch the screen to test.');
  console.log('[Touch Debug] Looking for elements with touch-action: none or e.preventDefault()');
  
  // Return cleanup function
  // Note: removeEventListener options must match addEventListener options for proper removal
  return () => {
    document.removeEventListener('touchstart', captureHandler, { capture: true, passive: true } as EventListenerOptions);
    document.removeEventListener('touchmove', captureHandler, { capture: true, passive: true } as EventListenerOptions);
    document.removeEventListener('touchstart', bubbleHandler);
    document.removeEventListener('touchmove', bubbleHandler);
    console.log('[Touch Debug] Touch event debugging disabled.');
  };
}

/**
 * Scans the DOM for elements that might be blocking touch scrolling.
 * Returns a list of potentially problematic elements.
 */
export function scanForTouchBlockers(): HTMLElement[] {
  const blockers: HTMLElement[] = [];
  const allElements = document.querySelectorAll('*');
  
  allElements.forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    
    const style = window.getComputedStyle(el);
    const touchAction = style.touchAction;
    
    // Check for blocking touch-action values
    if (touchAction === 'none' || touchAction === 'manipulation') {
      blockers.push(el);
      console.warn('[Touch Scan] Found potential blocker:', {
        element: el.tagName,
        className: el.className?.slice(0, 50),
        id: el.id,
        touchAction
      });
    }
  });
  
  if (blockers.length === 0) {
    console.log('[Touch Scan] ✅ No elements found with blocking touch-action CSS');
  } else {
    console.warn(`[Touch Scan] ⚠️ Found ${blockers.length} elements with potentially blocking CSS`);
  }
  
  return blockers;
}

/**
 * Adds a visual overlay showing touch-action values for debugging.
 * Press Escape to remove the overlay.
 */
export function showTouchActionOverlay(): void {
  const overlay = document.createElement('div');
  overlay.id = 'touch-debug-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.8);
    color: #0f0;
    font-family: monospace;
    font-size: 12px;
    padding: 10px;
    border-radius: 5px;
    z-index: 99999;
    max-width: 300px;
    max-height: 50vh;
    overflow: auto;
  `;
  
  const updateOverlay = (e: TouchEvent) => {
    const target = e.target as HTMLElement;
    if (!target) return;
    
    const style = window.getComputedStyle(target);
    overlay.innerHTML = `
      <strong>Touch Debug</strong><br/>
      <hr style="border-color: #333; margin: 5px 0;"/>
      Tag: ${target.tagName}<br/>
      Class: ${target.className?.slice(0, 30) || 'none'}<br/>
      touch-action: <span style="color: ${style.touchAction === 'none' ? '#f00' : '#0f0'}">${style.touchAction}</span><br/>
      overflow: ${style.overflow}<br/>
      overflow-y: ${style.overflowY}<br/>
      <hr style="border-color: #333; margin: 5px 0;"/>
      <small>Press ESC to close</small>
    `;
  };
  
  document.body.appendChild(overlay);
  document.addEventListener('touchstart', updateOverlay, { passive: true });
  
  const cleanup = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      overlay.remove();
      document.removeEventListener('touchstart', updateOverlay);
      document.removeEventListener('keydown', cleanup);
    }
  };
  document.addEventListener('keydown', cleanup);
  
  console.log('[Touch Debug] Overlay enabled. Touch screen to see touch-action values. Press ESC to close.');
}

// Export a combined debug function for easy use
export function enableTouchDebugging(): () => void {
  const cleanup = detectTouchInterception();
  scanForTouchBlockers();
  return cleanup;
}
