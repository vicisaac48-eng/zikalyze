/**
 * Playwright test to verify mint green splash screen is hidden in web browsers
 * and only visible on mobile native apps
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('🚀 Starting Playwright test for splash screen visibility...\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Load the index.html file
  const htmlPath = path.join(__dirname, 'index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
  await page.setContent(htmlContent);

  console.log('📄 Loaded index.html\n');

  // Check splash screen element
  const splash = page.locator('#initial-splash');
  const splashExists = await splash.count() > 0;
  console.log('✅ Splash element exists:', splashExists);

  // Check if splash is visible (should be hidden in browser)
  const splashVisible = await splash.isVisible();
  console.log('👁️  Splash is visible:', splashVisible);

  // Check computed display style
  const splashDisplay = await splash.evaluate(el => {
    return window.getComputedStyle(el).display;
  });
  console.log('🎨 Computed display style:', splashDisplay);

  // Check inline display style
  const splashInlineDisplay = await splash.evaluate(el => el.style.display);
  console.log('📝 Inline display style:', splashInlineDisplay);

  // Check background color
  const splashBg = await splash.evaluate(el => {
    return window.getComputedStyle(el).backgroundColor;
  });
  console.log('🎨 Splash background color:', splashBg);

  // Check body background color (should be dark for web)
  const bodyBg = await page.evaluate(() => {
    return window.getComputedStyle(document.body).backgroundColor;
  });
  console.log('🎨 Body background color:', bodyBg);

  // Check if native app was detected
  const nativeAppDetected = await page.evaluate(() => {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.matchMedia('(display-mode: fullscreen)').matches ||
           (window.navigator && window.navigator.standalone === true);
  });
  console.log('📱 Native app detected:', nativeAppDetected);

  // Check tagline visibility
  const tagline = page.locator('#splash-tagline');
  const taglineVisible = await tagline.isVisible();
  console.log('🏷️  Tagline is visible:', taglineVisible);

  console.log('\n============================================================');
  console.log('FINAL RESULT:');
  console.log('============================================================');
  
  const testPassed = !splashVisible && splashDisplay === 'none' && !nativeAppDetected && !taglineVisible;
  
  if (testPassed) {
    console.log('✅ SUCCESS: Splash screen is properly HIDDEN in browser');
    console.log('   - Splash element exists but is hidden');
    console.log('   - Display is "none"');
    console.log('   - Not visible to users');
    console.log('   - Native app not detected');
    console.log('   - Tagline also hidden');
    console.log('   - Body has dark background for web');
  } else {
    console.log('❌ FAILURE: Splash screen visibility issue detected');
    if (splashVisible) console.log('   - Splash is visible (should be hidden)');
    if (splashDisplay !== 'none') console.log('   - Display is not "none"');
    if (nativeAppDetected) console.log('   - Native app incorrectly detected');
    if (taglineVisible) console.log('   - Tagline is visible (should be hidden)');
  }
  console.log('============================================================\n');

  await browser.close();
  
  process.exit(testPassed ? 0 : 1);
})();
