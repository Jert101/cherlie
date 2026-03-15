'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { toPng } from 'html-to-image'
import { supabase, Memory, Letter, Poem, Surprise, Wish, DailyMessage } from '@/lib/supabase'
import { buildMemoryStarsFromMemories, type MemoryStarData } from '@/lib/starUtils'
import { getDayIndexInPH, formatDateInPH } from '@/lib/dateUtils'
import { isYouTubeUrl, extractYouTubeId, getYouTubeEmbedUrlWithControls } from '@/lib/youtubeUtils'
import WorldStarSky from './stars/WorldStarSky'
import MemoryGarden from './locations/MemoryGarden'
import LoveLetterHouse from './locations/LoveLetterHouse'
import RiverOfPoem from './locations/RiverOfPoem'
import GameArcade from './locations/GameArcade'
import StarHill from './locations/StarHill'
import FinalCliff from './locations/FinalCliff'
import MoonLocation from './locations/MoonLocation'
import LocationModal from './LocationModal'
import MemoryPuzzle from './games/MemoryPuzzle'
import HeartCatcher from './games/HeartCatcher'
import SayILoveYou from './games/SayILoveYou'
import FinalCliffModal from './locations/FinalCliffModal'

type Location = 'memory-garden' | 'love-letter-house' | 'river-of-poem' | 'game-arcade' | 'star-hill' | 'final-cliff' | 'moon' | null

interface WorldMapProps {
  visitCount: number
}

export default function WorldMap({ visitCount }: WorldMapProps) {
  const [activeLocation, setActiveLocation] = useState<Location>(null)
  const [memories, setMemories] = useState<Memory[]>([])
  const [letters, setLetters] = useState<Letter[]>([])
  const [poems, setPoems] = useState<Poem[]>([])
  const [surprises, setSurprises] = useState<Surprise[]>([])
  const [wishes, setWishes] = useState<Wish[]>([])
  const [isCreatingWish, setIsCreatingWish] = useState(false)
  const [dailyMessages, setDailyMessages] = useState<DailyMessage[]>([])
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null)
  const memoryCardRef = useRef<HTMLDivElement>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  const memoryStars: MemoryStarData[] = useMemo(
    () => buildMemoryStarsFromMemories(memories),
    [memories]
  )

  const todaysMessage = useMemo(() => {
    if (!dailyMessages.length) return null
    const dayIndex = getDayIndexInPH()
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

      // Load visible poems (River of Poem)
      const { data: poemData } = await supabase
        .from('poems')
        .select('*')
        .eq('visible', true)
        .order('order_index', { ascending: true })

      if (poemData) setPoems(poemData)

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

  const handleDownloadMemoryCard = async () => {
    if (!memoryCardRef.current || !selectedMemory) return
    setIsDownloading(true)
    try {
      const dataUrl = await toPng(memoryCardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: '#1e1b4b',
      })
      const slug = selectedMemory.title.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/gi, '') || 'memory'
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `memory-garden-${slug}.png`
      link.click()
    } catch (err) {
      console.error('Download failed:', err)
    } finally {
      setIsDownloading(false)
    }
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

      {/* Map Container: on mobile header is in flow so the card never overlaps the message */}
      <div className="relative flex flex-col md:flex-row md:items-center md:justify-center p-4 md:p-8 min-h-screen">
        {/* Intro + Today's message + visit text — in flow on mobile so card stays below */}
        <div className="flex-shrink-0 w-full flex flex-col items-center gap-2 px-4 pt-2 pb-4 md:pb-0 md:absolute md:top-8 md:left-0 md:right-0 md:pt-0">
          <p className="md:hidden text-center text-sm font-medium text-pink-100 drop-shadow-md">
            You&apos;re in our secret world, my love.
          </p>
          {todaysMessage && (
            <div className="w-full max-w-xl rounded-2xl bg-purple-900/70 border border-pink-500/50 px-4 py-2.5 shadow-lg backdrop-blur-sm animate-pulse-glow z-10">
              <p className="text-xs md:text-sm text-center text-pink-100">
                <span className="font-semibold text-pink-300 mr-1">
                  Today&apos;s message from Solpie:
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
        {/* Map card — always starts below the message on mobile */}
        <div className="relative w-full max-w-5xl min-h-[60vh] md:min-h-[64vh] map-frame backdrop-blur-sm rounded-[2rem] overflow-hidden border border-pink-500/30 flex-1 md:flex-none">
          {/* Subtle paper texture / starfield */}
          <div className="absolute inset-0 opacity-[0.15]" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(236, 72, 153, 0.6) 1px, transparent 0)`,
            backgroundSize: '32px 32px',
            animation: 'starfield 25s linear infinite'
          }} />

          {/* Semantic star sky */}
          <div className="absolute inset-0 z-[6] pointer-events-none">
            <WorldStarSky memoryStars={memoryStars} />
          </div>

          {/* Map title */}
          <div className="absolute top-3 left-0 right-0 z-10 text-center md:top-5">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-pink-200/95 text-handwritten drop-shadow-md">
              SoLuna
            </h2>
            <p className="text-[10px] sm:text-xs text-purple-300/80 mt-0.5 tracking-widest uppercase">
              Our constellation
            </p>
          </div>

          {/* World Map Layout */}
          <div className="relative z-10 h-full pt-14 pb-6 px-4 md:pt-16 md:pb-8 md:px-6 flex items-center justify-center">
            {/* Mobile: journey path map */}
            <div className="flex flex-col items-center w-full max-w-sm md:hidden gap-6 sm:gap-7">
              <svg className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 pointer-events-none" style={{ height: '100%' }}>
                <defs>
                  <linearGradient id="pathGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(236,72,153,0.5)" />
                    <stop offset="100%" stopColor="rgba(139,92,246,0.5)" />
                  </linearGradient>
                </defs>
                <line x1="0" y1="0" x2="0" y2="100%" stroke="url(#pathGrad)" strokeWidth="2" className="journey-path-line" />
              </svg>
              <MapPinSpot icon="🌺" label="Memory Garden" subtitle={`${memories.length} memories`} onClick={() => handleLocationClick('memory-garden')} />
              <MapPinSpot icon="💌" label="Love Letter House" subtitle={`${letters.length} letters`} onClick={() => handleLocationClick('love-letter-house')} />
              <MapPinSpot icon="🌊" label="River of Poem" subtitle={`${poems.length} poems`} onClick={() => handleLocationClick('river-of-poem')} />
              <MapPinSpot icon="🎮" label="Game Arcade" subtitle="Play together" onClick={() => handleLocationClick('game-arcade')} />
              <MapPinSpot icon="⭐" label="Star Hill" subtitle={`${surprises.length} surprises`} onClick={() => handleLocationClick('star-hill')} />
              <MapPinSpot icon="🌅" label="Final Cliff" subtitle="Where our story peaks" onClick={() => handleLocationClick('final-cliff')} />
              {visitCount >= 10 && (
                <MapPinSpot icon="🌙" label="The Moon" subtitle="Secret place" onClick={() => handleLocationClick('moon')} />
              )}
            </div>

            {/* Desktop: constellation layout — stars connected by lines */}
            <div className="hidden md:block relative w-full aspect-[4/3] min-h-[320px] max-h-[420px] max-w-3xl mx-auto">
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <linearGradient id="constellationStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(251,113,133,0.5)" />
                    <stop offset="100%" stopColor="rgba(196,181,253,0.4)" />
                  </linearGradient>
                </defs>
                {/* Constellation lines: connect locations into one shape */}
                <path d="M 200 38 L 100 98" fill="none" stroke="url(#constellationStroke)" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
                <path d="M 200 38 L 300 98" fill="none" stroke="url(#constellationStroke)" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
                <path d="M 100 98 L 100 208" fill="none" stroke="url(#constellationStroke)" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
                <path d="M 300 98 L 300 208" fill="none" stroke="url(#constellationStroke)" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
                <path d="M 100 208 L 300 208" fill="none" stroke="url(#constellationStroke)" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
                <path d="M 200 38 L 200 262" fill="none" stroke="url(#constellationStroke)" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="4 5" opacity="0.5" />
              </svg>

              {/* Star pins — same positions as constellation nodes (viewBox 0 0 400 300) */}
              <MapPinSpot icon="🎮" label="Game Arcade" subtitle="Play together" onClick={() => handleLocationClick('game-arcade')} className="constellation-star absolute left-1/2 top-[12.5%] -translate-x-1/2 -translate-y-1/2" />
              <MapPinSpot icon="🌺" label="Memory Garden" subtitle={`${memories.length} memories`} onClick={() => handleLocationClick('memory-garden')} className="constellation-star absolute left-[22%] top-[30%] -translate-x-1/2 -translate-y-1/2" />
              <MapPinSpot icon="💌" label="Love Letter House" subtitle={`${letters.length} letters`} onClick={() => handleLocationClick('love-letter-house')} className="constellation-star absolute right-[22%] top-[30%] translate-x-1/2 -translate-y-1/2" />
              <MapPinSpot icon="🌊" label="River of Poem" subtitle={`${poems.length} poems`} onClick={() => handleLocationClick('river-of-poem')} className="constellation-star absolute left-1/2 top-[50%] -translate-x-1/2 -translate-y-1/2" />
              <MapPinSpot icon="⭐" label="Star Hill" subtitle={`${surprises.length} surprises`} onClick={() => handleLocationClick('star-hill')} className="constellation-star absolute left-[22%] bottom-[28%] -translate-x-1/2 translate-y-1/2" />
              <MapPinSpot icon="🌅" label="Final Cliff" subtitle="Where our story peaks" onClick={() => handleLocationClick('final-cliff')} className="constellation-star absolute right-[22%] bottom-[28%] translate-x-1/2 translate-y-1/2" />
              {visitCount >= 10 && (
                <MapPinSpot icon="🌙" label="The Moon" subtitle="Secret place" onClick={() => handleLocationClick('moon')} className="constellation-star absolute left-1/2 bottom-[10%] -translate-x-1/2 translate-y-1/2" />
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
          <div className="space-y-5 max-h-[70vh] overflow-y-auto p-4">
            {/* Romantic intro */}
            <p className="text-center text-sm md:text-base text-pink-200/90 text-handwritten px-2">
              Every moment with you becomes a flower here. Choose one to relive it.
            </p>

            {selectedMemory && (
              <div className="space-y-3">
                <div
                  ref={memoryCardRef}
                  className="relative rounded-2xl bg-gradient-to-br from-purple-900/80 via-pink-900/70 to-purple-950/80 border border-pink-500/40 p-4 md:p-5 overflow-hidden shadow-[0_8px_32px_rgba(236,72,153,0.15),inset_0_1px_0_rgba(251,113,133,0.2)]"
                >
                  {/* Petal + sparkle overlay */}
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
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={`s-${i}`}
                      className="absolute text-base opacity-60 animate-float"
                      style={{
                        left: `${(i * 23 + 10) % 100}%`,
                        top: `${(i * 17 + 20) % 100}%`,
                        animationDuration: `${5 + i}s`,
                        animationDelay: `${i * 0.5}s`,
                      }}
                    >
                      ✨
                    </div>
                  ))}
                </div>

                <div className="relative z-10 flex flex-col md:flex-row gap-4 md:gap-6 items-start">
                  {/* Polaroid-style photo frame */}
                  <div className="w-full md:w-2/5 rounded-xl overflow-hidden border-2 border-pink-300/30 bg-purple-950/40 p-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
                    <img
                      src={selectedMemory.image_url}
                      alt={selectedMemory.title}
                      className="w-full aspect-square object-cover rounded-lg"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 text-left space-y-3">
                    <p className="text-xs uppercase tracking-widest text-pink-300/80">
                      One of our forever moments
                    </p>
                    <h3 className="text-xl md:text-2xl font-bold text-pink-200 text-handwritten">
                      {selectedMemory.title}
                    </h3>
                    <div className="text-xs md:text-sm text-purple-200 flex flex-wrap gap-3">
                      <span className="italic">Remember when — {formatDateInPH(selectedMemory.date, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      {selectedMemory.location && <span>📍 {selectedMemory.location}</span>}
                    </div>
                    <p className="text-sm md:text-base text-purple-100 whitespace-pre-wrap leading-relaxed">
                      {selectedMemory.description}
                    </p>
                    <p className="text-pink-300/90 text-sm italic text-handwritten pt-1">
                      I still carry this day in my heart.
                    </p>
                  </div>
                </div>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadMemoryCard}
                  disabled={isDownloading}
                  className="w-full py-2.5 px-4 rounded-xl bg-pink-500/80 hover:bg-pink-500 border border-pink-400/50 text-pink-100 font-medium text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDownloading ? (
                    <>Downloading…</>
                  ) : (
                    <>📥 Download this memory</>
                  )}
                </button>
              </div>
            )}

            {/* Divider before grid */}
            <div className="flex items-center gap-3">
              <span className="flex-1 h-px bg-gradient-to-r from-transparent via-pink-500/40 to-transparent" />
              <span className="text-xs uppercase tracking-widest text-pink-300/70">More flowers in our garden</span>
              <span className="flex-1 h-px bg-gradient-to-r from-transparent via-pink-500/40 to-transparent" />
            </div>

            {memories.length === 0 ? (
              <p className="text-center text-purple-200/80 text-sm py-6 text-handwritten">
                No flowers in the garden yet — but every day with you is a seed. Come back soon.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {memories.map((memory) => (
                  <button
                    key={memory.id}
                    type="button"
                    onClick={() => setSelectedMemory(memory)}
                    className={`text-left transition-all duration-300 ${selectedMemory?.id === memory.id ? 'ring-2 ring-pink-400/60 rounded-xl ring-offset-2 ring-offset-purple-950/50' : ''}`}
                  >
                    <MemoryCard memory={memory} isSelected={selectedMemory?.id === memory.id} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </LocationModal>
      )}

      {activeLocation === 'love-letter-house' && (
        <LocationModal
          title="Love Letter House"
          onClose={handleCloseModal}
        >
          <div className="space-y-5 max-h-[70vh] overflow-y-auto p-4 relative">
            {/* Romantic intro */}
            <p className="text-center text-sm md:text-base text-pink-200/90 text-handwritten px-2">
              Words I wrote just for you. Open one and feel my heart.
            </p>
            {/* Subtle floating hearts (decorative) */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
              {[...Array(4)].map((_, i) => (
                <span
                  key={i}
                  className="absolute text-lg opacity-20 animate-float"
                  style={{
                    left: `${15 + i * 25}%`,
                    top: `${20 + (i % 3) * 25}%`,
                    animationDuration: `${6 + i}s`,
                    animationDelay: `${i * 0.4}s`,
                  }}
                >
                  ❤️
                </span>
              ))}
            </div>
            {letters.length === 0 ? (
              <p className="text-center text-purple-200/80 text-sm py-8 text-handwritten">
                No letters here yet — but every word I&apos;ll ever write is already yours.
              </p>
            ) : (
              <div className="space-y-4 relative z-10">
                {letters.map((letter) => (
                  <LetterCard key={letter.id} letter={letter} />
                ))}
              </div>
            )}
          </div>
        </LocationModal>
      )}

      {activeLocation === 'river-of-poem' && (
        <LocationModal
          title="River of Poem"
          onClose={handleCloseModal}
        >
          <div className="space-y-5 max-h-[70vh] overflow-y-auto p-4 relative">
            <p className="text-center text-sm md:text-base text-cyan-100/95 text-handwritten px-2">
              Every line I write flows to you like a river. These poems are yours.
            </p>
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
              {[...Array(6)].map((_, i) => (
                <span
                  key={i}
                  className="absolute text-base opacity-15 animate-float"
                  style={{
                    left: `${10 + (i * 18) % 80}%`,
                    top: `${15 + (i * 12) % 75}%`,
                    animationDuration: `${5 + (i % 3)}s`,
                    animationDelay: `${i * 0.35}s`,
                  }}
                >
                  ✨
                </span>
              ))}
            </div>
            {poems.length === 0 ? (
              <p className="text-center text-purple-200/80 text-sm py-8 text-handwritten">
                The river is still — but I&apos;m already writing the next one for you.
              </p>
            ) : (
              <div className="space-y-5 relative z-10">
                {poems.map((poem) => (
                  <PoemCard key={poem.id} poem={poem} />
                ))}
              </div>
            )}
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
          <div className="space-y-6 max-h-[70vh] overflow-y-auto p-4 relative">
            {/* Romantic intro */}
            <p className="text-center text-sm md:text-base text-pink-200/95 text-handwritten px-2">
              Where wishes become stars and surprises wait in the dark. This hill is ours.
            </p>
            {/* Subtle twinkling sky atmosphere */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
              {[...Array(8)].map((_, i) => (
                <span
                  key={i}
                  className="absolute text-base opacity-20 animate-float"
                  style={{
                    left: `${10 + (i * 12) % 80}%`,
                    top: `${15 + (i * 11) % 70}%`,
                    animationDuration: `${4 + (i % 3)}s`,
                    animationDelay: `${i * 0.3}s`,
                  }}
                >
                  ✨
                </span>
              ))}
            </div>
            <div className="relative z-10 space-y-6">
              <WishStarField wishes={wishes} />
              <WishForm onCreate={handleCreateWish} isSubmitting={isCreatingWish} />
              {/* Surprises section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="flex-1 h-px bg-gradient-to-r from-transparent via-pink-500/40 to-transparent" />
                  <span className="text-xs uppercase tracking-widest text-pink-300/80">Surprises I left for you</span>
                  <span className="flex-1 h-px bg-gradient-to-r from-transparent via-pink-500/40 to-transparent" />
                </div>
                {surprises.length === 0 ? (
                  <p className="text-center text-purple-200/70 text-sm py-4 text-handwritten">
                    No surprises here yet — but the stars are always watching over you.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {surprises.map((surprise) => (
                      <SurpriseCard key={surprise.id} surprise={surprise} />
                    ))}
                  </div>
                )}
              </div>
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

// Memory Card Component — romantic garden flower
function MemoryCard({ memory, isSelected = false }: { memory: Memory; isSelected?: boolean }) {
  return (
    <div className={`group relative bg-purple-900/40 backdrop-blur-sm rounded-xl p-4 border border-pink-500/30 hover:border-pink-500/60 transition-all duration-300 hover:glow-soft hover:scale-[1.02] active:scale-[0.99] ${isSelected ? 'border-pink-400/50 shadow-[0_0_20px_rgba(236,72,153,0.25)]' : ''}`}>
      {/* Tiny petal accent */}
      <span className="absolute top-2 right-2 text-sm opacity-60 group-hover:opacity-100 transition-opacity">🌸</span>
      <div className="relative aspect-square mb-3 rounded-lg overflow-hidden ring-1 ring-pink-500/20">
        <img
          src={memory.image_url}
          alt={memory.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <h3 className="font-bold text-pink-300 mb-1 truncate text-handwritten">{memory.title}</h3>
      <p className="text-sm text-purple-200 mb-2 line-clamp-3 break-words overflow-hidden">{memory.description}</p>
      <div className="flex justify-between text-xs text-purple-300">
        <span>📅 {formatDateInPH(memory.date)}</span>
        {memory.location && <span>📍 {memory.location}</span>}
      </div>
      <p className="mt-2 text-[10px] text-pink-300/60 italic">Tap to relive this moment</p>
    </div>
  )
}

// Letter Card Component – envelope that opens into a letter (romantic & magical)
function LetterCard({ letter }: { letter: Letter }) {
  const [open, setOpen] = useState(false)

  return (
    <button
      type="button"
      onClick={() => setOpen((v) => !v)}
      className="w-full text-left px-1 md:px-2 group/card"
    >
      <div className={`relative bg-purple-900/40 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-pink-500/30 hover:border-pink-500/60 transition-all duration-300 hover:glow-soft ${open ? 'shadow-[0_0_24px_rgba(236,72,153,0.2)]' : ''}`}>
        {/* Envelope header with wax-seal feel */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-9 md:w-14 md:h-11 rounded-md bg-gradient-to-br from-pink-600 to-purple-600 overflow-hidden shadow-[0_0_16px_rgba(236,72,153,0.6),inset_0_1px_0_rgba(255,255,255,0.2)]">
              {/* Envelope flap */}
              <div
                className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-pink-200/90 to-pink-500 transition-transform duration-500 origin-top"
                style={{ transform: open ? 'rotateX(180deg)' : 'rotateX(0deg)' }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-xl md:text-2xl drop-shadow-sm">
                💌
              </div>
              {/* Wax seal dot when sealed */}
              {!open && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-red-900/80 border border-red-700/60 shadow-inner" title="Sealed with love" />
              )}
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold text-handwritten text-pink-300">
                {letter.title}
              </h3>
              {!open && (
                <p className="text-xs text-purple-200/80 italic">
                  Tap to open — sealed with love
                </p>
              )}
            </div>
          </div>
          <span className="text-xs text-pink-200/80 font-medium">
            {open ? 'Open' : 'Sealed'}
          </span>
        </div>

        {/* Letter body — parchment style when open, scrollable */}
        <div
          className={`mt-2 rounded-xl border transition-all duration-500 overflow-hidden ${
            open
              ? 'max-h-[70vh] overflow-y-auto opacity-100 bg-gradient-to-b from-amber-950/30 via-purple-950/50 to-amber-950/20 border-pink-500/30 shadow-inner'
              : 'max-h-0 opacity-0 border-transparent'
          }`}
        >
          {open && (
            <div className="px-5 md:px-6 py-5 md:py-6 relative">
              {/* Parchment texture hint */}
              <div className="absolute inset-0 opacity-[0.04] pointer-events-none rounded-xl" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 30h60M30 0v60\' stroke=\'%23fff\' stroke-width=\'0.5\' fill=\'none\'/%3E%3C/svg%3E")' }} />
              <p className="text-[10px] md:text-xs uppercase tracking-widest text-pink-300/70 mb-3 text-handwritten">
                To the one I love,
              </p>
              {letter.date && (
                <p className="text-[10px] md:text-xs text-pink-300/60 mb-2 relative z-10">
                  {formatDateInPH(letter.date)}
                </p>
              )}
              <p className="text-xs md:text-sm text-purple-100 whitespace-pre-wrap leading-relaxed relative z-10">
                {letter.content}
              </p>
              <p className="text-pink-300/90 text-sm italic text-handwritten pt-6 text-right relative z-10">
                Forever yours,
              </p>
              {/* Tiny heart at bottom */}
              <span className="absolute bottom-4 right-6 text-sm opacity-40">♥</span>
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

// Poem Card — river-themed, romantic (admin-added poems)
function PoemCard({ poem }: { poem: Poem }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <button
      type="button"
      onClick={() => setExpanded((v) => !v)}
      className="w-full text-left px-1 md:px-2 group/card"
    >
      <div className={`relative rounded-2xl border transition-all duration-300 overflow-hidden ${expanded ? 'bg-gradient-to-br from-cyan-900/40 via-purple-900/50 to-pink-900/30 border-cyan-500/40 shadow-[0_0_24px_rgba(34,211,238,0.15)]' : 'bg-gradient-to-br from-cyan-900/20 via-purple-900/40 to-pink-900/20 border-cyan-500/30 hover:border-pink-500/40 hover:glow-soft'}`}>
        {/* Top wave accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
        <div className="p-4 md:p-5 relative">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl opacity-80">🌊</span>
            <h3 className="text-lg md:text-xl font-bold text-handwritten text-cyan-200">
              {poem.title}
            </h3>
            {poem.date && (
              <span className="text-xs text-cyan-200/70 ml-auto">{formatDateInPH(poem.date)}</span>
            )}
          </div>
          <p className={`text-sm text-purple-100 whitespace-pre-wrap leading-relaxed ${expanded ? '' : 'line-clamp-4'}`}>
            {poem.body}
          </p>
          <p className="mt-3 text-xs text-cyan-200/70 italic">
            {expanded ? 'Tap to fold' : 'Tap to read more'}
          </p>
        </div>
        {/* Bottom shimmer */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-400/30 to-transparent" />
      </div>
    </button>
  )
}

// Surprise Card Component — magical gift from the stars (admin-added content)
function SurpriseCard({ surprise }: { surprise: Surprise }) {
  const icon = surprise.type === 'audio' ? '🎵' : surprise.type === 'image' ? '🖼️' : '⭐'
  const hasMessageContent = surprise.type === 'message' && surprise.content?.trim()
  const hasAudioContent = surprise.type === 'audio' && surprise.content?.trim()
  const hasImageContent = surprise.type === 'image' && surprise.content?.trim()

  return (
    <div className="group relative bg-gradient-to-br from-purple-900/50 via-pink-900/20 to-purple-900/50 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-pink-500/30 hover:border-pink-500/50 transition-all duration-300 hover:shadow-[0_0_32px_rgba(236,72,153,0.12)] overflow-hidden">
      {/* Magical corner sparkles */}
      <span className="absolute top-3 right-3 text-xl opacity-40 group-hover:opacity-70 transition-opacity">✨</span>
      <span className="absolute bottom-3 left-3 text-base opacity-25 group-hover:opacity-50 transition-opacity">⭐</span>
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500/25 to-purple-500/25 border border-pink-500/40 flex items-center justify-center text-2xl flex-shrink-0 shadow-[0_0_16px_rgba(236,72,153,0.2)]">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-widest text-pink-300/80 mb-1">A gift from the stars — just for you</p>
          <h3 className="text-lg md:text-xl font-bold text-handwritten text-pink-300 break-words">{surprise.title || 'Surprise'}</h3>
        </div>
      </div>
      {/* Message content — only when type is message and content exists */}
      {hasMessageContent && (
        <div className="relative rounded-xl bg-purple-950/40 border border-pink-500/20 px-4 py-3 text-purple-100 text-sm md:text-base whitespace-pre-wrap leading-relaxed">
          <div className="absolute inset-0 rounded-xl opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(251,113,133,0.5) 1px, transparent 0)', backgroundSize: '20px 20px' }} />
          <p className="relative z-10">{surprise.content.trim()}</p>
        </div>
      )}
      {/* Audio — YouTube/YouTube Music embed or direct audio file */}
      {hasAudioContent && (
        <div className="mt-3">
          <p className="text-xs text-pink-300/70 mb-2 italic">Listen with your heart</p>
          <div className="rounded-xl overflow-hidden bg-purple-950/50 border border-pink-500/25 shadow-inner">
            {isYouTubeUrl(surprise.content) ? (
              (() => {
                const videoId = extractYouTubeId(surprise.content.trim())
                if (!videoId) return <p className="p-4 text-purple-400 text-sm">Invalid YouTube link.</p>
                const embedUrl = getYouTubeEmbedUrlWithControls(videoId)
                return (
                  <div className="aspect-video w-full">
                    <iframe
                      src={embedUrl}
                      title={surprise.title || 'YouTube'}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )
              })()
            ) : (
              <audio controls className="w-full" preload="metadata">
                <source src={surprise.content.trim()} type="audio/mpeg" />
                <source src={surprise.content.trim()} type="audio/ogg" />
                <source src={surprise.content.trim()} type="audio/wav" />
                Your browser does not support the audio.
              </audio>
            )}
          </div>
        </div>
      )}
      {/* Image — only when type is image and URL exists */}
      {hasImageContent && (
        <div className="mt-3">
          <p className="text-xs text-pink-300/70 mb-2 italic">A moment saved for you</p>
          <div className="rounded-xl overflow-hidden border border-pink-500/25 shadow-[0_0_24px_rgba(236,72,153,0.08)]">
            <img
              src={surprise.content.trim()}
              alt={surprise.title || 'Surprise image'}
              className="w-full h-auto object-contain max-h-[60vh] bg-purple-950/30"
              loading="lazy"
              onError={(e) => {
                const target = e.currentTarget
                target.onerror = null
                target.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="120" viewBox="0 0 200 120"><rect fill="%23374151" width="200" height="120"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="14">Image could not be loaded</text></svg>')
              }}
            />
          </div>
        </div>
      )}
      {/* Fallback when content is missing so admin knows to add something */}
      {surprise.type === 'message' && !hasMessageContent && (
        <p className="text-purple-400/60 text-sm italic">No message content yet.</p>
      )}
      {surprise.type === 'audio' && !hasAudioContent && (
        <p className="text-purple-400/60 text-sm italic">No audio link added yet.</p>
      )}
      {surprise.type === 'image' && !hasImageContent && (
        <p className="text-purple-400/60 text-sm italic">No image link added yet.</p>
      )}
    </div>
  )
}

// Game Arcade Content — romantic, magical framing
function GameArcadeContent() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null)

  return (
    <div className="p-4 space-y-4">
      {!selectedGame ? (
        <>
          <p className="text-center text-sm md:text-base text-pink-200/90 text-handwritten px-2">
            Little games, big love. Pick one and play with me.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <GameButton
              title="Our Memory Match"
              subtitle="Match the pairs — each one is a piece of us"
              emoji="💕"
              onClick={() => setSelectedGame('memory-puzzle')}
            />
            <GameButton
              title="Catch My Heart"
              subtitle="Hearts fall from the sky. Catch 20 before time runs out!"
              emoji="💖"
              onClick={() => setSelectedGame('heart-catcher')}
            />
            <GameButton
              title="Say I Love You"
              subtitle="Tap the three words in the right order"
              emoji="💌"
              onClick={() => setSelectedGame('say-ilove-you')}
            />
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <button
            onClick={() => setSelectedGame(null)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-800/50 hover:bg-purple-700/60 border border-pink-500/20 text-pink-200 text-sm font-medium transition-colors"
          >
            ← Back to our games
          </button>
          {selectedGame === 'memory-puzzle' && <MemoryPuzzle />}
          {selectedGame === 'heart-catcher' && <HeartCatcher />}
          {selectedGame === 'say-ilove-you' && <SayILoveYou />}
        </div>
      )}
    </div>
  )
}

function GameButton({ title, subtitle, emoji, onClick }: { title: string; subtitle?: string; emoji: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group relative bg-purple-900/40 backdrop-blur-sm rounded-2xl p-6 md:p-8 border-2 border-pink-500/30 hover:border-pink-500/60 transition-all duration-300 hover:glow-soft hover:scale-[1.02] active:scale-[0.98] text-left overflow-hidden"
    >
      <span className="absolute top-2 right-2 text-lg opacity-30 group-hover:opacity-60 transition-opacity">✨</span>
      <div className="text-5xl md:text-6xl mb-3 transition-transform duration-300 group-hover:scale-110">{emoji}</div>
      <div className="text-lg md:text-xl font-bold text-pink-300 text-handwritten">{title}</div>
      {subtitle && (
        <p className="text-xs md:text-sm text-purple-200/80 mt-1.5 line-clamp-2">{subtitle}</p>
      )}
    </button>
  )
}

/* Map pin spot: romantic map landmark (glowing pin + handwritten label) */
function MapPinSpot({
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
      className={`group flex flex-col items-center gap-1.5 text-center cursor-pointer tap-target min-w-[44px] min-h-[44px] ${className}`}
    >
      <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center border-2 border-pink-200/50 map-pin-glow group-hover:scale-110 group-active:scale-95 transition-transform duration-300 flex-shrink-0">
        <span className="text-2xl sm:text-3xl md:text-3xl">{icon}</span>
      </div>
      <div className="space-y-0.5">
        <div className="text-sm sm:text-base font-semibold text-pink-100 text-handwritten">
          {label}
        </div>
        {subtitle && (
          <div className="text-[10px] sm:text-xs text-purple-200/80 max-w-[140px] md:max-w-[160px] truncate">
            {subtitle}
          </div>
        )}
      </div>
    </button>
  )
}

// Wish star field — magical sky of wishes
function WishStarField({ wishes }: { wishes: Wish[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selectedWish = wishes.find((w) => w.id === selectedId) || null

  if (!wishes.length) {
    return (
      <div className="rounded-2xl border border-pink-500/30 bg-gradient-to-b from-purple-900/30 to-purple-950/40 p-6 text-center shadow-[0_0_24px_rgba(236,72,153,0.08)]">
        <p className="text-4xl mb-2 opacity-80">✨</p>
        <p className="text-purple-200 text-sm text-handwritten">
          No wishes in the sky yet — whisper one below and it will light up our stars.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-pink-500/30 bg-gradient-to-b from-purple-900/20 to-purple-950/50 p-4 md:p-5 shadow-[0_0_24px_rgba(236,72,153,0.06)]">
      <p className="mb-3 text-sm text-pink-200/90 text-center text-handwritten">
        Your wishes shine here. Tap a star to read one.
      </p>
      <div className="relative h-36 md:h-40 bg-gradient-to-b from-indigo-950/50 via-purple-950/60 to-purple-950/80 rounded-xl overflow-hidden flex items-center justify-center border border-pink-500/20">
        {/* Soft starfield glow */}
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(251,113,133,0.15) 0%, transparent 60%)' }} />
        {wishes.slice(0, 24).map((wish, index) => {
          const angle = (index / Math.max(1, wishes.length)) * Math.PI * 2
          const radius = 38 + (index % 3) * 10
          const left = 50 + Math.cos(angle) * radius
          const top = 50 + Math.sin(angle) * (radius * 0.45)
          const isSelected = selectedId === wish.id

          return (
            <button
              key={wish.id}
              type="button"
              onClick={() => setSelectedId(wish.id)}
              className="absolute z-10 transition-transform duration-200 hover:scale-125"
              style={{ left: `${left}%`, top: `${top}%`, transform: 'translate(-50%, -50%)' }}
            >
              <span
                className={`block w-3 h-3 md:w-4 md:h-4 rounded-full transition-all duration-300 ${
                  isSelected
                    ? 'bg-pink-300 shadow-[0_0_16px_rgba(251,113,133,0.9),0_0_32px_rgba(251,113,133,0.5)] scale-125'
                    : 'bg-pink-200/90 shadow-[0_0_8px_rgba(251,113,133,0.6)] hover:shadow-[0_0_12px_rgba(251,113,133,0.8)]'
                }`}
              />
            </button>
          )
        })}
      </div>
      {selectedWish && (
        <div className="mt-4 p-4 rounded-xl bg-purple-900/50 border border-pink-500/30 text-sm text-purple-100 whitespace-pre-wrap shadow-inner">
          <p className="text-[10px] uppercase tracking-widest text-pink-300/70 mb-1.5">This wish shines for us</p>
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
    <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-pink-500/25 bg-purple-900/20 p-4 md:p-5">
      <p className="text-sm text-pink-200/90 text-handwritten">
        Whisper a wish — it will become a star I keep forever.
      </p>
      <textarea
        className="w-full rounded-xl bg-purple-950/50 border border-pink-500/40 px-4 py-3 text-sm text-white placeholder-purple-300/80 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400/30 transition-all"
        rows={2}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="What do you wish for us?"
        disabled={isSubmitting}
      />
      <button
        type="submit"
        disabled={isSubmitting || !value.trim()}
        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-semibold hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-[0_0_20px_rgba(236,72,153,0.3)] flex items-center justify-center gap-2"
      >
        {isSubmitting ? 'Sending to the stars…' : 'Send to the stars ✨'}
      </button>
    </form>
  )
}


