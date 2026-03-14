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
        const statsIdBase = 'gf_world'
        const shouldIncrementGf = role === 'gf'

        // Always load gf_world stats for unlocking logic
        const { data, error } = await supabase
          .from('visit_stats')
          .select('*')
          .eq('id', statsIdBase)
          .limit(1)

        if (error) throw error

        const existing = data && data.length > 0 ? data[0] : null
        let nextCount = existing ? existing.visit_count || 0 : 0

        if (shouldIncrementGf) {
          if (existing) {
            nextCount = (existing.visit_count || 0) + 1
            await supabase
              .from('visit_stats')
              .update({
                visit_count: nextCount,
                last_visit: new Date().toISOString(),
              })
              .eq('id', statsIdBase)
          } else {
            const { data: inserted, error: insertError } = await supabase
              .from('visit_stats')
              .insert({
                id: statsIdBase,
                visit_count: 1,
                last_visit: new Date().toISOString(),
              })
              .select('*')

            if (insertError) throw insertError
            if (inserted && inserted.length > 0) {
              nextCount = inserted[0].visit_count
            } else {
              nextCount = 1
            }
          }
        }

        setVisitCount(nextCount)
      } catch (err) {
        console.error('Error updating visit stats:', err)
        // Fallback: at least allow page to render
        setVisitCount(1)
      }
    }

    updateVisitStats()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('userRole')
    router.push('/')
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
        onClick={handleLogout}
        className="fixed top-4 right-4 z-50 px-4 py-2 rounded-xl bg-purple-900/60 backdrop-blur-sm border-2 border-purple-500/50 hover:border-pink-500/50 text-purple-200 hover:text-pink-300 transition-all duration-300 text-sm font-semibold hover:glow-soft"
      >
        Logout
      </button>
      <WorldMap visitCount={visitCount} />
    </div>
  )
}
