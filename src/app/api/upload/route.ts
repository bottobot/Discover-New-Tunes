import { NextRequest, NextResponse } from 'next/server'
import { writeFile, unlink, mkdir } from 'fs/promises'
import { join } from 'path'
import { performOCR } from '@/utils/googleVision'
import logger from '@/utils/logger'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function createTempDir() {
  const tmpDir = join(process.cwd(), 'tmp')
  await mkdir(tmpDir, { recursive: true })
  return tmpDir
}

export async function POST(req: NextRequest) {
  let tempPath: string | null = null

  try {
    const formData = await req.formData()
    const file = formData.get('image') as File | null

    if (!file) {
      logger.warn('No image file uploaded')
      return NextResponse.json(
        { 
          success: false, 
          error: 'No image file uploaded',
          details: {
            message: 'Form data did not contain an image file',
            code: 'MISSING_FILE'
          }
        },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          }
        }
      )
    }

    logger.info('Processing file', { name: file.name, size: file.size, type: file.type })

    const tmpDir = await createTempDir()
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    tempPath = join(tmpDir, `${Date.now()}-${file.name}`)
    await writeFile(tempPath, buffer)

    const text = await performOCR(buffer)
    const lines = text.split('\n')
    const potentialArtists = lines.filter(line => line.trim().length > 0)

    return NextResponse.json(
      { 
        success: true, 
        text,
        artists: potentialArtists
      },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      }
    )
  } catch (error) {
    logger.error('Error processing image', { 
      error: error instanceof Error ? error.message : String(error), 
      stack: error instanceof Error ? error.stack : undefined 
    })
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error processing image',
        details: {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        }
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      }
    )
  } finally {
    if (tempPath) {
      try {
        await unlink(tempPath)
      } catch (error) {
        logger.error('Error cleaning up temp file', { path: tempPath, error })
      }
    }
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
