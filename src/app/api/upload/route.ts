import { NextRequest, NextResponse } from 'next/server'
import { writeFile, unlink, mkdir } from 'fs/promises'
import { join } from 'path'
import { performOCR } from '@/utils/googleVision'

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
      return NextResponse.json(
        { success: false, error: 'No image file uploaded' },
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

    const tmpDir = await createTempDir()
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    tempPath = join(tmpDir, `${Date.now()}-${file.name}`)
    await writeFile(tempPath, buffer)

    const text = await performOCR(tempPath)
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
    return NextResponse.json(
      { success: false, error: 'Error processing image' },
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
        // Silently handle cleanup errors
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
