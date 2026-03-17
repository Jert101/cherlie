'use client'

import { useEffect, useState } from 'react'
import { supabase, Prayer } from '@/lib/supabase'
import { formatDateTimeInPH } from '@/lib/dateUtils'

export default function PrayersPanel() {
  const [prayers, setPrayers] = useState<Prayer[]>([])
  const [loading, setLoading] = useState(true)
  const [newPrayer, setNewPrayer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    loadPrayers()
  }, [])

  const loadPrayers = async () => {
    try {
      const { data, error } = await supabase
        .from('prayers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPrayers((data || []) as Prayer[])
    } catch (err) {
      console.error('Error loading prayers:', err)
      alert('Error loading prayers')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePrayer = async () => {
    const trimmed = newPrayer.trim()
    if (!trimmed) return

    try {
      setSubmitting(true)
      const { error } = await supabase
        .from('prayers')
        .insert({ message: trimmed, author_role: 'bf', visible: true })

      if (error) throw error
      setNewPrayer('')
      loadPrayers()
    } catch (err) {
      console.error('Error creating prayer:', err)
      alert('Error creating prayer')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleVisibility = async (p: Prayer) => {
    try {
      const { error } = await supabase
        .from('prayers')
        .update({ visible: !p.visible })
        .eq('id', p.id)

      if (error) throw error
      loadPrayers()
    } catch (err) {
      console.error('Error updating prayer:', err)
      alert('Error updating prayer')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this prayer?')) return
    try {
      const { error } = await supabase
        .from('prayers')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadPrayers()
    } catch (err) {
      console.error('Error deleting prayer:', err)
      alert('Error deleting prayer')
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-purple-200">Loading prayers...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-pink-300">Prayer Wall</h2>
        <span className="text-sm text-purple-300">
          {prayers.length} prayer{prayers.length !== 1 ? 's' : ''}
        </span>
      </div>

      <p className="text-purple-200/90 text-sm mb-6">
        Prayers left by you and her. Newest first.
      </p>

      <div className="mb-6 rounded-2xl border border-cyan-300/20 bg-purple-900/30 p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">🕯️</span>
          <h3 className="text-lg font-semibold text-cyan-100">Write a prayer (BF)</h3>
        </div>
        <textarea
          value={newPrayer}
          onChange={(e) => setNewPrayer(e.target.value)}
          rows={3}
          maxLength={5000}
          placeholder="Write a prayer for both of you…"
          className="w-full px-4 py-3 rounded-xl bg-purple-950/40 border border-cyan-300/20 text-purple-50 placeholder-purple-200/40 focus:outline-none focus:border-pink-300/40 focus:ring-2 focus:ring-cyan-300/10 transition-all duration-300 resize-none"
          disabled={submitting}
        />
        <div className="flex items-center justify-between mt-3 gap-3">
          <span className="text-xs text-purple-200/60">{newPrayer.length}/5000</span>
          <button
            type="button"
            disabled={submitting || !newPrayer.trim()}
            onClick={handleCreatePrayer}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400/80 to-pink-500/80 text-slate-950 font-semibold text-sm hover:from-cyan-300 hover:to-pink-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-[0_0_24px_rgba(34,211,238,0.18)]"
          >
            {submitting ? 'Sending…' : 'Post prayer'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {prayers.map((p) => (
          <div key={p.id} className="bg-purple-800/30 rounded-xl p-4 border border-purple-500/30">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-cyan-900/40 text-cyan-100 border border-cyan-300/20">
                    {p.author_role === 'gf' ? 'GF' : p.author_role === 'bf' ? 'BF' : p.author_role}
                  </span>
                  {!p.visible && (
                    <span className="text-xs font-medium text-amber-300 bg-amber-900/40 px-2 py-1 rounded">
                      Hidden on Prayer Wall
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setExpandedId((prev) => (prev === p.id ? null : p.id))}
                  className="w-full text-left"
                >
                  <p
                    className={`text-purple-100 whitespace-pre-wrap break-words ${
                      expandedId === p.id ? '' : 'line-clamp-3'
                    }`}
                  >
                    {p.message}
                  </p>
                  <p className="text-xs text-cyan-200/70 italic mt-2">
                    {expandedId === p.id ? 'Tap to fold' : 'Tap to expand'}
                  </p>
                </button>
                <p className="text-xs text-purple-400 mt-2">{formatDateTimeInPH(p.created_at)}</p>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleToggleVisibility(p)}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    p.visible ? 'bg-green-700/50 hover:bg-green-600/50' : 'bg-yellow-700/50 hover:bg-yellow-600/50'
                  }`}
                >
                  {p.visible ? 'Hide' : 'Show'}
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="px-3 py-2 rounded-lg bg-red-700/50 hover:bg-red-600/50 text-sm transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {prayers.length === 0 && (
        <div className="text-center py-12 text-purple-300">
          No prayers yet. Add one from the Prayer Wall in the world map.
        </div>
      )}
    </div>
  )
}

