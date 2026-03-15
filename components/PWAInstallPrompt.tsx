'use client'

import { useEffect, useState } from 'react'

const DISMISS_KEY = 'soluna-pwa-dismissed'
const DISMISS_DAYS = 7

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Already running as installed app (standalone)
    const standalone =
      typeof window !== 'undefined' &&
      (window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as Navigator & { standalone?: boolean }).standalone === true)
    if (standalone) {
      setIsInstalled(true)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      const dismissed = localStorage.getItem(DISMISS_KEY)
      if (dismissed) {
        const t = parseInt(dismissed, 10)
        if (Date.now() - t < DISMISS_DAYS * 24 * 60 * 60 * 1000) return
      }
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setShowPrompt(false)
    if (outcome === 'dismissed') {
      localStorage.setItem(DISMISS_KEY, Date.now().toString())
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem(DISMISS_KEY, Date.now().toString())
  }

  if (isInstalled || !showPrompt || !deferredPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[9999] flex justify-center pointer-events-none sm:left-auto sm:right-4 sm:bottom-4 sm:max-w-sm">
      <div className="pointer-events-auto flex items-center gap-3 rounded-2xl bg-black/80 backdrop-blur border border-pink-500/30 shadow-xl px-4 py-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white">Install SoLuna</p>
          <p className="text-xs text-pink-200/90">Add to home screen for a better experience</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleInstall}
            className="px-3 py-1.5 rounded-lg bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium transition-colors"
          >
            Install
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="p-1.5 rounded-lg text-pink-200/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Dismiss"
          >
            <span className="sr-only">Dismiss</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
