'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, Text, Float } from '@react-three/drei'
import { Suspense } from 'react'
import PlanetScene from '@/components/PlanetScene'
import ParticleField from '@/components/ParticleField'
import { createSpeedOfLightAnimation } from '@/lib/speedOfLightAnimation'

export default function PlanetPage() {
  const [mounted, setMounted] = useState(false)
  const [animationComplete, setAnimationComplete] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const role = localStorage.getItem('userRole')
    if (role !== 'gf' && role !== 'bf') {
      router.push('/')
      return
    }
    
    // Create speed of light animation when page loads
    createSpeedOfLightAnimation(() => {
      setAnimationComplete(true)
      // Dispatch event to start music after animation
      window.dispatchEvent(new CustomEvent('speedOfLightComplete'))
    })
  }, [router])

  const handleEnterWorld = () => {
    // Create speed of light animation before navigating
    createSpeedOfLightAnimation(() => {
      router.push('/world')
    })
  }

  const handleLogout = () => {
    localStorage.removeItem('userRole')
    router.push('/')
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen cosmic-gradient">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-pink-300 text-lg">Loading your world...</p>
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
      
      <div className="absolute inset-0 z-10">
        <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
          <Suspense fallback={null}>
            {/* Enhanced magical lighting */}
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1.5} color="#FFFFFF" />
            <pointLight position={[10, 10, 10]} intensity={1.5} color="#FFFFFF" />
            <pointLight position={[-10, -10, -10]} intensity={1.2} color="#EC4899" />
            <pointLight position={[0, 10, 0]} intensity={0.8} color="#A855F7" />
            <pointLight position={[0, -10, 0]} intensity={0.8} color="#F472B6" />
            <pointLight position={[10, 0, -10]} intensity={0.6} color="#10B981" />
            <pointLight position={[-10, 0, 10]} intensity={0.6} color="#F59E0B" />
            
            {/* Enhanced starfield */}
            <Stars 
              radius={400} 
              depth={60} 
              count={8000} 
              factor={5} 
              fade 
              speed={0.5}
            />
            
            <PlanetScene onEnterWorld={handleEnterWorld} />
            
            <OrbitControls
              enableZoom={true}
              enablePan={false}
              minDistance={5}
              maxDistance={50}
              autoRotate={false}
              enableDamping={true}
              dampingFactor={0.05}
              zoomSpeed={1.5}
              rotateSpeed={0.5}
            />
          </Suspense>
        </Canvas>
      </div>
      
      {/* Floating hint text */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 text-center">
        <p className="text-pink-300/80 text-lg font-handwritten animate-pulse">
          Click the world to enter ✨
        </p>
      </div>

    </div>
  )
}
