'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { gsap } from 'gsap'
import { supabase, SiteSettings } from '@/lib/supabase'
import ParticleField from '@/components/ParticleField'
import { createSpeedOfLightAnimation } from '@/lib/speedOfLightAnimation'

export default function WelcomePage() {
  const [mounted, setMounted] = useState(false)
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const role = localStorage.getItem('userRole')
    if (role !== 'gf') {
      router.push('/')
      return
    }

    loadSettings()

    // Animate entrance
    gsap.fromTo('.welcome-content', 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
    )
  }, [router])

  const loadSettings = async () => {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('*')
        .single()
      if (data) setSettings(data)
    } catch (err) {
      console.error('Error loading settings:', err)
    }
  }

  const handleYes = () => {
    // Fade out welcome content
    gsap.to('.welcome-content', {
      opacity: 0,
      scale: 0.1,
      duration: 0.3,
      ease: 'power2.in'
    })
    
    // Create speed of light travel animation
    createSpeedOfLightAnimation(() => {
      router.push('/planet')
    })
  }

  const handleNo = () => {
    const noButton = document.querySelector('.no-button')
    const yesButton = document.querySelector('.yes-button')
    
    if (noButton && yesButton) {
      gsap.to(noButton, {
        scale: 0.1,
        opacity: 0,
        duration: 0.3,
        ease: 'back.in(1.7)'
      })
      
      gsap.to(yesButton, {
        scale: 1.2,
        duration: 0.5,
        ease: 'elastic.out(1, 0.5)',
        repeat: 1,
        yoyo: true
      })
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('userRole')
    router.push('/')
  }

  if (!mounted) return null

  return (
    <div className="relative min-h-screen cosmic-gradient flex items-center justify-center overflow-hidden">
      <ParticleField />
      <button
        onClick={handleLogout}
        className="fixed top-4 right-4 z-50 px-4 py-2 rounded-xl bg-purple-900/60 backdrop-blur-sm border-2 border-purple-500/50 hover:border-pink-500/50 text-purple-200 hover:text-pink-300 transition-all duration-300 text-sm font-semibold hover:glow-soft"
      >
        Logout
      </button>
      
      <div className="welcome-content relative z-10 text-center px-6 max-w-2xl">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-handwritten text-pink-300 glow-soft">
          Welcome to our world, <span className="text-pink-400">{settings?.gf_name || 'baby'}</span>.
        </h1>
        <p className="text-2xl md:text-3xl text-purple-200 mb-12">
          Ready for the surprise?
        </p>

        <div className="flex gap-6 justify-center items-center flex-wrap">
          <button
            onClick={handleYes}
            className="yes-button px-12 py-6 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xl hover:from-pink-600 hover:to-purple-700 transition-all duration-300 glow hover:glow-soft transform hover:scale-110 active:scale-95 cursor-pointer"
          >
            YES
          </button>
          
          <button
            onClick={handleNo}
            className="no-button px-12 py-6 rounded-2xl bg-purple-800/50 border-2 border-purple-500/50 text-purple-200 font-bold text-xl hover:border-pink-500/50 transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            NO
          </button>
        </div>
      </div>
    </div>
  )
}
