# Production Links Guide - Privacy Policy & Terms of Service

## Overview
This guide explains how privacy and terms links work on the deployed website (https://zikalyze.com), not just on localhost.

## ✅ Verified Production Links

### React App Routes (Hash Routing)
These work within the React application using HashRouter:

- **Privacy Policy**: `https://zikalyze.com/#/privacy`
- **Terms of Service**: `https://zikalyze.com/#/terms`

**How it works:**
- The app uses React Router's HashRouter (configured in `src/App.tsx`)
- Hash routing works with any server configuration (no server-side routing needed)
- Works with IPFS deployment and static hosting
- Links use format: `<Link to="/privacy">` which becomes `#/privacy` in the URL

### Standalone HTML Files (Direct Access)
These work as standalone pages accessible directly via URL:

- **Privacy Policy**: `https://zikalyze.com/privacy.html`
- **Terms of Service**: `https://zikalyze.com/terms.html`

**How it works:**
- Standalone HTML files in `public/` folder
- Automatically copied to `dist/` during build
- Work without React app loading
- Perfect for Google Play Store requirements
- Use relative links (`./privacy.html`, `./terms.html`) for cross-linking

## Link Implementation

### 1. Auth Page Links
**File**: `src/pages/Auth.tsx`

```tsx
<Link to="/terms" className="text-primary hover:underline">
  Terms of Service
</Link>
<Link to="/privacy" className="text-primary hover:underline">
  Privacy Policy
</Link>
```

**Rendered URLs**:
- Terms: `https://zikalyze.com/#/terms`
- Privacy: `https://zikalyze.com/#/privacy`

### 2. Landing Page Footer Links
**File**: `src/pages/Landing.tsx`

```tsx
<Link to="/privacy">Privacy Policy</Link>
<Link to="/terms">Terms of Service</Link>
```

**Rendered URLs**: Same as above (hash routing)

### 3. Standalone HTML Cross-Links
**File**: `public/privacy.html`

```html
<a href="./terms.html">Terms of Service</a>
<a href="https://zikalyze.com">Home</a>
```

**File**: `public/terms.html`

```html
<a href="./privacy.html">Privacy Policy</a>
<a href="https://zikalyze.com">Home</a>
```

**Rendered URLs**:
- From privacy.html: `https://zikalyze.com/terms.html`
- From terms.html: `https://zikalyze.com/privacy.html`

## Deployment Configuration

### Vite Config (`vite.config.ts`)
```typescript
export default defineConfig({
  base: './',  // Relative paths for IPFS compatibility
  // ...
});
```

This configuration ensures:
- ✅ Works on any domain or subdomain
- ✅ Works with IPFS deployments
- ✅ Works with CDN deployments
- ✅ No hardcoded absolute paths

### Build Process
1. Run `npm run build`
2. Vite compiles React app to `dist/`
3. Standalone HTML files copied from `public/` to `dist/`
4. All files ready for deployment

## Testing Production Build Locally

### Method 1: Preview Server
```bash
npm run build
npm run preview
```
Visit: `http://localhost:4173`

### Method 2: Test Standalone Files
```bash
# After building
open dist/privacy.html  # Mac
xdg-open dist/privacy.html  # Linux
start dist/privacy.html  # Windows
```

## Google Play Store Compliance

### Requirements ✅
- [x] Privacy Policy must be accessible via clickable link
- [x] Terms of Service must be accessible via clickable link  
- [x] Links must work on the web (not just localhost)
- [x] Standalone HTML pages for direct access

### Submission URLs
Use these URLs when submitting to Google Play Store:

**Privacy Policy URL**: `https://zikalyze.com/privacy.html`  
**Terms of Service URL**: `https://zikalyze.com/terms.html`

**Alternative In-App URLs** (also valid):
- Privacy: `https://zikalyze.com/#/privacy`
- Terms: `https://zikalyze.com/#/terms`

## URL Compatibility Matrix

| Access Method | Privacy Link | Terms Link | Works? |
|--------------|-------------|------------|--------|
| React App (Auth page) | `#/privacy` | `#/terms` | ✅ |
| React App (Footer) | `#/privacy` | `#/terms` | ✅ |
| Direct HTML Access | `/privacy.html` | `/terms.html` | ✅ |
| Cross-links in HTML | `./privacy.html` | `./terms.html` | ✅ |
| Google Play Store | `/privacy.html` | `/terms.html` | ✅ |
| IPFS Gateway | `/privacy.html` | `/terms.html` | ✅ |

## Troubleshooting

### Issue: Links don't work on production
**Solution**: Ensure the build was run before deployment
```bash
npm run build
```

### Issue: 404 errors on privacy.html/terms.html
**Solution**: Check that `dist/` folder contains these HTML files
```bash
ls -la dist/*.html
# Should show: index.html, privacy.html, terms.html, offline.html
```

### Issue: Links work on localhost but not production
**Solution**: Verify the base path is set to `./` in vite.config.ts

## Maintenance

### Updating Legal Pages
When updating privacy policy or terms of service:

1. **Update React Components**:
   - Edit `src/pages/PrivacyPolicy.tsx`
   - Edit `src/pages/TermsOfService.tsx`

2. **Update Standalone HTML**:
   - Edit `public/privacy.html`
   - Edit `public/terms.html`

3. **Update "Last Updated" Date**:
   - Update date in all 4 files above

4. **Rebuild**:
   ```bash
   npm run build
   ```

5. **Deploy**:
   - Push to `main` branch (triggers IPFS deployment)
   - Or manually deploy `dist/` folder

## Summary

✅ **All links are production-ready and work on https://zikalyze.com**  
✅ **React Router hash links work**: `#/privacy`, `#/terms`  
✅ **Standalone HTML files work**: `/privacy.html`, `/terms.html`  
✅ **Google Play Store compliant**: Direct accessible URLs  
✅ **IPFS compatible**: Relative paths, no absolute URLs  
✅ **No localhost dependencies**: All paths are relative or domain-agnostic

The implementation supports multiple access methods and deployment scenarios while maintaining Google Play Store compliance requirements.
