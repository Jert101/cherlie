'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminNav from './AdminNav'
import MemoriesPanel from './panels/MemoriesPanel'
import LettersPanel from './panels/LettersPanel'
import SurprisesPanel from './panels/SurprisesPanel'
import GamesPanel from './panels/GamesPanel'
import SettingsPanel from './panels/SettingsPanel'

type Panel = 'dashboard' | 'memories' | 'letters' | 'surprises' | 'games' | 'settings'

export default function AdminDashboard() {
  const [activePanel, setActivePanel] = useState<Panel>('dashboard')
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('userRole')
    router.push('/')
  }

  return (
    <div className="min-h-screen cosmic-gradient">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <div className="flex justify-between items-center mb-4">
            <div className="flex-1"></div>
            <div className="flex-1 text-center">
              <h1 className="text-4xl font-bold text-handwritten text-pink-300 mb-2">
                Admin Panel
              </h1>
              <p className="text-purple-200">Manage "Our World" content</p>
            </div>
            <div className="flex-1 flex justify-end">
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl bg-purple-800/50 hover:bg-purple-700/50 text-purple-200 hover:text-pink-300 transition-all duration-300 text-sm font-semibold"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <AdminNav activePanel={activePanel} onPanelChange={setActivePanel} />

          {/* Main Content */}
          <div className="flex-1 bg-purple-900/40 backdrop-blur-sm rounded-2xl border-2 border-purple-500/30 p-6">
            {activePanel === 'dashboard' && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎛️</div>
                <h2 className="text-3xl font-bold text-pink-300 mb-4">Welcome to Admin Panel</h2>
                <p className="text-purple-200 text-lg">
                  Select a section from the sidebar to manage content
                </p>
              </div>
            )}
            {activePanel === 'memories' && <MemoriesPanel />}
            {activePanel === 'letters' && <LettersPanel />}
            {activePanel === 'surprises' && <SurprisesPanel />}
            {activePanel === 'games' && <GamesPanel />}
            {activePanel === 'settings' && <SettingsPanel />}
          </div>
        </div>
      </div>
    </div>
  )
}
