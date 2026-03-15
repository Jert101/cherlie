'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { Poem } from '@/lib/supabase'

interface RiverOfPoemProps {
  poems: Poem[]
  onClick: () => void
}

export default function RiverOfPoem({ poems, onClick }: RiverOfPoemProps) {
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
      className="relative h-full min-h-[200px] bg-gradient-to-br from-cyan-900/20 via-purple-900/30 to-pink-900/20 backdrop-blur-sm rounded-2xl border-2 border-cyan-500/30 cursor-pointer hover:border-pink-500/50 transition-all duration-300 hover:glow-soft overflow-hidden group"
    >
      {/* Flowing river shimmer */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent animate-pulse opacity-60" style={{ animationDuration: '4s' }} />
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute w-full h-8 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-full animate-float"
            style={{
              top: `${25 + i * 25}%`,
              animationDelay: `${i * 1.2}s`,
              animationDuration: `${6 + i}s`,
            }}
          />
        ))}
      </div>

      {/* Floating sparkles / ink drops */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className="absolute text-2xl md:text-3xl opacity-40 group-hover:opacity-70 transition-opacity animate-float"
            style={{
              left: `${15 + i * 20}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${5 + i * 0.5}s`,
            }}
          >
            ✨
          </span>
        ))}
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-gradient-to-t from-purple-900/85 via-transparent to-cyan-900/20 z-10">
        <div className="text-5xl md:text-6xl mb-3 group-hover:scale-110 transition-transform duration-300">
          🌊
        </div>
        <h3 className="text-xl md:text-2xl font-bold text-handwritten text-cyan-200 mb-1">
          River of Poem
        </h3>
        <p className="text-purple-200/90 text-sm text-center">
          {poems.length === 0
            ? 'Words that flow like water to you'
            : `${poems.length} poem${poems.length !== 1 ? 's' : ''} written for you`}
        </p>
      </div>

      {/* Soft glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-500/10 to-transparent animate-pulse" />
      </div>
    </div>
  )
}
