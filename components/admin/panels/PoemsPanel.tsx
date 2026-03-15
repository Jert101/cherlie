'use client'

import { useState, useEffect } from 'react'
import { supabase, Poem } from '@/lib/supabase'
import PoemForm from './forms/PoemForm'
import { formatDateInPH } from '@/lib/dateUtils'

export default function PoemsPanel() {
  const [poems, setPoems] = useState<Poem[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Poem | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadPoems()
  }, [])

  const loadPoems = async () => {
    try {
      const { data, error } = await supabase
        .from('poems')
        .select('*')
        .order('order_index', { ascending: true })

      if (error) throw error
      setPoems(data || [])
    } catch (err) {
      console.error('Error loading poems:', err)
      alert('Error loading poems')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this poem?')) return

    try {
      const { error } = await supabase
        .from('poems')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadPoems()
    } catch (err) {
      console.error('Error deleting poem:', err)
      alert('Error deleting poem')
    }
  }

  const handleToggleVisibility = async (p: Poem) => {
    try {
      const { error } = await supabase
        .from('poems')
        .update({ visible: !p.visible })
        .eq('id', p.id)

      if (error) throw error
      loadPoems()
    } catch (err) {
      console.error('Error updating poem:', err)
      alert('Error updating poem')
    }
  }

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const index = poems.findIndex((p) => p.id === id)
    if (index === -1) return

    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= poems.length) return

    const orderA = poems[index].order_index
    const orderB = poems[newIndex].order_index

    try {
      await supabase
        .from('poems')
        .update({ order_index: orderB })
        .eq('id', poems[index].id)
      await supabase
        .from('poems')
        .update({ order_index: orderA })
        .eq('id', poems[newIndex].id)
      loadPoems()
    } catch (err) {
      console.error('Error reordering poems:', err)
      alert('Error reordering poems')
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-purple-200">Loading poems...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-pink-300">River of Poem</h2>
        <button
          onClick={() => {
            setEditing(null)
            setShowForm(true)
          }}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-300"
        >
          + Add Poem
        </button>
      </div>

      {showForm && (
        <PoemForm
          poem={editing}
          onClose={() => {
            setShowForm(false)
            setEditing(null)
          }}
          onSave={loadPoems}
        />
      )}

      <div className="space-y-4">
        {poems.map((poem, index) => (
          <div
            key={poem.id}
            className="bg-purple-800/30 rounded-xl p-4 border border-purple-500/30"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-purple-300 text-sm">#{poem.order_index}</span>
                  <h3 className="font-bold text-pink-300 text-xl">{poem.title}</h3>
                  {poem.date && (
                    <span className="text-purple-400 text-sm">{formatDateInPH(poem.date)}</span>
                  )}
                  {!poem.visible && (
                    <span className="text-red-300 text-sm font-bold">(Hidden)</span>
                  )}
                </div>
                <p className="text-purple-200 text-sm line-clamp-3 whitespace-pre-wrap">{poem.body}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4 flex-wrap">
              <button
                onClick={() => handleReorder(poem.id, 'up')}
                disabled={index === 0}
                className="px-3 py-2 rounded-lg bg-purple-700/50 hover:bg-purple-600/50 text-sm transition-colors disabled:opacity-50"
              >
                ↑
              </button>
              <button
                onClick={() => handleReorder(poem.id, 'down')}
                disabled={index === poems.length - 1}
                className="px-3 py-2 rounded-lg bg-purple-700/50 hover:bg-purple-600/50 text-sm transition-colors disabled:opacity-50"
              >
                ↓
              </button>
              <button
                onClick={() => {
                  setEditing(poem)
                  setShowForm(true)
                }}
                className="flex-1 px-3 py-2 rounded-lg bg-purple-700/50 hover:bg-purple-600/50 text-sm transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleToggleVisibility(poem)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                  poem.visible
                    ? 'bg-green-700/50 hover:bg-green-600/50'
                    : 'bg-yellow-700/50 hover:bg-yellow-600/50'
                }`}
              >
                {poem.visible ? 'Hide' : 'Show'}
              </button>
              <button
                onClick={() => handleDelete(poem.id)}
                className="px-3 py-2 rounded-lg bg-red-700/50 hover:bg-red-600/50 text-sm transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {poems.length === 0 && (
        <div className="text-center py-12 text-purple-300">
          No poems yet. Add your first poem for her!
        </div>
      )}
    </div>
  )
}
