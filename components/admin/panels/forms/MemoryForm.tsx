'use client'

import { useState, useRef } from 'react'
import { supabase, Memory } from '@/lib/supabase'
import { uploadImageToSupabase, compressImage } from '@/lib/imageUtils'

interface MemoryFormProps {
  memory: Memory | null
  onClose: () => void
  onSave: () => void
}

export default function MemoryForm({ memory, onClose, onSave }: MemoryFormProps) {
  const [formData, setFormData] = useState({
    title: memory?.title || '',
    description: memory?.description || '',
    image_url: memory?.image_url || '',
    date: memory?.date || new Date().toISOString().split('T')[0],
    location: memory?.location || '',
    visible: memory?.visible ?? true,
  })
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [preview, setPreview] = useState<string | null>(memory?.image_url || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (before compression)
    if (file.size > 10 * 1024 * 1024) { // 10MB max
      alert('Image is too large. Please select an image smaller than 10MB')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      // Show preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Compress and upload
      setUploadProgress(30)
      const publicUrl = await uploadImageToSupabase(file)
      
      setUploadProgress(100)
      setFormData({ ...formData, image_url: publicUrl })
      
      setTimeout(() => {
        setUploadProgress(0)
      }, 1000)
    } catch (err: any) {
      console.error('Error uploading image:', err)
      alert(`Error uploading image: ${err.message || 'Unknown error'}`)
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.image_url) {
      alert('Please upload an image or provide an image URL')
      return
    }

    setLoading(true)

    try {
      if (memory) {
        // Update
        const { error } = await supabase
          .from('memories')
          .update(formData)
          .eq('id', memory.id)

        if (error) throw error
      } else {
        // Create
        const { error } = await supabase
          .from('memories')
          .insert([formData])

        if (error) throw error
      }

      onSave()
      onClose()
    } catch (err: any) {
      console.error('Error saving memory:', err)
      alert(`Error saving memory: ${err.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-purple-900/95 backdrop-blur-md rounded-2xl border-2 border-pink-500/30 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-bold text-pink-300 mb-4">
          {memory ? 'Edit Memory' : 'Add Memory'}
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
            <label className="block text-purple-200 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              maxLength={300}
              className="w-full px-4 py-2 rounded-lg bg-purple-800/50 border border-purple-500/50 text-white focus:outline-none focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block text-purple-200 mb-2">Image</label>
            
            {/* File Upload */}
            <div className="mb-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="image-upload"
                disabled={uploading}
              />
              <label
                htmlFor="image-upload"
                className={`inline-block px-4 py-2 rounded-lg cursor-pointer transition-all duration-300 ${
                  uploading
                    ? 'bg-purple-700/50 text-purple-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700'
                }`}
              >
                {uploading ? `Uploading... ${uploadProgress}%` : '📷 Upload Image'}
              </label>
              {uploading && (
                <div className="mt-2 w-full bg-purple-800/50 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>

            {/* Image Preview */}
            {preview && (
              <div className="mb-3 relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full max-h-64 object-cover rounded-lg border-2 border-pink-500/30"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPreview(null)
                    setFormData({ ...formData, image_url: '' })
                    if (fileInputRef.current) {
                      fileInputRef.current.value = ''
                    }
                  }}
                  className="absolute top-2 right-2 px-2 py-1 bg-red-600/80 hover:bg-red-600 text-white rounded text-sm"
                >
                  Remove
                </button>
              </div>
            )}

            {/* Manual URL Input (Alternative) */}
            <div className="mt-3">
              <label className="block text-purple-200 mb-2 text-sm">Or enter image URL manually:</label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => {
                  setFormData({ ...formData, image_url: e.target.value })
                  setPreview(e.target.value || null)
                }}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-2 rounded-lg bg-purple-800/50 border border-purple-500/50 text-white focus:outline-none focus:border-pink-500"
              />
            </div>
            
            <p className="text-xs text-purple-300 mt-2">
              Images are automatically compressed to WebP format (max 500KB) for optimal performance
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-purple-200 mb-2">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="w-full px-4 py-2 rounded-lg bg-purple-800/50 border border-purple-500/50 text-white focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-purple-200 mb-2">Location (optional)</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-purple-800/50 border border-purple-500/50 text-white focus:outline-none focus:border-pink-500"
              />
            </div>
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
