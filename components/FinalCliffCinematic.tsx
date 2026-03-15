'use client'

import { useEffect, useState } from 'react'
import { Memory } from '@/lib/supabase'

interface FinalCliffCinematicProps {
  memories: Memory[]
  finalMessage: string
  onComplete: () => void
}

export default function FinalCliffCinematic({
  memories,
  finalMessage,
  onComplete,
}: FinalCliffCinematicProps) {
  const [showContinue, setShowContinue] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowContinue(true), 6000)
    const autoClose = setTimeout(onComplete, 100000)
    return () => {
      clearTimeout(timer)
      clearTimeout(autoClose)
    }
  }, [onComplete])

  const featuredMemories = memories.filter((m) => m.visible).slice(0, 3)
  const defaultMessage =
    'No matter how big this universe becomes, my favorite place will always be right beside you.'

  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center overflow-y-auto pointer-events-none">
      <div className="pointer-events-auto absolute inset-0 bg-gradient-to-b from-black via-slate-950 to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(236,72,153,0.25),transparent_55%),radial-gradient(circle_at_80%_30%,rgba(129,140,248,0.3),transparent_50%),radial-gradient(circle_at_50%_90%,rgba(236,72,153,0.15),transparent_55%)]" />

      {/* Starfield */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(60)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/60 blur-[1px] animate-pulse"
            style={{
              width: 2,
              height: 2,
              left: `${(i * 37) % 100}%`,
              top: `${(i * 59) % 100}%`,
              animationDuration: `${4 + (i % 5)}s`,
              animationDelay: `${i * 0.12}s`,
              opacity: 0.4 + (i % 5) * 0.1,
            }}
          />
        ))}
      </div>

      <div className="relative z-[61] w-full max-w-2xl sm:max-w-3xl md:max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 text-center">
        {/* Intro */}
        <div className="mb-6 sm:mb-8 md:mb-10">
          <p className="text-lg sm:text-xl md:text-2xl text-pink-200 mb-2 font-medium text-handwritten">
            So… you chose to stay in my universe.
          </p>
          <p className="text-xs sm:text-sm md:text-base text-purple-200/80">
            Watch as our story turns into stars.
          </p>
        </div>

        {/* Memory stars */}
        <div className="flex justify-center gap-4 sm:gap-6 md:gap-10 mb-6 sm:mb-8 md:mb-10">
          {featuredMemories.length > 0 ? (
            featuredMemories.map((memory, index) => (
              <div
                key={memory.id}
                className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-pink-500/60 via-purple-500/70 to-indigo-500/60 shadow-[0_0_32px_rgba(236,72,153,0.6)] overflow-hidden border border-pink-200/40 flex-shrink-0"
              >
                <div className="absolute inset-[2px] sm:inset-[3px] rounded-full overflow-hidden">
                  <img
                    src={memory.image_url}
                    alt={memory.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="absolute inset-0 rounded-full bg-pink-300/10 mix-blend-screen" />
                <div className="absolute -inset-1 rounded-full border border-pink-300/30 blur-[1px]" />
                <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.6),transparent_40%)]" />
                <span className="absolute -bottom-5 sm:-bottom-6 left-1/2 -translate-x-1/2 text-[9px] sm:text-[10px] md:text-xs text-pink-100/80 whitespace-nowrap max-w-[4rem] sm:max-w-[5rem] md:max-w-[6rem] truncate">
                  {index === 0 && 'The day we first met'}
                  {index === 1 && 'Our first adventure'}
                  {index === 2 && 'The moment I knew'}
                </span>
              </div>
            ))
          ) : (
            <div className="flex justify-center gap-4">
              {['💕', '✨', '💖'].map((e, i) => (
                <span key={i} className="text-4xl sm:text-5xl md:text-6xl opacity-80 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}>{e}</span>
              ))}
            </div>
          )}
        </div>

        {/* Narration */}
        <div className="space-y-3 sm:space-y-4 md:space-y-5 mb-6 sm:mb-8 md:mb-10 text-xs sm:text-sm md:text-base text-purple-100/90 max-w-xl mx-auto leading-relaxed">
          <p>Every memory became a star, quietly keeping our story in its light.</p>
          <p>The day we met, the way you laughed, the way you looked at me—none of it ever really left.</p>
          <p>Somewhere between all those little moments, you quietly became my favorite part of the universe.</p>
        </div>

        {/* Constellation */}
        <div className="relative h-24 sm:h-28 md:h-40 mb-6 sm:mb-8 md:mb-10 flex items-center justify-center">
          <svg
            className="w-40 h-24 sm:w-52 sm:h-32 md:w-72 md:h-40"
            viewBox="0 0 200 120"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden
          >
            <defs>
              <linearGradient id="cinematicConstellationStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F9A8D4" />
                <stop offset="100%" stopColor="#A5B4FC" />
              </linearGradient>
            </defs>
            <path
              d="M20,60 C40,20 80,20 100,60 C120,100 160,100 180,60"
              fill="none"
              stroke="url(#cinematicConstellationStroke)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: 'drop-shadow(0 0 8px rgba(248, 113, 113, 0.8))' }}
            />
            {[20, 60, 100, 140, 180].map((cx, idx) => (
              <circle
                key={idx}
                cx={cx}
                cy={idx === 2 ? 60 : idx % 2 === 0 ? 60 : 40 + idx * 10}
                r={4}
                fill="#F9A8D4"
              />
            ))}
          </svg>
        </div>

        {/* Future */}
        <div className="mb-6 sm:mb-8 md:mb-10">
          <p className="text-xs sm:text-sm md:text-base text-purple-100/90 mb-1">All these stars are our past and present.</p>
          <p className="text-sm sm:text-base md:text-lg text-pink-200 font-medium text-handwritten">
            But the best part of our story hasn&apos;t happened yet.
          </p>
        </div>

        {/* Final star + message */}
        <div className="relative inline-flex items-center justify-center mb-4 sm:mb-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-pink-500 via-fuchsia-500 to-purple-500 shadow-[0_0_48px_rgba(236,72,153,0.8)] flex items-center justify-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-white/10 border border-pink-100/60 flex items-center justify-center">
              <span className="text-2xl sm:text-3xl md:text-4xl">★</span>
            </div>
          </div>
          <div className="absolute -inset-4 sm:-inset-6 rounded-full bg-pink-400/10 blur-3xl" />
        </div>

        <p className="text-sm sm:text-base md:text-lg text-purple-100/95 max-w-xl sm:max-w-2xl mx-auto leading-relaxed font-medium text-handwritten">
          {finalMessage || defaultMessage}
        </p>

        <p className="mt-4 sm:mt-6 text-[10px] sm:text-xs text-purple-400/80 tracking-wide uppercase">
          Our story continues…
        </p>

        {/* Continue button — appears after a few seconds, allows early dismiss */}
        {showContinue && (
          <div className="mt-8 sm:mt-10 pointer-events-auto">
            <button
              onClick={onComplete}
              className="min-h-[48px] px-8 sm:px-10 py-3 sm:py-4 rounded-2xl bg-pink-500/90 hover:bg-pink-500 border-2 border-pink-400/50 text-white font-bold text-sm sm:text-base transition-all duration-300 shadow-lg hover:shadow-[0_0_24px_rgba(236,72,153,0.4)] transform hover:scale-105 active:scale-95 touch-manipulation"
            >
              Continue to our world
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
