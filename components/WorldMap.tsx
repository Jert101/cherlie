'use client'

import { useState, useEffect } from 'react'
import { supabase, Memory, Letter, Surprise } from '@/lib/supabase'
import MemoryGarden from './locations/MemoryGarden'
import LoveLetterHouse from './locations/LoveLetterHouse'
import GameArcade from './locations/GameArcade'
import StarHill from './locations/StarHill'
import FinalCliff from './locations/FinalCliff'
import LocationModal from './LocationModal'
import MemoryPuzzle from './games/MemoryPuzzle'
import HeartCatcher from './games/HeartCatcher'
import TimelineRunner from './games/TimelineRunner'
import FinalCliffModal from './locations/FinalCliffModal'

type Location = 'memory-garden' | 'love-letter-house' | 'game-arcade' | 'star-hill' | 'final-cliff' | null

export default function WorldMap() {
  const [activeLocation, setActiveLocation] = useState<Location>(null)
  const [memories, setMemories] = useState<Memory[]>([])
  const [letters, setLetters] = useState<Letter[]>([])
  const [surprises, setSurprises] = useState<Surprise[]>([])

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

  return (
    <div className="relative w-full h-screen overflow-hidden">
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
      <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8">
        <div className="relative w-full max-w-6xl h-full max-h-[800px] bg-gradient-to-br from-purple-900/40 via-pink-900/30 to-indigo-900/40 backdrop-blur-md rounded-3xl border-2 border-pink-500/40 overflow-hidden shadow-2xl glow-soft">
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
          <div className="absolute inset-0 z-5 pointer-events-none">
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

          {/* Locations Grid */}
          <div className="relative z-10 h-full grid grid-cols-1 md:grid-cols-3 gap-4 p-4 md:p-8">
            {/* Memory Garden - Top Left */}
            <div className="md:col-span-1">
              <MemoryGarden
                memories={memories}
                onClick={() => handleLocationClick('memory-garden')}
              />
            </div>

            {/* Love Letter House - Top Center */}
            <div className="md:col-span-1">
              <LoveLetterHouse
                letters={letters}
                onClick={() => handleLocationClick('love-letter-house')}
              />
            </div>

            {/* Game Arcade - Top Right */}
            <div className="md:col-span-1">
              <GameArcade
                onClick={() => handleLocationClick('game-arcade')}
              />
            </div>

            {/* Star Hill - Bottom Left */}
            <div className="md:col-span-1">
              <StarHill
                surprises={surprises}
                onClick={() => handleLocationClick('star-hill')}
              />
            </div>

            {/* Final Cliff - Bottom Center-Right (spans 2 columns) */}
            <div className="md:col-span-2">
              <FinalCliff
                onClick={() => handleLocationClick('final-cliff')}
              />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[70vh] overflow-y-auto p-4">
            {memories.map((memory) => (
              <MemoryCard key={memory.id} memory={memory} />
            ))}
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
            {surprises.map((surprise) => (
              <SurpriseCard key={surprise.id} surprise={surprise} />
            ))}
          </div>
        </LocationModal>
      )}

      {activeLocation === 'final-cliff' && (
        <FinalCliffModal onClose={handleCloseModal} />
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

// Letter Card Component
function LetterCard({ letter }: { letter: Letter }) {
  return (
    <div className="bg-purple-900/40 backdrop-blur-sm rounded-xl p-6 border border-pink-500/30 hover:border-pink-500/60 transition-all duration-300 hover:glow-soft">
      <h3 className="text-2xl font-bold text-handwritten text-pink-300 mb-4">{letter.title}</h3>
      <div className="text-purple-200 whitespace-pre-wrap leading-relaxed">
        {letter.content}
      </div>
    </div>
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

