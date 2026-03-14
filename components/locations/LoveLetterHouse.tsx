'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { Letter } from '@/lib/supabase'

interface LoveLetterHouseProps {
  letters: Letter[]
  onClick: () => void
}

export default function LoveLetterHouse({ letters, onClick }: LoveLetterHouseProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.4 }
      )
    }
  }, [])

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      className="relative h-full min-h-[200px] bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-sm rounded-2xl border-2 border-pink-500/30 cursor-pointer hover:border-pink-500/60 transition-all duration-300 hover:glow-soft overflow-hidden group"
    >
      {/* Floating envelopes */}
      <div className="absolute inset-0 flex items-center justify-center">
        {letters.slice(0, 5).map((_, i) => (
          <div
            key={i}
            className="absolute text-5xl animate-float opacity-60"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 2) * 30}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${5 + i * 0.3}s`
            }}
          >
            💌
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-gradient-to-t from-purple-900/80 to-transparent z-10">
        <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
          💌
        </div>
        <h3 className="text-2xl font-bold text-handwritten text-pink-300 mb-2">
          Love Letter House
        </h3>
        <p className="text-purple-200 text-sm text-center">
          {letters.length} letters from the heart
        </p>
      </div>

      {/* Glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-500/20 to-transparent animate-pulse" />
      </div>
    </div>
  )
}
