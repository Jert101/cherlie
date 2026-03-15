'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { gsap } from 'gsap'

export default function TimelineRunner() {
  const [position, setPosition] = useState(0)
  const [obstacles, setObstacles] = useState<number[]>([])
  const [gameActive, setGameActive] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [distance, setDistance] = useState(0)

  useEffect(() => {
    loadGameSettings()
  }, [])

  useEffect(() => {
    if (gameActive) {
      const moveInterval = setInterval(() => {
        setDistance((prev) => prev + 1)
        setPosition((prev) => (prev + 1) % 3)
        
        // Generate obstacles
        if (Math.random() > 0.7) {
          setObstacles((prev) => [...prev, Math.floor(Math.random() * 3)])
        }
        
        // Move obstacles
        setObstacles((prev) => prev.map((pos) => pos))
        
        // Check win condition
        if (distance >= 100) {
          setGameActive(false)
          setGameWon(true)
          gsap.fromTo('.success-modal',
            { opacity: 0, scale: 0.8 },
            { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' }
          )
        }
      }, 100)

      const obstacleInterval = setInterval(() => {
        setObstacles((prev) => {
          // Remove old obstacles and add new ones
          return prev.filter(() => Math.random() > 0.3).concat(
            Math.random() > 0.5 ? [Math.floor(Math.random() * 3)] : []
          )
        })
      }, 500)

      return () => {
        clearInterval(moveInterval)
        clearInterval(obstacleInterval)
      }
    }
  }, [gameActive, distance])

  const loadGameSettings = async () => {
    try {
      const { data } = await supabase
        .from('games')
        .select('success_message')
        .eq('game_name', 'timeline-runner')
        .single()
      if (data) setSuccessMessage(data.success_message)
    } catch (err) {
      console.error('Error loading game settings:', err)
      setSuccessMessage('You made it through our timeline! Here\'s to many more chapters together 🌟')
    }
  }

  const startGame = () => {
    setPosition(1)
    setObstacles([])
    setDistance(0)
    setGameActive(true)
    setGameWon(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (!gameActive) return
    
    if (e.key === 'ArrowLeft' && position > 0) {
      setPosition((prev) => prev - 1)
    } else if (e.key === 'ArrowRight' && position < 2) {
      setPosition((prev) => prev + 1)
    }
  }

  if (gameWon) {
    return (
      <div className="success-modal text-center p-8 rounded-2xl bg-gradient-to-b from-purple-900/60 to-pink-900/40 border border-pink-500/30 shadow-[0_0_40px_rgba(236,72,153,0.2)]">
        <div className="flex justify-center gap-2 mb-4">
          {['💕', '🌟', '💖'].map((e, i) => (
            <span key={i} className="text-5xl animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}>{e}</span>
          ))}
        </div>
        <h3 className="text-2xl md:text-3xl font-bold text-handwritten text-pink-300 mb-2">
          You reached the end of our timeline!
        </h3>
        <p className="text-purple-200 text-sm md:text-base mb-6 max-w-md mx-auto">{successMessage}</p>
        <button
          onClick={startGame}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-pink-500/30"
        >
          Run to me again
        </button>
      </div>
    )
  }

  return (
    <div className="p-2 md:p-4 space-y-4" onKeyDown={handleKeyPress} tabIndex={0}>
      <p className="text-center text-sm text-pink-200/80 text-handwritten">
        You&apos;re running toward me. Use ← → to dodge the clouds and reach 100!
      </p>
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="flex gap-4">
          <p className="text-purple-200 text-sm">Distance: <span className="text-pink-300 font-semibold">{distance}/100</span></p>
          <p className="text-purple-200 text-sm">Use ← → to move</p>
        </div>
        {!gameActive && (
          <button
            onClick={startGame}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg text-sm"
          >
            Start — run to me!
          </button>
        )}
      </div>

      <div
        className="relative w-full h-80 md:h-96 rounded-2xl overflow-hidden border-2 border-pink-500/30"
        style={{ background: 'linear-gradient(180deg, rgba(30,27,75,0.6) 0%, rgba(88,28,135,0.3) 100%)' }}
      >
        <div className="absolute inset-0 flex">
          {[0, 1, 2].map((lane) => (
            <div
              key={lane}
              className="flex-1 border-r border-pink-500/20 last:border-r-0 relative"
            >
              {position === lane && (
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-5xl md:text-6xl animate-bounce drop-shadow-lg">
                  💕
                </div>
              )}
              {obstacles.includes(lane) && (
                <div className="absolute top-8 left-1/2 -translate-x-1/2 text-3xl md:text-4xl opacity-80">
                  ☁️
                </div>
              )}
            </div>
          ))}
        </div>
        {!gameActive && distance === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-pink-200/90 px-4">
            <p className="text-center text-base md:text-lg text-handwritten">Press Start, then use the arrow keys to move. Run through the clouds to reach me.</p>
          </div>
        )}
      </div>
    </div>
  )
}
