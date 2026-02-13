#!/usr/bin/env node

/**
 * Icon Generator for Zikalyze
 * Generates Play Store icons with TrendingUp icon in colored box
 * Uses HTML Canvas to generate PNG icons at various sizes
 */

const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Icon sizes for Android/Play Store
const ICON_SIZES = {
  playStore: 512,      // Play Store listing
  xxxhdpi: 192,        // Extra extra extra high DPI
  xxhdpi: 144,         // Extra extra high DPI
  xhdpi: 96,           // Extra high DPI
  hdpi: 72,            // High DPI
  mdpi: 48,            // Medium DPI
  favicon: 192         // Web favicon
};

// Brand colors (cyan primary from Tailwind config)
const COLORS = {
  background: '#168076', // bg-primary (cyan-ish from theme)
  foreground: '#ffffff', // white for icon
  rounded: true,
  roundRadius: 0.15      // 15% of size for rounded corners
};

/**
 * Draw TrendingUp icon path
 */
function drawTrendingUpIcon(ctx, x, y, size, color) {
  const strokeWidth = size * 0.08; // 8% of size
  
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Calculate coordinates (based on lucide-react TrendingUp path)
  const points = [
    [x + size * 0.12, y + size * 0.72],  // Start bottom left
    [x + size * 0.36, y + size * 0.48],  // Middle point
    [x + size * 0.52, y + size * 0.64],  // Dip point
    [x + size * 0.88, y + size * 0.28]   // End top right
  ];
  
  // Draw the trending line
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i][0], points[i][1]);
  }
  ctx.stroke();
  
  // Draw arrow head at end
  const arrowSize = size * 0.15;
  const lastPoint = points[points.length - 1];
  
  ctx.beginPath();
  ctx.moveTo(lastPoint[0], lastPoint[1]);
  ctx.lineTo(lastPoint[0] - arrowSize * 0.7, lastPoint[1]);
  ctx.lineTo(lastPoint[0], lastPoint[1] - arrowSize * 0.7);
  ctx.closePath();
  ctx.fill();
}

/**
 * Generate a single icon
 */
function generateIcon(size, outputPath) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Draw background (rounded rectangle)
  ctx.fillStyle = COLORS.background;
  
  if (COLORS.rounded) {
    const radius = size * COLORS.roundRadius;
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(size - radius, 0);
    ctx.quadraticCurveTo(size, 0, size, radius);
    ctx.lineTo(size, size - radius);
    ctx.quadraticCurveTo(size, size, size - radius, size);
    ctx.lineTo(radius, size);
    ctx.quadraticCurveTo(0, size, 0, size - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.fillRect(0, 0, size, size);
  }
  
  // Draw TrendingUp icon (centered, about 50% of canvas size)
  const iconSize = size * 0.5;
  const iconX = (size - iconSize) / 2;
  const iconY = (size - iconSize) / 2;
  
  drawTrendingUpIcon(ctx, iconX, iconY, iconSize, COLORS.foreground);
  
  // Save to file
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  console.log(`✓ Generated: ${outputPath} (${size}×${size})`);
}

/**
 * Main function
 */
function main() {
  const rootDir = path.join(__dirname, '..');
  
  // Create output directories
  const outputs = [
    { dir: path.join(rootDir, 'android/play-store-assets'), name: 'icon-512x512.png', size: ICON_SIZES.playStore },
    { dir: path.join(rootDir, 'android/app/src/main/res/mipmap-xxxhdpi'), name: 'ic_launcher.png', size: ICON_SIZES.xxxhdpi },
    { dir: path.join(rootDir, 'android/app/src/main/res/mipmap-xxxhdpi'), name: 'ic_launcher_round.png', size: ICON_SIZES.xxxhdpi },
    { dir: path.join(rootDir, 'android/app/src/main/res/mipmap-xxxhdpi'), name: 'ic_launcher_foreground.png', size: ICON_SIZES.xxxhdpi },
    { dir: path.join(rootDir, 'android/app/src/main/res/mipmap-xxhdpi'), name: 'ic_launcher.png', size: ICON_SIZES.xxhdpi },
    { dir: path.join(rootDir, 'android/app/src/main/res/mipmap-xxhdpi'), name: 'ic_launcher_round.png', size: ICON_SIZES.xxhdpi },
    { dir: path.join(rootDir, 'android/app/src/main/res/mipmap-xxhdpi'), name: 'ic_launcher_foreground.png', size: ICON_SIZES.xxhdpi },
    { dir: path.join(rootDir, 'android/app/src/main/res/mipmap-xhdpi'), name: 'ic_launcher.png', size: ICON_SIZES.xhdpi },
    { dir: path.join(rootDir, 'android/app/src/main/res/mipmap-xhdpi'), name: 'ic_launcher_round.png', size: ICON_SIZES.xhdpi },
    { dir: path.join(rootDir, 'android/app/src/main/res/mipmap-xhdpi'), name: 'ic_launcher_foreground.png', size: ICON_SIZES.xhdpi },
    { dir: path.join(rootDir, 'android/app/src/main/res/mipmap-hdpi'), name: 'ic_launcher.png', size: ICON_SIZES.hdpi },
    { dir: path.join(rootDir, 'android/app/src/main/res/mipmap-hdpi'), name: 'ic_launcher_round.png', size: ICON_SIZES.hdpi },
    { dir: path.join(rootDir, 'android/app/src/main/res/mipmap-hdpi'), name: 'ic_launcher_foreground.png', size: ICON_SIZES.hdpi },
    { dir: path.join(rootDir, 'android/app/src/main/res/mipmap-mdpi'), name: 'ic_launcher.png', size: ICON_SIZES.mdpi },
    { dir: path.join(rootDir, 'android/app/src/main/res/mipmap-mdpi'), name: 'ic_launcher_round.png', size: ICON_SIZES.mdpi },
    { dir: path.join(rootDir, 'android/app/src/main/res/mipmap-mdpi'), name: 'ic_launcher_foreground.png', size: ICON_SIZES.mdpi },
    { dir: path.join(rootDir, 'public'), name: 'favicon.png', size: ICON_SIZES.favicon }
  ];
  
  console.log('\n🎨 Generating Zikalyze icons with TrendingUp design...\n');
  
  outputs.forEach(({ dir, name, size }) => {
    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const outputPath = path.join(dir, name);
    generateIcon(size, outputPath);
  });
  
  console.log('\n✅ All icons generated successfully!\n');
  console.log('📦 Ready for Play Store upload:\n');
  console.log(`   → ${path.join(rootDir, 'android/play-store-assets/icon-512x512.png')}`);
  console.log('\n📱 Android launcher icons updated in all densities\n');
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { generateIcon };
