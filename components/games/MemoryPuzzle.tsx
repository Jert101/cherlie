'use client'

import { useState, useEffect } from 'react'
import { supabase, Game } from '@/lib/supabase'
import { gsap } from 'gsap'

export default function MemoryPuzzle() {
  const [cards, setCards] = useState<number[]>([])
  const [flipped, setFlipped] = useState<number[]>([])
  const [matched, setMatched] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [successMessage, setSuccessMessage] = useState('')
  const [gameWon, setGameWon] = useState(false)

  useEffect(() => {
    loadGameSettings()
    initializeGame()
  }, [])

  const loadGameSettings = async () => {
    try {
      const { data } = await supabase
        .from('games')
        .select('success_message')
        .eq('game_name', 'memory-puzzle')
        .single()
      if (data) setSuccessMessage(data.success_message)
    } catch (err) {
      console.error('Error loading game settings:', err)
      setSuccessMessage('You solved it! Just like you solve my heart every day ❤️')
    }
  }

  const initializeGame = () => {
    const pairs = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6]
    const shuffled = [...pairs].sort(() => Math.random() - 0.5)
    setCards(shuffled)
    setFlipped([])
    setMatched([])
    setMoves(0)
    setGameWon(false)
  }

  const handleCardClick = (index: number) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(index)) return

    const newFlipped = [...flipped, index]
    setFlipped(newFlipped)

    if (newFlipped.length === 2) {
      setMoves(moves + 1)
      const [first, second] = newFlipped
      
      if (cards[first] === cards[second]) {
        setMatched([...matched, first, second])
        setFlipped([])
        
        if (matched.length + 2 === cards.length) {
          setTimeout(() => {
            setGameWon(true)
            gsap.fromTo('.success-modal',
              { opacity: 0, scale: 0.8 },
              { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' }
            )
          }, 500)
        }
      } else {
        setTimeout(() => {
          setFlipped([])
        }, 1000)
      }
    }
  }

  if (gameWon) {
    return (
      <div className="success-modal text-center p-8 rounded-2xl bg-gradient-to-b from-purple-900/60 to-pink-900/40 border border-pink-500/30 shadow-[0_0_40px_rgba(236,72,153,0.2)]">
        <div className="flex justify-center gap-2 mb-4">
          {['💕', '✨', '💖'].map((e, i) => (
            <span key={i} className="text-5xl animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}>{e}</span>
          ))}
        </div>
        <h3 className="text-2xl md:text-3xl font-bold text-handwritten text-pink-300 mb-2">
          You matched them all!
        </h3>
        <p className="text-purple-200 text-sm md:text-base mb-6 max-w-md mx-auto">{successMessage}</p>
        <button
          onClick={initializeGame}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-pink-500/30"
        >
          Play again for us
        </button>
      </div>
    )
  }

  const emojis = ['💕', '🌹', '⭐', '🌙', '✨', '💖']

  return (
    <div className="p-2 md:p-4 space-y-4">
      <p className="text-center text-sm text-pink-200/80 text-handwritten">
        Find the matching pairs — each one is a piece of our story.
      </p>
      <div className="flex justify-between items-center">
        <p className="text-purple-200 text-sm">Moves: <span className="text-pink-300 font-semibold">{moves}</span></p>
        <button
          onClick={initializeGame}
          className="px-3 py-1.5 rounded-lg bg-purple-800/50 hover:bg-purple-700/60 border border-pink-500/20 text-pink-200 text-sm transition-colors"
        >
          Start over
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2 md:gap-3 max-w-md mx-auto">
        {cards.map((card, index) => {
          const isFlipped = flipped.includes(index) || matched.includes(index)
          const isMatched = matched.includes(index)
          return (
            <button
              key={index}
              onClick={() => handleCardClick(index)}
              className={`aspect-square rounded-xl border-2 transition-all duration-300 flex items-center justify-center text-3xl md:text-4xl ${
                isMatched
                  ? 'bg-pink-500/30 border-pink-400/50 shadow-[0_0_12px_rgba(236,72,153,0.4)]'
                  : 'bg-purple-800/50 border-purple-500/50 hover:border-pink-500/50 hover:shadow-[0_0_12px_rgba(236,72,153,0.2)]'
              } disabled:opacity-50`}
              disabled={isFlipped || matched.includes(index)}
            >
              {isFlipped ? (
                <span className={isMatched ? 'animate-pulse' : ''}>{emojis[card - 1]}</span>
              ) : (
                <span className="text-purple-400/80 text-2xl">?</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
