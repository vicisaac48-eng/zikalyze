# Cache Invalidation Update - February 17, 2026

## Issue
New privacy policy and terms of service content not showing on the website due to service worker caching.

## Root Cause
The privacy policy (`public/privacy.html`) was dated February 16, 2026, while the terms (`public/terms.html`) was updated to February 17, 2026. Even though source files were current, the service worker cache (v7) was serving old cached versions with outdated revision hashes.

## Solution Implemented

### 1. Updated Privacy Policy Date
- **File**: `public/privacy.html`
- **Change**: Updated "Last updated: February 16, 2026" → "Last updated: February 17, 2026"
- This ensures both policy and terms have consistent dates

### 2. Incremented Service Worker Cache
- **File**: `public/sw.js`
- **Change**: Cache version incremented from `v7` → `v8`
- This forces browsers to invalidate old caches and fetch new content

### 3. Rebuilt Application with VitePWA
- **Command**: `npm run build`
- **Result**: VitePWA regenerated service worker with new revision hashes:
  - `privacy.html`: `7101d05b5acc571ea8cb8e0b8cd923c2` (NEW)
  - `terms.html`: `f0f32a8f87952198263e284cc3e40c6a` (existing)
- Both files now precached with updated content

## How Cache Invalidation Works

### Service Worker Cache Strategy
1. **VitePWA Auto-Update**: Configured with `registerType: "autoUpdate"` in `vite.config.ts`
2. **Revision-Based Caching**: Each file gets a unique hash based on its content
3. **Automatic Cleanup**: `cleanupOutdatedCaches()` removes old cache versions
4. **Two-Layer Caching**:
   - Manual `sw.js` cache version (v8)
   - VitePWA precache with file revision hashes

### User Experience
When users visit the site:
1. New service worker (with v8 cache) is detected
2. Browser automatically updates to new service worker
3. Old cache (v7) is automatically cleaned up
4. Fresh privacy.html and terms.html are served with updated content
5. No manual cache clearing required

## Deployment Steps

### For Web Deployment
1. Deploy the built `dist/` folder to your hosting (Netlify, Vercel, etc.)
2. The updated service worker will be automatically served
3. Users will get the new content on their next visit (or refresh)

### For Mobile (Capacitor)
1. Copy updated files to Capacitor:
   ```bash
   npx cap sync
   ```
2. Rebuild the mobile app:
   ```bash
   cd android && ./gradlew assembleRelease
   ```
3. The updated privacy and terms pages will be included in the app

## Testing Cache Invalidation

### Test Locally
1. **Start dev server**: `npm run dev`
2. **Open browser**: Navigate to `http://localhost:8080`
3. **Check Privacy**: Go to Privacy Policy page, verify date shows "February 17, 2026"
4. **Check Terms**: Go to Terms page, verify date shows "February 17, 2026"

### Test Production Build
1. **Build**: `npm run build`
2. **Serve**: `npx vite preview`
3. **Open browser**: Navigate to the preview URL
4. **Check both pages**: Verify dates are current

### Verify Service Worker
1. Open browser DevTools → Application tab
2. Go to "Service Workers" section
3. Verify new service worker is active
4. Check "Cache Storage" → Should see `zikalyze-v8`
5. Old `zikalyze-v7` should be removed

## Files Changed

### Source Files (Committed to Git)
- `public/privacy.html` - Updated date
- `public/sw.js` - Incremented cache version to v8

### Generated Files (Not Committed)
- `dist/sw.js` - VitePWA-generated service worker with new revision hashes
- `dist/privacy.html` - Built version with updated date
- `dist/terms.html` - Built version (already current)

## Future Updates

### When to Update Cache Version
Update the cache version in `public/sw.js` whenever:
1. Privacy policy content changes
2. Terms of service content changes
3. Critical bug fixes in static HTML files
4. Major UI/UX updates that must be immediately reflected

### Process for Future Updates
1. Edit the content in `public/privacy.html` or `public/terms.html`
2. Update the "Last updated" date
3. Increment cache version in `public/sw.js` (e.g., v8 → v9)
4. Run `npm run build` to regenerate service worker
5. Deploy the `dist/` folder
6. Users automatically get the new content

## Technical Notes

### Why Two Service Workers?
1. **Manual SW** (`public/sw.js`): 
   - Handles push notifications
   - Background AI learning
   - Custom caching logic
   - Manual cache version control

2. **VitePWA SW** (`dist/sw.js`):
   - Precaching of all static assets
   - Automatic revision hash generation
   - Workbox integration
   - Offline support

Both work together to ensure:
- Users get updated content automatically
- Old caches are cleaned up
- Offline functionality works
- Push notifications continue to function

### Cache Names
- Manual cache: `zikalyze-v8` (in `public/sw.js`)
- VitePWA cache: `workbox-precache-v2-...` (managed automatically)

## Verification Checklist

- [x] Privacy policy date updated to February 17, 2026
- [x] Service worker cache version incremented to v8
- [x] Application built successfully
- [x] New revision hashes generated for both HTML files
- [x] Build artifacts excluded from git (.gitignore configured)
- [x] Documentation created

## Commit
- **Branch**: `copilot/update-terms-and-conditions-page`
- **Commit**: `d016b76` - "Update privacy policy date and service worker cache to v8"
- **Files Changed**: 2 files, 2 insertions(+), 2 deletions(-)
