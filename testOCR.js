const fs = require('fs');
const path = require('path');
const { processImage } = require('./utils/imageProcessing');

// Set Google Cloud credentials
process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(__dirname, 'google-cloud-key.json');

async function testOCR() {
  const imagePath = path.join(__dirname, 'basscoastlineup.png');
  
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    console.log('Starting OCR test...');
    const result = await processImage(imageBuffer);
    console.log('OCR test completed.');
    console.log('Extracted artists:', result.artists);
  } catch (error) {
    console.error('Error during OCR test:', error);
  }
}

testOCR();
