import React from 'react'

export default function ErrorDetails() {
  // Client-side only to access URL parameters
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(window.location.search);
  const errorData = JSON.parse(decodeURIComponent(params.get('error') || '{}'));

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
      title: 'Stack Trace',
      data: { stack: errorData.stack }
    }
  ];

  return (
    <div className="p-8 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Error Details</h1>
        <button
          onClick={() => window.history.back()}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Back to Upload
        </button>
      </div>

      <div className="space-y-6">
        {sections.map((section, index) => (
          <div key={index} className="border rounded-lg overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 font-semibold text-gray-700">
              {section.title}
            </div>
            <div className="p-4">
              <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded">
                {JSON.stringify(section.data, null, 2)}
              </pre>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <button
          onClick={() => {
            const text = JSON.stringify(errorData, null, 2);
            navigator.clipboard.writeText(text);
          }}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Copy All to Clipboard
        </button>
      </div>
    </div>
  )
}
