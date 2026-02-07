# Web App Health Check Tests

This directory contains automated health check tests for the Zikalyze web application to verify that it works perfectly without hanging or crashes.

## Overview

The health check suite uses Playwright to run automated browser tests that verify:

- ✅ App loads without hanging
- ✅ Critical pages render successfully
- ✅ Navigation between pages works smoothly
- ✅ No JavaScript errors or crashes occur
- ✅ React components render properly
- ✅ Page lifecycle completes without memory leaks

## Running the Tests

### Prerequisites

1. Make sure all dependencies are installed:
```bash
npm install
```

2. Build the application:
```bash
npm run build
```

### Run Health Check

To run the health check tests:

```bash
npm run test:health
```

This will:
1. Start a preview server with the built app
2. Run all health check tests in Chromium browser
3. Generate a test report
4. Automatically shut down the server when tests complete

### View Test Results

To view the detailed HTML report:

```bash
npm run test:health:report
```

### Interactive Mode

To run tests in interactive UI mode (useful for debugging):

```bash
npm run test:health:ui
```

## Test Coverage

The health check suite includes the following tests:

### Basic Loading Tests
- **Landing Page Load**: Verifies the homepage loads without hanging
- **React App Render**: Confirms React components render without errors

### Navigation Tests
- **Auth Page**: Tests navigation to authentication page
- **Contact Page**: Verifies contact page loads correctly
- **Privacy Policy**: Checks privacy policy page renders
- **Terms of Service**: Validates terms page displays properly
- **Install Page**: Tests PWA install page functionality
- **404 Handling**: Ensures unknown routes are handled gracefully

### Stability Tests
- **Multi-Page Navigation**: Tests navigation between multiple pages without crashes
- **Full Page Lifecycle**: Verifies complete page lifecycle including scrolling and navigation

### Error Detection
All tests actively monitor for:
- Console errors
- Page crashes
- JavaScript exceptions
- Unhandled promise rejections
- Page hangs (via timeout configurations)

## Test Configuration

Tests are configured in `playwright.config.ts`:
- **Timeout**: 60 seconds per test
- **Retries**: 2 retries on CI, 0 locally
- **Browser**: Chromium (can be extended to Firefox and WebKit)
- **Screenshots**: Captured on failure
- **Videos**: Recorded on failure
- **Traces**: Collected on first retry

## Continuous Integration

These health checks are automatically run in CI/CD via GitHub Actions:

- **On every push** to `main` or `develop` branches
- **On every pull request** to `main` or `develop` branches  
- **Daily at 6 AM UTC** as a scheduled check
- **Manually** via GitHub Actions workflow dispatch

The workflow will:
1. Build the application
2. Install Playwright and browsers
3. Run all health checks
4. Upload test reports and screenshots
5. Comment on PRs with test results

To manually trigger a health check in CI:
1. Go to the "Actions" tab in GitHub
2. Select "Web App Health Check" workflow
3. Click "Run workflow"

### CI Configuration

The CI workflow is defined in `.github/workflows/health-check.yml` and runs:

```bash
npm run build && npm run test:health
```

The tests will fail if:
- Any page takes longer than 60 seconds to load
- Any JavaScript errors are thrown
- The browser crashes
- Navigation fails
- Critical elements are missing

## Troubleshooting

### Test Failures

If tests fail:

1. Check the HTML report: `npm run test:health:report`
2. Look for screenshots in `test-results/` directory
3. Check videos for visual debugging
4. Review console errors in the test output

### Slow Tests

If tests are timing out:
- Increase timeout in `playwright.config.ts`
- Check network connectivity
- Verify the preview server is running properly

### Browser Issues

If browser launch fails:
```bash
npx playwright install chromium
```

## Adding More Tests

To add additional health checks:

1. Open `tests/health-check.spec.ts`
2. Add new test cases following the existing pattern
3. Run tests to verify: `npm run test:health`

Example:
```typescript
test('should load new feature page', async ({ page }) => {
  await page.goto('http://localhost:8080/#/new-feature', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('body', { state: 'visible' });
  expect(page.isClosed()).toBe(false);
});
```

## Best Practices

- Keep tests focused on health/stability, not functionality
- Use realistic timeouts (30-60 seconds)
- Monitor for console errors and crashes
- Test critical user paths
- Ensure tests can run in CI environment
- Keep tests independent and repeatable
