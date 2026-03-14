'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import WorldMap from '@/components/WorldMap'
import ParticleField from '@/components/ParticleField'

export default function WorldPage() {
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const role = localStorage.getItem('userRole')
    if (role !== 'gf') {
      router.push('/')
      return
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('userRole')
    router.push('/')
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen cosmic-gradient">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-pink-300 text-lg">Entering our world...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen cosmic-gradient overflow-hidden">
      <ParticleField />
      <button
        onClick={handleLogout}
        className="fixed top-4 right-4 z-50 px-4 py-2 rounded-xl bg-purple-900/60 backdrop-blur-sm border-2 border-purple-500/50 hover:border-pink-500/50 text-purple-200 hover:text-pink-300 transition-all duration-300 text-sm font-semibold hover:glow-soft"
      >
        Logout
      </button>
      <WorldMap />
    </div>
  )
}
