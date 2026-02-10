#!/usr/bin/env python3
"""
Create a 1024x500 feature graphic for Google Play Store
Using Zikalyze branding and app content
"""

from PIL import Image, ImageDraw, ImageFont
import os

# Paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(SCRIPT_DIR)
LOGO_PATH = os.path.join(REPO_ROOT, "public", "pwa-512x512.png")
OUTPUT_PATH = os.path.join(REPO_ROOT, "public", "feature-graphic.png")

# Feature graphic dimensions
WIDTH = 1024
HEIGHT = 500

# Zikalyze brand colors (from src/index.css)
PRIMARY_COLOR = "#70ffc1"  # Cyan/Green - hsl(154, 100%, 72%)
DARK_COLOR = "#0f172a"     # Dark foreground - hsl(222.2, 47.4%, 11.2%)
SECONDARY_DARK = "#1e293b" # Slightly lighter dark

def hex_to_rgb(hex_color):
    """Convert hex color to RGB tuple"""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def create_feature_graphic():
    """Create the feature graphic"""
    
    # Create base image with gradient background
    img = Image.new('RGB', (WIDTH, HEIGHT), hex_to_rgb(DARK_COLOR))
    draw = ImageDraw.Draw(img)
    
    # Create a subtle gradient effect by drawing rectangles with varying opacity
    # Draw darker to lighter gradient from left to right
    for i in range(WIDTH):
        # Calculate color interpolation
        progress = i / WIDTH
        # Interpolate between DARK_COLOR and SECONDARY_DARK
        r1, g1, b1 = hex_to_rgb(DARK_COLOR)
        r2, g2, b2 = hex_to_rgb(SECONDARY_DARK)
        
        r = int(r1 + (r2 - r1) * progress)
        g = int(g1 + (g2 - g1) * progress)
        b = int(b1 + (b2 - b1) * progress)
        
        draw.rectangle([(i, 0), (i+1, HEIGHT)], fill=(r, g, b))
    
    # Load and resize logo
    try:
        logo = Image.open(LOGO_PATH)
        # Resize logo to fit nicely (about 200px)
        logo_size = 200
        logo = logo.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
        
        # Position logo on the left side with some padding
        logo_x = 80
        logo_y = (HEIGHT - logo_size) // 2
        
        # Paste logo with alpha channel
        img.paste(logo, (logo_x, logo_y), logo if logo.mode == 'RGBA' else None)
        
    except Exception as e:
        print(f"Warning: Could not load logo: {e}")
    
    # Add text - we'll use default font and draw manually
    # Since we don't have custom fonts, we'll draw text using PIL's default
    
    # App name
    text_x = 320  # Start after the logo
    app_name = "Zikalyze AI"
    tagline = "AI-Powered Cryptocurrency Analysis"
    subtitle = "Real-Time Signals • Whale Tracking • Multi-Timeframe Analysis"
    
    try:
        # Try to use a better font if available
        font_large = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 72)
        font_medium = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 36)
        font_small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 24)
    except:
        # Fallback to default font with size
        try:
            font_large = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 60)
            font_medium = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 30)
            font_small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 20)
        except:
            font_large = ImageFont.load_default()
            font_medium = ImageFont.load_default()
            font_small = ImageFont.load_default()
    
    # Draw app name in primary color
    draw.text((text_x, 140), app_name, fill=hex_to_rgb(PRIMARY_COLOR), font=font_large)
    
    # Draw tagline
    draw.text((text_x, 230), tagline, fill=(255, 255, 255), font=font_medium)
    
    # Draw subtitle/features
    draw.text((text_x, 290), subtitle, fill=(180, 180, 180), font=font_small)
    
    # Add accent line using primary color
    accent_y = 360
    draw.rectangle([(text_x, accent_y), (WIDTH - 80, accent_y + 4)], 
                   fill=hex_to_rgb(PRIMARY_COLOR))
    
    # Save the image
    img.save(OUTPUT_PATH, 'PNG', quality=95)
    print(f"✅ Feature graphic created successfully!")
    print(f"📁 Location: {OUTPUT_PATH}")
    print(f"📐 Size: {WIDTH}x{HEIGHT} pixels")
    print(f"💾 File size: {os.path.getsize(OUTPUT_PATH) / 1024:.1f} KB")
    
    return OUTPUT_PATH

if __name__ == "__main__":
    create_feature_graphic()
