'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { Prayer } from '@/lib/supabase'

interface PrayerWallProps {
  prayers: Prayer[]
  onClick: () => void
}

export default function PrayerWall({ prayers, onClick }: PrayerWallProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.6 })
    }
  }, [])

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      className="relative h-full min-h-[200px] bg-gradient-to-br from-slate-900/35 via-indigo-900/35 to-pink-900/25 backdrop-blur-sm rounded-2xl border-2 border-cyan-300/25 cursor-pointer hover:border-pink-300/50 transition-all duration-300 hover:glow-soft overflow-hidden group"
    >
      {/* Heavenly light rays */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[520px] h-[320px] bg-[radial-gradient(circle_at_50%_30%,rgba(34,211,238,0.35),transparent_60%)] blur-2xl opacity-60" />
        <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_20%_30%,rgba(236,72,153,0.16),transparent_55%),radial-gradient(circle_at_80%_70%,rgba(34,211,238,0.14),transparent_60%)]" />
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-[140%] h-10 bg-gradient-to-r from-transparent via-white/7 to-transparent rounded-full blur-md animate-float"
            style={{
              top: `${18 + i * 12}%`,
              left: `${-20 + (i % 2) * 10}%`,
              transform: `rotate(${(i % 2 === 0 ? 8 : -8) + i}deg)`,
              animationDelay: `${i * 0.35}s`,
              animationDuration: `${6.5 + i * 0.6}s`,
            }}
          />
        ))}
      </div>

      {/* Floating sparkles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <span
            key={i}
            className="absolute text-lg md:text-xl opacity-25 group-hover:opacity-45 transition-opacity animate-float"
            style={{
              left: `${8 + (i * 11) % 84}%`,
              top: `${14 + (i * 17) % 72}%`,
              animationDelay: `${i * 0.28}s`,
              animationDuration: `${4.5 + (i % 4)}s`,
            }}
          >
            ✧
          </span>
        ))}
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent z-10">
        <div className="text-6xl mb-3 group-hover:scale-110 transition-transform duration-300">
          🕯️
        </div>
        <h3 className="text-2xl font-bold text-handwritten text-cyan-100 mb-1 drop-shadow">
          Prayer Wall
        </h3>
        <p className="text-purple-100/85 text-sm text-center max-w-md">
          {prayers.length === 0
            ? 'A quiet place to leave a prayer for us—soft, sacred, and heard.'
            : `${prayers.length} prayer${prayers.length !== 1 ? 's' : ''} glowing in the light`}
        </p>
      </div>

      {/* Hover shimmer */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-300/10 to-transparent animate-pulse" />
      </div>
    </div>
  )
}

