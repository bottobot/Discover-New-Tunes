import { config } from 'dotenv';
import { performOCR } from './src/utils/googleVision';
import path from 'path';
import logger from './src/utils/logger';

// Load environment variables from .env file with explicit path
const envPath = path.resolve(__dirname, '.env');
const result = config({ path: envPath });

if (result.error) {
  logger.error('Failed to load environment variables:', {
    error: result.error.message,
    path: envPath
  });
  throw result.error;
}

// Log loaded environment variables (without sensitive values)
logger.info('Environment variables loaded:', {
  GOOGLE_VISION_PROJECT_ID: process.env.GOOGLE_VISION_PROJECT_ID,
  GOOGLE_VISION_CLIENT_EMAIL: process.env.GOOGLE_VISION_CLIENT_EMAIL ? '[REDACTED]' : undefined,
  GOOGLE_VISION_PRIVATE_KEY: process.env.GOOGLE_VISION_PRIVATE_KEY ? '[REDACTED]' : undefined
});

// Verify required environment variables are present
const requiredEnvVars = [
  'GOOGLE_VISION_PROJECT_ID',
  'GOOGLE_VISION_CLIENT_EMAIL',
  'GOOGLE_VISION_PRIVATE_KEY'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export { performOCR, path, logger };
