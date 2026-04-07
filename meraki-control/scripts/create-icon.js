const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Create 180x180 canvas (standard apple-touch-icon size)
const size = 180;
const canvas = createCanvas(size, size);
const ctx = canvas.getContext('2d');

// Background - Keswick Green
ctx.fillStyle = '#3D4F3D';
ctx.fillRect(0, 0, size, size);

// Meraki text - centered
ctx.fillStyle = '#FFFFFF';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';

// Main title "Meraki"
ctx.font = 'bold 36px Georgia, serif';
ctx.fillText('Meraki', size/2, size/2 - 10);

// Subtitle "Control"
ctx.font = '14px Georgia, serif';
ctx.fillStyle = 'rgba(255,255,255,0.6)';
ctx.fillText('Control', size/2, size/2 + 18);

// Save
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync(path.join(__dirname, '../public/apple-touch-icon.png'), buffer);
console.log('✅ Created centered icon (180x180)');
