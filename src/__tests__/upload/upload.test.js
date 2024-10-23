import fs from 'fs';
import path from 'path';
import { performOCR } from '@/utils/googleVision';
import logger from '@/utils/logger';

async function testUpload() {
  const imagePath = path.join(process.cwd(), 'public', 'test-lineup.png');
  
  try {
    // Read the image file
    const imageBuffer = fs.readFileSync(imagePath);
    
    // Perform OCR on the image buffer
    const text = await performOCR(imageBuffer);
    logger.info('OCR Result:', { text });
    
    // Split into lines and filter out empty ones
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    logger.info('Potential artists:', { lines });
    
    // Write the results to a file
    const outputPath = path.join(process.cwd(), 'public', 'test-lineup.txt');
    fs.writeFileSync(outputPath, lines.join('\n'));
    logger.info('Results written to:', { outputPath });
  } catch (error) {
    logger.error('Error processing test upload:', { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}

testUpload().catch(console.error);
