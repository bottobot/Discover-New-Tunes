const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Create a canvas
const width = 800;
const height = 600;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// Set background
ctx.fillStyle = '#ffffff';
ctx.fillRect(0, 0, width, height);

// Set text properties
ctx.font = '30px Arial';
ctx.fillStyle = '#000000';

// Add some text
ctx.fillText('Test Lineup', 50, 50);
ctx.fillText('Artist 1', 50, 100);
ctx.fillText('Artist 2', 50, 150);
ctx.fillText('Artist 3', 50, 200);

// Save the image
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync(path.join(__dirname, 'public', 'test-lineup.png'), buffer);

console.log('Test image created: public/test-lineup.png');
