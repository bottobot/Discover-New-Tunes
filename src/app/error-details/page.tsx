import React from 'react'

function ErrorSection({ title, data }: { title: string; data: any }) {
  if (!data || Object.keys(data).length === 0) return null;

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-100 px-4 py-2 font-semibold text-gray-700">
        {title}
      </div>
      <div className="p-4">
        <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded overflow-x-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export default function ErrorDetails() {
  const [errorData, setErrorData] = React.useState<any>(null);

  React.useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const rawError = params.get('error');
      if (rawError) {
        const parsedError = JSON.parse(decodeURIComponent(rawError));
        setErrorData(parsedError);
      }
    } catch (error) {
      console.error('Error parsing error data:', error);
      setErrorData({
        errorType: 'Error Parsing Data',
        errorMessage: 'Failed to parse error details',
        originalError: error instanceof Error ? error.message : String(error)
      });
    }
  }, []);

  if (!errorData) {
    return (
      <div className="p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Loading Error Details...</h1>
      </div>
    );
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
  ];

  return (
    <div className="p-8 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Error Details</h1>
        <div className="space-x-4">
          <button
            onClick={() => {
              const text = JSON.stringify(errorData, null, 2);
              navigator.clipboard.writeText(text)
                .then(() => alert('Error details copied to clipboard'))
                .catch(() => alert('Failed to copy to clipboard'));
            }}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Copy All
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
          <ErrorSection key={index} title={section.title} data={section.data} />
        ))}
      </div>
    </div>
  )
}
