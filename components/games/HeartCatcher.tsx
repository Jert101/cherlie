'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { gsap } from 'gsap'

export default function HeartCatcher() {
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [hearts, setHearts] = useState<Array<{ id: number; x: number; y: number }>>([])
  const [gameActive, setGameActive] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const gameAreaRef = useRef<HTMLDivElement>(null)
  const heartIdRef = useRef(0)

  useEffect(() => {
    loadGameSettings()
  }, [])

  useEffect(() => {
    if (gameActive && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameActive(false)
            checkWin()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      const heartInterval = setInterval(() => {
        if (gameAreaRef.current) {
          const newHeart = {
            id: heartIdRef.current++,
            x: Math.random() * 80 + 10,
            y: Math.random() * 60 + 10,
          }
          setHearts((prev) => [...prev, newHeart])
          
          // Remove heart after 3 seconds if not caught
          setTimeout(() => {
            setHearts((prev) => prev.filter((h) => h.id !== newHeart.id))
          }, 3000)
        }
      }, 800)

      return () => {
        clearInterval(timer)
        clearInterval(heartInterval)
      }
    }
  }, [gameActive, timeLeft])

  const loadGameSettings = async () => {
    try {
      const { data } = await supabase
        .from('games')
        .select('success_message')
        .eq('game_name', 'heart-catcher')
        .single()
      if (data) setSuccessMessage(data.success_message)
    } catch (err) {
      console.error('Error loading game settings:', err)
      setSuccessMessage('You caught my heart! It was always yours anyway 💕')
    }
  }

  const startGame = () => {
    setScore(0)
    setTimeLeft(30)
    setHearts([])
    setGameActive(true)
    setGameWon(false)
  }

  const catchHeart = (id: number) => {
    setHearts((prev) => prev.filter((h) => h.id !== id))
    setScore((prev) => prev + 1)
  }

  const checkWin = () => {
    if (score >= 20) {
      setGameWon(true)
      gsap.fromTo('.success-modal',
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' }
      )
    }
  }

  if (gameWon) {
    return (
      <div className="success-modal text-center p-8">
        <div className="text-6xl mb-4 animate-bounce">💕</div>
        <h3 className="text-3xl font-bold text-handwritten text-pink-300 mb-4">
          Amazing!
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
    <div className="p-4">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <p className="text-purple-200">Score: {score}</p>
          <p className="text-purple-200">Time: {timeLeft}s</p>
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

      <div
        ref={gameAreaRef}
        className="relative w-full h-96 bg-purple-900/30 rounded-xl border-2 border-purple-500/30 overflow-hidden"
      >
        {hearts.map((heart) => (
          <button
            key={heart.id}
            onClick={() => catchHeart(heart.id)}
            className="absolute text-4xl animate-bounce cursor-pointer hover:scale-125 transition-transform"
            style={{
              left: `${heart.x}%`,
              top: `${heart.y}%`,
            }}
          >
            💖
          </button>
        ))}
        
        {!gameActive && hearts.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-purple-300">
            <p className="text-xl">Click "Start Game" to begin catching hearts!</p>
          </div>
        )}
      </div>
    </div>
  )
}
