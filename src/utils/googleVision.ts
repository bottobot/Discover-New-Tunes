import { ImageAnnotatorClient } from '@google-cloud/vision';
import fs from 'fs/promises';
import path from 'path';
import logger from './logger';

let client: ImageAnnotatorClient | null = null;

// Initialize client with credentials from environment variables
function initializeClient(): ImageAnnotatorClient {
  if (client) return client;

  try {
    if (!process.env.GOOGLE_VISION_CLIENT_EMAIL || !process.env.GOOGLE_VISION_PRIVATE_KEY) {
      throw new Error('Missing required Google Vision credentials in environment variables');
    }

    client = new ImageAnnotatorClient({
      projectId: process.env.GOOGLE_VISION_PROJECT_ID,
      credentials: {
        private_key: process.env.GOOGLE_VISION_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_VISION_CLIENT_EMAIL
      }
    });
    
    logger.info('Google Vision client initialized successfully');
    return client;
  } catch (error) {
    logger.error('Failed to initialize Google Vision client:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}

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
    // Initialize client if not already initialized
    const visionClient = initializeClient();

    logger.info('Starting OCR process:', { 
      imagePath,
      timestamp: new Date().toISOString()
    });

    // Validate image before processing
    await validateImage(imagePath);
    
    // Read the file content
    const imageContent = await fs.readFile(imagePath);
    
    // Perform OCR using image content
    const [result] = await visionClient.textDetection(imageContent);
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
