import { ImageAnnotatorClient } from '@google-cloud/vision';
import fs from 'fs/promises';
import path from 'path';
import logger from './logger';

// Initialize client with credentials file
const client: ImageAnnotatorClient = (() => {
  try {
    const credentialsPath = path.join(process.cwd(), 'inductive-choir-439205-p6-c66d07c3bd77.json');
    const instance = new ImageAnnotatorClient({
      keyFilename: credentialsPath
    });
    logger.info('Google Vision client initialized successfully');
    return instance;
  } catch (error) {
    logger.error('Failed to initialize Google Vision client:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
})();

const supportedFormats = ['.png', '.jpg', '.jpeg', '.webp'];
const maxFileSize = 20 * 1024 * 1024; // 20MB

async function validateImage(imagePath: string): Promise<void> {
  try {
    // Check if file exists
    const stats = await fs.stat(imagePath);
    
    // Check file size
    if (stats.size > maxFileSize) {
      throw new Error(`File size (${stats.size} bytes) exceeds maximum allowed size (${maxFileSize} bytes)`);
    }
    
    // Check file format
    const fileExtension = path.extname(imagePath).toLowerCase();
    if (!supportedFormats.includes(fileExtension)) {
      throw new Error(`Unsupported file format: ${fileExtension}. Supported formats are: ${supportedFormats.join(', ')}`);
    }

    logger.info('Image validation successful:', {
      path: imagePath,
      size: stats.size,
      format: fileExtension
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('ENOENT')) {
      throw new Error(`File not found: ${imagePath}`);
    }
    throw error;
  }
}

export async function performOCR(imagePath: string): Promise<string> {
  const startTime = Date.now();
  
  try {
    logger.info('Starting OCR process:', { 
      imagePath,
      timestamp: new Date().toISOString()
    });

    // Validate image before processing
    await validateImage(imagePath);
    
    // Read the file content
    const imageContent = await fs.readFile(imagePath);
    
    // Perform OCR using image content
    const [result] = await client.textDetection(imageContent);
    const detections = result.textAnnotations;
    
    if (!detections || detections.length === 0) {
      logger.warn('No text detected in the image:', { imagePath });
      return '';
    }

    const text = detections[0].description || '';
    const processingTime = Date.now() - startTime;
    
    logger.info('OCR completed successfully:', {
      imagePath,
      processingTime: `${processingTime}ms`,
      textLength: text.length,
      timestamp: new Date().toISOString()
    });

    return text;
  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    logger.error('OCR process failed:', { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      imagePath,
      processingTime: `${processingTime}ms`,
      timestamp: new Date().toISOString()
    });

    throw new Error(`Failed to perform OCR: ${error instanceof Error ? error.message : String(error)}`);
  }
}
