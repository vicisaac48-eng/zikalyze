# GitHub Workflows Retry Logic Implementation

## Problem Statement

The Android Build workflow was experiencing failures due to GitHub's transient infrastructure errors:

```
remote: Internal Server Error
Error: fatal: unable to access 'https://github.com/vicisaac48-eng/zikalyze/': The requested URL returned error: 500
The process '/usr/bin/git' failed with exit code 128
```

These 500 Internal Server Errors during the checkout step caused workflow runs to fail, even though the issue was temporary and not related to the repository or code.

## Root Cause

GitHub Actions' `actions/checkout@v4` action does not have built-in retry logic for HTTP 500 errors. When GitHub's infrastructure experiences transient issues:

1. The checkout action attempts to fetch the repository
2. GitHub returns a 500 Internal Server Error
3. The checkout action fails immediately without retrying
4. The entire workflow run fails

While GitHub Actions has some retry mechanisms for certain failures, HTTP 500 errors during checkout are not automatically retried by default.

## Solution

We implemented retry logic using the `Wandalen/wretry.action@v3` wrapper, which provides:

- **Automatic retries**: Up to 5 attempts for any GitHub Action
- **Configurable delays**: 10-second wait between retry attempts  
- **Error handling**: Wraps the target action and retries on any failure

### Implementation

All workflow files were updated to wrap the checkout step:

**Before:**
```yaml
- name: Checkout repository
  uses: actions/checkout@v4
```

**After:**
```yaml
- name: Checkout repository
  uses: Wandalen/wretry.action@v3
  with:
    action: actions/checkout@v4
    attempt_limit: 5
    attempt_delay: 10000
```

For workflows that require additional checkout parameters (like `fetch-depth`):

```yaml
- name: Checkout repository
  uses: Wandalen/wretry.action@v3
  with:
    action: actions/checkout@v4
    with: |
      fetch-depth: 0
    attempt_limit: 5
    attempt_delay: 10000
```

## Files Modified

The following workflow files were updated with retry logic:

1. `.github/workflows/android-build.yml` - Android build workflow
2. `.github/workflows/release.yml` - APK release workflow
3. `.github/workflows/deploy-ipfs.yml` - IPFS deployment workflow
4. `.github/workflows/health-check.yml` - Health check workflow
5. `.github/workflows/codeql.yml` - Security scanning workflow

## Benefits

1. **Resilience**: Workflows can now recover from transient GitHub infrastructure failures
2. **Reliability**: Reduces false-negative failures caused by temporary network/server issues
3. **Consistency**: All workflows use the same retry strategy
4. **Transparency**: Retry attempts are logged, providing visibility into infrastructure issues

## Testing

All workflow YAML files were validated for:
- Correct YAML syntax
- Proper retry action configuration
- Preservation of original checkout parameters

## Configuration Details

- **Attempt Limit**: 5 retries
- **Attempt Delay**: 10 seconds (10000 milliseconds)
- **Total Time**: Up to ~50 seconds maximum (5 attempts × 10 seconds)

This configuration balances quick recovery for transient errors while avoiding excessive delays for permanent failures.

## References

- [Wandalen/wretry.action](https://github.com/Wandalen/wretry.action) - GitHub Action retry wrapper
- [actions/checkout](https://github.com/actions/checkout) - Official GitHub checkout action
- [GitHub Actions Documentation](https://docs.github.com/en/actions) - GitHub Actions guides

## Monitoring

To verify the fix is working:

1. Check workflow run logs for retry messages
2. Monitor workflow success rates for improvement
3. Look for "Retrying" indicators in failed checkout attempts

The retry logic will automatically engage when GitHub returns 500 errors or other transient failures during checkout.
