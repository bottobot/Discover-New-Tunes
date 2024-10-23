import { ImageAnnotatorClient } from '@google-cloud/vision';
import fs from 'fs/promises';

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

const maxFileSize = 20 * 1024 * 1024; // 20MB
const validImageSignatures = [
  [0xFF, 0xD8], // JPEG
  [0x89, 0x50], // PNG
  [0x47, 0x49], // GIF
  [0x52, 0x49], // WEBP
];

async function validateImage(buffer: Buffer): Promise<void> {
  if (buffer.length > maxFileSize) {
    throw new Error(`File size (${buffer.length} bytes) exceeds maximum allowed size (${maxFileSize} bytes)`);
  }

  // Check for valid image signatures
  const isValidImage = validImageSignatures.some(signature => 
    signature.every((byte, index) => buffer[index] === byte)
  );

  if (!isValidImage) {
    throw new Error('Invalid image format');
  }
}

export async function performOCR(input: string | Buffer): Promise<string> {
  try {
    // Initialize client if not already initialized
    const visionClient = initializeClient();

    // Convert input to buffer if it's a file path
    const buffer = typeof input === 'string' 
      ? await fs.readFile(input)
      : input;
    
    // Validate image before processing
    await validateImage(buffer);
    
    // Perform OCR using image buffer
    const [result] = await visionClient.textDetection(buffer);
    const detections = result.textAnnotations;
    
    if (!detections || detections.length === 0) {
      return '';
    }

    return detections[0].description || '';
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error(`Failed to perform OCR: ${error instanceof Error ? error.message : String(error)}`);
  }
}
