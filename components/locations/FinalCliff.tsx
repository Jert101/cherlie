'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

interface FinalCliffProps {
  onClick: () => void
}

export default function FinalCliff({ onClick }: FinalCliffProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1, delay: 1 }
      )
    }
  }, [])

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      className="relative h-full min-h-[200px] bg-gradient-to-br from-pink-900/40 via-purple-900/40 to-indigo-900/40 backdrop-blur-sm rounded-2xl border-2 border-pink-500/50 cursor-pointer hover:border-pink-500/80 transition-all duration-300 hover:glow overflow-hidden group"
    >
      {/* Sunset gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-orange-900/30 via-pink-900/20 to-transparent" />

      {/* Floating hearts */}
      <div className="absolute inset-0">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute text-3xl animate-float opacity-40"
            style={{
              left: `${10 + i * 12}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${6 + i * 0.5}s`
            }}
          >
            ❤️
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-t from-purple-900/90 to-transparent z-10">
        <div className="text-7xl mb-4 group-hover:scale-125 transition-transform duration-300">
          🌅
        </div>
        <h3 className="text-3xl font-bold text-handwritten text-pink-300 mb-3">
          Final Cliff
        </h3>
        <p className="text-purple-200 text-center max-w-md">
          Where our story reaches its peak
        </p>
        <div className="mt-4 text-2xl animate-pulse">
          ✨
        </div>
      </div>

      {/* Enhanced glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-500/30 to-transparent animate-pulse" />
      </div>
    </div>
  )
}
