import React, { useState, useCallback, memo } from 'react'
import dynamic from 'next/dynamic'
import axios from 'axios'

// Dynamically import Image component
const Image = dynamic(() => import('next/image'), {
  loading: () => <div className="w-full h-[300px] bg-gray-100 animate-pulse" />
})

interface ImageUploadProps {
  onOCRComplete: (text: string) => void
}

interface ErrorResponse {
  success: false;
  error: string;
  details?: {
    message: string;
    stack?: string;
    code?: string;
    path?: string;
  };
}

const ImageUpload: React.FC<ImageUploadProps> = memo(({ onOCRComplete }) => {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setPreview(URL.createObjectURL(selectedFile))
      setError(null)

      // Clean up previous preview URL
      return () => {
        if (preview) URL.revokeObjectURL(preview)
      }
    }
  }, [preview])

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    setError(null)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        validateStatus: (status) => status < 500
      })

      if (response.data.success && response.data.text) {
        onOCRComplete(response.data.text)
      } else {
        throw new Error(response.data.error || 'OCR failed')
      }
    } catch (error) {
      let errorMessage = 'Error processing image. Please try again.'
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 500) {
          const errorData = error.response.data as ErrorResponse
          errorMessage = errorData.error || errorMessage
        }
      } else if (error instanceof Error) {
        errorMessage = error.message
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [file, onOCRComplete])

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="image">
            Upload Lineup Image
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="image"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={loading}
          />
        </div>
        {preview && (
          <div className="mb-4 relative w-full h-[300px]">
            <Image 
              src={preview}
              alt="Preview"
              fill
              style={{ objectFit: 'contain' }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false}
              loading="lazy"
            />
          </div>
        )}
        {error && (
          <div className="mb-4 text-red-500 text-sm">
            {error}
          </div>
        )}
        <div className="flex items-center justify-between">
          <button
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            type="submit"
            disabled={!file || loading}
          >
            {loading ? 'Processing...' : 'Upload'}
          </button>
        </div>
      </form>
    </div>
  )
})

ImageUpload.displayName = 'ImageUpload'

export default ImageUpload
