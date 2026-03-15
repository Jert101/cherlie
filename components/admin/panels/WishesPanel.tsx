'use client'

import { useState, useEffect } from 'react'
import { supabase, Wish } from '@/lib/supabase'
import { formatDateTimeInPH } from '@/lib/dateUtils'

export default function WishesPanel() {
  const [wishes, setWishes] = useState<Wish[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWishes()
  }, [])

  const loadWishes = async () => {
    try {
      const { data, error } = await supabase
        .from('wishes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setWishes(data || [])
    } catch (err) {
      console.error('Error loading wishes:', err)
      alert('Error loading wishes')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-purple-200">Loading wishes...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-pink-300">Star Hill wishes</h2>
        <span className="text-sm text-purple-300">
          {wishes.length} wish{wishes.length !== 1 ? 'es' : ''}
        </span>
      </div>

      <p className="text-purple-200/90 text-sm mb-6">
        Wishes she made on Star Hill. Newest first.
      </p>

      <div className="space-y-4">
        {wishes.map((wish, index) => (
          <div
            key={wish.id}
            className="bg-purple-800/30 rounded-xl p-4 border border-purple-500/30"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-purple-100 whitespace-pre-wrap break-words">
                  {wish.message}
                </p>
                <p className="text-xs text-purple-400 mt-2">
                  {formatDateTimeInPH(wish.created_at)}
                </p>
              </div>
              {!wish.visible && (
                <span className="flex-shrink-0 text-xs font-medium text-amber-300 bg-amber-900/40 px-2 py-1 rounded">
                  Hidden on Star Hill
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {wishes.length === 0 && (
        <div className="text-center py-12 text-purple-300">
          No wishes yet. When she makes a wish on Star Hill, it will show up here.
        </div>
      )}
    </div>
  )
}
