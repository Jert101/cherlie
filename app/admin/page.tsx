'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminDashboard from '@/components/admin/AdminDashboard'

export default function AdminPage() {
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const role = localStorage.getItem('userRole')
    if (role !== 'admin') {
      router.push('/')
      return
    }
  }, [router])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen cosmic-gradient">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-pink-300 text-lg">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  return <AdminDashboard />
}
