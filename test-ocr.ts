import { performOCR } from './src/utils/googleVision';
import path from 'path';
import logger from './src/utils/logger';

async function testOCR() {
  const imagePath = path.join(process.cwd(), '2023-poster.webp');
  
  try {
    const text = await performOCR(imagePath);
    logger.info('OCR Result:', { text });
    
    // Split into lines and filter out empty ones
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    logger.info('Potential artists:', { lines });
  } catch (error) {
    logger.error('Error processing image:', { 
      error: error instanceof Error ? error.message : String(error),
      path: imagePath
    });
  }
}

testOCR().catch(console.error);
