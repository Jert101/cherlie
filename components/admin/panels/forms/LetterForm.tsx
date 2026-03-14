'use client'

import { useState } from 'react'
import { supabase, Letter } from '@/lib/supabase'

interface LetterFormProps {
  letter: Letter | null
  onClose: () => void
  onSave: () => void
}

export default function LetterForm({ letter, onClose, onSave }: LetterFormProps) {
  const [formData, setFormData] = useState({
    title: letter?.title || '',
    content: letter?.content || '',
    order_index: letter?.order_index || 0,
    visible: letter?.visible ?? true,
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (letter) {
        const { error } = await supabase
          .from('letters')
          .update(formData)
          .eq('id', letter.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('letters')
          .insert([formData])

        if (error) throw error
      }

      onSave()
      onClose()
    } catch (err) {
      console.error('Error saving letter:', err)
      alert('Error saving letter')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-purple-900/95 backdrop-blur-md rounded-2xl border-2 border-pink-500/30 p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-bold text-pink-300 mb-4">
          {letter ? 'Edit Letter' : 'Add Letter'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-purple-200 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-4 py-2 rounded-lg bg-purple-800/50 border border-purple-500/50 text-white focus:outline-none focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block text-purple-200 mb-2">Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={12}
              maxLength={2000}
              required
              className="w-full px-4 py-2 rounded-lg bg-purple-800/50 border border-purple-500/50 text-white focus:outline-none focus:border-pink-500 font-sans"
            />
            <p className="text-xs text-purple-300 mt-1">
              {formData.content.length}/2000 characters
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-purple-200 mb-2">Order Index</label>
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
                Visible to GF
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
