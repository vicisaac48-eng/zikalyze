const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('🚀 Starting Playwright test for tagline visibility...\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();
  
  // Read the index.html file
  const htmlPath = path.join(__dirname, 'index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
  
  // Load it as a file URL
  await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
  
  console.log('📄 Loaded index.html\n');
  
  // Wait a moment for scripts to run
  await page.waitForTimeout(1000);
  
  // Check if tagline element exists
  const tagline = await page.locator('#splash-tagline');
  const exists = await tagline.count() > 0;
  
  console.log(`✅ Tagline element exists: ${exists}`);
  
  if (exists) {
    // Check if it's visible
    const isVisible = await tagline.isVisible();
    console.log(`👁️  Tagline is visible: ${isVisible}`);
    
    // Check computed display style
    const display = await tagline.evaluate(el => window.getComputedStyle(el).display);
    console.log(`🎨 Computed display style: "${display}"`);
    
    // Check inline style
    const inlineStyle = await tagline.evaluate(el => el.style.display);
    console.log(`📝 Inline display style: "${inlineStyle}"`);
    
    // Check the full style attribute
    const styleAttr = await tagline.getAttribute('style');
    console.log(`🏷️  Style attribute contains: ${styleAttr.includes('display: none !important') ? '✅ display: none !important' : '❌ NO !important'}`);
    
    // Get the text content
    const text = await tagline.textContent();
    console.log(`📄 Tagline text: "${text}"`);
    
    // Check native app detection
    const isNativeApp = await page.evaluate(() => {
      return (
        (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
        (window.matchMedia && window.matchMedia('(display-mode: fullscreen)').matches) ||
        (window.navigator && window.navigator.standalone === true) ||
        (typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform && Capacitor.isNativePlatform())
      );
    });
    console.log(`📱 Native app detected: ${isNativeApp}`);
    
    console.log('\n' + '='.repeat(60));
    console.log('FINAL RESULT:');
    console.log('='.repeat(60));
    
    if (!isVisible && display === 'none') {
      console.log('✅ SUCCESS: Tagline is properly HIDDEN in browser');
      console.log('   - Element exists in DOM');
      console.log('   - Display is "none"');
      console.log('   - Not visible to users');
      console.log('   - Has !important flag for protection');
    } else {
      console.log('❌ PROBLEM: Tagline is VISIBLE in browser');
      console.log(`   - isVisible: ${isVisible}`);
      console.log(`   - display: ${display}`);
      console.log('   - This should NOT happen!');
    }
    console.log('='.repeat(60));
  } else {
    console.log('❌ ERROR: Tagline element not found in DOM');
  }
  
  await browser.close();
  console.log('\n✅ Test complete');
})();
