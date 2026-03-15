'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

/**
 * When time lock is enabled and we're before unlock_date, clear all login state
 * and redirect to code entry so the user sees the countdown. All accounts
 * (gf, bf, admin) are logged out until the timer is done.
 */
export default function TimeLockGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [allowed, setAllowed] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false

    async function check() {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('time_lock_enabled, unlock_date')
          .single()

        if (cancelled) return

        if (data?.time_lock_enabled && data?.unlock_date) {
          const unlockAt = new Date(data.unlock_date).getTime()
          const now = Date.now()
          if (now < unlockAt) {
            localStorage.removeItem('userRole')
            if (typeof sessionStorage !== 'undefined') {
              sessionStorage.removeItem('welcomeFromCodeEntry')
            }
            router.replace('/')
            setAllowed(false)
            return
          }
        }
        setAllowed(true)
      } catch {
        if (!cancelled) setAllowed(true)
      }
    }

    check()
    return () => { cancelled = true }
  }, [router])

  if (allowed === null) {
    return (
      <div className="flex items-center justify-center min-h-screen cosmic-gradient">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mx-auto mb-4" />
          <p className="text-pink-300 text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  if (allowed === false) {
    return null
  }

  return <>{children}</>
}
