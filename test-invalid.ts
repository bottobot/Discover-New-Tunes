import { performOCR } from './src/utils/googleVision';
import path from 'path';
import logger from './src/utils/logger';

async function testInvalidFile() {
  const imagePath = path.join(process.cwd(), 'nonexistent.webp');
  
  try {
    await performOCR(imagePath);
  } catch (error) {
    logger.error('Error processing invalid file:', { 
      error: error instanceof Error ? error.message : String(error),
      path: imagePath
    });
  }
}

testInvalidFile().catch(console.error);
