import React from 'react'

export default function ErrorDetails() {
  // Client-side only to access URL parameters
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(window.location.search);
  const errorData = JSON.parse(decodeURIComponent(params.get('error') || '{}'));

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Error Details</h1>
      <div className="bg-gray-100 p-4 rounded-lg">
        <pre className="whitespace-pre-wrap font-mono text-sm">
          {JSON.stringify(errorData, null, 2)}
        </pre>
      </div>
      <button
        onClick={() => window.history.back()}
        className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Back to Upload
      </button>
    </div>
  )
}
