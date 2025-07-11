'use client'

import dynamic from 'next/dynamic'

// Dynamic import to prevent hydration issues
const DynamicHome = dynamic(() => import('./page'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading UniGrading...</p>
      </div>
    </div>
  )
})

export default function DynamicPage() {
  return <DynamicHome />
}
