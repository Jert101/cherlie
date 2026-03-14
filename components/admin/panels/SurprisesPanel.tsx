'use client'

import { useState, useEffect } from 'react'
import { supabase, Surprise } from '@/lib/supabase'
import SurpriseForm from './forms/SurpriseForm'

export default function SurprisesPanel() {
  const [surprises, setSurprises] = useState<Surprise[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Surprise | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadSurprises()
  }, [])

  const loadSurprises = async () => {
    try {
      const { data, error } = await supabase
        .from('surprises')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setSurprises(data || [])
    } catch (err) {
      console.error('Error loading surprises:', err)
      alert('Error loading surprises')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this surprise?')) return

    try {
      const { error } = await supabase
        .from('surprises')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadSurprises()
    } catch (err) {
      console.error('Error deleting surprise:', err)
      alert('Error deleting surprise')
    }
  }

  const handleToggleVisibility = async (surprise: Surprise) => {
    try {
      const { error } = await supabase
        .from('surprises')
        .update({ visible: !surprise.visible })
        .eq('id', surprise.id)

      if (error) throw error
      loadSurprises()
    } catch (err) {
      console.error('Error updating surprise:', err)
      alert('Error updating surprise')
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-purple-200">Loading surprises...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-pink-300">Surprises</h2>
        <button
          onClick={() => {
            setEditing(null)
            setShowForm(true)
          }}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-300"
        >
          + Add Surprise
        </button>
      </div>

      {showForm && (
        <SurpriseForm
          surprise={editing}
          onClose={() => {
            setShowForm(false)
            setEditing(null)
          }}
          onSave={loadSurprises}
        />
      )}

      <div className="space-y-4">
        {surprises.map((surprise) => (
          <div
            key={surprise.id}
            className="bg-purple-800/30 rounded-xl p-4 border border-purple-500/30"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">
                    {surprise.type === 'audio' ? '🎵' : surprise.type === 'image' ? '🖼️' : '⭐'}
                  </span>
                  <h3 className="font-bold text-pink-300 text-xl">{surprise.title}</h3>
                  <span className="text-xs text-purple-300 bg-purple-700/50 px-2 py-1 rounded">
                    {surprise.type}
                  </span>
                  {!surprise.visible && (
                    <span className="text-red-300 text-sm font-bold">(Hidden)</span>
                  )}
                </div>
                <p className="text-purple-200 text-sm line-clamp-2">{surprise.content}</p>
                <p className="text-xs text-purple-300 mt-2">Position: {surprise.position}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  setEditing(surprise)
                  setShowForm(true)
                }}
                className="flex-1 px-3 py-2 rounded-lg bg-purple-700/50 hover:bg-purple-600/50 text-sm transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleToggleVisibility(surprise)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                  surprise.visible
                    ? 'bg-green-700/50 hover:bg-green-600/50'
                    : 'bg-yellow-700/50 hover:bg-yellow-600/50'
                }`}
              >
                {surprise.visible ? 'Hide' : 'Show'}
              </button>
              <button
                onClick={() => handleDelete(surprise.id)}
                className="px-3 py-2 rounded-lg bg-red-700/50 hover:bg-red-600/50 text-sm transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {surprises.length === 0 && (
        <div className="text-center py-12 text-purple-300">
          No surprises yet. Add your first surprise!
        </div>
      )}
    </div>
  )
}
