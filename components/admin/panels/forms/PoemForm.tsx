'use client'

import { useState } from 'react'
import { supabase, Poem } from '@/lib/supabase'

interface PoemFormProps {
  poem: Poem | null
  onClose: () => void
  onSave: () => void
}

export default function PoemForm({ poem, onClose, onSave }: PoemFormProps) {
  const [formData, setFormData] = useState({
    title: poem?.title || '',
    body: poem?.body || '',
    order_index: poem?.order_index ?? 0,
    visible: poem?.visible ?? true,
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (poem) {
        const { error } = await supabase
          .from('poems')
          .update(formData)
          .eq('id', poem.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('poems')
          .insert([formData])

        if (error) throw error
      }

      onSave()
      onClose()
    } catch (err) {
      console.error('Error saving poem:', err)
      alert('Error saving poem')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-purple-900/95 backdrop-blur-md rounded-2xl border-2 border-pink-500/30 p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-bold text-pink-300 mb-4">
          {poem ? 'Edit Poem' : 'Add Poem'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-purple-200 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="e.g. For You, On a Quiet Night"
              className="w-full px-4 py-2 rounded-lg bg-purple-800/50 border border-purple-500/50 text-white focus:outline-none focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block text-purple-200 mb-2">Poem</label>
            <textarea
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              rows={14}
              maxLength={3000}
              required
              placeholder="Write your poem here..."
              className="w-full px-4 py-2 rounded-lg bg-purple-800/50 border border-purple-500/50 text-white focus:outline-none focus:border-pink-500 font-sans whitespace-pre-wrap"
            />
            <p className="text-xs text-purple-300 mt-1">
              {formData.body.length}/3000 characters
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-purple-200 mb-2">Order</label>
              <input
                type="number"
                value={formData.order_index}
                onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                min="0"
                className="w-full px-4 py-2 rounded-lg bg-purple-800/50 border border-purple-500/50 text-white focus:outline-none focus:border-pink-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-8">
              <input
                type="checkbox"
                id="visible"
                checked={formData.visible}
                onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <label htmlFor="visible" className="text-purple-200">
                Visible in River of Poem
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl bg-purple-800/50 text-purple-200 hover:bg-purple-700/50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
