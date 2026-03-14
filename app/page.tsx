'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import CodeEntry from '@/components/CodeEntry'

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen cosmic-gradient">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-pink-300 text-lg">Building your world...</p>
        </div>
      </div>
    )
  }

  return <CodeEntry />
}
