'use client'

import { useState, useEffect } from 'react'
import { supabase, SiteSettings, VisitStats } from '@/lib/supabase'

export default function SettingsPanel() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [visitStats, setVisitStats] = useState<VisitStats | null>(null)

  useEffect(() => {
    loadSettings()
    loadVisitStats()
  }, [])

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single()

      if (error) throw error
      setSettings(data)
    } catch (err) {
      console.error('Error loading settings:', err)
      alert('Error loading settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!settings) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('site_settings')
        .update({
          site_name: settings.site_name,
          gf_name: settings.gf_name,
          gf_code: settings.gf_code,
          admin_code: settings.admin_code,
          bf_code: settings.bf_code || null,
          time_lock_enabled: settings.time_lock_enabled,
          unlock_date: settings.unlock_date || null,
          music_url: settings.music_url || null,
          rocket_delay: settings.rocket_delay,
          planet_rotation_speed: settings.planet_rotation_speed,
          final_message: settings.final_message,
        })
        .eq('id', '00000000-0000-0000-0000-000000000000')

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      alert('Settings saved successfully!')
    } catch (err: any) {
      console.error('Error saving settings:', err)
      const errorMessage = err?.message || err?.error?.message || 'Unknown error occurred'
      alert(`Error saving settings: ${errorMessage}\n\nCheck the browser console for more details.`)
    } finally {
      setSaving(false)
    }
  }

  const loadVisitStats = async () => {
    try {
      const { data, error } = await supabase
        .from('visit_stats')
        .select('*')
        .eq('id', 'gf_world')
        .limit(1)

      if (error) throw error
      const existing = data && data.length > 0 ? data[0] : null
      setVisitStats(existing)
    } catch (err) {
      console.error('Error loading visit stats:', err)
    }
  }

  const handleSetVisits = async (value: number) => {
    const safe = Math.max(0, Math.floor(value))
    try {
      const { data, error } = await supabase
        .from('visit_stats')
        .upsert(
          {
            id: 'gf_world',
            visit_count: safe,
            last_visit: new Date().toISOString(),
          },
          { onConflict: 'id' }
        )
        .select('*')

      if (error) throw error
      if (data && data.length > 0) {
        setVisitStats(data[0])
      } else {
        setVisitStats({ id: 'gf_world', visit_count: safe, last_visit: new Date().toISOString() })
      }
    } catch (err) {
      console.error('Error updating visit stats:', err)
      alert('Error updating visit stats')
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-purple-200">Loading settings...</div>
  }

  if (!settings) {
    return <div className="text-center py-12 text-purple-200">Settings not found</div>
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-pink-300 mb-6">Site Settings</h2>

      <div className="mb-6 p-4 rounded-xl bg-purple-800/30 border border-purple-500/30 text-purple-200">
        <p className="font-semibold mb-1 text-pink-300">💡 Dynamic Configuration</p>
        <p className="text-sm">
          All settings here are fully dynamic and editable. Changes take effect immediately without redeployment.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block text-purple-200 mb-2">Site Name</label>
          <input
            type="text"
            value={settings.site_name || ''}
            onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
            required
            className="w-full px-4 py-2 rounded-lg bg-purple-800/50 border border-purple-500/50 text-white focus:outline-none focus:border-pink-500"
            placeholder="Our World"
          />
          <p className="text-xs text-purple-300 mt-1">
            This name appears on the code entry page
          </p>
        </div>

        <div>
          <label className="block text-purple-200 mb-2">GF Name / Pet Name</label>
          <input
            type="text"
            value={settings.gf_name || ''}
            onChange={(e) => setSettings({ ...settings, gf_name: e.target.value })}
            required
            className="w-full px-4 py-2 rounded-lg bg-purple-800/50 border border-purple-500/50 text-white focus:outline-none focus:border-pink-500"
            placeholder="baby"
          />
          <p className="text-xs text-purple-300 mt-1">
            This name appears in the welcome message (e.g., "Welcome to our world, [name]")
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-purple-200 mb-2">GF Code</label>
            <input
              type="text"
              value={settings.gf_code}
              onChange={(e) => setSettings({ ...settings, gf_code: e.target.value })}
              required
              className="w-full px-4 py-2 rounded-lg bg-purple-800/50 border border-purple-500/50 text-white focus:outline-none focus:border-pink-500"
              placeholder="Enter GF access code"
            />
            <p className="text-xs text-purple-300 mt-1">
              Code for the main user to access the world
            </p>
          </div>

          <div>
            <label className="block text-purple-200 mb-2">Admin Code</label>
            <input
              type="text"
              value={settings.admin_code}
              onChange={(e) => setSettings({ ...settings, admin_code: e.target.value })}
              required
              className="w-full px-4 py-2 rounded-lg bg-purple-800/50 border border-purple-500/50 text-white focus:outline-none focus:border-pink-500"
              placeholder="Enter admin access code"
            />
            <p className="text-xs text-purple-300 mt-1">
              Code to access the admin panel
            </p>
          </div>
        </div>

        <div>
          <label className="block text-purple-200 mb-2">BF Code (optional)</label>
          <input
            type="text"
            value={settings.bf_code || ''}
            onChange={(e) => setSettings({ ...settings, bf_code: e.target.value })}
            className="w-full px-4 py-2 rounded-lg bg-purple-800/50 border border-purple-500/50 text-white focus:outline-none focus:border-pink-500"
            placeholder="Secret code for you to enter her world"
          />
          <p className="text-xs text-purple-300 mt-1">
            When used, enters the world as a hidden &quot;bf&quot; role (she won&apos;t see this).
          </p>
        </div>

        <div>
          <label className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              checked={settings.time_lock_enabled}
              onChange={(e) => setSettings({ ...settings, time_lock_enabled: e.target.checked })}
              className="w-4 h-4 rounded"
            />
            <span className="text-purple-200">Enable Time Lock</span>
          </label>
        </div>

        {settings.time_lock_enabled && (
          <div>
            <label className="block text-purple-200 mb-2">Unlock Date & Time</label>
            <input
              type="datetime-local"
              value={settings.unlock_date ? new Date(settings.unlock_date).toISOString().slice(0, 16) : ''}
              onChange={(e) => setSettings({ ...settings, unlock_date: e.target.value ? new Date(e.target.value).toISOString() : null })}
              className="w-full px-4 py-2 rounded-lg bg-purple-800/50 border border-purple-500/50 text-white focus:outline-none focus:border-pink-500"
            />
          </div>
        )}

        <div>
          <label className="block text-purple-200 mb-2">Music URL (optional)</label>
          <input
            type="url"
            value={settings.music_url || ''}
            onChange={(e) => setSettings({ ...settings, music_url: e.target.value || null })}
            className="w-full px-4 py-2 rounded-lg bg-purple-800/50 border border-purple-500/50 text-white focus:outline-none focus:border-pink-500"
            placeholder="https://example.com/music.mp3"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-purple-200 mb-2">Rocket Delay (ms)</label>
            <input
              type="number"
              value={settings.rocket_delay}
              onChange={(e) => setSettings({ ...settings, rocket_delay: parseInt(e.target.value) || 2000 })}
              min="0"
              className="w-full px-4 py-2 rounded-lg bg-purple-800/50 border border-purple-500/50 text-white focus:outline-none focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block text-purple-200 mb-2">Planet Rotation Speed</label>
            <input
              type="number"
              step="0.1"
              value={settings.planet_rotation_speed}
              onChange={(e) => setSettings({ ...settings, planet_rotation_speed: parseFloat(e.target.value) || 0.5 })}
              min="0"
              max="2"
              className="w-full px-4 py-2 rounded-lg bg-purple-800/50 border border-purple-500/50 text-white focus:outline-none focus:border-pink-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-purple-200 mb-2">Final Message</label>
          <textarea
            value={settings.final_message}
            onChange={(e) => setSettings({ ...settings, final_message: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 rounded-lg bg-purple-800/50 border border-purple-500/50 text-white focus:outline-none focus:border-pink-500"
          />
        </div>

        <div className="mt-8 p-4 rounded-xl bg-purple-800/40 border border-purple-500/40 text-purple-100 space-y-3">
          <p className="font-semibold text-pink-300">
            🌙 World Visit Counter (global for GF)
          </p>
          <p className="text-xs text-purple-200">
            This tracks how many times `/world` has been opened by her (stored in the database,
            not per device). It controls when the secret Moon location appears.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span>
              Current visits:{' '}
              <span className="font-semibold text-pink-200">
                {visitStats ? visitStats.visit_count : '0'}
              </span>
            </span>
            <button
              type="button"
              onClick={() => handleSetVisits(0)}
              className="px-3 py-1 rounded-lg bg-purple-700/60 hover:bg-purple-600/60 text-xs"
            >
              Reset to 0
            </button>
            <button
              type="button"
              onClick={() => handleSetVisits(10)}
              className="px-3 py-1 rounded-lg bg-purple-700/60 hover:bg-purple-600/60 text-xs"
            >
              Set to 10 (unlock Moon)
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  )
}
