#!/usr/bin/env python3
"""
Generate a professional logo for Zikalyze with the brand colors.
Creates a modern, clean crypto/analytics themed logo - NO GLOW, clean and professional.
"""

from PIL import Image, ImageDraw, ImageFont
import math
import shutil
import os

# Zikalyze brand colors (from CSS)
PRIMARY_CYAN = (112, 255, 193)  # #70ffc1 - HSL(168, 76%, 73%)
ACCENT_PURPLE = (197, 163, 255)  # #c5a3ff - HSL(267, 84%, 81%)
DARK_BG = (10, 15, 26)  # #0a0f1a - HSL(222, 47%, 6%)

# Size for the main logo
SIZE = 512
CENTER = SIZE // 2

def create_professional_logo():
    """
    Create a clean, professional cryptocurrency/analytics logo.
    NO glow effects - just clean, sharp geometric shapes.
    """
    # Create image with transparency
    img = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Design: Modern hexagonal badge with "Z" and chart elements
    # Clean, flat design - no gradients, no glow, just solid colors
    
    # Outer hexagon - solid cyan outline
    hex_radius = 180
    hex_points = []
    for i in range(6):
        angle = math.pi / 3 * i - math.pi / 6  # Flat top
        x = CENTER + hex_radius * math.cos(angle)
        y = CENTER + hex_radius * math.sin(angle)
        hex_points.append((x, y))
    
    # Draw hexagon with clean solid outline
    draw.polygon(hex_points, outline=PRIMARY_CYAN, width=8)
    
    # Inner hexagon - purple accent
    inner_radius = 140
    inner_hex_points = []
    for i in range(6):
        angle = math.pi / 3 * i - math.pi / 6
        x = CENTER + inner_radius * math.cos(angle)
        y = CENTER + inner_radius * math.sin(angle)
        inner_hex_points.append((x, y))
    
    # Draw inner hexagon
    draw.polygon(inner_hex_points, outline=ACCENT_PURPLE, width=4)
    
    # Stylized "Z" letter - clean and geometric
    z_scale = 1.2
    z_thickness = 16
    z_width = int(80 * z_scale)
    z_height = int(100 * z_scale)
    z_top_y = CENTER - z_height // 2
    
    # Top horizontal bar of Z
    draw.rectangle(
        [CENTER - z_width//2, z_top_y,
         CENTER + z_width//2, z_top_y + z_thickness],
        fill=PRIMARY_CYAN
    )
    
    # Diagonal of Z - clean solid diagonal
    diagonal_points = [
        (CENTER + z_width//2 - z_thickness//2, z_top_y),
        (CENTER + z_width//2 + z_thickness//2, z_top_y),
        (CENTER - z_width//2 + z_thickness//2, z_top_y + z_height),
        (CENTER - z_width//2 - z_thickness//2, z_top_y + z_height)
    ]
    draw.polygon(diagonal_points, fill=PRIMARY_CYAN)
    
    # Bottom horizontal bar of Z
    draw.rectangle(
        [CENTER - z_width//2, z_top_y + z_height - z_thickness,
         CENTER + z_width//2, z_top_y + z_height],
        fill=PRIMARY_CYAN
    )
    
    # Add small accent dots at hexagon vertices - clean geometric detail
    dot_radius = 6
    for point in hex_points[::2]:  # Every other vertex
        draw.ellipse(
            [point[0] - dot_radius, point[1] - dot_radius,
             point[0] + dot_radius, point[1] + dot_radius],
            fill=ACCENT_PURPLE
        )
    
    # Add three small chart bars at bottom - representing analytics
    bar_width = 10
    bar_spacing = 24
    bar_base_y = CENTER + 100
    bar_heights = [25, 40, 30]  # Small, clean bars
    
    for i, height in enumerate(bar_heights):
        x = CENTER - bar_spacing + (i * bar_spacing)
        draw.rectangle(
            [x - bar_width//2, bar_base_y - height,
             x + bar_width//2, bar_base_y],
            fill=ACCENT_PURPLE
        )
    
    return img

def main():
    print("Generating clean, professional Zikalyze logo (NO glow)...")
    
    # Backup old logo before generating new one
    output_path = 'src/assets/zikalyze-logo.png'
    if os.path.exists(output_path):
        backup_path = 'src/assets/zikalyze-logo-old.png'
        shutil.copy(output_path, backup_path)
        print(f"✓ Backup of old logo saved to {backup_path}")
    
    # Generate the logo
    logo = create_professional_logo()
    
    # Save at high quality
    logo.save(output_path, 'PNG', optimize=True, compress_level=9)
    
    print(f"✓ Professional logo saved to {output_path}")
    print(f"  Size: {logo.size}")
    print(f"  Mode: {logo.mode}")
    print(f"  Design: Clean, flat, professional - NO glow effects")

if __name__ == '__main__':
    main()
