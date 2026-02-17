# Changelog

## [1.1.0] - 2026-02-17

### Added
- Push notifications support for Android via Firebase Cloud Messaging (FCM)
- Real-time price updates via WebSocket connections
- Service worker cache management with auto-update functionality
- Google Services configuration for Android builds

### Fixed
- AAB build artifacts now properly handled with binary encoding in .gitattributes
- Service worker cache invalidation for privacy and terms pages
- Privacy policy consistency - removed outdated files that contradicted no-data-collection policy
- UTF-8 encoding errors for Android AAB files in Codespace

### Improved
- Neural network threshold optimized to 55% (from 60%) for better trade capture
- Algorithm confidence threshold maintained at 65% for quality filtering
- Dynamic threshold adjustment: relaxes to 50% when algorithmic confidence >65%
- Analysis output streamlined by removing redundant explanatory text
- Build artifacts and dependencies properly excluded via .gitignore

### Security
- Binary files (AAB, APK, JKS, keystore) properly marked in .gitattributes
- Client-side only architecture with AES-256-GCM encryption
- No data collection policy enforced throughout application

### Technical
- Firebase BOM 34.9.0 with Analytics integration
- Capacitor 8.0.2 for native Android functionality
- VitePWA with registerType: "autoUpdate" and cleanupOutdatedCaches()
- Google Services plugin 4.4.4 for Android builds
