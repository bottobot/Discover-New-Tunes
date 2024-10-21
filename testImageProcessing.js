require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { processImage } = require('./utils/imageProcessing');

async function runTest() {
  try {
    const imagePath = path.join(__dirname, 'basscoastlineup.png');
    console.log('Image path:', imagePath);
    
    if (!fs.existsSync(imagePath)) {
      throw new Error('Image file not found');
    }
    
    const imageBuffer = fs.readFileSync(imagePath);
    console.log('Image file read successfully');
    
    console.log('Starting image processing test...');
    const result = await processImage(imageBuffer);
    
    console.log('Test completed successfully.');
    console.log('Extracted artists:', result.artists);
    console.log('Full text:', result.fullText);
  } catch (error) {
    console.error('Test failed. Error details:');
    console.error(error.message);
    console.error(error.stack);
  }
}

console.log('Environment variables:');
console.log('GOOGLE_CSE_ID:', process.env.GOOGLE_CSE_ID);
console.log('SPOTIFY_CLIENT_ID:', process.env.SPOTIFY_CLIENT_ID ? 'Set' : 'Not set');
console.log('SPOTIFY_CLIENT_SECRET:', process.env.SPOTIFY_CLIENT_SECRET ? 'Set' : 'Not set');
console.log('GOOGLE_API_KEY:', process.env.GOOGLE_API_KEY ? 'Set' : 'Not set');

const timeout = setTimeout(() => {
  console.error('Test timed out after 5 minutes');
  process.exit(1);
}, 5 * 60 * 1000);

runTest().then(() => {
  clearTimeout(timeout);
  process.exit(0);
}).catch((error) => {
  console.error('Unhandled error:', error);
  clearTimeout(timeout);
  process.exit(1);
});
