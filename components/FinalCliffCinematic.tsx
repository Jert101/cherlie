'use client'

import { useEffect } from 'react'
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
  useEffect(() => {
    console.log('[FinalCliffCinematic] Mounted, starting auto-close timer')
    // Simple auto-close after a short cinematic duration
    const timer = setTimeout(() => {
      onComplete()
    }, 9000)

    return () => clearTimeout(timer)
  }, [onComplete])

  const featuredMemories = memories
    .filter((m) => m.visible)
    .slice(0, 3)

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none">
      <div className="cinematic-overlay absolute inset-0 bg-gradient-to-b from-black via-slate-950 to-black opacity-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(236,72,153,0.35),transparent_60%),radial-gradient(circle_at_80%_30%,rgba(129,140,248,0.4),transparent_55%),radial-gradient(circle_at_50%_90%,rgba(56,189,248,0.25),transparent_60%)]" />

        {/* Ambient starfield dots */}
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
                opacity: 0.5 + (i % 5) * 0.08,
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-[61] max-w-4xl mx-auto px-6 text-center text-purple-100 pointer-events-none">
        {/* Intro text */}
        <div className="cinematic-intro-text mb-10">
          <p className="text-xl md:text-2xl text-pink-200 mb-3">
            So… you chose to stay in my universe.
          </p>
          <p className="text-sm md:text-base text-purple-200/80">
            Watch as our story turns into stars.
          </p>
        </div>

        {/* Memory stars row */}
        <div className="flex justify-center gap-6 md:gap-10 mb-8 md:mb-10">
          {featuredMemories.map((memory, index) => (
            <div
              key={memory.id}
              className="cinematic-memory-star relative w-20 h-20 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-pink-500/60 via-purple-500/70 to-indigo-500/60 shadow-[0_0_40px_rgba(236,72,153,0.8)] overflow-hidden border border-pink-200/40"
            >
              <div className="absolute inset-[3px] rounded-full overflow-hidden">
                <img
                  src={memory.image_url}
                  alt={memory.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="absolute inset-0 rounded-full bg-pink-300/10 mix-blend-screen" />
              <div className="absolute -inset-1 rounded-full border border-pink-300/30 blur-[1px]" />
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.7),transparent_40%)]" />
              <div className="absolute inset-0 animate-pulse opacity-60">
                <div className="absolute -inset-4 rounded-full bg-pink-400/10 blur-2xl" />
              </div>
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] md:text-xs text-pink-100/80 whitespace-nowrap max-w-[6rem] truncate">
                {index === 0 && 'The day we first met'}
                {index === 1 && 'Our first adventure'}
                {index === 2 && 'The moment I knew'}
              </span>
            </div>
          ))}
        </div>

        {/* Memory captions */}
        <div className="space-y-4 md:space-y-5 mb-10 md:mb-12 text-sm md:text-base">
          <p className="cinematic-memory-caption text-purple-100/90">
            Every memory became a star, quietly keeping our story in its light.
          </p>
          <p className="cinematic-memory-caption text-purple-100/90">
            The day we met, the way you laughed, the way you looked at me—none
            of it ever really left.
          </p>
          <p className="cinematic-memory-caption text-purple-100/90">
            Somewhere between all those little moments, you quietly became my
            favorite part of the universe.
          </p>
        </div>

        {/* Constellation */}
        <div className="relative h-32 md:h-40 mb-10 md:mb-12 flex items-center justify-center">
          <svg
            className="w-52 h-32 md:w-72 md:h-40"
            viewBox="0 0 200 120"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient
                id="constellationStroke"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#F9A8D4" />
                <stop offset="100%" stopColor="#A5B4FC" />
              </linearGradient>
            </defs>
            <path
              className="cinematic-constellation-line"
              d="M20,60 C40,20 80,20 100,60 C120,100 160,100 180,60"
              fill="none"
              stroke="url(#constellationStroke)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: 'drop-shadow(0 0 8px rgba(248, 113, 113, 0.9))' }}
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

        {/* Future text */}
        <div className="cinematic-future-text mb-8 md:mb-10">
          <p className="text-sm md:text-base text-purple-100/90 mb-2">
            All these stars are our past and present.
          </p>
          <p className="text-base md:text-lg text-pink-200">
            But the best part of our story hasn&apos;t happened yet.
          </p>
        </div>

        {/* Final star + message */}
        <div className="cinematic-final-star relative inline-flex items-center justify-center mb-4 md:mb-6">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-pink-500 via-fuchsia-500 to-purple-500 shadow-[0_0_60px_rgba(236,72,153,0.9)] flex items-center justify-center">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/10 border border-pink-100/60 flex items-center justify-center">
              <span className="text-3xl md:text-4xl">★</span>
            </div>
          </div>
          <div className="absolute -inset-6 rounded-full bg-pink-400/10 blur-3xl" />
        </div>

        <p className="cinematic-final-message text-sm md:text-base text-purple-100/95 max-w-2xl mx-auto leading-relaxed">
          {finalMessage ||
            'No matter how big this universe becomes, my favorite place will always be right beside you.'}
        </p>

        <p className="mt-6 text-[11px] md:text-xs text-purple-400/80 tracking-wide uppercase">
          Our story continues…
        </p>
      </div>
    </div>
  )
}

