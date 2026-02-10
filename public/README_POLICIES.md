# Legal Policy Pages

This directory contains standalone HTML versions of Zikalyze's legal policy pages for public access without requiring the React app to load.

## Files

### privacy.html
- **Purpose**: Privacy Policy for Play Store submission and public access
- **URL**: `https://zikalyze.com/privacy.html`
- **Description**: Comprehensive GDPR-compliant privacy policy detailing data collection, usage, and user rights
- **Last Updated**: January 20, 2025

### terms.html
- **Purpose**: Terms of Service for Play Store and public access
- **URL**: `https://zikalyze.com/terms.html`
- **Description**: Complete terms of service including disclaimers, acceptable use, and legal obligations
- **Last Updated**: January 20, 2025

## Features

Both HTML files include:
- ✅ **Responsive Design**: Mobile-friendly layout optimized for all screen sizes
- ✅ **Dark Theme**: Matches Zikalyze's branding with dark background (#0a0f1a)
- ✅ **Standalone**: No dependencies on React or external CSS files
- ✅ **Accessible**: Proper semantic HTML structure
- ✅ **SEO Optimized**: Meta tags and proper document structure
- ✅ **Cross-linked**: Privacy and Terms pages link to each other

## Usage

### For Play Store Submission
When submitting to Google Play Store, use the following URL in the "Privacy Policy" field:
```
https://zikalyze.com/privacy.html
```

### For In-App Reference
Users can also access policies through the React app routes:
- Privacy: `https://zikalyze.com/#/privacy`
- Terms: `https://zikalyze.com/#/terms`

## Maintenance

When updating these files:
1. Update the content in both the HTML files and corresponding React components:
   - `public/privacy.html` ↔ `src/pages/PrivacyPolicy.tsx`
   - `public/terms.html` ↔ `src/pages/TermsOfService.tsx`
2. Update the "Last updated" date
3. Rebuild and redeploy the application
4. The static HTML files in `public/` are automatically copied to `dist/` during build

## Contact

For questions about these policies:
- Email: privacyzikalyze@gmail.com
