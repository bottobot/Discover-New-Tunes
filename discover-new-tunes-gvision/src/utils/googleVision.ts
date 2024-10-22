import vision from '@google-cloud/vision'

const client = new vision.ImageAnnotatorClient({
  credentials: {
    client_email: process.env.GOOGLE_VISION_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_VISION_PRIVATE_KEY,
  },
})

export async function performOCR(imagePath: string): Promise<string> {
  try {
    const [result] = await client.textDetection(imagePath)
    const detections = result.textAnnotations
    
    if (detections && detections.length > 0) {
      return detections[0].description || ''
    }
    
    return ''
  } catch (error) {
    console.error('Error performing OCR:', error)
    throw new Error('Failed to perform OCR')
  }
}
