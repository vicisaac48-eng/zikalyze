const { chromium } = require('playwright');
const path = require('path');

async function testMintFlash() {
  console.log('🚀 Testing for mint green flash in regular browser...\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Track background color changes
  const backgroundColors = [];
  
  // Monitor body background color
  page.on('domcontentloaded', async () => {
    try {
      const bgColor = await page.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundColor;
      });
      backgroundColors.push({ time: 'domcontentloaded', color: bgColor });
      console.log(`📄 DOMContentLoaded - Body background: ${bgColor}`);
    } catch (e) {
      console.log('Could not get background at DOMContentLoaded');
    }
  });
  
  // Load the HTML file
  const htmlPath = 'file://' + path.resolve(__dirname, 'index.html');
  await page.goto(htmlPath);
  
  // Wait a bit for any async changes
  await page.waitForTimeout(500);
  
  // Check initial body background
  const initialBg = await page.evaluate(() => {
    return window.getComputedStyle(document.body).backgroundColor;
  });
  console.log(`🎨 Initial body background: ${initialBg}`);
  
  // Check if splash is visible
  const splashVisible = await page.locator('#initial-splash').isVisible();
  console.log(`👁️  Splash visible: ${splashVisible}`);
  
  // Check splash display style
  const splashDisplay = await page.evaluate(() => {
    const splash = document.getElementById('initial-splash');
    return splash ? window.getComputedStyle(splash).display : 'not found';
  });
  console.log(`📝 Splash display: ${splashDisplay}`);
  
  // Check if tagline is visible
  const taglineVisible = await page.locator('#splash-tagline').isVisible();
  console.log(`🏷️  Tagline visible: ${taglineVisible}`);
  
  // Check display mode
  const displayMode = await page.evaluate(() => {
    return {
      standalone: window.matchMedia('(display-mode: standalone)').matches,
      fullscreen: window.matchMedia('(display-mode: fullscreen)').matches,
      browser: window.matchMedia('(display-mode: browser)').matches
    };
  });
  console.log(`📱 Display modes:`, displayMode);
  
  // Take a screenshot for visual verification
  await page.screenshot({ path: 'test-mint-flash.png' });
  console.log(`📸 Screenshot saved: test-mint-flash.png`);
  
  // Analyze results
  console.log('\n============================================================');
  console.log('ANALYSIS:');
  console.log('============================================================');
  
  const mintGreen = 'rgb(178, 235, 224)';
  const darkBg = 'rgb(10, 15, 26)';
  
  let hasMintFlash = false;
  let verdict = '';
  
  if (initialBg === mintGreen) {
    hasMintFlash = true;
    verdict = '❌ FAIL: Body background is MINT GREEN in regular browser!';
  } else if (initialBg === darkBg) {
    verdict = '✅ PASS: Body background is correctly DARK';
  } else {
    verdict = `⚠️  UNKNOWN: Body background is ${initialBg}`;
  }
  
  console.log(verdict);
  
  if (splashVisible) {
    console.log('❌ FAIL: HTML splash is VISIBLE in regular browser!');
    hasMintFlash = true;
  } else {
    console.log('✅ PASS: HTML splash is correctly HIDDEN');
  }
  
  if (taglineVisible) {
    console.log('❌ FAIL: Tagline is VISIBLE in regular browser!');
  } else {
    console.log('✅ PASS: Tagline is correctly HIDDEN');
  }
  
  console.log('\nDisplay mode detection:');
  console.log(`  Standalone: ${displayMode.standalone} (should be false)`);
  console.log(`  Fullscreen: ${displayMode.fullscreen} (should be false)`);
  console.log(`  Browser: ${displayMode.browser} (should be true)`);
  
  console.log('============================================================');
  
  if (hasMintFlash) {
    console.log('\n❌ MINT GREEN FLASH DETECTED!');
    console.log('The app shows mint green in regular browsers.');
    console.log('This needs to be fixed.\n');
  } else {
    console.log('\n✅ NO MINT GREEN FLASH!');
    console.log('The app correctly shows dark background in browsers.\n');
  }
  
  await browser.close();
  
  process.exit(hasMintFlash ? 1 : 0);
}

testMintFlash().catch(err => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
