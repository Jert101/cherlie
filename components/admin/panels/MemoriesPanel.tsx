'use client'

import { useState, useEffect } from 'react'
import { supabase, Memory } from '@/lib/supabase'
import MemoryForm from './forms/MemoryForm'

export default function MemoriesPanel() {
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Memory | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadMemories()
  }, [])

  const loadMemories = async () => {
    try {
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .order('date', { ascending: false })

      if (error) throw error
      setMemories(data || [])
    } catch (err) {
      console.error('Error loading memories:', err)
      alert('Error loading memories')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this memory?')) return

    try {
      const { error } = await supabase
        .from('memories')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadMemories()
    } catch (err) {
      console.error('Error deleting memory:', err)
      alert('Error deleting memory')
    }
  }

  const handleToggleVisibility = async (memory: Memory) => {
    try {
      const { error } = await supabase
        .from('memories')
        .update({ visible: !memory.visible })
        .eq('id', memory.id)

      if (error) throw error
      loadMemories()
    } catch (err) {
      console.error('Error updating memory:', err)
      alert('Error updating memory')
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-purple-200">Loading memories...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-pink-300">Memories</h2>
        <button
          onClick={() => {
            setEditing(null)
            setShowForm(true)
          }}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-300"
        >
          + Add Memory
        </button>
      </div>

      {showForm && (
        <MemoryForm
          memory={editing}
          onClose={() => {
            setShowForm(false)
            setEditing(null)
          }}
          onSave={loadMemories}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {memories.map((memory) => (
          <div
            key={memory.id}
            className="bg-purple-800/30 rounded-xl p-4 border border-purple-500/30"
          >
            <div className="relative aspect-video mb-3 rounded-lg overflow-hidden">
              <img
                src={memory.image_url}
                alt={memory.title}
                className="w-full h-full object-cover"
              />
              {!memory.visible && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-red-300 font-bold">Hidden</span>
                </div>
              )}
            </div>
            <h3 className="font-bold text-pink-300 mb-1">{memory.title}</h3>
            <p className="text-sm text-purple-200 mb-2 line-clamp-2">{memory.description}</p>
            <div className="flex justify-between text-xs text-purple-300 mb-3">
              <span>{new Date(memory.date).toLocaleDateString()}</span>
              {memory.location && <span>{memory.location}</span>}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditing(memory)
                  setShowForm(true)
                }}
                className="flex-1 px-3 py-2 rounded-lg bg-purple-700/50 hover:bg-purple-600/50 text-sm transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleToggleVisibility(memory)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                  memory.visible
                    ? 'bg-green-700/50 hover:bg-green-600/50'
                    : 'bg-yellow-700/50 hover:bg-yellow-600/50'
                }`}
              >
                {memory.visible ? 'Hide' : 'Show'}
              </button>
              <button
                onClick={() => handleDelete(memory.id)}
                className="px-3 py-2 rounded-lg bg-red-700/50 hover:bg-red-600/50 text-sm transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {memories.length === 0 && (
        <div className="text-center py-12 text-purple-300">
          No memories yet. Add your first memory!
        </div>
      )}
    </div>
  )
}
