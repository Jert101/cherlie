'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { gsap } from 'gsap'
import { supabase, SiteSettings } from '@/lib/supabase'
import ParticleField from '@/components/ParticleField'
import TimeLockGuard from '@/components/TimeLockGuard'
import { createSpeedOfLightAnimation } from '@/lib/speedOfLightAnimation'

const WELCOME_STATS_ID = 'gf_welcome'

function getWelcomeCopy(visitCount: number, gfName: string): { headline: string; subtext: string; badge: string | null } {
  const name = gfName || 'baby'
  if (visitCount <= 1) {
    return {
      headline: `Welcome to our world, ${name}.`,
      subtext: 'Ready for the surprise?',
      badge: null,
    }
  }
  if (visitCount === 2) {
    return {
      headline: `You came back, ${name}.`,
      subtext: 'My heart still does that thing when I see you.',
      badge: 'Your second return',
    }
  }
  if (visitCount === 3) {
    return {
      headline: `Third time’s the charm. Or maybe it’s just you.`,
      subtext: 'I left a little something new for you inside.',
      badge: 'Time #3',
    }
  }
  if (visitCount <= 5) {
    return {
      headline: `You’re here again, ${name}.`,
      subtext: `Visit #${visitCount} — I still get butterflies every time.`,
      badge: null,
    }
  }
  if (visitCount <= 9) {
    return {
      headline: 'You keep coming back.',
      subtext: 'That’s the best gift. Our world gets a little brighter each time you’re here.',
      badge: `Return #${visitCount}`,
    }
  }
  return {
    headline: 'You’ve been here so many times.',
    subtext: 'This place is ours. The fact that you keep returning is my favorite plot twist.',
    badge: `${visitCount} returns`,
  }
}

export default function WelcomePage() {
  const [mounted, setMounted] = useState(false)
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [welcomeVisitCount, setWelcomeVisitCount] = useState<number>(1)
  const [copyReady, setCopyReady] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const role = localStorage.getItem('userRole')
    if (role !== 'gf' && role !== 'bf') {
      router.push('/')
      return
    }

    loadSettings()
    updateWelcomeVisitCount(role === 'gf')
  }, [router])

  async function updateWelcomeVisitCount(shouldIncrement: boolean) {
    try {
      // Only count as a new session when she came from code entry (after logout or 30 min auto-logout)
      const fromCodeEntry = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('welcomeFromCodeEntry') === '1'
      if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem('welcomeFromCodeEntry')

      const { data: existing } = await supabase
        .from('visit_stats')
        .select('*')
        .eq('id', WELCOME_STATS_ID)
        .limit(1)

      const current = existing && existing.length > 0 ? existing[0].visit_count || 0 : 0
      let nextCount = current

      if (shouldIncrement && fromCodeEntry) {
        nextCount = current + 1
        if (existing && existing.length > 0) {
          await supabase
            .from('visit_stats')
            .update({ visit_count: nextCount, last_visit: new Date().toISOString() })
            .eq('id', WELCOME_STATS_ID)
        } else {
          await supabase.from('visit_stats').insert({
            id: WELCOME_STATS_ID,
            visit_count: nextCount,
            last_visit: new Date().toISOString(),
          })
        }
      }

      setWelcomeVisitCount(nextCount)
      setCopyReady(true)
    } catch (err) {
      console.error('Error updating welcome visit:', err)
      setWelcomeVisitCount(1)
      setCopyReady(true)
    }
  }

  const loadSettings = async () => {
    try {
      const { data } = await supabase.from('site_settings').select('*').single()
      if (data) setSettings(data)
    } catch (err) {
      console.error('Error loading settings:', err)
    }
  }

  useEffect(() => {
    if (!copyReady || !mounted) return
    gsap.fromTo('.welcome-content', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' })
  }, [copyReady, mounted])

  const handleYes = () => {
    gsap.to('.welcome-content', {
      opacity: 0,
      scale: 0.1,
      duration: 0.3,
      ease: 'power2.in',
    })
    createSpeedOfLightAnimation(() => router.push('/planet'))
  }

  const handleNo = () => {
    const noButton = document.querySelector('.no-button')
    const yesButton = document.querySelector('.yes-button')
    if (noButton && yesButton) {
      gsap.to(noButton, { scale: 0.1, opacity: 0, duration: 0.3, ease: 'back.in(1.7)' })
      gsap.to(yesButton, { scale: 1.2, duration: 0.5, ease: 'elastic.out(1, 0.5)', repeat: 1, yoyo: true })
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('userRole')
    router.push('/')
  }

  if (!mounted || !copyReady) {
    return (
      <TimeLockGuard>
        <div className="relative min-h-screen cosmic-gradient flex items-center justify-center">
          <ParticleField />
          <p className="relative z-10 text-pink-300/80 text-handwritten text-lg">Opening our world…</p>
        </div>
      </TimeLockGuard>
    )
  }

  const { headline, subtext, badge } = getWelcomeCopy(welcomeVisitCount, settings?.gf_name ?? '')

  return (
    <TimeLockGuard>
    <div className="relative min-h-screen cosmic-gradient flex items-center justify-center overflow-hidden">
      <ParticleField />
      <button
        onClick={handleLogout}
        className="fixed top-4 right-4 z-50 px-4 py-2 rounded-xl bg-purple-900/60 backdrop-blur-sm border-2 border-purple-500/50 hover:border-pink-500/50 text-purple-200 hover:text-pink-300 transition-all duration-300 text-sm font-semibold hover:glow-soft"
      >
        Logout
      </button>

      <div className="welcome-content relative z-10 text-center px-4 sm:px-6 max-w-2xl">
        {badge && (
          <p className="text-xs sm:text-sm uppercase tracking-widest text-pink-300/80 mb-3 sm:mb-4 animate-pulse">
            ✦ {badge} ✦
          </p>
        )}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 text-handwritten text-pink-300 glow-soft leading-tight">
          {headline}
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-purple-200 mb-8 sm:mb-10 md:mb-12 max-w-xl mx-auto">
          {subtext}
        </p>

        <div className="flex gap-4 sm:gap-6 justify-center items-center flex-wrap">
          <button
            onClick={handleYes}
            className="yes-button px-8 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-lg sm:text-xl hover:from-pink-600 hover:to-purple-700 transition-all duration-300 glow hover:glow-soft transform hover:scale-110 active:scale-95 cursor-pointer"
          >
            YES
          </button>
          <button
            onClick={handleNo}
            className="no-button px-8 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6 rounded-2xl bg-purple-800/50 border-2 border-purple-500/50 text-purple-200 font-bold text-lg sm:text-xl hover:border-pink-500/50 transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            NO
          </button>
        </div>
      </div>
    </div>
    </TimeLockGuard>
  )
}
