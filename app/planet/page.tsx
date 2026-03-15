'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { Suspense } from 'react'
import PlanetScene from '@/components/PlanetScene'
import ParticleField from '@/components/ParticleField'
import ResponsivePlanetCamera from '@/components/ResponsivePlanetCamera'
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

    createSpeedOfLightAnimation(() => {
      setAnimationComplete(true)
      window.dispatchEvent(new CustomEvent('speedOfLightComplete'))
    })
  }, [router])

  const handleEnterWorld = () => {
    createSpeedOfLightAnimation(() => router.push('/world'))
  }

  const handleBack = () => {
    router.push('/welcome')
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen cosmic-gradient">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-400/80 mx-auto mb-4" />
          <p className="text-pink-200 text-lg text-handwritten">Bringing you to our world…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-[100dvh] h-[100dvh] w-full cosmic-gradient overflow-hidden">
      <ParticleField />

      {/* Golden romantic overlay — subtle vignette and warm gradient */}
      <div
        className="pointer-events-none fixed inset-0 z-[5]"
        aria-hidden
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% 40%, transparent 0%, transparent 50%),
            radial-gradient(ellipse 100% 100% at 50% 50%, rgba(251,191,36,0.06) 0%, transparent 70%),
            radial-gradient(ellipse 150% 150% at 50% 100%, rgba(236,72,153,0.08) 0%, transparent 50%)
          `,
        }}
      />

      <button
        onClick={handleBack}
        className="fixed top-4 right-4 z-50 px-4 py-2 rounded-xl bg-purple-900/60 backdrop-blur-sm border-2 border-amber-500/30 hover:border-amber-400/50 text-amber-100 hover:text-amber-200 transition-all duration-300 text-sm font-semibold hover:shadow-[0_0_20px_rgba(251,191,36,0.2)] flex items-center gap-1.5"
      >
        <span aria-hidden>←</span>
        Back
      </button>

      {/* Romantic title */}
      <div className="absolute top-6 left-0 right-0 z-20 text-center pointer-events-none">
        <p className="text-amber-200/90 text-handwritten text-xl sm:text-2xl font-bold drop-shadow-lg">
          SoLuna
        </p>
        <p className="text-pink-200/70 text-xs sm:text-sm mt-0.5 tracking-widest uppercase">
          You&apos;re almost there
        </p>
      </div>

      <div className="absolute inset-0 z-10 w-full h-full min-h-0">
        <Canvas
          camera={{ position: [0, 0, 10], fov: 75 }}
          gl={{ alpha: true, antialias: true }}
          style={{ display: 'block', width: '100%', height: '100%' }}
        >
          <ResponsivePlanetCamera />
          <Suspense fallback={null}>
            <ambientLight intensity={0.55} />
            <directionalLight position={[10, 10, 5]} intensity={1.4} color="#FFF8E7" />
            <pointLight position={[10, 10, 10]} intensity={1.2} color="#FFF4D4" />
            <pointLight position={[-10, -10, -10]} intensity={1.0} color="#EC4899" />
            <pointLight position={[0, 10, 0]} intensity={0.9} color="#FBBF24" />
            <pointLight position={[0, -10, 0]} intensity={0.7} color="#F472B6" />
            <pointLight position={[10, 0, -10]} intensity={0.5} color="#FCD34D" />
            <pointLight position={[-10, 0, 10]} intensity={0.5} color="#F9A8D4" />

            <Stars
              radius={400}
              depth={60}
              count={8000}
              factor={5}
              fade
              speed={0.4}
              saturation={0.6}
            />

            <PlanetScene onEnterWorld={handleEnterWorld} />

            <OrbitControls
              enableZoom={true}
              enablePan={false}
              minDistance={4}
              maxDistance={55}
              autoRotate={false}
              enableDamping={true}
              dampingFactor={0.05}
              zoomSpeed={1.2}
              rotateSpeed={0.5}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Bottom hint — golden, romantic */}
      <div className="absolute bottom-6 sm:bottom-8 left-0 right-0 z-20 text-center px-4">
        <p className="text-amber-200/95 text-base sm:text-lg font-handwritten drop-shadow-md">
          Touch the world to step inside
        </p>
        <p className="text-pink-200/70 text-xs sm:text-sm mt-1">
          Everything we built is waiting for you ✨
        </p>
      </div>
    </div>
  )
}
