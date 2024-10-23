'use client';

import React from 'react'
import dynamic from 'next/dynamic'

// Dynamically import components
const ErrorSection = dynamic(() => import('@/app/error-details/ErrorSection'), {
  loading: () => <div className="animate-pulse bg-gray-100 h-32 rounded-lg mb-4" />
})

export default function ErrorDetails() {
  const [errorData, setErrorData] = React.useState<any>(null)
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const rawError = params.get('error')
      if (rawError) {
        const parsedError = JSON.parse(decodeURIComponent(rawError))
        setErrorData(parsedError)
      }
    } catch (error) {
      setErrorData({
        errorType: 'Error Parsing Data',
        errorMessage: 'Failed to parse error details',
        originalError: error instanceof Error ? error.message : String(error)
      })
    }
  }, [])

  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(errorData, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }, [errorData])

  if (!errorData) {
    return (
      <div className="p-8 bg-white rounded-lg shadow-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-100 rounded"></div>
        </div>
      </div>
    )
  }

  const sections = [
    {
      title: 'Basic Information',
      data: {
        timestamp: errorData.timestamp,
        errorType: errorData.errorType,
        errorMessage: errorData.errorMessage
      }
    },
    {
      title: 'Response Details',
      data: errorData.response
    },
    {
      title: 'Request Details',
      data: errorData.request
    },
    {
      title: 'Server Error Details',
      data: errorData.response?.data?.details
    },
    {
      title: 'Stack Trace',
      data: { stack: errorData.stack }
    }
  ].filter(section => section.data && Object.keys(section.data).length > 0)

  return (
    <div className="p-8 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Error Details</h1>
        <div className="space-x-4">
          <button
            onClick={handleCopy}
            className={`${
              copied ? 'bg-green-500' : 'bg-gray-500 hover:bg-gray-700'
            } text-white font-bold py-2 px-4 rounded transition-colors`}
          >
            {copied ? 'Copied!' : 'Copy All'}
          </button>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Back
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {sections.map((section, index) => (
          <ErrorSection key={index} {...section} />
        ))}
      </div>
    </div>
  )
}
