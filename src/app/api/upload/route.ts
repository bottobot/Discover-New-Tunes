import { NextRequest, NextResponse } from 'next/server'
import { writeFile, unlink, mkdir } from 'fs/promises'
import { join } from 'path'
import { performOCR } from '@/utils/googleVision'
import logger from '@/utils/logger'

// New route segment config format
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('image') as File | null

    if (!file) {
      logger.warn('No image file uploaded')
      return NextResponse.json({ success: false, error: 'No image file uploaded' }, { status: 400 })
    }

    // Log received file information
    logger.info('Received file:', { name: file.name, size: file.size, type: file.type })

    // Create tmp directory if it doesn't exist
    const tmpDir = join(process.cwd(), 'tmp')
    await mkdir(tmpDir, { recursive: true })

    // Save the file temporarily
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const tempPath = join(tmpDir, `${Date.now()}-${file.name}`)
    await writeFile(tempPath, buffer)

    logger.info('File saved temporarily at:', tempPath)

    try {
      // Perform OCR using Google Vision API
      const text = await performOCR(tempPath)

      logger.info('OCR result:', { text })

      // Process the OCR result to extract potential artists
      const lines = text.split('\n')
      const potentialArtists = lines.filter(line => line.trim().length > 0)

      return NextResponse.json({ 
        success: true, 
        text,
        artists: potentialArtists
      }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      })
    } finally {
      // Delete the temporary file
      await unlink(tempPath)
      logger.info('Temporary file deleted:', tempPath)
    }
  } catch (error) {
    logger.error('Error processing image:', { 
      error: error instanceof Error ? error.message : String(error), 
      stack: error instanceof Error ? error.stack : undefined 
    })
    return NextResponse.json({ success: false, error: 'Error processing image' }, { status: 500 })
  }
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  })
}
