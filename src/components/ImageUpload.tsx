import React, { useState, useCallback, memo } from 'react'
import dynamic from 'next/dynamic'
import axios from 'axios'
import { useRouter } from 'next/navigation'

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

interface ErrorData {
  timestamp: string;
  errorType: string;
  errorMessage: string;
  request: {
    url: string;
    method: string;
    fileName: string;
    fileSize: number;
    fileType: string;
  };
  response?: {
    status?: number;
    statusText?: string;
    data?: any;
  };
  stack?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = memo(({ onOCRComplete }) => {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setPreview(URL.createObjectURL(selectedFile))

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
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      })

      if (response.data.success && response.data.text) {
        onOCRComplete(response.data.text)
      } else {
        throw new Error(response.data.error || 'OCR failed')
      }
    } catch (error) {
      const errorData: ErrorData = {
        timestamp: new Date().toISOString(),
        errorType: 'Upload Error',
        errorMessage: 'Error processing image',
        request: {
          url: '/api/upload',
          method: 'POST',
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type
        }
      }
      
      if (axios.isAxiosError(error)) {
        errorData.errorType = 'API Error'
        errorData.errorMessage = error.response?.data?.error || error.message
        errorData.response = {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        }
        errorData.stack = error.stack
      } else if (error instanceof Error) {
        errorData.errorMessage = error.message
        errorData.stack = error.stack
      }

      // Redirect to error page with error details
      router.push(`/error-details?error=${encodeURIComponent(JSON.stringify(errorData))}`)
    } finally {
      setLoading(false)
    }
  }, [file, onOCRComplete, router])

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
