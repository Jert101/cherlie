'use client'

type Panel =
  | 'dashboard'
  | 'memories'
  | 'letters'
  | 'poems'
  | 'surprises'
  | 'wishes'
  | 'prayers'
  | 'chat-portal'
  | 'games'
  | 'daily-messages'
  | 'settings'

interface AdminNavProps {
  activePanel: Panel
  onPanelChange: (panel: Panel) => void
}

export default function AdminNav({ activePanel, onPanelChange }: AdminNavProps) {
  const navItems: Array<{ id: Panel; label: string; icon: string }> = [
    { id: 'dashboard', label: 'Dashboard', icon: '🎛️' },
    { id: 'memories', label: 'Memories', icon: '🌺' },
    { id: 'letters', label: 'Letters', icon: '💌' },
    { id: 'poems', label: 'River of Poem', icon: '🌊' },
    { id: 'surprises', label: 'Surprises', icon: '⭐' },
    { id: 'wishes', label: 'Star Hill wishes', icon: '🙏' },
    { id: 'prayers', label: 'Prayer Wall', icon: '🕯️' },
    { id: 'chat-portal', label: 'Portal Chat', icon: '🌀' },
    { id: 'games', label: 'Games', icon: '🎮' },
    { id: 'daily-messages', label: 'Daily Messages', icon: '📅' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ]

  return (
    <nav className="w-full lg:w-64 bg-purple-900/40 backdrop-blur-sm rounded-2xl border-2 border-purple-500/30 p-4">
      <ul className="space-y-2">
        {navItems.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => onPanelChange(item.id)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center gap-3 ${
                activePanel === item.id
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white glow-soft'
                  : 'bg-purple-800/30 text-purple-200 hover:bg-purple-800/50 hover:text-pink-300'
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="font-semibold">{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
