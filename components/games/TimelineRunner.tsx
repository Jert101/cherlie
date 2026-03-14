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
      <div className="success-modal text-center p-8">
        <div className="text-6xl mb-4 animate-bounce">🌟</div>
        <h3 className="text-3xl font-bold text-handwritten text-pink-300 mb-4">
          You Did It!
        </h3>
        <p className="text-purple-200 text-lg mb-6">{successMessage}</p>
        <button
          onClick={startGame}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-300"
        >
          Play Again
        </button>
      </div>
    )
  }

  return (
    <div className="p-4" onKeyDown={handleKeyPress} tabIndex={0}>
      <div className="mb-4 flex justify-between items-center">
        <div>
          <p className="text-purple-200">Distance: {distance}/100</p>
          <p className="text-purple-200 text-sm">Use ← → arrows to move</p>
        </div>
        {!gameActive && (
          <button
            onClick={startGame}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-300"
          >
            Start Game
          </button>
        )}
      </div>

      <div className="relative w-full h-96 bg-purple-900/30 rounded-xl border-2 border-purple-500/30 overflow-hidden">
        {/* Lanes */}
        <div className="absolute inset-0 flex">
          {[0, 1, 2].map((lane) => (
            <div
              key={lane}
              className="flex-1 border-r border-purple-500/20 last:border-r-0 relative"
            >
              {/* Player */}
              {position === lane && (
                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-5xl animate-bounce">
                  🏃
                </div>
              )}
              
              {/* Obstacles */}
              {obstacles.includes(lane) && (
                <div className="absolute top-10 left-1/2 transform -translate-x-1/2 text-4xl animate-pulse">
                  ⚠️
                </div>
              )}
            </div>
          ))}
        </div>
        
        {!gameActive && distance === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-purple-300">
            <p className="text-xl">Click "Start Game" and use arrow keys to run!</p>
          </div>
        )}
      </div>
    </div>
  )
}
