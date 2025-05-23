'use client';

import React from 'react';

export default function ErrorDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {children}
      </div>
    </div>
  );
}
