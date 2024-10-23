import { ImageAnnotatorClient } from '@google-cloud/vision';
import logger from './logger';

let client: ImageAnnotatorClient | null = null;

function formatPrivateKey(key: string): string {
  // If the key doesn't start with the header, assume it needs to be formatted
  if (!key.includes('-----BEGIN PRIVATE KEY-----')) {
    // Replace literal \n with newlines
    key = key.replace(/\\n/g, '\n');
    
    // If still no header, add the full format
    if (!key.includes('-----BEGIN PRIVATE KEY-----')) {
      key = `-----BEGIN PRIVATE KEY-----\n${key}\n-----END PRIVATE KEY-----\n`;
    }
  }
  return key;
}

function initializeClient(): ImageAnnotatorClient {
  if (client) return client;

  if (!process.env.GOOGLE_VISION_CLIENT_EMAIL || !process.env.GOOGLE_VISION_PRIVATE_KEY) {
    throw new Error('Missing required Google Vision credentials in environment variables');
  }

  try {
    const privateKey = formatPrivateKey(process.env.GOOGLE_VISION_PRIVATE_KEY);
    
    client = new ImageAnnotatorClient({
      projectId: process.env.GOOGLE_VISION_PROJECT_ID,
      credentials: {
        private_key: privateKey,
        client_email: process.env.GOOGLE_VISION_CLIENT_EMAIL
      }
    });
    
    logger.info('Google Vision client initialized successfully');
    return client;
  } catch (error) {
    logger.error('Failed to initialize Google Vision client:', {
      error: error instanceof Error ? error.message : String(error),
      clientEmail: process.env.GOOGLE_VISION_CLIENT_EMAIL,
      projectId: process.env.GOOGLE_VISION_PROJECT_ID,
      hasPrivateKey: !!process.env.GOOGLE_VISION_PRIVATE_KEY
    });
    throw new Error('Failed to initialize Google Vision client. Check your credentials.');
  }
}

const maxFileSize = 20 * 1024 * 1024; // 20MB
const validImageSignatures = [
  [0xFF, 0xD8], // JPEG
  [0x89, 0x50], // PNG
  [0x47, 0x49], // GIF
  [0x52, 0x49], // WEBP
];

async function validateImage(buffer: Buffer): Promise<void> {
  if (!buffer || buffer.length === 0) {
    throw new Error('Invalid image: empty buffer');
  }

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

export async function performOCR(buffer: Buffer): Promise<string> {
  try {
    // Initialize client if not already initialized
    const visionClient = initializeClient();
    
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
    logger.error('OCR Error:', { 
      error: error instanceof Error ? error.message : String(error)
    });
    throw new Error(`Failed to perform OCR: ${error instanceof Error ? error.message : String(error)}`);
  }
}
