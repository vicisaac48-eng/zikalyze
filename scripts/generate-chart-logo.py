#!/usr/bin/env python3
"""
Generate Zikalyze logo with CHART/ANALYTICS theme - matching original style.
Features prominent upward trending chart line and data visualization elements.
"""

from PIL import Image, ImageDraw
import math
import shutil
import os

# Zikalyze brand colors (from CSS)
PRIMARY_CYAN = (112, 255, 193)  # #70ffc1 - HSL(168, 76%, 73%)
ACCENT_PURPLE = (197, 163, 255)  # #c5a3ff - HSL(267, 84%, 81%)
DARK_BG = (10, 15, 26)  # #0a0f1a

# Size for the main logo
SIZE = 512
CENTER = SIZE // 2

def create_chart_analytics_logo():
    """
    Create a logo with prominent CHART/TRENDING elements.
    Main focus: Upward trending chart line showing growth/analytics.
    """
    # Create image with transparency
    img = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # DESIGN: Upward trending chart as the main element
    # This represents crypto analytics, growth, and data trends
    
    # Circle background - represents completeness/data sphere
    circle_radius = 190
    circle_thickness = 6
    draw.ellipse(
        [CENTER - circle_radius, CENTER - circle_radius,
         CENTER + circle_radius, CENTER + circle_radius],
        outline=PRIMARY_CYAN,
        width=circle_thickness
    )
    
    # MAIN FEATURE: Upward trending chart line (like 📈)
    # Create a smooth upward trend with data points
    chart_points = []
    num_points = 7
    start_x = CENTER - 140
    end_x = CENTER + 140
    start_y = CENTER + 80  # Bottom
    end_y = CENTER - 80    # Top (upward trend)
    
    for i in range(num_points):
        # X position spreads across width
        x = start_x + (i * (end_x - start_x) / (num_points - 1))
        
        # Y position trends upward with some variation for realistic chart
        base_progress = i / (num_points - 1)
        y = start_y + (end_y - start_y) * base_progress
        
        # Add slight variation to make it look like real data
        if i == 1:
            y += 15  # Small dip
        elif i == 3:
            y += 10  # Another small variation
        elif i == 5:
            y -= 10  # Peak variation
        
        chart_points.append((int(x), int(y)))
    
    # Draw the trend line connecting all points
    for i in range(len(chart_points) - 1):
        draw.line(
            [chart_points[i], chart_points[i + 1]],
            fill=PRIMARY_CYAN,
            width=10
        )
    
    # Draw data points (circles) at each point
    point_radius = 8
    for i, (x, y) in enumerate(chart_points):
        # Gradient effect: earlier points more purple, later more cyan
        if i < 3:
            color = ACCENT_PURPLE
        else:
            color = PRIMARY_CYAN
        
        draw.ellipse(
            [x - point_radius, y - point_radius,
             x + point_radius, y + point_radius],
            fill=color
        )
    
    # Add vertical bars at the bottom (like a bar chart base)
    bar_width = 14
    bar_base_y = CENTER + 120
    bar_positions = [CENTER - 100, CENTER - 50, CENTER, CENTER + 50, CENTER + 100]
    bar_heights = [30, 50, 45, 70, 80]  # Increasing trend
    
    for i, (x, height) in enumerate(zip(bar_positions, bar_heights)):
        # Color varies from purple to cyan
        if i < 2:
            color = ACCENT_PURPLE
        else:
            color = PRIMARY_CYAN
        
        draw.rectangle(
            [x - bar_width//2, bar_base_y - height,
             x + bar_width//2, bar_base_y],
            fill=color
        )
    
    # Add "Z" letterform integrated with the chart
    # Stylized to look like part of the data/trend
    z_top_y = CENTER - 140
    z_thickness = 12
    z_width = 70
    z_height = 80
    
    # Top bar of Z
    draw.rectangle(
        [CENTER - z_width//2, z_top_y,
         CENTER + z_width//2, z_top_y + z_thickness],
        fill=PRIMARY_CYAN
    )
    
    # Diagonal of Z (like a trending line)
    diagonal_points = [
        (CENTER + z_width//2 - z_thickness//2, z_top_y),
        (CENTER + z_width//2 + z_thickness//2, z_top_y),
        (CENTER - z_width//2 + z_thickness//2, z_top_y + z_height),
        (CENTER - z_width//2 - z_thickness//2, z_top_y + z_height)
    ]
    draw.polygon(diagonal_points, fill=PRIMARY_CYAN)
    
    # Bottom bar of Z
    draw.rectangle(
        [CENTER - z_width//2, z_top_y + z_height - z_thickness,
         CENTER + z_width//2, z_top_y + z_height],
        fill=PRIMARY_CYAN
    )
    
    # Add grid dots for data visualization feel
    dot_radius = 3
    grid_positions = [
        (CENTER - 160, CENTER - 120),
        (CENTER + 160, CENTER - 120),
        (CENTER - 160, CENTER + 120),
        (CENTER + 160, CENTER + 120),
    ]
    
    for x, y in grid_positions:
        draw.ellipse(
            [x - dot_radius, y - dot_radius,
             x + dot_radius, y + dot_radius],
            fill=ACCENT_PURPLE
        )
    
    return img

def main():
    print("Generating Zikalyze logo with CHART/ANALYTICS theme...")
    print("Main features: Upward trending chart line 📈 + data visualization")
    
    # Backup current logo before generating new one
    output_path = 'src/assets/zikalyze-logo.png'
    if os.path.exists(output_path):
        backup_path = 'src/assets/zikalyze-logo-backup.png'
        shutil.copy(output_path, backup_path)
        print(f"✓ Backup of current logo saved to {backup_path}")
    
    # Generate the logo
    logo = create_chart_analytics_logo()
    
    # Save at high quality
    logo.save(output_path, 'PNG', optimize=True, compress_level=9)
    
    print(f"✓ Chart/analytics logo saved to {output_path}")
    print(f"  Size: {logo.size}")
    print(f"  Mode: {logo.mode}")
    print(f"  Theme: Upward trending chart 📈 with data points")
    print(f"  Style: Analytics/data visualization")

if __name__ == '__main__':
    main()
