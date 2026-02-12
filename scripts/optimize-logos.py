#!/usr/bin/env python3
"""
Optimize Zikalyze logos for Android quality standards.
Maintains exact colors and style while improving compression and quality.
"""

from PIL import Image, ImageFilter
import os

# Android icon specifications
ANDROID_ICONS = {
    'mdpi': 48,
    'hdpi': 72,
    'xhdpi': 96,
    'xxhdpi': 144,
    'xxxhdpi': 192
}

def optimize_png(input_path, output_path, size=None, quality_level=9):
    """
    Optimize PNG image while maintaining quality.
    
    Args:
        input_path: Source image path
        output_path: Destination image path
        size: Target size (width, height) or None to keep original
        quality_level: PNG compression level (0-9, higher = smaller file)
    """
    print(f"Processing: {input_path} -> {output_path}")
    
    # Open image
    img = Image.open(input_path)
    
    # Ensure RGBA mode for proper transparency handling
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    # Resize if needed
    if size and img.size != size:
        # Use LANCZOS (high-quality) resampling
        img = img.resize(size, Image.Resampling.LANCZOS)
        print(f"  Resized to: {size}")
    
    # For Android launcher icons, ensure the logo fits within safe zone
    # Android recommends 66% of icon should be the actual logo content
    # with ~33% padding for adaptive icons
    
    # Save with optimal PNG compression
    # optimize=True enables additional optimization passes
    # compress_level controls zlib compression (0-9)
    img.save(
        output_path,
        'PNG',
        optimize=True,
        compress_level=quality_level
    )
    
    # Get file sizes
    input_size = os.path.getsize(input_path)
    output_size = os.path.getsize(output_path)
    reduction = ((input_size - output_size) / input_size) * 100 if input_size > 0 else 0
    
    print(f"  Input: {input_size/1024:.1f}KB -> Output: {output_size/1024:.1f}KB (reduction: {reduction:.1f}%)")
    return img

def create_android_icons(source_path, base_output_dir):
    """
    Create Android launcher icons in all required densities.
    """
    print(f"\nCreating Android launcher icons from: {source_path}")
    
    # Load source logo
    source_img = Image.open(source_path)
    
    # Process each density
    for density, size in ANDROID_ICONS.items():
        output_dir = os.path.join(base_output_dir, f'mipmap-{density}')
        os.makedirs(output_dir, exist_ok=True)
        
        print(f"\n{density.upper()} ({size}x{size}):")
        
        # Create ic_launcher.png (square icon with logo)
        launcher_path = os.path.join(output_dir, 'ic_launcher.png')
        optimize_png(source_path, launcher_path, (size, size), quality_level=9)
        
        # Create ic_launcher_round.png (same as square for now)
        round_path = os.path.join(output_dir, 'ic_launcher_round.png')
        optimize_png(source_path, round_path, (size, size), quality_level=9)
        
        # Create ic_launcher_foreground.png (same as square for now)
        foreground_path = os.path.join(output_dir, 'ic_launcher_foreground.png')
        optimize_png(source_path, foreground_path, (size, size), quality_level=9)

def main():
    """Main optimization process."""
    print("=" * 70)
    print("Zikalyze Logo Optimization for Android Quality Standards")
    print("=" * 70)
    
    # Paths
    source_logo = 'src/assets/zikalyze-logo.png'
    
    # 1. Optimize main logo (512x512) - highest quality
    print("\n1. Optimizing main logo (512x512)...")
    optimize_png(source_logo, 'src/assets/zikalyze-logo.png.new', (512, 512), quality_level=9)
    os.replace('src/assets/zikalyze-logo.png.new', source_logo)
    
    # 2. Optimize PWA icons
    print("\n2. Optimizing PWA icons...")
    optimize_png(source_logo, 'public/pwa-512x512.png.new', (512, 512), quality_level=9)
    os.replace('public/pwa-512x512.png.new', 'public/pwa-512x512.png')
    
    optimize_png(source_logo, 'public/pwa-192x192.png.new', (192, 192), quality_level=9)
    os.replace('public/pwa-192x192.png.new', 'public/pwa-192x192.png')
    
    # 3. Optimize favicon
    print("\n3. Optimizing favicon...")
    optimize_png(source_logo, 'public/favicon.png.new', (48, 48), quality_level=9)
    os.replace('public/favicon.png.new', 'public/favicon.png')
    
    # 4. Create Android icons in all densities
    print("\n4. Creating Android launcher icons...")
    create_android_icons(source_logo, 'android/app/src/main/res')
    
    print("\n" + "=" * 70)
    print("✓ Logo optimization complete!")
    print("=" * 70)
    print("\nAll logos have been optimized while maintaining:")
    print("  • Exact same colors and visual style")
    print("  • High quality (LANCZOS resampling)")
    print("  • Optimal PNG compression (level 9)")
    print("  • Android standard dimensions")
    print("  • RGBA support with proper alpha channel")

if __name__ == '__main__':
    main()
