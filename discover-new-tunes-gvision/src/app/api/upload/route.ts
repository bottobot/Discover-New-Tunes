import { NextRequest, NextResponse } from 'next/server'
import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'
import { performOCR } from '../../../utils/googleVision'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('image') as File | null

    if (!file) {
      return NextResponse.json({ success: false, error: 'No image file uploaded' }, { status: 400 })
    }

    // Save the file temporarily
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const tempPath = join('/tmp', file.name)
    await writeFile(tempPath, buffer)

    // Perform OCR using Google Vision API
    const text = await performOCR(tempPath)

    // Delete the temporary file
    await unlink(tempPath)

    // Process the OCR result to extract potential artists
    const lines = text.split('\n')
    const potentialArtists = lines.filter(line => line.trim().length > 0)

    return NextResponse.json({ 
      success: true, 
      text,
      artists: potentialArtists
    })
  } catch (error) {
    console.error('Error processing image:', error)
    return NextResponse.json({ success: false, error: 'Error processing image' }, { status: 500 })
  }
}
