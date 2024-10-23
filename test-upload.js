const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const winston = require('winston');

// Create a logger instance
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'test-upload' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

async function testImageUpload() {
  const imagePath = path.join(__dirname, 'public', 'test-lineup.png');
  const formData = new FormData();
  formData.append('image', fs.createReadStream(imagePath), 'test-lineup.png');

  try {
    logger.info('Starting image upload test');
    logger.info(`Using image: ${imagePath}`);

    const response = await axios.post('http://localhost:3000/api/upload', formData, {
      headers: {
        ...formData.getHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    });

    logger.info('Upload successful', { response: response.data });
    console.log('Response:', response.data);
  } catch (error) {
    logger.error('Error during image upload test:', {
      error: error.message,
      response: error.response ? error.response.data : null,
      stack: error.stack,
    });
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

testImageUpload();
