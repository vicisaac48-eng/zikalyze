#!/usr/bin/env python3
"""
Create Google Play Store assets from the Zikalyze logo.
Generates high-res icon and feature graphic for Play Console upload.
"""

import os
from PIL import Image, ImageDraw, ImageFont

# Paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
LOGO_PATH = os.path.join(PROJECT_ROOT, "src/assets/zikalyze-logo.png")
OUTPUT_DIR = os.path.join(PROJECT_ROOT, "android/play-store-assets")

# Create output directory
os.makedirs(OUTPUT_DIR, exist_ok=True)

print("Creating Google Play Store assets...")
print(f"Logo source: {LOGO_PATH}")
print(f"Output directory: {OUTPUT_DIR}")

# Load the logo
logo = Image.open(LOGO_PATH)
print(f"✓ Loaded logo: {logo.size} {logo.mode}")

# 1. High-res icon (512x512) - Required by Play Store
print("\n1. Creating high-res icon (512x512)...")
highres_icon = logo.copy()
if highres_icon.size != (512, 512):
    highres_icon = highres_icon.resize((512, 512), Image.Resampling.LANCZOS)

highres_path = os.path.join(OUTPUT_DIR, "icon-512x512.png")
highres_icon.save(highres_path, "PNG", optimize=True)
file_size = os.path.getsize(highres_path) / 1024
print(f"✓ Saved: {highres_path} ({file_size:.1f}KB)")

# 2. Feature Graphic (1024x500) - Recommended for Play Store
print("\n2. Creating feature graphic (1024x500)...")
feature_graphic = Image.new("RGB", (1024, 500), color=(181, 234, 215))  # #B5EAD7

# Center the logo
logo_resized = logo.copy()
if logo.mode == "RGBA":
    logo_resized = logo_resized.resize((400, 400), Image.Resampling.LANCZOS)
else:
    logo_resized = logo_resized.resize((400, 400), Image.Resampling.LANCZOS)
    
# Calculate position to center logo
logo_x = (1024 - 400) // 2
logo_y = (500 - 400) // 2

# Paste logo
if logo_resized.mode == "RGBA":
    feature_graphic.paste(logo_resized, (logo_x, logo_y), logo_resized)
else:
    feature_graphic.paste(logo_resized, (logo_x, logo_y))

feature_path = os.path.join(OUTPUT_DIR, "feature-graphic-1024x500.png")
feature_graphic.save(feature_path, "PNG", optimize=True)
file_size = os.path.getsize(feature_path) / 1024
print(f"✓ Saved: {feature_path} ({file_size:.1f}KB)")

# 3. Create README with upload instructions
print("\n3. Creating README.md with upload instructions...")
readme_content = """# Google Play Store Assets

This directory contains assets required for uploading Zikalyze to the Google Play Store.

## Assets Included

### 1. High-Resolution Icon (512×512)
- **File:** `icon-512x512.png`
- **Size:** 512×512 pixels
- **Format:** PNG, 32-bit with alpha channel
- **Purpose:** App icon displayed in Google Play Console
- **Requirement:** **Required** by Google Play Store

### 2. Feature Graphic (1024×500)
- **File:** `feature-graphic-1024x500.png`
- **Size:** 1024×500 pixels
- **Format:** PNG
- **Purpose:** Header graphic displayed at the top of your app's Play Store listing
- **Requirement:** **Recommended** (highly visible in store)

## Upload Instructions

### Step 1: Access Play Console
1. Go to [Google Play Console](https://play.google.com/console)
2. Select your app or create a new app

### Step 2: Upload High-Res Icon
1. Navigate to **Main store listing** in the left menu
2. Scroll to **App icon** section
3. Click **Upload** and select `icon-512x512.png`
4. Verify the preview looks correct

### Step 3: Upload Feature Graphic
1. In the same **Main store listing** page
2. Scroll to **Feature graphic** section
3. Click **Upload** and select `feature-graphic-1024x500.png`
4. Verify the preview looks correct

### Step 4: Additional Assets
You'll also need to provide:
- **Screenshots** (minimum 2, up to 8)
  - Phone: 320-3840px on shortest side
  - Tablet (if applicable): 1200-7680px on shortest side
- **Short description** (80 characters max)
- **Full description** (4000 characters max)
- **App category**
- **Content rating**

## Asset Specifications

### Logo Design
- **Source:** GitHub Gist design (trending chart with arrow)
- **Background:** Green (#B5EAD7)
- **Foreground:** Dark trending line (#1A1C1E)
- **Style:** Professional, analytics-focused

### Quality Standards
- All images optimized with PNG compression
- High-quality LANCZOS resampling
- Meets Google Play Store requirements
- Professional presentation

## Launcher Icons

The app's launcher icons are located in:
```
android/app/src/main/res/mipmap-{density}/
```

Densities available:
- **MDPI** (48×48px) - Medium
- **HDPI** (72×72px) - High
- **XHDPI** (96×96px) - Extra-high
- **XXHDPI** (144×144px) - Extra-extra-high
- **XXXHDPI** (192×192px) - Extra-extra-extra-high

## Notes

- Keep source files for future updates
- Test on multiple devices before publishing
- Follow Google Play Store policies and guidelines
- Update assets if you change the app's branding

## Questions?

For more information, visit:
- [Google Play Console Help](https://support.google.com/googleplay/android-developer/)
- [Graphic Assets Guidelines](https://support.google.com/googleplay/android-developer/answer/9866151)

---

*Generated: 2026-02-12*
*App: Zikalyze - Crypto Analytics*
"""

readme_path = os.path.join(OUTPUT_DIR, "README.md")
with open(readme_path, "w") as f:
    f.write(readme_content)
print(f"✓ Saved: {readme_path}")

print("\n✅ All Google Play Store assets created successfully!")
print(f"\nAssets location: {OUTPUT_DIR}")
print("\nFiles created:")
print("  1. icon-512x512.png (High-res app icon)")
print("  2. feature-graphic-1024x500.png (Store listing header)")
print("  3. README.md (Upload instructions)")
print("\n🚀 Ready for Google Play Store submission!")
