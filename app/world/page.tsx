'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import WorldMap from '@/components/WorldMap'
import ParticleField from '@/components/ParticleField'
import { supabase } from '@/lib/supabase'

export default function WorldPage() {
  const [mounted, setMounted] = useState(false)
  const [visitCount, setVisitCount] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const role = localStorage.getItem('userRole')
    if (role !== 'gf' && role !== 'bf') {
      router.push('/')
      return
    }

    const updateVisitStats = async () => {
      try {
        // Use gf_welcome so the count matches the welcome page ("3rd time" = same number here and for moon)
        const WELCOME_STATS_ID = 'gf_welcome'
        const { data: welcomeData, error: welcomeError } = await supabase
          .from('visit_stats')
          .select('*')
          .eq('id', WELCOME_STATS_ID)
          .limit(1)

        if (welcomeError) throw welcomeError
        const welcomeRow = welcomeData && welcomeData.length > 0 ? welcomeData[0] : null
        const count = welcomeRow ? welcomeRow.visit_count || 0 : 0

        // Keep gf_world in sync for admin panel and moon unlock (same count as gf_welcome)
        if (role === 'gf' && count > 0) {
          const { data: worldData } = await supabase
            .from('visit_stats')
            .select('*')
            .eq('id', 'gf_world')
            .limit(1)
          const worldRow = worldData && worldData.length > 0 ? worldData[0] : null
          const worldCount = worldRow ? worldRow.visit_count || 0 : 0
          if (count > worldCount) {
            if (worldRow) {
              await supabase
                .from('visit_stats')
                .update({ visit_count: count, last_visit: new Date().toISOString() })
                .eq('id', 'gf_world')
            } else {
              await supabase
                .from('visit_stats')
                .insert({ id: 'gf_world', visit_count: count, last_visit: new Date().toISOString() })
            }
          }
        }

        setVisitCount(count > 0 ? count : 1)
      } catch (err) {
        console.error('Error updating visit stats:', err)
        setVisitCount(1)
      }
    }

    updateVisitStats()
  }, [router])

  const handleBackToPlanet = () => {
    router.push('/planet')
  }

  if (!mounted || visitCount === null) {
    return (
      <div className="flex items-center justify-center min-h-screen cosmic-gradient">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-pink-300 text-lg">Entering our world...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen cosmic-gradient overflow-x-hidden">
      <div className="hidden sm:block">
        <ParticleField />
      </div>
      <button
        onClick={handleBackToPlanet}
        className="fixed top-4 right-4 z-50 px-4 py-2 rounded-xl bg-purple-900/60 backdrop-blur-sm border-2 border-purple-500/50 hover:border-pink-500/50 text-purple-200 hover:text-pink-300 transition-all duration-300 text-sm font-semibold hover:glow-soft flex items-center gap-1.5"
      >
        <span aria-hidden>🌍</span>
        Back to the planet
      </button>
      {/* Top spacer so button never overlaps Today's message */}
      <div className="pt-14">
        <WorldMap visitCount={visitCount} />
      </div>
    </div>
  )
}
