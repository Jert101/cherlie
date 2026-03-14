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
      gsap.fromTo(overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5 }
      )
      gsap.fromTo(modalRef.current,
        { opacity: 0, scale: 0.8, y: 100 },
        { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: 'power3.out' }
      )
    }
  }, [])

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

  const handleClose = () => {
    // During cinematic, just close immediately without modal animation
    if (showCinematic) {
      onClose()
      return
    }

    if (modalRef.current && overlayRef.current) {
      gsap.to(modalRef.current, {
        opacity: 0,
        scale: 0.8,
        y: 100,
        duration: 0.4,
        onComplete: onClose
      })
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.4
      })
    } else {
      onClose()
    }
  }

  const handleReveal = () => {
    setShowConfession(true)
  }

  const handleStartCinematic = () => {
    // Debug: verify button click wiring
    console.log('[FinalCliffModal] Starting cinematic')
    setShowCinematic(true)
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
      onClick={handleClose}
    >
      {showCinematic ? (
        // Full-screen cinematic takes over the overlay
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
          className="relative bg-gradient-to-br from-purple-900/98 via-pink-900/95 to-purple-950/98 backdrop-blur-xl rounded-3xl border-2 border-pink-500/50 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden glow"
          onClick={(e) => e.stopPropagation()}
        >
          {!showConfession ? (
              <div className="p-8 text-center">
                <div className="text-7xl mb-6 animate-pulse">🌅</div>
                <h2 className="text-4xl font-bold text-handwritten text-pink-300 mb-4">
                  Final Cliff
                </h2>
                <p className="text-purple-200 text-lg mb-8">
                  You&apos;ve explored our world, seen our memories, read our letters, played our games, and found our surprises.
                </p>
                <p className="text-pink-300 text-xl mb-8 font-semibold">
                  Are you ready for what&apos;s next?
                </p>
                <button
                  onClick={handleReveal}
                  className="px-12 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xl hover:from-pink-600 hover:to-purple-700 transition-all duration-300 glow hover:glow-soft transform hover:scale-110 active:scale-95"
                >
                  Reveal
                </button>
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="confession-text mb-8">
                  <div className="text-6xl mb-6 animate-pulse">💕</div>
                  <h2 className="text-5xl font-bold text-handwritten text-pink-300 mb-6">
                    {settings?.final_message || 'Will you be mine forever?'}
                  </h2>
                </div>
                
                <div className="confession-buttons flex gap-4 justify-center">
                  <button
                    onClick={handleStartCinematic}
                    className="px-12 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xl hover:from-pink-600 hover:to-purple-700 transition-all duration-300 glow hover:glow-soft transform hover:scale-110 active:scale-95"
                  >
                    YES OF COURSE
                  </button>
                  <button
                    onClick={handleStartCinematic}
                    className="px-12 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xl hover:from-pink-600 hover:to-purple-700 transition-all duration-300 glow hover:glow-soft transform hover:scale-110 active:scale-95"
                  >
                    YES
                  </button>
                </div>
              </div>
          )}

          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-purple-300 hover:text-pink-300 text-3xl transition-colors w-12 h-12 flex items-center justify-center rounded-full hover:bg-pink-500/20"
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}
