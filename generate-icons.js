const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Create assets directory if it doesn't exist
if (!fs.existsSync('assets')) {
  fs.mkdirSync('assets');
}

// Create a simple colored square as base
const createBaseImage = async (size, color) => {
  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 42, g: 157, b: 143, alpha: 1 } // Toiletty green color
    }
  })
  .png()
  .toBuffer();
};

// Generate icons
async function generateIcons() {
  try {
    // Generate icon.png (1024x1024)
    const iconBuffer = await createBaseImage(1024);
    await sharp(iconBuffer)
      .resize(1024, 1024)
      .toFile('assets/icon.png');

    // Generate adaptive-icon.png (1024x1024)
    await sharp(iconBuffer)
      .resize(1024, 1024)
      .toFile('assets/adaptive-icon.png');

    // Generate splash.png (1242x2436)
    const splashBuffer = await createBaseImage(1242);
    await sharp(splashBuffer)
      .resize(1242, 2436)
      .toFile('assets/splash.png');

    // Generate favicon.png (48x48)
    await sharp(iconBuffer)
      .resize(48, 48)
      .toFile('assets/favicon.png');

    console.log('Icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons(); 