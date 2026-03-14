import type { Memory } from './supabase'

export type StarType = 'memory' | 'wish' | 'secret' | 'anniversary'

export interface BaseStarData {
  id: string
  type: StarType
  // Normalized sky coordinates in 2D space (-1..1)
  x: number
  y: number
}

export interface MemoryStarData extends BaseStarData {
  type: 'memory'
  memoryId: string
  title: string
  imageUrl: string
  date: string
  location?: string | null
}

/**
 * Deterministically build memory stars from memories.
 * Uses index-based angle distribution so stars feel evenly spread,
 * but stable across renders for the same list/order.
 */
export function buildMemoryStarsFromMemories(memories: Memory[]): MemoryStarData[] {
  if (!memories.length) return []

  const count = Math.min(memories.length, 40)

  return memories.slice(0, count).map((memory, index) => {
    const angle = (index / count) * Math.PI * 2
    const radius = 0.5 + (index % 5) * 0.08 // keep stars roughly in a band

    const x = Math.cos(angle) * radius
    const y = Math.sin(angle) * radius * 0.6 // slightly squash vertically

    return {
      id: `memory-star-${memory.id}`,
      type: 'memory' as const,
      memoryId: memory.id,
      title: memory.title,
      imageUrl: memory.image_url,
      date: memory.date,
      location: memory.location,
      x: Math.max(-1, Math.min(1, x)),
      y: Math.max(-1, Math.min(1, y)),
    }
  })
}

