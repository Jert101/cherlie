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
      <div className="success-modal text-center p-8 rounded-2xl bg-gradient-to-b from-purple-900/60 to-pink-900/40 border border-pink-500/30 shadow-[0_0_40px_rgba(236,72,153,0.2)]">
        <div className="flex justify-center gap-2 mb-4 flex-wrap">
          {['💖', '💕', '✨', '💖', '💕'].map((e, i) => (
            <span key={i} className="text-4xl md:text-5xl animate-bounce" style={{ animationDelay: `${i * 0.08}s` }}>{e}</span>
          ))}
        </div>
        <h3 className="text-2xl md:text-3xl font-bold text-handwritten text-pink-300 mb-2">
          You caught my heart!
        </h3>
        <p className="text-purple-200 text-sm md:text-base mb-6 max-w-md mx-auto">{successMessage}</p>
        <button
          onClick={startGame}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-pink-500/30"
        >
          Catch hearts again
        </button>
      </div>
    )
  }

  return (
    <div className="p-2 md:p-4 space-y-4">
      <p className="text-center text-sm text-pink-200/80 text-handwritten">
        Hearts are falling from the sky. Tap them before they disappear — catch 20 to win!
      </p>
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="flex gap-4">
          <p className="text-purple-200 text-sm">Hearts: <span className="text-pink-300 font-semibold">{score}/20</span></p>
          <p className="text-purple-200 text-sm">Time: <span className="text-pink-300 font-semibold">{timeLeft}s</span></p>
        </div>
        {!gameActive && (
          <button
            onClick={startGame}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg text-sm"
          >
            Start — hearts will fall!
          </button>
        )}
      </div>

      <div
        ref={gameAreaRef}
        className="relative w-full h-80 md:h-96 rounded-2xl overflow-hidden border-2 border-pink-500/30 shadow-inner"
        style={{ background: 'linear-gradient(180deg, rgba(88,28,135,0.4) 0%, rgba(126,34,206,0.3) 50%, rgba(236,72,153,0.2) 100%)' }}
      >
        {hearts.map((heart) => (
          <button
            key={heart.id}
            onClick={() => catchHeart(heart.id)}
            className="absolute text-4xl md:text-5xl cursor-pointer hover:scale-125 active:scale-95 transition-transform drop-shadow-lg"
            style={{
              left: `${heart.x}%`,
              top: `${heart.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            💖
          </button>
        ))}
        {!gameActive && hearts.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-pink-200/90 px-4">
            <p className="text-center text-base md:text-lg text-handwritten">When you start, hearts will rain down. Tap each one — my heart is in every tap.</p>
          </div>
        )}
      </div>
    </div>
  )
}
