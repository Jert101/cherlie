'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, SiteSettings } from '@/lib/supabase'
import ParticleField from './ParticleField'

export default function CodeEntry() {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [timeLocked, setTimeLocked] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadSettings()
  }, [])

  useEffect(() => {
    if (settings?.time_lock_enabled && settings.unlock_date) {
      checkTimeLock()
      const interval = setInterval(checkTimeLock, 1000)
      return () => clearInterval(interval)
    }
  }, [settings])

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single()

      if (error) throw error
      setSettings(data)
    } catch (err) {
      console.error('Error loading settings:', err)
    }
  }

  const checkTimeLock = () => {
    if (!settings?.unlock_date) return

    const unlockDate = new Date(settings.unlock_date)
    const now = new Date()
    const diff = unlockDate.getTime() - now.getTime()

    if (diff > 0) {
      setTimeLocked(true)
      setCountdown(Math.ceil(diff / 1000))
    } else {
      setTimeLocked(false)
      setCountdown(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      let currentSettings = settings
      if (!currentSettings) {
        await loadSettings()
        // Reload settings after fetching
        const { data } = await supabase
          .from('site_settings')
          .select('*')
          .single()
        currentSettings = data
      }

      if (!currentSettings) {
        setError('Unable to load settings. Please try again.')
        return
      }

      if (code === currentSettings.gf_code) {
        // GF code - go to welcome screen
        localStorage.setItem('userRole', 'gf')
        router.push('/welcome')
      } else if (currentSettings.bf_code && code === currentSettings.bf_code) {
        // BF code - secret access to GF world
        localStorage.setItem('userRole', 'bf')
        router.push('/welcome')
      } else if (code === currentSettings.admin_code) {
        // Admin code - go to admin panel
        localStorage.setItem('userRole', 'admin')
        router.push('/admin')
      } else {
        setError("Hmm… that's not the key. Try again ❤️")
        setCode('')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formatCountdown = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (days > 0) return `${days}d ${hours}h ${minutes}m ${secs}s`
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`
    if (minutes > 0) return `${minutes}m ${secs}s`
    return `${secs}s`
  }

  return (
    <div className="relative min-h-screen cosmic-gradient flex items-center justify-center overflow-hidden">
      <ParticleField />
      
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-handwritten text-pink-300 glow-soft">
            {settings?.site_name || 'Our World'}
          </h1>
          <p className="text-purple-200 text-lg">Enter the key to begin</p>
        </div>

        {timeLocked && countdown !== null && (
          <div className="mb-6 p-6 rounded-2xl bg-purple-900/30 backdrop-blur-sm border border-pink-500/30 glow-soft">
            <p className="text-center text-pink-200 mb-2">
              ⏰ This world will unlock in:
            </p>
            <p className="text-center text-3xl font-bold text-pink-300 text-handwritten">
              {formatCountdown(countdown)}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter your code..."
              disabled={loading || timeLocked}
              className="w-full px-6 py-4 rounded-2xl bg-purple-900/40 backdrop-blur-sm border-2 border-purple-500/50 text-white placeholder-purple-300 focus:outline-none focus:border-pink-500 focus:glow transition-all duration-300 text-lg"
              autoFocus
            />
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-900/30 border border-red-500/50 text-red-200 text-center animate-pulse">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !code.trim() || timeLocked}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold text-lg hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 glow hover:glow-soft transform hover:scale-105 active:scale-95"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin mr-2">✨</span>
                Entering...
              </span>
            ) : (
              'Enter World'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
