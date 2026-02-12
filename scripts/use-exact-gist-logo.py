#!/usr/bin/env python3
"""
Convert the exact SVG from the Gist to PNG with transparent background.
NO modifications - just remove the background fill.
"""

from PIL import Image, ImageDraw

def create_exact_logo_from_svg():
    """
    Recreate the EXACT SVG from the gist, only removing the background.
    Everything else stays exactly as in the original SVG.
    """
    SIZE = 512
    
    # Create transparent image
    img = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Scale factor from 500x500 to 512x512
    scale = SIZE / 500
    
    # Colors from the EXACT SVG (no changes)
    STROKE_COLOR = (26, 28, 30)  # #1A1C1E from the SVG
    # Background fill #B5EAD7 is removed (transparent instead)
    
    # Main trending line path - EXACT coordinates from SVG
    # Path: M185 320L235 270L285 320L350 255
    line_points = [
        (int(185 * scale), int(320 * scale)),
        (int(235 * scale), int(270 * scale)),
        (int(285 * scale), int(320 * scale)),
        (int(350 * scale), int(255 * scale))
    ]
    
    # Draw the line exactly as in SVG
    stroke_width = int(24 * scale)
    for i in range(len(line_points) - 1):
        draw.line([line_points[i], line_points[i + 1]], 
                  fill=STROKE_COLOR, width=stroke_width)
    
    # Add round line caps manually (draw circles at each point)
    cap_radius = stroke_width // 2
    for x, y in line_points:
        draw.ellipse([x - cap_radius, y - cap_radius,
                     x + cap_radius, y + cap_radius],
                    fill=STROKE_COLOR)
    
    # Arrow path - EXACT coordinates from SVG
    # Path: M305 255H350V300 (horizontal line then vertical line)
    arrow_points = [
        (int(305 * scale), int(255 * scale)),
        (int(350 * scale), int(255 * scale)),
        (int(350 * scale), int(300 * scale))
    ]
    
    # Draw arrow lines
    draw.line([arrow_points[0], arrow_points[1]], 
              fill=STROKE_COLOR, width=stroke_width)
    draw.line([arrow_points[1], arrow_points[2]], 
              fill=STROKE_COLOR, width=stroke_width)
    
    # Add round caps for arrow
    for x, y in arrow_points:
        draw.ellipse([x - cap_radius, y - cap_radius,
                     x + cap_radius, y + cap_radius],
                    fill=STROKE_COLOR)
    
    return img

def main():
    print("Converting EXACT logo from Gist...")
    print("  Source: GitHub Gist SVG (unchanged)")
    print("  Colors: Original #1A1C1E stroke")
    print("  Background: Transparent (removed #B5EAD7 fill)")
    print("  NO modifications to design")
    
    logo = create_exact_logo_from_svg()
    
    output_path = 'src/assets/zikalyze-logo.png'
    logo.save(output_path, 'PNG', optimize=True, compress_level=9)
    
    print(f"\n✓ Exact logo created: {output_path}")
    print(f"  Size: {logo.size}")
    print(f"  Mode: {logo.mode} (transparent)")

if __name__ == '__main__':
    main()
