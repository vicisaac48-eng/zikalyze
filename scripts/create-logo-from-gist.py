#!/usr/bin/env python3
"""
Convert the Gist SVG logo to PNG with Zikalyze brand colors and transparent background.
Uses the chart/trending design from the gist but applies brand styling.
"""

from PIL import Image, ImageDraw
import math

# Zikalyze brand colors
PRIMARY_CYAN = (112, 255, 193)  # #70ffc1
ACCENT_PURPLE = (197, 163, 255)  # #c5a3ff
DARK_STROKE = (26, 28, 30)  # #1A1C1E

SIZE = 512
CENTER = SIZE // 2

def create_logo_from_gist_design():
    """
    Recreate the gist logo design with Zikalyze branding.
    - Trending chart line (upward arrow style)
    - Transparent background (no green fill)
    - Brand colors applied
    """
    # Create transparent image
    img = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Scale factor from 500x500 to 512x512
    scale = SIZE / 500
    
    # Rounded rectangle background (but transparent/outlined only)
    # Original: rect 400x400 at (50,50) with radius 80 and fill #B5EAD7
    # We'll make it a cyan outline instead of filled green
    rect_x = int(50 * scale)
    rect_y = int(50 * scale)
    rect_w = int(400 * scale)
    rect_h = int(400 * scale)
    rect_r = int(80 * scale)
    
    # Draw rounded rectangle outline in PRIMARY_CYAN
    # Top edge
    draw.line([(rect_x + rect_r, rect_y), (rect_x + rect_w - rect_r, rect_y)], 
              fill=PRIMARY_CYAN, width=8)
    # Right edge
    draw.line([(rect_x + rect_w, rect_y + rect_r), (rect_x + rect_w, rect_y + rect_h - rect_r)], 
              fill=PRIMARY_CYAN, width=8)
    # Bottom edge
    draw.line([(rect_x + rect_r, rect_y + rect_h), (rect_x + rect_w - rect_r, rect_y + rect_h)], 
              fill=PRIMARY_CYAN, width=8)
    # Left edge
    draw.line([(rect_x, rect_y + rect_r), (rect_x, rect_y + rect_h - rect_r)], 
              fill=PRIMARY_CYAN, width=8)
    
    # Draw rounded corners
    corner_r = rect_r
    # Top-left
    draw.arc([rect_x, rect_y, rect_x + 2*corner_r, rect_y + 2*corner_r], 
             180, 270, fill=PRIMARY_CYAN, width=8)
    # Top-right
    draw.arc([rect_x + rect_w - 2*corner_r, rect_y, rect_x + rect_w, rect_y + 2*corner_r], 
             270, 360, fill=PRIMARY_CYAN, width=8)
    # Bottom-right
    draw.arc([rect_x + rect_w - 2*corner_r, rect_y + rect_h - 2*corner_r, 
              rect_x + rect_w, rect_y + rect_h], 
             0, 90, fill=PRIMARY_CYAN, width=8)
    # Bottom-left
    draw.arc([rect_x, rect_y + rect_h - 2*corner_r, 
              rect_x + 2*corner_r, rect_y + rect_h], 
             90, 180, fill=PRIMARY_CYAN, width=8)
    
    # Main trending line path (zigzag upward trend)
    # Original: M185 320L235 270L285 320L350 255
    # Scale and draw the trending line
    line_points = [
        (int(185 * scale), int(320 * scale)),
        (int(235 * scale), int(270 * scale)),
        (int(285 * scale), int(320 * scale)),
        (int(350 * scale), int(255 * scale))
    ]
    
    # Draw the main trend line with PRIMARY_CYAN
    for i in range(len(line_points) - 1):
        draw.line([line_points[i], line_points[i + 1]], 
                  fill=PRIMARY_CYAN, width=int(24 * scale))
    
    # Add data points on the line
    point_radius = int(12 * scale)
    for i, (x, y) in enumerate(line_points):
        # Gradient from purple to cyan
        if i < 2:
            color = ACCENT_PURPLE
        else:
            color = PRIMARY_CYAN
        draw.ellipse([x - point_radius, y - point_radius,
                     x + point_radius, y + point_radius],
                    fill=color)
    
    # Arrow head (right and down strokes)
    # Original: M305 255H350V300
    arrow_points = [
        (int(305 * scale), int(255 * scale)),
        (int(350 * scale), int(255 * scale)),
        (int(350 * scale), int(300 * scale))
    ]
    
    # Draw arrow in ACCENT_PURPLE
    draw.line([arrow_points[0], arrow_points[1]], 
              fill=ACCENT_PURPLE, width=int(24 * scale))
    draw.line([arrow_points[1], arrow_points[2]], 
              fill=ACCENT_PURPLE, width=int(24 * scale))
    
    return img

def main():
    print("Creating Zikalyze logo from Gist design...")
    print("  Source: GitHub Gist SVG")
    print("  Design: Trending chart line with arrow")
    print("  Colors: Zikalyze brand (cyan & purple)")
    print("  Background: Transparent (no white/green)")
    
    logo = create_logo_from_gist_design()
    
    output_path = 'src/assets/zikalyze-logo.png'
    logo.save(output_path, 'PNG', optimize=True, compress_level=9)
    
    print(f"\n✓ Logo created: {output_path}")
    print(f"  Size: {logo.size}")
    print(f"  Mode: {logo.mode} (transparent background)")
    print(f"  Theme: Trending chart with upward arrow")
    print(f"  Colors: Brand cyan & purple")

if __name__ == '__main__':
    main()
