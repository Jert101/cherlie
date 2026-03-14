'use client'

import { useState, useEffect } from 'react'
import { supabase, Letter } from '@/lib/supabase'
import LetterForm from './forms/LetterForm'

export default function LettersPanel() {
  const [letters, setLetters] = useState<Letter[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Letter | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadLetters()
  }, [])

  const loadLetters = async () => {
    try {
      const { data, error } = await supabase
        .from('letters')
        .select('*')
        .order('order_index', { ascending: true })

      if (error) throw error
      setLetters(data || [])
    } catch (err) {
      console.error('Error loading letters:', err)
      alert('Error loading letters')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this letter?')) return

    try {
      const { error } = await supabase
        .from('letters')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadLetters()
    } catch (err) {
      console.error('Error deleting letter:', err)
      alert('Error deleting letter')
    }
  }

  const handleToggleVisibility = async (letter: Letter) => {
    try {
      const { error } = await supabase
        .from('letters')
        .update({ visible: !letter.visible })
        .eq('id', letter.id)

      if (error) throw error
      loadLetters()
    } catch (err) {
      console.error('Error updating letter:', err)
      alert('Error updating letter')
    }
  }

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const index = letters.findIndex((l) => l.id === id)
    if (index === -1) return

    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= letters.length) return

    const temp = letters[index].order_index
    letters[index].order_index = letters[newIndex].order_index
    letters[newIndex].order_index = temp

    try {
      await supabase
        .from('letters')
        .update({ order_index: letters[index].order_index })
        .eq('id', letters[index].id)
      await supabase
        .from('letters')
        .update({ order_index: letters[newIndex].order_index })
        .eq('id', letters[newIndex].id)
      loadLetters()
    } catch (err) {
      console.error('Error reordering letters:', err)
      alert('Error reordering letters')
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-purple-200">Loading letters...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-pink-300">Love Letters</h2>
        <button
          onClick={() => {
            setEditing(null)
            setShowForm(true)
          }}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-300"
        >
          + Add Letter
        </button>
      </div>

      {showForm && (
        <LetterForm
          letter={editing}
          onClose={() => {
            setShowForm(false)
            setEditing(null)
          }}
          onSave={loadLetters}
        />
      )}

      <div className="space-y-4">
        {letters.map((letter, index) => (
          <div
            key={letter.id}
            className="bg-purple-800/30 rounded-xl p-4 border border-purple-500/30"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-purple-300 text-sm">#{letter.order_index}</span>
                  <h3 className="font-bold text-pink-300 text-xl">{letter.title}</h3>
                  {!letter.visible && (
                    <span className="text-red-300 text-sm font-bold">(Hidden)</span>
                  )}
                </div>
                <p className="text-purple-200 text-sm line-clamp-2">{letter.content}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => handleReorder(letter.id, 'up')}
                disabled={index === 0}
                className="px-3 py-2 rounded-lg bg-purple-700/50 hover:bg-purple-600/50 text-sm transition-colors disabled:opacity-50"
              >
                ↑
              </button>
              <button
                onClick={() => handleReorder(letter.id, 'down')}
                disabled={index === letters.length - 1}
                className="px-3 py-2 rounded-lg bg-purple-700/50 hover:bg-purple-600/50 text-sm transition-colors disabled:opacity-50"
              >
                ↓
              </button>
              <button
                onClick={() => {
                  setEditing(letter)
                  setShowForm(true)
                }}
                className="flex-1 px-3 py-2 rounded-lg bg-purple-700/50 hover:bg-purple-600/50 text-sm transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleToggleVisibility(letter)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                  letter.visible
                    ? 'bg-green-700/50 hover:bg-green-600/50'
                    : 'bg-yellow-700/50 hover:bg-yellow-600/50'
                }`}
              >
                {letter.visible ? 'Hide' : 'Show'}
              </button>
              <button
                onClick={() => handleDelete(letter.id)}
                className="px-3 py-2 rounded-lg bg-red-700/50 hover:bg-red-600/50 text-sm transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {letters.length === 0 && (
        <div className="text-center py-12 text-purple-300">
          No letters yet. Add your first letter!
        </div>
      )}
    </div>
  )
}
