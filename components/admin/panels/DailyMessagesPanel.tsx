'use client'

import { useEffect, useState } from 'react'
import { supabase, DailyMessage } from '@/lib/supabase'

export default function DailyMessagesPanel() {
  const [messages, setMessages] = useState<DailyMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newMessage, setNewMessage] = useState('')

  useEffect(() => {
    loadMessages()
  }, [])

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_messages')
        .select('*')
        .order('order_index', { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (err) {
      console.error('Error loading daily messages:', err)
      alert('Error loading daily messages')
    } finally {
      setLoading(false)
    }
  }

  const handleAddMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = newMessage.trim()
    if (!trimmed) return

    try {
      setSaving(true)
      const nextOrder =
        messages.length > 0
          ? Math.max(...messages.map((m) => m.order_index)) + 1
          : 1

      const { data, error } = await supabase
        .from('daily_messages')
        .insert({ message: trimmed, order_index: nextOrder, visible: true })
        .select('*')
        .single()

      if (error) throw error
      if (data) {
        setMessages((prev) => [...prev, data])
        setNewMessage('')
      }
    } catch (err) {
      console.error('Error adding daily message:', err)
      alert('Error adding daily message')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleVisible = async (msg: DailyMessage) => {
    try {
      const { error } = await supabase
        .from('daily_messages')
        .update({ visible: !msg.visible })
        .eq('id', msg.id)

      if (error) throw error
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, visible: !m.visible } : m))
      )
    } catch (err) {
      console.error('Error updating visibility:', err)
      alert('Error updating visibility')
    }
  }

  const handleUpdateMessage = async (id: string, message: string) => {
    try {
      const trimmed = message.trim()
      if (!trimmed) return
      const { error } = await supabase
        .from('daily_messages')
        .update({ message: trimmed })
        .eq('id', id)

      if (error) throw error
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, message: trimmed } : m))
      )
    } catch (err) {
      console.error('Error updating message:', err)
      alert('Error updating message')
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-purple-200">Loading daily messages...</div>
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-pink-300 mb-6">Daily Love Messages</h2>

      <div className="mb-6 p-4 rounded-xl bg-purple-800/30 border border-purple-500/30 text-purple-200 text-sm">
        These messages rotate on the `/world` page as &quot;Today&apos;s message from me&quot;.
        Add as many as you like; they will be picked based on the calendar day.
      </div>

      <form onSubmit={handleAddMessage} className="mb-6 space-y-3">
        <label className="block text-purple-200 text-sm mb-1">
          New daily message
        </label>
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          rows={2}
          className="w-full px-4 py-2 rounded-lg bg-purple-800/50 border border-purple-500/50 text-white focus:outline-none focus:border-pink-500 text-sm"
          placeholder='e.g. "You are my favorite part of every day."'
        />
        <button
          type="submit"
          disabled={saving || !newMessage.trim()}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-semibold hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 transition-all duration-300"
        >
          {saving ? 'Adding...' : 'Add Message'}
        </button>
      </form>

      <div className="space-y-4">
        {messages.map((msg) => (
          <DailyMessageRow
            key={msg.id}
            message={msg}
            onToggleVisible={handleToggleVisible}
            onUpdateMessage={handleUpdateMessage}
          />
        ))}
        {messages.length === 0 && (
          <div className="text-purple-200 text-sm">No daily messages yet. Add one above.</div>
        )}
      </div>
    </div>
  )
}

function DailyMessageRow({
  message,
  onToggleVisible,
  onUpdateMessage,
}: {
  message: DailyMessage
  onToggleVisible: (m: DailyMessage) => void
  onUpdateMessage: (id: string, text: string) => void
}) {
  const [localValue, setLocalValue] = useState(message.message)

  const handleBlur = () => {
    if (localValue !== message.message) {
      onUpdateMessage(message.id, localValue)
    }
  }

  return (
    <div className="bg-purple-800/30 rounded-xl p-4 border border-purple-500/30 space-y-3">
      <div className="flex items-center justify-between text-xs text-purple-300">
        <span>Order: {message.order_index}</span>
        <button
          type="button"
          onClick={() => onToggleVisible(message)}
          className={`px-3 py-1 rounded-lg text-xs font-semibold ${
            message.visible
              ? 'bg-green-700/50 hover:bg-green-600/50'
              : 'bg-red-700/50 hover:bg-red-600/50'
          }`}
        >
          {message.visible ? 'Visible' : 'Hidden'}
        </button>
      </div>
      <textarea
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        rows={2}
        className="w-full px-3 py-2 rounded-lg bg-purple-900/60 border border-purple-500/50 text-sm text-white focus:outline-none focus:border-pink-500"
      />
    </div>
  )
}

