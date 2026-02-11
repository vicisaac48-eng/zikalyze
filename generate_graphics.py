#!/usr/bin/env python3
"""
Generate Zikalyze Play Store Graphics
Creates feature graphic and OG image with current brand colors
"""

from PIL import Image, ImageDraw, ImageFont
import os

# Brand Colors (from src/index.css)
PRIMARY_COLOR = (112, 255, 193)  # #70ffc1 - Cyan/Green
BACKGROUND_COLOR = (15, 23, 42)  # #0f172a - Dark Slate
ACCENT_COLOR = (197, 157, 255)   # #c59dff - Purple
TEXT_COLOR = (255, 255, 255)     # White
MUTED_COLOR = (148, 163, 184)    # #94a3b8 - Muted text

def create_feature_graphic():
    """
    Create Play Store Feature Graphic (1024x500)
    """
    print("Creating Feature Graphic (1024×500)...")
    
    # Create image
    width, height = 1024, 500
    img = Image.new('RGB', (width, height), BACKGROUND_COLOR)
    draw = ImageDraw.Draw(img)
    
    # Draw gradient background elements
    # Top left circle
    draw.ellipse([50, 50, 200, 200], fill=None, outline=PRIMARY_COLOR, width=2)
    
    # Bottom right circle
    draw.ellipse([850, 350, 980, 480], fill=None, outline=ACCENT_COLOR, width=2)
    
    # Center decorative elements
    draw.ellipse([700, 80, 800, 180], fill=None, outline=PRIMARY_COLOR, width=1)
    
    # Draw chart-like lines (representing crypto analysis)
    points = [
        (100, 350), (150, 300), (200, 320), (250, 250),
        (300, 270), (350, 200), (400, 230), (450, 150)
    ]
    draw.line(points, fill=PRIMARY_COLOR, width=3)
    
    # Add circles at data points
    for x, y in points[::2]:
        draw.ellipse([x-4, y-4, x+4, y+4], fill=PRIMARY_COLOR)
    
    # Draw grid pattern (subtle)
    for i in range(0, width, 100):
        draw.line([(i, 0), (i, height)], fill=(255, 255, 255, 10), width=1)
    for i in range(0, height, 100):
        draw.line([(0, i), (width, i)], fill=(255, 255, 255, 10), width=1)
    
    # Load logo if available
    logo_path = 'src/assets/zikalyze-logo.png'
    if os.path.exists(logo_path):
        try:
            logo = Image.open(logo_path)
            # Resize logo to fit nicely
            logo_size = 120
            logo = logo.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
            # Paste logo on left side
            img.paste(logo, (80, 190), logo if logo.mode == 'RGBA' else None)
        except Exception as e:
            print(f"Could not load logo: {e}")
    
    # Use default font (will try to load better one if available)
    try:
        title_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 64)
        subtitle_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 24)
        feature_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 14)
    except:
        # Fallback to default
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()
        feature_font = ImageFont.load_default()
    
    # Draw title
    title = "Zikalyze AI"
    title_x = 250
    draw.text((title_x, 180), title, fill=PRIMARY_COLOR, font=title_font)
    
    # Draw subtitle
    subtitle = "AI-Powered Cryptocurrency Analysis"
    draw.text((title_x, 260), subtitle, fill=MUTED_COLOR, font=subtitle_font)
    
    # Draw features
    features = "Real-Time Signals • Whale Tracking • Multi-Timeframe Analysis"
    draw.text((title_x, 320), features, fill=TEXT_COLOR, font=feature_font)
    
    # Draw accent line at bottom
    draw.rectangle([0, 490, width, 500], fill=PRIMARY_COLOR)
    
    # Save
    output_path = 'public/feature-graphic.png'
    img.save(output_path, 'PNG', optimize=True)
    print(f"✓ Saved Feature Graphic: {output_path}")
    return img

def create_og_image():
    """
    Create OG/Social Media Image (1200x630)
    """
    print("Creating OG Image (1200×630)...")
    
    # Create image
    width, height = 1200, 630
    img = Image.new('RGBA', (width, height), BACKGROUND_COLOR)
    draw = ImageDraw.Draw(img)
    
    # Draw background pattern
    # Diagonal lines
    for i in range(-height, width, 50):
        draw.line([(i, 0), (i+height, height)], fill=(255, 255, 255, 5), width=1)
    
    # Circles
    draw.ellipse([100, 100, 250, 250], fill=None, outline=PRIMARY_COLOR, width=3)
    draw.ellipse([950, 400, 1100, 550], fill=None, outline=ACCENT_COLOR, width=2)
    draw.ellipse([800, 80, 880, 160], fill=None, outline=PRIMARY_COLOR, width=1)
    
    # Brain/AI icon representation (simplified)
    brain_x, brain_y = 150, 300
    draw.ellipse([brain_x, brain_y, brain_x+100, brain_y+100], 
                 fill=None, outline=PRIMARY_COLOR, width=3)
    # Neural network nodes
    nodes = [(brain_x+20, brain_y+30), (brain_x+50, brain_y+30), (brain_x+80, brain_y+30),
             (brain_x+35, brain_y+70), (brain_x+65, brain_y+70)]
    for x, y in nodes:
        draw.ellipse([x-5, y-5, x+5, y+5], fill=PRIMARY_COLOR)
    # Connections
    for i in range(len(nodes)-2):
        draw.line([nodes[i], nodes[i+2]], fill=PRIMARY_COLOR, width=2)
    
    # Chart representation
    chart_x, chart_y = 850, 200
    chart_width, chart_height = 280, 180
    draw.rectangle([chart_x, chart_y, chart_x+chart_width, chart_y+chart_height],
                   fill=(26, 31, 46), outline=PRIMARY_COLOR, width=1)
    # Chart line
    chart_points = [
        (chart_x+20, chart_y+140), (chart_x+60, chart_y+110),
        (chart_x+100, chart_y+130), (chart_x+140, chart_y+70),
        (chart_x+180, chart_y+90), (chart_x+220, chart_y+40),
        (chart_x+260, chart_y+60)
    ]
    draw.line(chart_points, fill=PRIMARY_COLOR, width=3)
    for x, y in chart_points[::2]:
        draw.ellipse([x-3, y-3, x+3, y+3], fill=PRIMARY_COLOR)
    
    # Load logo if available
    logo_path = 'src/assets/zikalyze-logo.png'
    if os.path.exists(logo_path):
        try:
            logo = Image.open(logo_path)
            logo_size = 150
            logo = logo.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
            # Paste logo
            img.paste(logo, (100, 100), logo if logo.mode == 'RGBA' else None)
        except Exception as e:
            print(f"Could not load logo: {e}")
    
    # Fonts
    try:
        title_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 72)
        subtitle_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 28)
        stats_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 16)
    except:
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()
        stats_font = ImageFont.load_default()
    
    # Title
    title = "Zikalyze"
    draw.text((350, 260), title, fill=TEXT_COLOR, font=title_font)
    
    # Subtitle
    subtitle = "AI-Powered Crypto Trading Analysis"
    draw.text((350, 360), subtitle, fill=MUTED_COLOR, font=subtitle_font)
    
    # Features/Stats
    features = [
        ("🧠 Smart Money", PRIMARY_COLOR),
        ("📊 ICT Analysis", ACCENT_COLOR),
        ("🔔 Real-time", PRIMARY_COLOR)
    ]
    
    feature_y = 430
    feature_x = 350
    for i, (feat, color) in enumerate(features):
        x_pos = feature_x + (i * 150)
        # Background pill
        text_width = 120
        draw.rounded_rectangle([x_pos, feature_y, x_pos+text_width, feature_y+32],
                               radius=16, fill=None, outline=color, width=2)
        draw.text((x_pos+10, feature_y+8), feat, fill=color, font=stats_font)
    
    # Accuracy badge
    draw.text((350, 500), "80%", fill=TEXT_COLOR, font=title_font)
    draw.text((470, 520), "Accuracy Rate", fill=MUTED_COLOR, font=subtitle_font)
    
    # Bottom gradient line
    draw.rectangle([0, 620, width, 630], fill=PRIMARY_COLOR)
    
    # Corner accents
    points_tl = [(0, 0), (150, 0), (0, 150)]
    draw.polygon(points_tl, fill=(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2], 25))
    
    points_br = [(width, height), (width, height-150), (width-150, height)]
    draw.polygon(points_br, fill=(ACCENT_COLOR[0], ACCENT_COLOR[1], ACCENT_COLOR[2], 25))
    
    # Save
    output_path = 'public/og-image.png'
    img.save(output_path, 'PNG', optimize=True)
    print(f"✓ Saved OG Image: {output_path}")
    return img

def main():
    print("="*60)
    print("ZIKALYZE PLAY STORE GRAPHICS GENERATOR")
    print("="*60)
    print(f"\nBrand Colors:")
    print(f"  Primary: #{PRIMARY_COLOR[0]:02x}{PRIMARY_COLOR[1]:02x}{PRIMARY_COLOR[2]:02x}")
    print(f"  Background: #{BACKGROUND_COLOR[0]:02x}{BACKGROUND_COLOR[1]:02x}{BACKGROUND_COLOR[2]:02x}")
    print(f"  Accent: #{ACCENT_COLOR[0]:02x}{ACCENT_COLOR[1]:02x}{ACCENT_COLOR[2]:02x}")
    print()
    
    # Generate graphics
    feature = create_feature_graphic()
    og = create_og_image()
    
    print("\n" + "="*60)
    print("GRAPHICS GENERATION COMPLETE!")
    print("="*60)
    print("\nFiles created:")
    print("  ✓ public/feature-graphic.png (1024×500)")
    print("  ✓ public/og-image.png (1200×630)")
    print("\nReady for Play Store upload!")

if __name__ == '__main__':
    main()
