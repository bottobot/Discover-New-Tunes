import { describe, it, expect } from '@jest/globals';
import { performOCR } from '@/utils/googleVision';
import path from 'path';
import logger from '@/utils/logger';
import fs from 'fs/promises';

describe('OCR Tests', () => {
  it('should process valid image file', async () => {
    const imagePath = path.join(process.cwd(), '2023-poster.webp');
    
    // First check if file exists
    const fileExists = await fs.access(imagePath)
      .then(() => true)
      .catch(() => false);
    
    if (!fileExists) {
      // Skip test if test image doesn't exist
      console.log('Test image not found, skipping test');
      return;
    }

    const text = await performOCR(imagePath);
    expect(text).toBeDefined();
    expect(typeof text).toBe('string');
    
    // Split into lines and filter out empty ones
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    expect(Array.isArray(lines)).toBe(true);
  });

  it('should handle invalid file path', async () => {
    const imagePath = path.join(process.cwd(), 'nonexistent.webp');
    
    await expect(performOCR(imagePath)).rejects.toThrow('ENOENT');
  });

  it('should handle invalid buffer input', async () => {
    const invalidBuffer = Buffer.from('not an image');
    
    await expect(performOCR(invalidBuffer)).rejects.toThrow('Invalid image format');
  });

  it('should handle empty buffer', async () => {
    const emptyBuffer = Buffer.alloc(0);
    
    await expect(performOCR(emptyBuffer)).rejects.toThrow('Invalid image format');
  });
});
