import { ImageAnnotatorClient } from '@google-cloud/vision';
import fs from 'fs/promises';
import path from 'path';

let client: ImageAnnotatorClient | null = null;

function initializeClient(): ImageAnnotatorClient {
  if (client) return client;

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
  
  return client;
}

const supportedFormats = ['.png', '.jpg', '.jpeg', '.webp'];
const maxFileSize = 20 * 1024 * 1024; // 20MB

async function validateImage(imagePath: string): Promise<void> {
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
}

export async function performOCR(imagePath: string): Promise<string> {
  try {
    // Initialize client if not already initialized
    const visionClient = initializeClient();

    // Validate image before processing
    await validateImage(imagePath);
    
    // Read the file content
    const imageContent = await fs.readFile(imagePath);
    
    // Perform OCR using image content
    const [result] = await visionClient.textDetection(imageContent);
    const detections = result.textAnnotations;
    
    if (!detections || detections.length === 0) {
      return '';
    }

    return detections[0].description || '';
  } catch (error) {
    throw new Error(`Failed to perform OCR: ${error instanceof Error ? error.message : String(error)}`);
  }
}
