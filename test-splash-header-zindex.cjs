/**
 * Playwright test to verify that the splash screen has a higher z-index
 * than the header, ensuring the header is hidden during splash on mobile native apps
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('🚀 Starting test for splash screen z-index vs header z-index...\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Load the index.html file
  const htmlPath = path.join(__dirname, 'index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
  await page.setContent(htmlContent);

  console.log('📄 Loaded index.html\n');

  // Get splash screen z-index
  const splash = page.locator('#initial-splash');
  const splashZIndex = await splash.evaluate(el => {
    const zIndex = window.getComputedStyle(el).zIndex;
    return zIndex === 'auto' ? el.style.zIndex : zIndex;
  });
  console.log('🎨 Splash screen z-index:', splashZIndex);

  // Parse z-index values
  const splashZ = parseInt(splashZIndex);
  
  console.log('\n============================================================');
  console.log('VALIDATION CHECKS:');
  console.log('============================================================');
  
  // Check 1: Splash z-index should be 10000
  const hasSplashZIndex = splashZ === 10000;
  console.log(`✓ Splash z-index is 10000: ${hasSplashZIndex ? '✅ PASS' : '❌ FAIL'}`);
  
  // Check 2: Splash z-index should be greater than header's max z-index (9999 for android-fixed)
  const headerMaxZIndex = 9999;
  const splashAboveHeader = splashZ > headerMaxZIndex;
  console.log(`✓ Splash z-index (${splashZ}) > Header max z-index (${headerMaxZIndex}): ${splashAboveHeader ? '✅ PASS' : '❌ FAIL'}`);
  
  // Check 3: Verify inline style contains correct z-index
  const inlineZIndex = await splash.evaluate(el => el.style.zIndex);
  const hasCorrectInlineStyle = inlineZIndex === '10000';
  console.log(`✓ Inline style has z-index: 10000: ${hasCorrectInlineStyle ? '✅ PASS' : '❌ FAIL'}`);
  
  console.log('============================================================\n');
  
  console.log('EXPLANATION:');
  console.log('- Header with android-fixed class has z-index: 9999');
  console.log('- Splash screen must have z-index: 10000 to be above header');
  console.log('- This ensures header is hidden during splash on mobile native apps\n');
  
  const testPassed = hasSplashZIndex && splashAboveHeader && hasCorrectInlineStyle;
  
  console.log('============================================================');
  console.log('FINAL RESULT:');
  console.log('============================================================');
  
  if (testPassed) {
    console.log('✅ SUCCESS: Splash screen z-index is correctly configured');
    console.log('   - Splash z-index is 10000');
    console.log('   - Splash is above header (9999)');
    console.log('   - Header will be hidden during splash on mobile native');
  } else {
    console.log('❌ FAILURE: Splash screen z-index issue detected');
    if (!hasSplashZIndex) console.log('   - Splash z-index is not 10000');
    if (!splashAboveHeader) console.log('   - Splash z-index is not above header');
    if (!hasCorrectInlineStyle) console.log('   - Inline style z-index is incorrect');
  }
  console.log('============================================================\n');

  await browser.close();
  
  process.exit(testPassed ? 0 : 1);
})();
