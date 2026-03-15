'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { supabase, SiteSettings, Memory } from '@/lib/supabase'
import FinalCliffCinematic from '@/components/FinalCliffCinematic'

interface FinalCliffModalProps {
  onClose: () => void
  memories: Memory[]
}

export default function FinalCliffModal({ onClose, memories }: FinalCliffModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [showConfession, setShowConfession] = useState(false)
  const [showCinematic, setShowCinematic] = useState(false)

  useEffect(() => {
    loadSettings()
    if (modalRef.current && overlayRef.current) {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5 })
      gsap.fromTo(modalRef.current, { opacity: 0, scale: 0.9, y: 40 }, { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: 'power3.out' })
    }
    return () => {
      if (modalRef.current) gsap.killTweensOf(modalRef.current)
      if (overlayRef.current) gsap.killTweensOf(overlayRef.current)
    }
  }, [])

  const loadSettings = async () => {
    try {
      const { data } = await supabase.from('site_settings').select('*').single()
      if (data) setSettings(data)
    } catch (err) {
      console.error('Error loading settings:', err)
    }
  }

  const handleClose = () => {
    if (showCinematic) {
      requestAnimationFrame(() => requestAnimationFrame(() => onClose()))
      return
    }
    if (modalRef.current && overlayRef.current) {
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.35 })
      gsap.to(modalRef.current, {
        opacity: 0,
        scale: 0.95,
        y: 20,
        duration: 0.35,
        onComplete: () => {
          if (modalRef.current) gsap.killTweensOf(modalRef.current)
          if (overlayRef.current) gsap.killTweensOf(overlayRef.current)
          requestAnimationFrame(() => requestAnimationFrame(() => onClose()))
        }
      })
    } else {
      onClose()
    }
  }

  const handleReveal = () => {
    setShowConfession(true)
  }

  const handleStartCinematic = () => {
    setShowCinematic(true)
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/70 backdrop-blur-md overflow-y-auto"
      onClick={handleClose}
    >
      {showCinematic ? (
        <FinalCliffCinematic
          memories={memories}
          finalMessage={
            settings?.final_message ||
            'No matter how big this universe becomes, my favorite place will always be right beside you.'
          }
          onComplete={handleClose}
        />
      ) : (
        <div
          ref={modalRef}
          className="relative my-auto w-full max-w-2xl sm:max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl border-2 border-pink-500/50 shadow-2xl bg-gradient-to-br from-purple-900/98 via-pink-900/95 to-purple-950/98 backdrop-blur-xl glow"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Subtle magical sparkles */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl sm:rounded-3xl">
            {[...Array(6)].map((_, i) => (
              <span
                key={i}
                className="absolute text-lg sm:text-xl opacity-30"
                style={{
                  left: `${15 + i * 18}%`,
                  top: `${20 + (i % 3) * 25}%`,
                  animation: 'pulse 3s ease-in-out infinite',
                  animationDelay: `${i * 0.2}s`,
                }}
              >
                ✨
              </span>
            ))}
          </div>

          {!showConfession ? (
            <div className="relative z-10 px-5 py-8 sm:p-8 md:p-10 text-center">
              <div className="text-5xl sm:text-6xl md:text-7xl mb-4 sm:mb-6 animate-pulse" aria-hidden>🌅</div>
              <p className="text-[10px] sm:text-xs uppercase tracking-widest text-pink-300/80 mb-2">Where our story peaks</p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-handwritten text-pink-300 mb-3 sm:mb-4">
                The Final Cliff
              </h2>
              <p className="text-purple-200 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-xl mx-auto leading-relaxed">
                You&apos;ve walked through our memories, opened our letters, played in our little world, and found the surprises I left for you.
              </p>
              <p className="text-pink-200/95 text-base sm:text-lg md:text-xl mb-6 sm:mb-8 font-medium text-handwritten">
                There&apos;s one more thing I need to say…
              </p>
              <button
                onClick={handleReveal}
                className="min-h-[48px] sm:min-h-[52px] px-8 sm:px-10 md:px-12 py-3 sm:py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-base sm:text-lg md:text-xl hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-[0_0_28px_rgba(236,72,153,0.4)] transform hover:scale-105 active:scale-95 touch-manipulation"
              >
                Reveal it
              </button>
            </div>
          ) : (
            <div className="relative z-10 px-5 py-8 sm:p-8 md:p-10 text-center">
              <div className="text-5xl sm:text-6xl md:text-7xl mb-4 sm:mb-6 animate-pulse" aria-hidden>💕</div>
              <p className="text-[10px] sm:text-xs uppercase tracking-widest text-pink-300/80 mb-3">This is my heart asking yours</p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-handwritten text-pink-300 mb-6 sm:mb-8 max-w-xl mx-auto leading-tight">
                {settings?.final_message || 'Will you be mine forever?'}
              </h2>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <button
                  onClick={handleStartCinematic}
                  className="min-h-[48px] sm:min-h-[52px] px-8 sm:px-10 md:px-12 py-3 sm:py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-base sm:text-lg md:text-xl hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-[0_0_28px_rgba(236,72,153,0.4)] transform hover:scale-105 active:scale-95 touch-manipulation"
                >
                  Yes, of course
                </button>
                <button
                  onClick={handleStartCinematic}
                  className="min-h-[48px] sm:min-h-[52px] px-8 sm:px-10 md:px-12 py-3 sm:py-4 rounded-2xl bg-gradient-to-r from-pink-500/90 to-purple-600/90 text-white font-bold text-base sm:text-lg border-2 border-pink-400/50 hover:border-pink-300/60 transition-all duration-300 transform hover:scale-105 active:scale-95 touch-manipulation"
                >
                  Yes
                </button>
              </div>
            </div>
          )}

          <button
            onClick={handleClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full text-purple-300 hover:text-pink-300 hover:bg-pink-500/20 text-2xl sm:text-3xl transition-colors touch-manipulation"
            aria-label="Close"
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}
