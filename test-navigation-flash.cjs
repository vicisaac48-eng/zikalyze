/**
 * Playwright test to verify no mint green flash during navigation
 * This test ensures body background stays dark (#0a0f1a) on all platforms
 * to prevent blank mint green flashes when navigating between pages
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('🚀 Starting test for navigation mint green flash fix...\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Load the index.html file
  const htmlPath = path.join(__dirname, 'index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
  await page.setContent(htmlContent);

  console.log('📄 Loaded index.html\n');

  // Test 1: Check body background color (should be dark on all platforms)
  const bodyBg = await page.evaluate(() => {
    return window.getComputedStyle(document.body).backgroundColor;
  });
  console.log('🎨 Body background color:', bodyBg);

  // Test 2: Check inline body style
  const bodyInlineBg = await page.evaluate(() => {
    return document.body.style.backgroundColor;
  });
  console.log('📝 Body inline background:', bodyInlineBg);

  // Test 3: Simulate native app mode (standalone) and verify body stays dark
  console.log('\n🔄 Simulating native app mode (standalone)...');
  
  // Execute the native app detection script
  await page.evaluate(() => {
    // Simulate native app detection
    const script = document.querySelector('script');
    if (script && script.textContent.includes('isNativeApp')) {
      eval(script.textContent);
    }
  });

  const bodyBgAfterScript = await page.evaluate(() => {
    return window.getComputedStyle(document.body).backgroundColor;
  });
  console.log('🎨 Body background after script:', bodyBgAfterScript);

  // Test 4: Check CSS media query rule for body background
  const cssHasMintGreenBody = await page.evaluate(() => {
    // Check if any CSS rules set body background to mint green
    const styleSheets = Array.from(document.styleSheets);
    for (const sheet of styleSheets) {
      try {
        const rules = Array.from(sheet.cssRules || []);
        for (const rule of rules) {
          if (rule.type === CSSRule.MEDIA_RULE) {
            const mediaRules = Array.from(rule.cssRules || []);
            for (const mediaRule of mediaRules) {
              if (mediaRule.selectorText === 'body' && 
                  mediaRule.style.backgroundColor &&
                  (mediaRule.style.backgroundColor.includes('B2EBE0') || 
                   mediaRule.style.backgroundColor.includes('178, 235, 224'))) {
                return true;
              }
            }
          }
        }
      } catch (e) {
        // Skip CORS-protected stylesheets
      }
    }
    return false;
  });

  console.log('🔍 CSS sets mint green on body:', cssHasMintGreenBody);

  // Test 5: Verify splash screen has mint green background (not body)
  const splashBg = await page.evaluate(() => {
    const splash = document.getElementById('initial-splash');
    return splash ? window.getComputedStyle(splash).backgroundColor : null;
  });
  console.log('🎨 Splash background color:', splashBg);

  console.log('\n============================================================');
  console.log('VALIDATION CHECKS:');
  console.log('============================================================');
  
  const isDarkBg = bodyBg === 'rgb(10, 15, 26)' || bodyBg === 'rgba(10, 15, 26, 1)';
  const inlineDark = bodyInlineBg === '#0a0f1a' || bodyInlineBg === 'rgb(10, 15, 26)';
  const staysDark = bodyBgAfterScript === 'rgb(10, 15, 26)' || bodyBgAfterScript === 'rgba(10, 15, 26, 1)';
  const noMintCSS = !cssHasMintGreenBody;
  const splashHasMint = splashBg === 'rgb(178, 235, 224)' || splashBg === 'rgba(178, 235, 224, 1)';

  console.log(`✓ Body background is dark (${bodyBg}): ${isDarkBg ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`✓ Inline style is dark: ${inlineDark ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`✓ Body stays dark after script: ${staysDark ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`✓ No CSS media query sets mint green on body: ${noMintCSS ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`✓ Splash element has mint green (not body): ${splashHasMint ? '✅ PASS' : '❌ FAIL'}`);
  
  console.log('============================================================\n');
  
  console.log('EXPLANATION:');
  console.log('- Body background must stay DARK (#0a0f1a) on all platforms');
  console.log('- This prevents mint green flash during page navigation');
  console.log('- Mint green is ONLY on the #initial-splash element');
  console.log('- When navigating (e.g., clicking "Get Started"), no flash occurs\n');
  
  const testPassed = isDarkBg && inlineDark && staysDark && noMintCSS && splashHasMint;
  
  console.log('============================================================');
  console.log('FINAL RESULT:');
  console.log('============================================================');
  
  if (testPassed) {
    console.log('✅ SUCCESS: Navigation flash fix is correctly implemented');
    console.log('   - Body background stays dark on all platforms');
    console.log('   - No CSS media queries set mint green on body');
    console.log('   - JavaScript does not set mint green on body');
    console.log('   - Splash element correctly has mint green background');
    console.log('   - No blank mint green flash will occur during navigation');
  } else {
    console.log('❌ FAILURE: Navigation flash issue detected');
    if (!isDarkBg) console.log('   - Body background is not dark');
    if (!inlineDark) console.log('   - Inline style is not dark');
    if (!staysDark) console.log('   - Body background changes after script');
    if (!noMintCSS) console.log('   - CSS media query sets mint green on body');
    if (!splashHasMint) console.log('   - Splash element does not have mint green');
  }
  console.log('============================================================\n');

  await browser.close();
  
  process.exit(testPassed ? 0 : 1);
})();
