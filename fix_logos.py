#!/usr/bin/env python3
"""
Fix Zikalyze logo files:
- Convert JPEG to PNG
- Resize to proper dimensions
- Make icons square
"""

from PIL import Image
import os

def convert_and_resize(input_path, output_path, target_size, bg_color=(15, 23, 42, 255)):
    """
    Convert image to PNG and resize with proper aspect ratio
    
    Args:
        input_path: Source image path
        output_path: Destination image path
        target_size: Tuple (width, height) for target size
        bg_color: Background color RGBA tuple (default: dark slate from brand)
    """
    print(f"Processing: {input_path} -> {output_path} ({target_size[0]}×{target_size[1]})")
    
    # Open the source image
    img = Image.open(input_path)
    
    # Convert to RGBA if not already
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    # Calculate aspect ratio to fit within target size while maintaining proportions
    img_ratio = img.width / img.height
    target_ratio = target_size[0] / target_size[1]
    
    # For square targets, center the image with padding
    if target_size[0] == target_size[1]:
        # Calculate the size to fit the image within the target maintaining aspect ratio
        if img_ratio > 1:  # Wider than tall
            new_width = target_size[0]
            new_height = int(target_size[0] / img_ratio)
        else:  # Taller than wide
            new_height = target_size[1]
            new_width = int(target_size[1] * img_ratio)
        
        # Resize image
        img_resized = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        # Create new image with target size and background
        new_img = Image.new('RGBA', target_size, bg_color)
        
        # Paste resized image centered
        offset_x = (target_size[0] - new_width) // 2
        offset_y = (target_size[1] - new_height) // 2
        new_img.paste(img_resized, (offset_x, offset_y), img_resized)
        
    else:
        # For non-square, just resize
        new_img = img.resize(target_size, Image.Resampling.LANCZOS)
    
    # Save as PNG
    new_img.save(output_path, 'PNG', optimize=True)
    print(f"✓ Created {output_path}")

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Use the existing JPEG file as source
    source_logo = os.path.join(base_dir, 'src/assets/zikalyze-logo.png')
    
    if not os.path.exists(source_logo):
        print(f"Error: Source logo not found at {source_logo}")
        return
    
    print("="*60)
    print("ZIKALYZE LOGO CONVERSION AND RESIZING")
    print("="*60)
    
    # Define all the files to create with their target sizes
    conversions = [
        # Web/PWA Assets
        (source_logo, os.path.join(base_dir, 'src/assets/zikalyze-logo.png'), (512, 512)),
        (source_logo, os.path.join(base_dir, 'public/pwa-512x512.png'), (512, 512)),
        (source_logo, os.path.join(base_dir, 'public/pwa-192x192.png'), (192, 192)),
        (source_logo, os.path.join(base_dir, 'public/favicon.png'), (48, 48)),
        
        # Android Icons - MDPI (48x48)
        (source_logo, os.path.join(base_dir, 'android/app/src/main/res/mipmap-mdpi/ic_launcher.png'), (48, 48)),
        (source_logo, os.path.join(base_dir, 'android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png'), (48, 48)),
        (source_logo, os.path.join(base_dir, 'android/app/src/main/res/mipmap-mdpi/ic_launcher_foreground.png'), (48, 48)),
        
        # Android Icons - HDPI (72x72)
        (source_logo, os.path.join(base_dir, 'android/app/src/main/res/mipmap-hdpi/ic_launcher.png'), (72, 72)),
        (source_logo, os.path.join(base_dir, 'android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png'), (72, 72)),
        (source_logo, os.path.join(base_dir, 'android/app/src/main/res/mipmap-hdpi/ic_launcher_foreground.png'), (72, 72)),
        
        # Android Icons - XHDPI (96x96)
        (source_logo, os.path.join(base_dir, 'android/app/src/main/res/mipmap-xhdpi/ic_launcher.png'), (96, 96)),
        (source_logo, os.path.join(base_dir, 'android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png'), (96, 96)),
        (source_logo, os.path.join(base_dir, 'android/app/src/main/res/mipmap-xhdpi/ic_launcher_foreground.png'), (96, 96)),
        
        # Android Icons - XXHDPI (144x144)
        (source_logo, os.path.join(base_dir, 'android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png'), (144, 144)),
        (source_logo, os.path.join(base_dir, 'android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png'), (144, 144)),
        (source_logo, os.path.join(base_dir, 'android/app/src/main/res/mipmap-xxhdpi/ic_launcher_foreground.png'), (144, 144)),
        
        # Android Icons - XXXHDPI (192x192)
        (source_logo, os.path.join(base_dir, 'android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png'), (192, 192)),
        (source_logo, os.path.join(base_dir, 'android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png'), (192, 192)),
        (source_logo, os.path.join(base_dir, 'android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.png'), (192, 192)),
    ]
    
    print(f"\nTotal files to process: {len(conversions)}\n")
    
    # Process all conversions
    for input_path, output_path, size in conversions:
        try:
            convert_and_resize(input_path, output_path, size)
        except Exception as e:
            print(f"✗ Error processing {output_path}: {e}")
    
    print("\n" + "="*60)
    print("CONVERSION COMPLETE!")
    print("="*60)
    
    # Verify the files
    print("\nVerifying files...")
    for _, output_path, expected_size in conversions:
        if os.path.exists(output_path):
            try:
                img = Image.open(output_path)
                actual_size = f"{img.width}×{img.height}"
                expected_str = f"{expected_size[0]}×{expected_size[1]}"
                status = "✓" if (img.width, img.height) == expected_size else "✗"
                print(f"{status} {os.path.basename(output_path)}: {actual_size} (expected {expected_str})")
            except Exception as e:
                print(f"✗ Error reading {output_path}: {e}")
        else:
            print(f"✗ File not created: {output_path}")

if __name__ == '__main__':
    main()
