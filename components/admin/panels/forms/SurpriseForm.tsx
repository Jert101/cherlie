'use client'

import { useState } from 'react'
import { supabase, Surprise } from '@/lib/supabase'
import { uploadFileToSupabase } from '@/lib/imageUtils'

interface SurpriseFormProps {
  surprise: Surprise | null
  onClose: () => void
  onSave: () => void
}

type ContentSource = 'url' | 'upload'

export default function SurpriseForm({ surprise, onClose, onSave }: SurpriseFormProps) {
  const [formData, setFormData] = useState({
    type: (surprise?.type as 'message' | 'audio' | 'image') || 'message',
    title: surprise?.title || '',
    content: surprise?.content || '',
    position: surprise?.position || 'star-hill',
    visible: surprise?.visible ?? true,
  })
  const [contentSource, setContentSource] = useState<ContentSource>('url')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const isAudioOrImage = formData.type === 'audio' || formData.type === 'image'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let content = formData.content

      if (isAudioOrImage && contentSource === 'upload' && uploadFile) {
        const folder = formData.type === 'audio' ? 'surprises/audio' : 'surprises/images'
        content = await uploadFileToSupabase(uploadFile, 'memories', folder)
      } else if (isAudioOrImage && contentSource === 'url' && !formData.content?.trim()) {
        alert(formData.type === 'audio' ? 'Please enter an audio URL (e.g. YouTube, YouTube Music, or direct link) or upload a file.' : 'Please enter an image URL or upload a file.')
        setLoading(false)
        return
      } else if (isAudioOrImage && contentSource === 'upload' && !uploadFile) {
        alert('Please choose a file to upload.')
        setLoading(false)
        return
      }

      const payload = { ...formData, content }

      if (surprise) {
        const { error } = await supabase.from('surprises').update(payload).eq('id', surprise.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('surprises').insert([payload])
        if (error) throw error
      }

      onSave()
      onClose()
    } catch (err) {
      console.error('Error saving surprise:', err)
      alert(err instanceof Error ? err.message : 'Error saving surprise')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-purple-900/95 backdrop-blur-md rounded-2xl border-2 border-pink-500/30 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-bold text-pink-300 mb-4">
          {surprise ? 'Edit Surprise' : 'Add Surprise'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-purple-200 mb-2">Type</label>
            <select
              value={formData.type}
              onChange={(e) => {
                setFormData({ ...formData, type: e.target.value as 'message' | 'audio' | 'image' })
                setContentSource('url')
                setUploadFile(null)
              }}
              className="w-full px-4 py-2 rounded-lg bg-purple-800/50 border border-purple-500/50 text-white focus:outline-none focus:border-pink-500"
            >
              <option value="message">Message</option>
              <option value="audio">Audio</option>
              <option value="image">Image</option>
            </select>
          </div>

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
            {formData.type === 'message' ? (
              <>
                <label className="block text-purple-200 mb-2">Message</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                  required
                  className="w-full px-4 py-2 rounded-lg bg-purple-800/50 border border-purple-500/50 text-white focus:outline-none focus:border-pink-500"
                />
              </>
            ) : (
              <>
                <label className="block text-purple-200 mb-2">
                  {formData.type === 'audio' ? 'Audio' : 'Image'} — URL or upload
                </label>
                <div className="flex gap-3 mb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="contentSource"
                      checked={contentSource === 'url'}
                      onChange={() => { setContentSource('url'); setUploadFile(null) }}
                      className="rounded"
                    />
                    <span className="text-purple-200">Enter URL</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="contentSource"
                      checked={contentSource === 'upload'}
                      onChange={() => setContentSource('upload')}
                      className="rounded"
                    />
                    <span className="text-purple-200">Upload file</span>
                  </label>
                </div>
                {contentSource === 'url' ? (
                  <input
                    type="url"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder={formData.type === 'audio' ? 'YouTube, YouTube Music, or direct audio link' : 'Image URL'}
                    className="w-full px-4 py-2 rounded-lg bg-purple-800/50 border border-purple-500/50 text-white placeholder-purple-400 focus:outline-none focus:border-pink-500"
                  />
                ) : (
                  <div>
                    <input
                      type="file"
                      accept={formData.type === 'audio' ? 'audio/*,.mp3,.wav,.ogg,.m4a' : 'image/*,.jpg,.jpeg,.png,.webp,.gif'}
                      onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                      className="w-full text-sm text-purple-200 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-pink-500/80 file:text-white file:font-medium"
                    />
                    {uploadFile && <p className="mt-1 text-xs text-purple-300">Selected: {uploadFile.name}</p>}
                  </div>
                )}
                {formData.type === 'audio' && contentSource === 'url' && (
                  <p className="mt-1 text-xs text-purple-400">YouTube and YouTube Music links are supported.</p>
                )}
              </>
            )}
          </div>

          <div>
            <label className="block text-purple-200 mb-2">Position</label>
            <select
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-purple-800/50 border border-purple-500/50 text-white focus:outline-none focus:border-pink-500"
            >
              <option value="star-hill">Star Hill</option>
              <option value="memory-garden">Memory Garden</option>
              <option value="love-letter-house">Love Letter House</option>
              <option value="game-arcade">Game Arcade</option>
              <option value="final-cliff">Final Cliff</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
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
