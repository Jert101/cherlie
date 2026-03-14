'use client'

import { useState, useEffect, useMemo } from 'react'
import { supabase, Memory, Letter, Surprise, Wish, DailyMessage } from '@/lib/supabase'
import { buildMemoryStarsFromMemories, type MemoryStarData } from '@/lib/starUtils'
import WorldStarSky from './stars/WorldStarSky'
import MemoryGarden from './locations/MemoryGarden'
import LoveLetterHouse from './locations/LoveLetterHouse'
import GameArcade from './locations/GameArcade'
import StarHill from './locations/StarHill'
import FinalCliff from './locations/FinalCliff'
import MoonLocation from './locations/MoonLocation'
import LocationModal from './LocationModal'
import MemoryPuzzle from './games/MemoryPuzzle'
import HeartCatcher from './games/HeartCatcher'
import TimelineRunner from './games/TimelineRunner'
import FinalCliffModal from './locations/FinalCliffModal'

type Location = 'memory-garden' | 'love-letter-house' | 'game-arcade' | 'star-hill' | 'final-cliff' | 'moon' | null

interface WorldMapProps {
  visitCount: number
}

export default function WorldMap({ visitCount }: WorldMapProps) {
  const [activeLocation, setActiveLocation] = useState<Location>(null)
  const [memories, setMemories] = useState<Memory[]>([])
  const [letters, setLetters] = useState<Letter[]>([])
  const [surprises, setSurprises] = useState<Surprise[]>([])
  const [wishes, setWishes] = useState<Wish[]>([])
  const [isCreatingWish, setIsCreatingWish] = useState(false)
  const [dailyMessages, setDailyMessages] = useState<DailyMessage[]>([])
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null)

  const memoryStars: MemoryStarData[] = useMemo(
    () => buildMemoryStarsFromMemories(memories),
    [memories]
  )

  const todaysMessage = useMemo(() => {
    if (!dailyMessages.length) return null
    const today = new Date()
    const dayIndex =
      today.getFullYear() * 1000 + today.getMonth() * 50 + today.getDate()
    const visibleMessages = dailyMessages.filter((m) => m.visible)
    if (!visibleMessages.length) return null
    const index = Math.abs(dayIndex) % visibleMessages.length
    return visibleMessages[index]
  }, [dailyMessages])

  const visitRewardText = useMemo(() => {
    if (!visitCount || visitCount < 2) return null
    if (visitCount >= 10) {
      return 'You\'ve visited our world so many times that a secret place in the sky has opened just for you.'
    }
    if (visitCount >= 5) {
      return `You’ve already visited ${visitCount} times. Keep coming back and something magical will unlock.`
    }
    return `You’ve visited ${visitCount} times. Every return means more than you know.`
  }, [visitCount])

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      // Load visible memories
      const { data: memData } = await supabase
        .from('memories')
        .select('*')
        .eq('visible', true)
        .order('date', { ascending: false })

      if (memData) setMemories(memData)

      // Load visible letters
      const { data: letterData } = await supabase
        .from('letters')
        .select('*')
        .eq('visible', true)
        .order('order_index', { ascending: true })

      if (letterData) setLetters(letterData)

      // Load visible surprises
      const { data: surpriseData } = await supabase
        .from('surprises')
        .select('*')
        .eq('visible', true)

      if (surpriseData) setSurprises(surpriseData)

      // Load visible wishes
      const { data: wishData } = await supabase
        .from('wishes')
        .select('*')
        .eq('visible', true)
        .order('created_at', { ascending: false })

      if (wishData) setWishes(wishData)

      // Load daily love messages
      const { data: dailyData } = await supabase
        .from('daily_messages')
        .select('*')
        .eq('visible', true)
        .order('order_index', { ascending: true })

      if (dailyData) setDailyMessages(dailyData)
    } catch (err) {
      console.error('Error loading content:', err)
    }
  }

  const handleLocationClick = (location: Location) => {
    setActiveLocation(location)
  }

  const handleCloseModal = () => {
    setActiveLocation(null)
  }

  const handleCreateWish = async (message: string) => {
    const trimmed = message.trim()
    if (!trimmed) return

    try {
      setIsCreatingWish(true)
      const { data, error } = await supabase
        .from('wishes')
        .insert({ message: trimmed, visible: true })
        .select('*')
        .single()

      if (error) throw error
      if (data) {
        setWishes((prev) => [data, ...prev])
      }
    } catch (err) {
      console.error('Error creating wish:', err)
    } finally {
      setIsCreatingWish(false)
    }
  }

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden overflow-y-auto">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-900/20 via-purple-900/30 to-indigo-900/20 animate-pulse" style={{ animationDuration: '8s' }} />
        
        {/* Floating orbs */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full blur-3xl animate-float opacity-30"
            style={{
              width: `${200 + i * 50}px`,
              height: `${200 + i * 50}px`,
              left: `${10 + i * 15}%`,
              top: `${10 + (i % 3) * 30}%`,
              background: i % 2 === 0 ? 'radial-gradient(circle, #EC4899, transparent)' : 'radial-gradient(circle, #6B46C1, transparent)',
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${10 + i * 2}s`
            }}
          />
        ))}
      </div>

      {/* Map Container */}
      <div className="relative flex items-center justify-center p-4 md:p-8 min-h-screen">
        {/* Mobile intro text + daily / visit messages */}
        <div className="absolute top-4 inset-x-0 flex flex-col items-center gap-2 md:top-8 px-4">
          <p className="md:hidden text-center text-sm font-medium text-pink-100 drop-shadow-md">
            You&apos;re in our secret world, my love.
          </p>
          {todaysMessage && (
            <div className="max-w-xl rounded-2xl bg-purple-900/70 border border-pink-500/50 px-4 py-2 shadow-lg backdrop-blur-sm animate-pulse-glow">
              <p className="text-xs md:text-sm text-center text-pink-100">
                <span className="font-semibold text-pink-300 mr-1">
                  Today&apos;s message from me:
                </span>
                {todaysMessage.message}
              </p>
            </div>
          )}
          {visitRewardText && (
            <p className="max-w-xl text-[11px] md:text-xs text-center text-pink-200/90">
              {visitRewardText}
            </p>
          )}
        </div>
        <div className="relative w-full max-w-6xl min-h-[70vh] md:min-h-[60vh] bg-gradient-to-br from-purple-900/40 via-pink-900/30 to-indigo-900/40 backdrop-blur-md rounded-3xl border-2 border-pink-500/40 overflow-hidden shadow-2xl glow-soft">
          {/* Enhanced Background Pattern */}
          <div className="absolute inset-0">
            {/* Animated starfield */}
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgba(236, 72, 153, 0.5) 1px, transparent 0)`,
              backgroundSize: '40px 40px',
              animation: 'starfield 20s linear infinite'
            }} />
            
            {/* Glowing grid lines */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `
                linear-gradient(rgba(236, 72, 153, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(236, 72, 153, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }} />
          </div>

          {/* Magical floating elements */}
          <div className="absolute inset-0 z-5 pointer-events-none hidden sm:block">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute text-2xl animate-float opacity-20"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${4 + Math.random() * 3}s`
                }}
              >
                {['✨', '⭐', '💫', '🌟'][Math.floor(Math.random() * 4)]}
              </div>
            ))}
          </div>

          {/* Semantic star sky tied to memories */}
          <div className="absolute inset-0 z-[6] pointer-events-none">
            <WorldStarSky memoryStars={memoryStars} />
          </div>

          {/* World Map Layout - Floating Island */}
          <div className="relative z-10 h-full p-4 md:p-8 flex items-center justify-center">
            {/* Mobile: simple stacked icons for clarity */}
            <div className="grid grid-cols-1 gap-4 md:hidden w-full max-w-sm">
              <IslandSpot
                icon="🌺"
                label="Memory Garden"
                subtitle={`${memories.length} memories`}
                onClick={() => handleLocationClick('memory-garden')}
              />
              <IslandSpot
                icon="💌"
                label="Love Letter House"
                subtitle={`${letters.length} letters`}
                onClick={() => handleLocationClick('love-letter-house')}
              />
              <IslandSpot
                icon="🎮"
                label="Game Arcade"
                subtitle="Play together, laugh together"
                onClick={() => handleLocationClick('game-arcade')}
              />
              <IslandSpot
                icon="⭐"
                label="Star Hill"
                subtitle={`${surprises.length} surprises`}
                onClick={() => handleLocationClick('star-hill')}
              />
              <IslandSpot
                icon="🌅"
                label="Final Cliff"
                subtitle="Where our story peaks"
                onClick={() => handleLocationClick('final-cliff')}
              />
              {visitCount >= 10 && (
                <IslandSpot
                  icon="🌙"
                  label="The Moon"
                  subtitle="Secret place above everything"
                  onClick={() => handleLocationClick('moon')}
                />
              )}
            </div>

            {/* Desktop: single floating island with spots */}
            <div className="hidden md:block relative w-full max-w-4xl h-[420px]">
              {/* Island blob */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[75%] rounded-[60%] bg-gradient-to-br from-purple-900/80 via-pink-900/70 to-indigo-900/80 shadow-[0_40px_80px_rgba(15,23,42,0.9)] border border-pink-500/40" />
              {/* Island highlight */}
              <div className="absolute left-1/2 top-[35%] -translate-x-1/2 w-[60%] h-[30%] rounded-[50%] bg-gradient-to-b from-pink-300/20 to-transparent blur-2xl" />

              {/* Spots positioned around the island */}
              <IslandSpot
                icon="🌺"
                label="Memory Garden"
                subtitle={`${memories.length} memories`}
                onClick={() => handleLocationClick('memory-garden')}
                className="absolute left-[18%] top-[28%]"
              />
              <IslandSpot
                icon="💌"
                label="Love Letter House"
                subtitle={`${letters.length} letters`}
                onClick={() => handleLocationClick('love-letter-house')}
                className="absolute right-[18%] top-[30%]"
              />
              <IslandSpot
                icon="🎮"
                label="Game Arcade"
                subtitle="Play together, laugh together"
                onClick={() => handleLocationClick('game-arcade')}
                className="absolute left-1/2 -translate-x-1/2 top-[16%]"
              />
              <IslandSpot
                icon="⭐"
                label="Star Hill"
                subtitle={`${surprises.length} surprises`}
                onClick={() => handleLocationClick('star-hill')}
                className="absolute left-[22%] bottom-[18%]"
              />
              <IslandSpot
                icon="🌅"
                label="Final Cliff"
                subtitle="Where our story peaks"
                onClick={() => handleLocationClick('final-cliff')}
                className="absolute right-[22%] bottom-[16%]"
              />
              {visitCount >= 10 && (
                <IslandSpot
                  icon="🌙"
                  label="The Moon"
                  subtitle="Secret place above everything"
                  onClick={() => handleLocationClick('moon')}
                  className="absolute left-1/2 -translate-x-1/2 bottom-[6%]"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Location Modals */}
      {activeLocation === 'memory-garden' && (
        <LocationModal
          title="Memory Garden"
          onClose={handleCloseModal}
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto p-4">
            {selectedMemory && (
              <div className="relative rounded-2xl bg-gradient-to-br from-purple-900/80 via-pink-900/70 to-purple-950/80 border border-pink-500/40 p-4 md:p-5 overflow-hidden">
                {/* Petal overlay */}
                <div className="pointer-events-none absolute inset-0 opacity-50">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute text-xl md:text-2xl animate-float"
                      style={{
                        left: `${(i * 19) % 100}%`,
                        top: `${(i * 37) % 100}%`,
                        animationDuration: `${6 + (i % 4)}s`,
                        animationDelay: `${i * 0.3}s`,
                      }}
                    >
                      🌸
                    </div>
                  ))}
                </div>

                <div className="relative z-10 flex flex-col md:flex-row gap-4 md:gap-6 items-start">
                  <div className="w-full md:w-1/3 rounded-xl overflow-hidden border border-pink-500/40">
                    <img
                      src={selectedMemory.image_url}
                      alt={selectedMemory.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 text-left space-y-2">
                    <h3 className="text-xl md:text-2xl font-bold text-pink-200">
                      {selectedMemory.title}
                    </h3>
                    <div className="text-xs md:text-sm text-purple-200 flex flex-wrap gap-3">
                      <span>📅 {new Date(selectedMemory.date).toLocaleDateString()}</span>
                      {selectedMemory.location && <span>📍 {selectedMemory.location}</span>}
                    </div>
                    <p className="text-sm md:text-base text-purple-100 whitespace-pre-wrap mt-2">
                      {selectedMemory.description}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {memories.map((memory) => (
                <button
                  key={memory.id}
                  type="button"
                  onClick={() => setSelectedMemory(memory)}
                  className="text-left"
                >
                  <MemoryCard memory={memory} />
                </button>
              ))}
            </div>
          </div>
        </LocationModal>
      )}

      {activeLocation === 'love-letter-house' && (
        <LocationModal
          title="Love Letter House"
          onClose={handleCloseModal}
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto p-4">
            {letters.map((letter) => (
              <LetterCard key={letter.id} letter={letter} />
            ))}
          </div>
        </LocationModal>
      )}

      {activeLocation === 'game-arcade' && (
        <LocationModal
          title="Game Arcade"
          onClose={handleCloseModal}
        >
          <GameArcadeContent />
        </LocationModal>
      )}

      {activeLocation === 'star-hill' && (
        <LocationModal
          title="Star Hill"
          onClose={handleCloseModal}
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto p-4">
            <WishStarField wishes={wishes} />
            <WishForm onCreate={handleCreateWish} isSubmitting={isCreatingWish} />
            <div className="space-y-4">
              {surprises.map((surprise) => (
                <SurpriseCard key={surprise.id} surprise={surprise} />
              ))}
            </div>
          </div>
        </LocationModal>
      )}

      {activeLocation === 'final-cliff' && (
        <FinalCliffModal onClose={handleCloseModal} memories={memories} />
      )}

      {activeLocation === 'moon' && (
        <LocationModal
          title="The Moon"
          onClose={handleCloseModal}
        >
          <div className="max-h-[70vh] overflow-y-auto p-6 text-center space-y-4">
            <div className="text-6xl mb-2">🌙</div>
            <h3 className="text-2xl font-bold text-pink-300 mb-2 text-handwritten">
              Our quiet place above everything
            </h3>
            <p className="text-purple-100 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
              {`Even if the universe restarted a thousand times,\nI would still find my way back to you.`}
            </p>
            <p className="text-purple-200 text-xs md:text-sm">
              You unlocked this place just by keep coming back here.
              That&apos;s all it ever takes for me too—just you, choosing us, again and again.
            </p>
          </div>
        </LocationModal>
      )}
    </div>
  )
}

// Memory Card Component
function MemoryCard({ memory }: { memory: Memory }) {
  return (
    <div className="bg-purple-900/40 backdrop-blur-sm rounded-xl p-4 border border-pink-500/30 hover:border-pink-500/60 transition-all duration-300 hover:glow-soft">
      <div className="relative aspect-square mb-3 rounded-lg overflow-hidden">
        <img
          src={memory.image_url}
          alt={memory.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <h3 className="font-bold text-pink-300 mb-1 truncate">{memory.title}</h3>
      <p className="text-sm text-purple-200 mb-2 line-clamp-3 break-words overflow-hidden">{memory.description}</p>
      <div className="flex justify-between text-xs text-purple-300">
        <span>📅 {new Date(memory.date).toLocaleDateString()}</span>
        {memory.location && <span>📍 {memory.location}</span>}
      </div>
    </div>
  )
}

// Letter Card Component – envelope that opens into a letter
function LetterCard({ letter }: { letter: Letter }) {
  const [open, setOpen] = useState(false)

  return (
    <button
      type="button"
      onClick={() => setOpen((v) => !v)}
      className="w-full text-left px-1 md:px-2"
    >
      <div className="bg-purple-900/40 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-pink-500/30 hover:border-pink-500/60 transition-all duration-300 hover:glow-soft">
        {/* Envelope header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-8 md:w-12 md:h-10 rounded-md bg-gradient-to-br from-pink-500 to-purple-500 relative overflow-hidden shadow-[0_0_12px_rgba(236,72,153,0.8)]">
              {/* Envelope flap */}
              <div
                className={`absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-pink-300 to-pink-500 transform origin-top transition-transform duration-300 ${
                  open ? 'rotate-x-180' : ''
                }`}
              />
              <div className="absolute inset-0 flex items-center justify-center text-lg md:text-xl">
                💌
              </div>
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold text-handwritten text-pink-300">
                {letter.title}
              </h3>
              {!open && (
                <p className="text-xs text-purple-200/80">
                  Tap to open this letter
                </p>
              )}
            </div>
          </div>
          <span className="text-xs text-pink-200/80">
            {open ? 'Open' : 'Sealed'}
          </span>
        </div>

        {/* Letter body */}
        <div
          className={`mt-2 rounded-xl bg-purple-950/60 border border-pink-500/20 px-5 py-4 text-xs md:text-sm text-purple-100 whitespace-pre-wrap leading-relaxed transition-all duration-300 ${
            open
              ? 'max-h-[300px] opacity-100'
              : 'max-h-0 opacity-0 overflow-hidden border-transparent px-4 py-0'
          }`}
        >
          {letter.content}
        </div>
      </div>
    </button>
  )
}

// Surprise Card Component
function SurpriseCard({ surprise }: { surprise: Surprise }) {
  return (
    <div className="bg-purple-900/40 backdrop-blur-sm rounded-xl p-6 border border-pink-500/30 hover:border-pink-500/60 transition-all duration-300 hover:glow-soft">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">
          {surprise.type === 'audio' ? '🎵' : surprise.type === 'image' ? '🖼️' : '⭐'}
        </span>
        <h3 className="text-xl font-bold text-pink-300">{surprise.title}</h3>
      </div>
      <div className="text-purple-200 whitespace-pre-wrap">
        {surprise.content}
      </div>
      {surprise.type === 'audio' && (
        <audio controls className="mt-4 w-full">
          <source src={surprise.content} type="audio/mpeg" />
        </audio>
      )}
      {surprise.type === 'image' && (
        <img src={surprise.content} alt={surprise.title} className="mt-4 rounded-lg w-full" />
      )}
    </div>
  )
}

// Game Arcade Content
function GameArcadeContent() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null)

  return (
    <div className="p-4">
      {!selectedGame ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GameButton
            title="Memory Puzzle"
            emoji="🧩"
            onClick={() => setSelectedGame('memory-puzzle')}
          />
          <GameButton
            title="Heart Catcher"
            emoji="💕"
            onClick={() => setSelectedGame('heart-catcher')}
          />
          <GameButton
            title="Timeline Runner"
            emoji="🏃"
            onClick={() => setSelectedGame('timeline-runner')}
          />
        </div>
      ) : (
        <div>
          <button
            onClick={() => setSelectedGame(null)}
            className="mb-4 px-4 py-2 bg-purple-800/50 rounded-lg hover:bg-purple-700/50 transition-colors"
          >
            ← Back to Games
          </button>
          {selectedGame === 'memory-puzzle' && <MemoryPuzzle />}
          {selectedGame === 'heart-catcher' && <HeartCatcher />}
          {selectedGame === 'timeline-runner' && <TimelineRunner />}
        </div>
      )}
    </div>
  )
}

function GameButton({ title, emoji, onClick }: { title: string; emoji: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-purple-900/40 backdrop-blur-sm rounded-xl p-8 border-2 border-pink-500/30 hover:border-pink-500/60 transition-all duration-300 hover:glow-soft transform hover:scale-105 active:scale-95"
    >
      <div className="text-6xl mb-4">{emoji}</div>
      <div className="text-xl font-bold text-pink-300">{title}</div>
    </button>
  )
}

// Simple island map spot
function IslandSpot({
  icon,
  label,
  subtitle,
  onClick,
  className = '',
}: {
  icon: string
  label: string
  subtitle?: string
  onClick: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group inline-flex flex-col items-center gap-1 text-center cursor-pointer ${className}`}
    >
      <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 shadow-[0_0_25px_rgba(236,72,153,0.9)] flex items-center justify-center border border-pink-200/60 group-hover:scale-110 group-active:scale-95 transition-transform duration-300">
        <span className="text-3xl md:text-4xl">{icon}</span>
      </div>
      <div className="space-y-0.5">
        <div className="text-sm md:text-base font-semibold text-pink-100">
          {label}
        </div>
        {subtitle && (
          <div className="text-[11px] md:text-xs text-purple-200/90">
            {subtitle}
          </div>
        )}
      </div>
    </button>
  )
}

// Wish star field + form

function WishStarField({ wishes }: { wishes: Wish[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selectedWish = wishes.find((w) => w.id === selectedId) || null

  if (!wishes.length) {
    return (
      <div className="rounded-2xl border border-pink-500/30 bg-purple-900/20 p-4 text-center text-purple-200 text-sm">
        Make a wish and it will become a star in our sky ✨
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-pink-500/30 bg-purple-900/20 p-4">
      <div className="mb-3 text-sm text-pink-200 text-center">
        Tap a star to see a wish.
      </div>
      <div className="relative h-32 bg-gradient-to-b from-purple-900/60 to-purple-950/80 rounded-xl overflow-hidden flex items-center justify-center">
        {wishes.slice(0, 24).map((wish, index) => {
          const angle = (index / Math.max(1, wishes.length)) * Math.PI * 2
          const radius = 40 + (index % 3) * 8
          const left = 50 + Math.cos(angle) * radius
          const top = 50 + Math.sin(angle) * (radius * 0.4)
          const isSelected = selectedId === wish.id

          return (
            <button
              key={wish.id}
              type="button"
              onClick={() => setSelectedId(wish.id)}
              className="absolute"
              style={{ left: `${left}%`, top: `${top}%` }}
            >
              <span
                className={`block w-3 h-3 rounded-full shadow-[0_0_10px_rgba(251,113,133,0.9)] ${
                  isSelected ? 'bg-pink-400 scale-125' : 'bg-pink-300/80'
                } transition-transform duration-200`}
              />
            </button>
          )
        })}
      </div>
      {selectedWish && (
        <div className="mt-4 p-3 rounded-xl bg-purple-900/60 border border-pink-500/40 text-sm text-purple-100 whitespace-pre-wrap">
          {selectedWish.message}
        </div>
      )}
    </div>
  )
}

function WishForm({
  onCreate,
  isSubmitting,
}: {
  onCreate: (message: string) => Promise<void> | void
  isSubmitting: boolean
}) {
  const [value, setValue] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed || isSubmitting) return
    await onCreate(trimmed)
    setValue('')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <label className="block text-sm text-pink-200">
        Make a wish to the stars 🌟
      </label>
      <textarea
        className="w-full rounded-2xl bg-purple-900/40 border border-pink-500/40 px-3 py-2 text-sm text-white placeholder-purple-300 focus:outline-none focus:border-pink-400"
        rows={2}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Write your wish here..."
        disabled={isSubmitting}
      />
      <button
        type="submit"
        disabled={isSubmitting || !value.trim()}
        className="px-4 py-2 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-semibold hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {isSubmitting ? 'Sending to the stars…' : 'Send wish to the stars'}
      </button>
    </form>
  )
}


