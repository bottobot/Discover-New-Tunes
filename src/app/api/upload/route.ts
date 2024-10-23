import { NextRequest, NextResponse } from 'next/server';
import { performOCR } from '@/utils/googleVision';
import logger from '@/utils/logger';

// Route segment config
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json(
        { 
          success: false,
          error: 'No file uploaded' 
        },
        { status: 400 }
      );
    }

    // Get the file bytes directly as a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    try {
      // Process the image buffer directly
      const text = await performOCR(buffer);
      logger.info('OCR completed successfully');

      return NextResponse.json({ 
        success: true,
        text 
      });
    } catch (error) {
      logger.error('Error processing image:', { 
        error: error instanceof Error ? error.message : String(error)
      });
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to process image',
          details: error instanceof Error ? error.message : String(error)
        },
        { status: 500 }
      );
    }
  } catch (error) {
    logger.error('Error handling upload:', { 
      error: error instanceof Error ? error.message : String(error)
    });
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to handle upload',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
