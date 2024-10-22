import sharp from 'sharp'
import path from 'path'
import { promises as fs } from 'fs'

export async function processImage(filePath: string): Promise<string> {
  const outputPath = path.join(process.cwd(), 'tmp', `processed_${Date.now()}.png`)
  
  await sharp(filePath)
    .resize(1000) // Resize to a maximum width of 1000px
    .normalize() // Normalize the image (improve contrast)
    .sharpen() // Sharpen the image
    .toFile(outputPath)

  return outputPath
}
