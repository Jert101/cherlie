'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

interface GameArcadeProps {
  onClick: () => void
}

export default function GameArcade({ onClick }: GameArcadeProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.6 }
      )
    }
  }, [])

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      className="relative h-full min-h-[200px] bg-gradient-to-br from-purple-900/30 to-indigo-900/30 backdrop-blur-sm rounded-2xl border-2 border-pink-500/30 cursor-pointer hover:border-pink-500/60 transition-all duration-300 hover:glow-soft overflow-hidden group"
    >
      {/* Animated game icons */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex gap-4">
          <div className="text-4xl animate-bounce" style={{ animationDelay: '0s' }}>
            🧩
          </div>
          <div className="text-4xl animate-bounce" style={{ animationDelay: '0.2s' }}>
            💕
          </div>
          <div className="text-4xl animate-bounce" style={{ animationDelay: '0.4s' }}>
            🏃
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-gradient-to-t from-purple-900/80 to-transparent z-10">
        <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
          🎮
        </div>
        <h3 className="text-2xl font-bold text-handwritten text-pink-300 mb-2">
          Game Arcade
        </h3>
        <p className="text-purple-200 text-sm text-center">
          Play together, laugh together
        </p>
      </div>

      {/* Glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-500/20 to-transparent animate-pulse" />
      </div>
    </div>
  )
}
