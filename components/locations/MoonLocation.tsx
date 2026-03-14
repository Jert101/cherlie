'use client'

interface MoonLocationProps {
  onClick: () => void
}

export default function MoonLocation({ onClick }: MoonLocationProps) {
  return (
    <button
      onClick={onClick}
      className="relative w-full h-full min-h-[180px] bg-gradient-to-br from-indigo-900/40 via-purple-900/40 to-slate-900/60 backdrop-blur-sm rounded-2xl border-2 border-pink-500/40 cursor-pointer hover:border-pink-500/70 transition-all duration-300 hover:glow-soft overflow-hidden group"
    >
      {/* Soft moon glow */}
      <div className="absolute inset-0">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full bg-gradient-to-b from-blue-200/80 via-indigo-300/60 to-transparent blur-2xl opacity-70" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(248,250,252,0.3),transparent_55%),radial-gradient(circle_at_80%_80%,rgba(129,140,248,0.35),transparent_60%)] opacity-60" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 z-10">
        <div className="text-6xl mb-3 group-hover:scale-110 transition-transform duration-300">
          🌙
        </div>
        <h3 className="text-2xl font-bold text-handwritten text-pink-200 mb-1">
          The Moon
        </h3>
        <p className="text-xs md:text-sm text-purple-100/90 text-center max-w-md">
          A quiet secret place that only appears for the one who keeps coming back.
        </p>
      </div>
    </button>
  )
}

