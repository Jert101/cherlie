'use client'

import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'

const INACTIVITY_MS = 30 * 60 * 1000 // 30 minutes

export default function InactivityLogout() {
  const router = useRouter()
  const pathname = usePathname()
  const lastActivityRef = useRef<number>(Date.now())
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const role = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null
    if (role !== 'gf' && role !== 'bf') return

    const clearTimer = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }

    const scheduleLogout = () => {
      clearTimer()
      timeoutRef.current = setTimeout(() => {
        localStorage.removeItem('userRole')
        router.push('/')
      }, INACTIVITY_MS)
    }

    const onActivity = () => {
      lastActivityRef.current = Date.now()
      scheduleLogout()
    }

    scheduleLogout()

    window.addEventListener('mousemove', onActivity)
    window.addEventListener('keydown', onActivity)
    window.addEventListener('touchstart', onActivity)
    window.addEventListener('scroll', onActivity)
    window.addEventListener('click', onActivity)

    return () => {
      clearTimer()
      window.removeEventListener('mousemove', onActivity)
      window.removeEventListener('keydown', onActivity)
      window.removeEventListener('touchstart', onActivity)
      window.removeEventListener('scroll', onActivity)
      window.removeEventListener('click', onActivity)
    }
  }, [router, pathname])

  return null
}
