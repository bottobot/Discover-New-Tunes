import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Error Details - Discover New Tunes',
  description: 'Detailed error information for debugging',
}

export default function ErrorDetailsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto">
        {children}
      </div>
    </div>
  )
}
