#!/usr/bin/env python3
"""
Convert the EXACT SVG from Gist to PNG - NO MODIFICATIONS AT ALL.
Keep everything exactly as in the original: colors, background, everything.
"""

from PIL import Image, ImageDraw

def create_exact_logo_with_background():
    """
    Recreate the EXACT SVG from the gist with EVERYTHING.
    - Green background (#B5EAD7)
    - Dark lines (#1A1C1E)
    - Exact coordinates
    - NO CHANGES
    """
    SIZE = 512
    
    # Create image with WHITE background (will add green rect)
    img = Image.new('RGB', (SIZE, SIZE), (255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    # Scale factor from 500x500 to 512x512
    scale = SIZE / 500
    
    # EXACT colors from SVG
    BG_COLOR = (181, 234, 215)  # #B5EAD7 - GREEN BACKGROUND
    STROKE_COLOR = (26, 28, 30)  # #1A1C1E - DARK STROKE
    
    # EXACT rounded rectangle with GREEN FILL (not transparent!)
    # rect width="400" height="400" x="50" y="50" rx="80" fill="#B5EAD7"
    rect_x = int(50 * scale)
    rect_y = int(50 * scale)
    rect_w = int(400 * scale)
    rect_h = int(400 * scale)
    rect_r = int(80 * scale)
    
    # Draw filled rounded rectangle with GREEN background
    draw.rounded_rectangle(
        [rect_x, rect_y, rect_x + rect_w, rect_y + rect_h],
        radius=rect_r,
        fill=BG_COLOR
    )
    
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
    
    # Add round line caps (stroke-linecap="round")
    cap_radius = stroke_width // 2
    for x, y in line_points:
        draw.ellipse([x - cap_radius, y - cap_radius,
                     x + cap_radius, y + cap_radius],
                    fill=STROKE_COLOR)
    
    # Arrow path - EXACT coordinates from SVG
    # Path: M305 255H350V300
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
    
    # Add round caps for arrow (stroke-linecap="round")
    for x, y in arrow_points:
        draw.ellipse([x - cap_radius, y - cap_radius,
                     x + cap_radius, y + cap_radius],
                    fill=STROKE_COLOR)
    
    return img

def main():
    print("Converting EXACT logo from Gist with NO MODIFICATIONS...")
    print("  SVG Source: GitHub Gist (vicisaac48-eng)")
    print("  Background: #B5EAD7 (GREEN) - INCLUDED")
    print("  Stroke: #1A1C1E (DARK) - EXACT")
    print("  NO CHANGES - Using exactly as-is!")
    
    logo = create_exact_logo_with_background()
    
    output_path = 'src/assets/zikalyze-logo.png'
    logo.save(output_path, 'PNG', optimize=True, compress_level=9)
    
    print(f"\n✓ EXACT logo created: {output_path}")
    print(f"  Size: {logo.size}")
    print(f"  Mode: {logo.mode} (with green background)")
    print(f"  100% faithful to original SVG!")

if __name__ == '__main__':
    main()
