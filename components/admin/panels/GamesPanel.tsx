'use client'

import { useState, useEffect } from 'react'
import { supabase, Game } from '@/lib/supabase'

export default function GamesPanel() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Game | null>(null)

  useEffect(() => {
    loadGames()
  }, [])

  const loadGames = async () => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .order('game_name', { ascending: true })

      if (error) throw error
      setGames(data || [])
    } catch (err) {
      console.error('Error loading games:', err)
      alert('Error loading games')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleEnabled = async (game: Game) => {
    try {
      const { error } = await supabase
        .from('games')
        .update({ enabled: !game.enabled })
        .eq('id', game.id)

      if (error) throw error
      loadGames()
    } catch (err) {
      console.error('Error updating game:', err)
      alert('Error updating game')
    }
  }

  const handleSaveMessage = async (game: Game, message: string) => {
    try {
      const { error } = await supabase
        .from('games')
        .update({ success_message: message })
        .eq('id', game.id)

      if (error) throw error
      setEditing(null)
      loadGames()
    } catch (err) {
      console.error('Error updating game message:', err)
      alert('Error updating game message')
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-purple-200">Loading games...</div>
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-pink-300 mb-6">Games</h2>

      <div className="space-y-4">
        {games.map((game) => (
          <div
            key={game.id}
            className="bg-purple-800/30 rounded-xl p-4 border border-purple-500/30"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-pink-300 text-xl mb-1">
                  {game.game_name.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </h3>
                <p className="text-purple-200 text-sm">
                  {game.enabled ? '✅ Enabled' : '❌ Disabled'}
                </p>
              </div>
              <button
                onClick={() => handleToggleEnabled(game)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  game.enabled
                    ? 'bg-red-700/50 hover:bg-red-600/50'
                    : 'bg-green-700/50 hover:bg-green-600/50'
                }`}
              >
                {game.enabled ? 'Disable' : 'Enable'}
              </button>
            </div>

            {editing?.id === game.id ? (
              <div className="space-y-3">
                <textarea
                  value={editing.success_message}
                  onChange={(e) => setEditing({ ...editing, success_message: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg bg-purple-800/50 border border-purple-500/50 text-white focus:outline-none focus:border-pink-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveMessage(game, editing.success_message)}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-300"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditing(null)}
                    className="px-4 py-2 rounded-lg bg-purple-800/50 text-purple-200 hover:bg-purple-700/50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-purple-200 text-sm mb-3">{game.success_message}</p>
                <button
                  onClick={() => setEditing(game)}
                  className="px-4 py-2 rounded-lg bg-purple-700/50 hover:bg-purple-600/50 text-sm transition-colors"
                >
                  Edit Success Message
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
