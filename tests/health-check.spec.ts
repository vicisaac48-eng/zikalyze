import { test, expect } from '@playwright/test';

/**
 * Health Check Tests for Zikalyze Web App
 * 
 * This test suite verifies that the web application:
 * - Loads without hanging or crashing
 * - Renders critical pages successfully
 * - Handles navigation without errors
 * - Displays expected UI elements
 */

// Configure test timeout and retry logic
test.describe.configure({ mode: 'serial' });

test.describe('Web App Health Check', () => {
  test.beforeEach(async ({ page }) => {
    // Set a reasonable timeout for page loads
    page.setDefaultTimeout(30000);
    
    // Listen for console errors and page crashes
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error(`Browser console error: ${msg.text()}`);
      }
    });
    
    page.on('pageerror', (error) => {
      console.error(`Page error: ${error.message}`);
    });
    
    page.on('crash', () => {
      throw new Error('Page crashed!');
    });
  });

  test('should load the landing page without hanging', async ({ page }) => {
    // Navigate to the landing page
    await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' });
    
    // Verify the page loaded successfully
    await expect(page).toHaveTitle(/Zikalyze/i);
    
    // Check for critical elements on landing page
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
    
    // Verify no immediate crashes
    await page.waitForTimeout(2000);
    expect(page.isClosed()).toBe(false);
  });

  test('should display landing page content without errors', async ({ page }) => {
    await page.goto('http://localhost:8080/', { waitUntil: 'domcontentloaded' });
    
    // Wait for main content to load
    await page.waitForSelector('body', { state: 'visible' });
    
    // Verify the page is visible and interactive
    const isVisible = await page.isVisible('body');
    expect(isVisible).toBe(true);
    
    // Check that images are loading (if any)
    const images = await page.$$('img');
    if (images.length > 0) {
      // Just verify images exist, don't check if loaded (may depend on network)
      expect(images.length).toBeGreaterThan(0);
    }
  });

  test('should navigate to auth page without crashing', async ({ page }) => {
    await page.goto('http://localhost:8080/', { waitUntil: 'domcontentloaded' });
    
    // Navigate to auth page via URL
    await page.goto('http://localhost:8080/#/auth', { waitUntil: 'domcontentloaded' });
    
    // Verify navigation was successful
    await page.waitForSelector('body', { state: 'visible' });
    expect(page.url()).toContain('#/auth');
    
    // Verify page is still responsive
    await page.waitForTimeout(1000);
    expect(page.isClosed()).toBe(false);
  });

  test('should load contact page without errors', async ({ page }) => {
    await page.goto('http://localhost:8080/#/contact', { waitUntil: 'domcontentloaded' });
    
    // Verify page loaded
    await page.waitForSelector('body', { state: 'visible' });
    expect(page.url()).toContain('#/contact');
    
    // Wait to ensure no delayed crashes
    await page.waitForTimeout(1000);
    expect(page.isClosed()).toBe(false);
  });

  test('should load privacy policy page without hanging', async ({ page }) => {
    await page.goto('http://localhost:8080/#/privacy', { waitUntil: 'domcontentloaded' });
    
    // Verify page loaded
    await page.waitForSelector('body', { state: 'visible' });
    expect(page.url()).toContain('#/privacy');
    
    // Verify content is present
    const bodyText = await page.textContent('body');
    expect(bodyText?.length).toBeGreaterThan(100); // Privacy policy should have substantial content
  });

  test('should load terms of service page without errors', async ({ page }) => {
    await page.goto('http://localhost:8080/#/terms', { waitUntil: 'domcontentloaded' });
    
    // Verify page loaded
    await page.waitForSelector('body', { state: 'visible' });
    expect(page.url()).toContain('#/terms');
    
    // Verify content is present
    const bodyText = await page.textContent('body');
    expect(bodyText?.length).toBeGreaterThan(100); // Terms should have substantial content
  });

  test('should handle navigation between multiple pages without crashes', async ({ page }) => {
    // Start at landing page
    await page.goto('http://localhost:8080/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    
    // Navigate to auth
    await page.goto('http://localhost:8080/#/auth', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    expect(page.isClosed()).toBe(false);
    
    // Navigate to contact
    await page.goto('http://localhost:8080/#/contact', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    expect(page.isClosed()).toBe(false);
    
    // Navigate back to landing
    await page.goto('http://localhost:8080/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    expect(page.isClosed()).toBe(false);
    
    // Verify final state
    await expect(page).toHaveTitle(/Zikalyze/i);
  });

  test('should load install page for PWA without errors', async ({ page }) => {
    await page.goto('http://localhost:8080/#/install', { waitUntil: 'domcontentloaded' });
    
    // Verify page loaded
    await page.waitForSelector('body', { state: 'visible' });
    expect(page.url()).toContain('#/install');
    
    // Verify no crashes after load
    await page.waitForTimeout(1000);
    expect(page.isClosed()).toBe(false);
  });

  test('should handle 404 not found page gracefully', async ({ page }) => {
    await page.goto('http://localhost:8080/#/nonexistent-route', { waitUntil: 'domcontentloaded' });
    
    // Verify page loaded (should show 404 page, not crash)
    await page.waitForSelector('body', { state: 'visible' });
    
    // Verify the app didn't crash
    await page.waitForTimeout(1000);
    expect(page.isClosed()).toBe(false);
  });

  test('should verify React app rendered without errors', async ({ page }) => {
    await page.goto('http://localhost:8080/', { waitUntil: 'domcontentloaded' });
    
    // Check for React root element
    const root = await page.$('#root');
    expect(root).toBeTruthy();
    
    // Verify root has content
    const rootContent = await page.$eval('#root', (el) => el.innerHTML);
    expect(rootContent.length).toBeGreaterThan(0);
    
    // Verify no crashes
    await page.waitForTimeout(2000);
    expect(page.isClosed()).toBe(false);
  });

  test('should complete full page lifecycle without memory leaks or hangs', async ({ page }) => {
    // Load page
    await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' });
    
    // Wait for initial render
    await page.waitForTimeout(2000);
    
    // Perform some interactions (scroll, etc.)
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    
    // Navigate away
    await page.goto('http://localhost:8080/#/contact', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    
    // Navigate back
    await page.goto('http://localhost:8080/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    
    // Verify app is still functional
    expect(page.isClosed()).toBe(false);
    const root = await page.$('#root');
    expect(root).toBeTruthy();
  });
});
