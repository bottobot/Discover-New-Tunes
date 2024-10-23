import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Discover New Tunes',
  description: 'Upload festival lineups and discover new artists',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          href="/_next/static/media/4473ecc91f70f139-s.p.woff"
          as="font"
          type="font/woff"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/_next/static/media/463dafcda517f24f-s.p.woff"
          as="font"
          type="font/woff"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
