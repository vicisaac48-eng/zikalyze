#!/usr/bin/env python3
"""
Remove white background from logo and make it transparent.
Usage: python3 remove-white-background.py <input-image> [output-image]
"""

import sys
from PIL import Image
import numpy as np

def remove_white_background(input_path, output_path=None, threshold=240):
    """
    Remove white/light colored background from an image.
    
    Args:
        input_path: Path to input image
        output_path: Path to save output (defaults to input_path with '-transparent.png')
        threshold: RGB value threshold for white (0-255, default 240)
    """
    print(f"Loading image: {input_path}")
    
    # Open image and convert to RGBA
    img = Image.open(input_path).convert('RGBA')
    print(f"  Original size: {img.size}")
    print(f"  Original mode: {img.mode}")
    
    # Convert to numpy array for easier processing
    data = np.array(img)
    
    # Get RGB channels
    r, g, b, a = data[:, :, 0], data[:, :, 1], data[:, :, 2], data[:, :, 3]
    
    # Create mask for white/near-white pixels
    # A pixel is considered white if all RGB values are above threshold
    white_mask = (r > threshold) & (g > threshold) & (b > threshold)
    
    # Set alpha to 0 for white pixels
    data[:, :, 3] = np.where(white_mask, 0, a)
    
    # Create new image from modified data
    result = Image.fromarray(data, 'RGBA')
    
    # Determine output path
    if output_path is None:
        base = input_path.rsplit('.', 1)[0]
        output_path = f"{base}-transparent.png"
    
    # Save as PNG (supports transparency)
    result.save(output_path, 'PNG', optimize=True, compress_level=9)
    
    print(f"✓ Saved transparent logo to: {output_path}")
    print(f"  Output size: {result.size}")
    print(f"  Output mode: {result.mode}")
    print(f"  White pixels removed (threshold: {threshold})")
    
    return output_path

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 remove-white-background.py <input-image> [output-image] [threshold]")
        print("\nExample:")
        print("  python3 remove-white-background.py logo.jpg")
        print("  python3 remove-white-background.py logo.jpg transparent-logo.png")
        print("  python3 remove-white-background.py logo.jpg transparent-logo.png 230")
        print("\nThreshold: RGB value (0-255) above which pixels are considered white (default: 240)")
        sys.exit(1)
    
    input_path = sys.argv[1]
    output_path = sys.argv[2] if len(sys.argv) > 2 else None
    threshold = int(sys.argv[3]) if len(sys.argv) > 3 else 240
    
    try:
        remove_white_background(input_path, output_path, threshold)
        print("\n✓ Success! Background removed.")
    except Exception as e:
        print(f"\n✗ Error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
