'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { Memory } from '@/lib/supabase'

interface MemoryGardenProps {
  memories: Memory[]
  onClick: () => void
}

export default function MemoryGarden({ memories, onClick }: MemoryGardenProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.2 }
      )
    }
  }, [])

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      className="relative h-full min-h-[200px] bg-gradient-to-br from-pink-900/30 to-purple-900/30 backdrop-blur-sm rounded-2xl border-2 border-pink-500/30 cursor-pointer hover:border-pink-500/60 transition-all duration-300 hover:glow-soft overflow-hidden group"
    >
      {/* Floating flowers/icons */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="grid grid-cols-3 gap-4 p-4">
          {[...Array(Math.min(memories.length, 9))].map((_, i) => (
            <div
              key={i}
              className="text-4xl animate-float"
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: `${4 + i * 0.5}s`
              }}
            >
              🌸
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-gradient-to-t from-purple-900/80 to-transparent">
        <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
          🌺
        </div>
        <h3 className="text-2xl font-bold text-handwritten text-pink-300 mb-2">
          Memory Garden
        </h3>
        <p className="text-purple-200 text-sm text-center">
          {memories.length} beautiful memories
        </p>
      </div>

      {/* Glow effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-500/20 to-transparent animate-pulse" />
      </div>
    </div>
  )
}
