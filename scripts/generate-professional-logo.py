#!/usr/bin/env python3
"""
Generate a professional logo for Zikalyze with the brand colors.
Creates a modern, clean crypto/analytics themed logo.
"""

from PIL import Image, ImageDraw, ImageFont
import math

# Zikalyze brand colors (from CSS)
PRIMARY_CYAN = (112, 255, 193)  # #70ffc1 - HSL(168, 76%, 73%)
ACCENT_PURPLE = (197, 163, 255)  # #c5a3ff - HSL(267, 84%, 81%)
DARK_BG = (10, 15, 26)  # #0a0f1a - HSL(222, 47%, 6%)
DARKER_BG = (8, 12, 20)  # Slightly darker variant

# Size for the main logo
SIZE = 512
CENTER = SIZE // 2

def create_professional_logo():
    """
    Create a professional cryptocurrency/analytics themed logo.
    Combines geometric shapes representing data, growth, and technology.
    """
    # Create image with transparency
    img = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Design concept: Abstract "Z" combined with chart/analytics elements
    # Using clean geometric shapes with gradient-like effects
    
    # Create a modern, abstract design
    # Central hexagon (representing blockchain/structure)
    hex_radius = 140
    hex_points = []
    for i in range(6):
        angle = math.pi / 3 * i - math.pi / 6  # Rotate to have flat top
        x = CENTER + hex_radius * math.cos(angle)
        y = CENTER + hex_radius * math.sin(angle)
        hex_points.append((x, y))
    
    # Draw hexagon outline with gradient effect (multiple thin lines)
    for thickness in range(8, 0, -1):
        alpha = int(255 * (thickness / 8))
        color = (*PRIMARY_CYAN, alpha)
        draw.polygon(hex_points, outline=color, width=thickness)
    
    # Inner accent hexagon
    inner_radius = 100
    inner_hex_points = []
    for i in range(6):
        angle = math.pi / 3 * i - math.pi / 6
        x = CENTER + inner_radius * math.cos(angle)
        y = CENTER + inner_radius * math.sin(angle)
        inner_hex_points.append((x, y))
    
    # Draw inner hexagon with purple accent
    for thickness in range(6, 0, -1):
        alpha = int(200 * (thickness / 6))
        color = (*ACCENT_PURPLE, alpha)
        draw.polygon(inner_hex_points, outline=color, width=thickness)
    
    # Add chart/growth bars (representing analytics)
    bar_width = 12
    bar_spacing = 20
    num_bars = 5
    start_x = CENTER - (num_bars * bar_spacing) // 2
    
    bar_heights = [30, 50, 40, 70, 60]  # Ascending trend
    for i, height in enumerate(bar_heights):
        x = start_x + i * bar_spacing
        y = CENTER + 10  # Offset down slightly
        
        # Gradient bars
        for h in range(height):
            alpha = int(255 * (h / height))
            color_ratio = h / height
            # Blend from purple to cyan
            r = int(ACCENT_PURPLE[0] * (1 - color_ratio) + PRIMARY_CYAN[0] * color_ratio)
            g = int(ACCENT_PURPLE[1] * (1 - color_ratio) + PRIMARY_CYAN[1] * color_ratio)
            b = int(ACCENT_PURPLE[2] * (1 - color_ratio) + PRIMARY_CYAN[2] * color_ratio)
            
            draw.rectangle(
                [x - bar_width//2, y - h, x + bar_width//2, y],
                fill=(r, g, b, alpha)
            )
    
    # Add circuit/network lines (representing blockchain/connectivity)
    # Top-left to center node
    node_size = 8
    nodes = [
        (CENTER - 80, CENTER - 80),
        (CENTER + 80, CENTER - 80),
        (CENTER + 80, CENTER + 80),
        (CENTER - 80, CENTER + 80),
    ]
    
    # Draw connecting lines
    for i, node in enumerate(nodes):
        # Line to center
        draw.line([node, (CENTER, CENTER)], fill=(*PRIMARY_CYAN, 100), width=2)
        # Draw node
        draw.ellipse(
            [node[0] - node_size, node[1] - node_size,
             node[0] + node_size, node[1] + node_size],
            fill=(*PRIMARY_CYAN, 200)
        )
    
    # Central node (larger)
    central_node_size = 12
    draw.ellipse(
        [CENTER - central_node_size, CENTER - central_node_size,
         CENTER + central_node_size, CENTER + central_node_size],
        fill=(*ACCENT_PURPLE, 255)
    )
    
    # Add stylized "Z" letter in the top portion
    # Using geometric shapes to form the letter
    z_top_y = CENTER - 120
    z_height = 60
    z_width = 60
    z_thickness = 10
    
    # Top horizontal bar of Z
    draw.rectangle(
        [CENTER - z_width//2, z_top_y,
         CENTER + z_width//2, z_top_y + z_thickness],
        fill=(*PRIMARY_CYAN, 255)
    )
    
    # Diagonal of Z
    # Create diagonal line effect
    for i in range(0, z_height, 2):
        x1 = CENTER + z_width//2 - int(i * z_width / z_height)
        x2 = x1 - z_thickness
        y = z_top_y + i
        draw.rectangle([x2, y, x1, y + 2], fill=(*PRIMARY_CYAN, 255))
    
    # Bottom horizontal bar of Z
    draw.rectangle(
        [CENTER - z_width//2, z_top_y + z_height - z_thickness,
         CENTER + z_width//2, z_top_y + z_height],
        fill=(*PRIMARY_CYAN, 255)
    )
    
    # Add glow effect around the entire design
    # Create a subtle outer glow
    glow_img = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_img)
    
    # Draw soft glow circles
    for radius in range(200, 100, -10):
        alpha = int(20 * (200 - radius) / 100)
        glow_draw.ellipse(
            [CENTER - radius, CENTER - radius,
             CENTER + radius, CENTER + radius],
            fill=(*PRIMARY_CYAN, alpha)
        )
    
    # Composite glow behind main image
    final_img = Image.alpha_composite(glow_img, img)
    
    return final_img

def main():
    print("Generating professional Zikalyze logo...")
    
    # Generate the logo
    logo = create_professional_logo()
    
    # Save at high quality
    output_path = 'src/assets/zikalyze-logo.png'
    logo.save(output_path, 'PNG', optimize=True, compress_level=9)
    
    print(f"✓ Professional logo saved to {output_path}")
    print(f"  Size: {logo.size}")
    print(f"  Mode: {logo.mode}")
    
    # Also save a backup of the old logo
    import shutil
    import os
    if os.path.exists(output_path):
        backup_path = 'src/assets/zikalyze-logo-old.png'
        shutil.copy(output_path, backup_path)
        print(f"✓ Backup of old logo saved to {backup_path}")

if __name__ == '__main__':
    main()
