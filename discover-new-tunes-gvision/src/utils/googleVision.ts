import { ImageAnnotatorClient } from '@google-cloud/vision';
import fs from 'fs/promises';
import path from 'path';
import logger from './logger';

const client = new ImageAnnotatorClient({
  projectId: process.env.GOOGLE_VISION_PROJECT_ID,
  credentials: {
    private_key: process.env.GOOGLE_VISION_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_VISION_CLIENT_EMAIL,
  },
});

const supportedFormats = ['.png', '.jpg', '.jpeg', '.webp'];

export async function performOCR(imagePath: string): Promise<string> {
  try {
    logger.info(`Performing OCR on image: ${imagePath}`);
    
    const fileExtension = path.extname(imagePath).toLowerCase();
    if (!supportedFormats.includes(fileExtension)) {
      throw new Error(`Unsupported file format: ${fileExtension}. Supported formats are: ${supportedFormats.join(', ')}`);
    }

    // Read the file content
    const imageContent = await fs.readFile(imagePath);
    
    // Perform OCR using image content
    const [result] = await client.textDetection(imageContent);
    const detections = result.textAnnotations;
    
    if (detections && detections.length > 0) {
      logger.info('OCR Result:', { text: detections[0].description });
      return detections[0].description || '';
    }
    
    logger.warn('No text detected in the image');
    return '';
  } catch (error) {
    logger.error('Error performing OCR:', { 
      error: error instanceof Error ? error.message : String(error), 
      stack: error instanceof Error ? error.stack : undefined,
      imagePath,
      imageSize: (await fs.stat(imagePath)).size
    });
    throw new Error(`Failed to perform OCR: ${error instanceof Error ? error.message : String(error)}`);
  }
}
