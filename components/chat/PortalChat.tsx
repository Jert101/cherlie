'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase, ChatMessage, ChatPortal, ChatReaction } from '@/lib/supabase'
import { formatDateTimeInPH } from '@/lib/dateUtils'

const PORTAL_ID = '22222222-2222-2222-2222-222222222222'

function getSenderRoleFromUserRole(userRole: string | null): 'gf' | 'bf' | null {
  if (userRole === 'gf') return 'gf'
  if (userRole === 'bf' || userRole === 'admin') return 'bf'
  return null
}

function msToMMSS(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${String(r).padStart(2, '0')}`
}

export default function PortalChat({ context }: { context: 'world' | 'admin' }) {
  const [portal, setPortal] = useState<ChatPortal | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [reactions, setReactions] = useState<ChatReaction[]>([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [closing, setClosing] = useState(false)
  const [picker, setPicker] = useState<{ messageId: string; x: number; y: number } | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const longPressTimerRef = useRef<number | null>(null)
  const longPressStartRef = useRef<{ x: number; y: number } | null>(null)

  const senderRole = useMemo(() => {
    if (typeof window === 'undefined') return null
    const ur = localStorage.getItem('userRole')
    return getSenderRoleFromUserRole(ur)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function ensurePortal() {
      try {
        // Create-or-load portal row
        const { data, error } = await supabase
          .from('chat_portal')
          .upsert({ id: PORTAL_ID }, { onConflict: 'id' })
          .select('*')
          .single()
        if (error) throw error
        if (!cancelled) setPortal(data as ChatPortal)
      } catch (e) {
        console.error('Failed to ensure portal:', e)
      }
    }

    ensurePortal()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!portal) return
    let cancelled = false

    async function cleanupIfExpired(p: ChatPortal) {
      if (!p.delete_at) return
      const deleteAt = new Date(p.delete_at).getTime()
      if (Date.now() < deleteAt) return
      // Delete portal => cascades delete messages
      await supabase.from('chat_portal').delete().eq('id', p.id)
    }

    async function load() {
      try {
        const { data: p } = await supabase
          .from('chat_portal')
          .select('*')
          .eq('id', PORTAL_ID)
          .single()
        if (cancelled) return
        setPortal(p as ChatPortal)
        await cleanupIfExpired(p as ChatPortal)

        const { data: msgs, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('portal_id', PORTAL_ID)
          .order('created_at', { ascending: true })
        if (error) throw error
        if (!cancelled) setMessages((msgs || []) as ChatMessage[])

        const { data: reacts, error: reactErr } = await supabase
          .from('chat_reactions')
          .select('*')
          .eq('portal_id', PORTAL_ID)
        if (reactErr) throw reactErr
        if (!cancelled) setReactions((reacts || []) as ChatReaction[])
      } catch (e) {
        console.error('Failed to load chat:', e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    const interval = setInterval(load, 2000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [portal?.id])

  useEffect(() => {
    // Auto-scroll to bottom on new messages
    if (!listRef.current) return
    listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages.length])

  const countdownMs = useMemo(() => {
    if (!portal?.delete_at) return null
    const ms = new Date(portal.delete_at).getTime() - Date.now()
    return ms
  }, [portal?.delete_at, messages.length])

  useEffect(() => {
    if (!portal?.delete_at) return
    const t = setInterval(() => {
      // re-render countdown
      setPortal((p) => (p ? ({ ...p } as ChatPortal) : p))
    }, 500)
    return () => clearInterval(t)
  }, [portal?.delete_at])

  const canUse = senderRole !== null
  const canSend = canUse && !sending && !!text.trim()

  const handleSend = async () => {
    const trimmed = text.trim()
    if (!trimmed || !senderRole) return
    try {
      setSending(true)
      const { error } = await supabase.from('chat_messages').insert({
        portal_id: PORTAL_ID,
        sender_role: senderRole,
        message: trimmed,
      })
      if (error) throw error
      setText('')
      // Let polling pick it up
    } catch (e) {
      console.error('Failed to send message:', e)
      const msg =
        typeof e === 'object' && e && 'message' in e
          ? String((e as any).message)
          : 'Failed to send message'
      alert(msg)
    } finally {
      setSending(false)
    }
  }

  const handleUnsend = async (messageId: string) => {
    if (!senderRole) return
    if (!confirm('Unsend this message?')) return
    try {
      await supabase
        .from('chat_messages')
        .update({
          is_unsent: true,
          unsent_at: new Date().toISOString(),
          unsent_by: senderRole,
          message: '',
        })
        .eq('id', messageId)
        .eq('portal_id', PORTAL_ID)
    } catch (e) {
      console.error('Failed to unsend:', e)
      alert('Failed to unsend message')
    }
  }

  const toggleReaction = async (messageId: string, emoji: string) => {
    if (!senderRole) return
    try {
      const existing = reactions.find(
        (r) => r.message_id === messageId && r.reactor_role === senderRole && r.emoji === emoji
      )
      if (existing) {
        await supabase.from('chat_reactions').delete().eq('id', existing.id)
      } else {
        await supabase.from('chat_reactions').insert({
          portal_id: PORTAL_ID,
          message_id: messageId,
          reactor_role: senderRole,
          emoji,
        })
      }
    } catch (e) {
      console.error('Failed to react:', e)
      alert('Failed to react')
    }
  }

  const handleClosePortal = async () => {
    if (!senderRole || !portal) return
    try {
      setClosing(true)
      const now = new Date()
      const deleteAt = new Date(now.getTime() + 30 * 60 * 1000).toISOString()

      const next =
        senderRole === 'gf'
          ? { closed_by_gf: true }
          : { closed_by_bf: true }

      // If other already closed -> delete immediately
      const otherClosed =
        senderRole === 'gf' ? portal.closed_by_bf : portal.closed_by_gf

      if (otherClosed) {
        await supabase.from('chat_portal').delete().eq('id', portal.id)
        // reset local
        setPortal({ ...portal, closed_by_gf: true, closed_by_bf: true } as ChatPortal)
        setMessages([])
        return
      }

      const { data: updated, error } = await supabase
        .from('chat_portal')
        .update({ ...next, delete_at: deleteAt, updated_at: new Date().toISOString() })
        .eq('id', portal.id)
        .select('*')
        .single()
      if (error) throw error
      setPortal(updated as ChatPortal)
    } catch (e) {
      console.error('Failed to close portal:', e)
      alert('Failed to close portal')
    } finally {
      setClosing(false)
    }
  }

  const title =
    context === 'admin'
      ? 'Portal Chat (BF → GF)'
      : 'Portal Chat'

  const otherClosed = senderRole
    ? senderRole === 'gf'
      ? !!portal?.closed_by_bf
      : !!portal?.closed_by_gf
    : false
  const otherName = senderRole === 'gf' ? 'Him' : 'Her'

  const quickEmojis = ['❤️', '✨', '🥺', '😂', '👍']

  const clearLongPress = () => {
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
    longPressStartRef.current = null
  }

  const openPicker = (messageId: string, x: number, y: number) => {
    setPicker({ messageId, x, y })
  }

  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-pink-500/20 bg-gradient-to-br from-slate-950/70 via-purple-950/60 to-pink-950/40 shadow-2xl"
      onClick={() => setPicker(null)}
    >
      <div className="absolute inset-0 pointer-events-none opacity-70 bg-[radial-gradient(circle_at_20%_15%,rgba(34,211,238,0.14),transparent_55%),radial-gradient(circle_at_80%_70%,rgba(236,72,153,0.10),transparent_60%)]" />
      <div className="relative p-5 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-pink-200/70">
              a tiny magical portal
            </p>
            <h3 className="text-2xl font-bold text-handwritten text-pink-200">{title}</h3>
            <p className="text-xs text-purple-200/70 mt-1">
              Closes when you both agree. If one forgets, it fades in 30 minutes.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClosePortal}
            disabled={!canUse || closing}
            className="shrink-0 px-4 py-2 rounded-xl bg-white/5 border border-pink-500/20 text-pink-100 hover:bg-white/10 hover:border-pink-400/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Close portal (starts deletion timer)"
          >
            {closing ? 'Closing…' : 'Close portal'}
          </button>
        </div>

        {portal?.delete_at && (
          <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-900/15 px-4 py-3">
            <p className="text-xs text-amber-200/90">
              Deletion countdown: <span className="font-semibold">{msToMMSS(countdownMs ?? 0)}</span>
            </p>
            <p className="text-[11px] text-amber-200/70 mt-1">
              If the other person closes the portal before the timer ends, the conversation deletes immediately.
            </p>
          </div>
        )}

        {otherClosed && (
          <div className="mt-3 rounded-2xl border border-cyan-300/20 bg-cyan-900/15 px-4 py-3">
            <p className="text-xs text-cyan-100/90">
              {otherName} closed the portal. If you close it too, the conversation will delete instantly.
            </p>
          </div>
        )}

        <div className="mt-5 rounded-2xl border border-pink-500/15 bg-black/20 overflow-hidden">
          <div
            ref={listRef}
            className="max-h-[45vh] md:max-h-[50vh] overflow-y-auto p-4 space-y-3"
          >
            {loading ? (
              <p className="text-center text-purple-200/70 text-sm py-8">Opening the portal…</p>
            ) : messages.length === 0 ? (
              <p className="text-center text-purple-200/70 text-sm py-8">
                No messages yet. Say hi through the stars.
              </p>
            ) : (
              messages.map((m) => {
                const mine = m.sender_role === senderRole
                const bubble = mine
                  ? 'bg-gradient-to-r from-pink-500/70 to-purple-600/70 text-white border-white/10'
                  : 'bg-white/5 text-purple-50 border-pink-500/15'
                const align = mine ? 'justify-end' : 'justify-start'
                const name =
                  m.sender_role === 'gf' ? 'Her' : 'Him'

                const msgReacts = reactions.filter((r) => r.message_id === m.id)
                const counts = msgReacts.reduce<Record<string, number>>((acc, r) => {
                  acc[r.emoji] = (acc[r.emoji] || 0) + 1
                  return acc
                }, {})
                return (
                  <div key={m.id} className={`flex ${align}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl border px-4 py-3 ${bubble}`}
                      onPointerDown={(e) => {
                        if (m.is_unsent) return
                        if (!senderRole) return
                        clearLongPress()
                        longPressStartRef.current = { x: e.clientX, y: e.clientY }
                        longPressTimerRef.current = window.setTimeout(() => {
                          openPicker(m.id, e.clientX, e.clientY)
                        }, 450)
                      }}
                      onPointerUp={clearLongPress}
                      onPointerCancel={clearLongPress}
                      onPointerMove={(e) => {
                        const start = longPressStartRef.current
                        if (!start || !longPressTimerRef.current) return
                        const dx = Math.abs(e.clientX - start.x)
                        const dy = Math.abs(e.clientY - start.y)
                        if (dx + dy > 12) clearLongPress()
                      }}
                      onContextMenu={(e) => {
                        if (m.is_unsent) return
                        if (!senderRole) return
                        e.preventDefault()
                        clearLongPress()
                        openPicker(m.id, e.clientX, e.clientY)
                      }}
                      title="Press and hold to react"
                    >
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <span className="text-[11px] opacity-90">{name}</span>
                        <span className="text-[10px] opacity-70">{formatDateTimeInPH(m.created_at)}</span>
                      </div>
                      {m.is_unsent ? (
                        <p className="text-sm italic opacity-80">Message unsent</p>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap leading-relaxed break-words">
                          {m.message}
                        </p>
                      )}

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {Object.keys(counts).length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {Object.entries(counts).map(([emoji, count]) => (
                              <span
                                key={emoji}
                                className="text-xs px-2 py-1 rounded-full bg-black/20 border border-white/10"
                              >
                                {emoji} {count}
                              </span>
                            ))}
                          </div>
                        )}
                        <span className="ml-auto text-[11px] opacity-70">
                          {m.is_unsent ? '' : 'Long-press to react'}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          <div className="border-t border-pink-500/15 p-4">
            <div className="flex gap-2 items-end">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={2}
                maxLength={1000}
                placeholder={canUse ? 'Send a message through the portal…' : 'Log in first.'}
                disabled={!canUse || sending}
                className="flex-1 rounded-2xl bg-purple-950/40 border border-pink-500/20 px-4 py-3 text-sm text-white placeholder-purple-200/40 focus:outline-none focus:border-pink-400/30 focus:ring-2 focus:ring-pink-400/10 resize-none"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!canSend}
                className="px-4 py-3 rounded-2xl bg-gradient-to-r from-cyan-400/70 to-pink-500/70 text-slate-950 font-semibold text-sm hover:from-cyan-300 hover:to-pink-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_24px_rgba(34,211,238,0.16)]"
              >
                {sending ? '…' : 'Send'}
              </button>
            </div>
            <p className="text-[11px] text-purple-200/60 mt-2">
              Tip: when you’re done, both tap <span className="text-pink-200/90 font-semibold">Close portal</span> to delete it instantly.
            </p>
          </div>
        </div>
      </div>

      {picker && senderRole && (() => {
        const msg = messages.find((m) => m.id === picker.messageId) || null
        if (!msg || msg.is_unsent) return null
        const mine = msg.sender_role === senderRole
        return (
          <div
            className="fixed z-[9999] -translate-x-1/2 -translate-y-full"
            style={{ left: picker.x, top: picker.y }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rounded-2xl border border-pink-500/20 bg-slate-950/90 backdrop-blur px-2 py-2 shadow-2xl">
              <div className="flex items-center gap-1">
                {quickEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => toggleReaction(picker.messageId, emoji)}
                    className="px-2 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-sm"
                    title="React"
                  >
                    {emoji}
                  </button>
                ))}
                {mine && (
                  <button
                    type="button"
                    onClick={() => handleUnsend(picker.messageId)}
                    className="ml-1 px-2 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/15 border border-red-400/20 transition-colors text-xs text-red-100"
                    title="Unsend"
                  >
                    Unsend
                  </button>
                )}
              </div>
              <div className="mt-1 text-[10px] text-purple-200/60 text-center">
                Tap outside to close
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

