import { performOCR, path, logger } from './test-utils';

async function testOCR() {
  const imagePath = path.join(process.cwd(), '2023-poster.webp');
  
  try {
    logger.info('Starting OCR test:', {
      imagePath,
      timestamp: new Date().toISOString()
    });

    const text = await performOCR(imagePath);
    
    logger.info('OCR test completed:', {
      success: true,
      textLength: text.length,
      text: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('OCR test failed:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    process.exit(1);
  }
}

testOCR();
