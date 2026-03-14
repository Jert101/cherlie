'use client'

import type { MemoryStarData } from '@/lib/starUtils'

interface WorldStarSkyProps {
  memoryStars: MemoryStarData[]
}

export default function WorldStarSky({ memoryStars }: WorldStarSkyProps) {
  if (!memoryStars.length) return null

  return (
    <div className="absolute inset-0 pointer-events-none">
      {memoryStars.map((star) => {
        const left = ((star.x + 1) / 2) * 100
        const top = ((star.y + 1) / 2) * 100

        return (
          <div
            key={star.id}
            className="absolute"
            style={{
              left: `${left}%`,
              top: `${top}%`,
            }}
          >
            <div className="pointer-events-none w-[3px] h-[3px] rounded-full bg-pink-400/80 shadow-[0_0_8px_rgba(236,72,153,0.9)] animate-pulse-glow" />
          </div>
        )
      })}
    </div>
  )
}

