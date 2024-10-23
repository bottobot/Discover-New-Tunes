import React from 'react'

interface ErrorSectionProps {
  title: string;
  data: any;
}

const ErrorSection: React.FC<ErrorSectionProps> = React.memo(({ title, data }) => {
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
})

ErrorSection.displayName = 'ErrorSection'

export default ErrorSection
