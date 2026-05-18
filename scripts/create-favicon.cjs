// Create a minimal 32x32 ICO file
const fs = require('fs');

// ICO header
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);   // Reserved
header.writeUInt16LE(1, 2);   // Image type (1 = ICO)
header.writeUInt16LE(1, 4);   // Number of images

// BMP info header
const bmpHeader = Buffer.alloc(40);
bmpHeader.writeUInt32LE(40, 0);    // Header size
bmpHeader.writeInt32LE(32, 4);     // Width
bmpHeader.writeInt32LE(32, 8);     // Height
bmpHeader.writeUInt16LE(1, 12);    // Planes
bmpHeader.writeUInt16LE(32, 14);   // Bits per pixel
bmpHeader.writeUInt32LE(0, 16);    // Compression
bmpHeader.writeUInt32LE(0, 20);    // Size of bitmap
bmpHeader.writeInt32LE(0, 24);     // XPelsPerMeter
bmpHeader.writeInt32LE(0, 28);     // YPelsPerMeter
bmpHeader.writeUInt32LE(0, 32);    // Used colors
bmpHeader.writeUInt32LE(0, 36);    // Important colors

// Create pixel data (32x32, RGBA) - simple checkerboard pattern
const pixelData = Buffer.alloc(32 * 32 * 4);
for (let i = 0; i < 32 * 32; i++) {
  const x = i % 32;
  const y = Math.floor(i / 32);
  if ((x + y) % 8 < 4) {
    pixelData.writeUInt32BE(0xFF0000FF, i * 4); // Red
  } else {
    pixelData.writeUInt32BE(0xFFFFFFFF, i * 4); // White
  }
}

// Image directory entry
const dirEntry = Buffer.alloc(16);
dirEntry.writeUInt8(32, 0);         // Width
dirEntry.writeUInt8(32, 1);         // Height
dirEntry.writeUInt8(0, 2);          // Color count
dirEntry.writeUInt8(0, 3);          // Reserved
dirEntry.writeUInt16LE(1, 4);       // Planes
dirEntry.writeUInt16LE(32, 6);      // Bits per pixel
const bmpSize = bmpHeader.length + pixelData.length;
dirEntry.writeUInt32LE(bmpSize, 8); // Size of image data
dirEntry.writeUInt32LE(22, 12);     // Offset to image data

// Combine all parts
const ico = Buffer.concat([header, dirEntry, bmpHeader, pixelData]);

fs.writeFileSync('public/favicon.ico', ico);
console.log('favicon.ico created successfully');
