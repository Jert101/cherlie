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
      <div className="success-modal text-center p-8">
        <div className="text-6xl mb-4 animate-bounce">🎉</div>
        <h3 className="text-3xl font-bold text-handwritten text-pink-300 mb-4">
          Congratulations!
        </h3>
        <p className="text-purple-200 text-lg mb-6">{successMessage}</p>
        <button
          onClick={initializeGame}
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
        <p className="text-purple-200">Moves: {moves}</p>
        <button
          onClick={initializeGame}
          className="px-4 py-2 rounded-lg bg-purple-800/50 hover:bg-purple-700/50 transition-colors text-sm"
        >
          Reset
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
        {cards.map((card, index) => {
          const isFlipped = flipped.includes(index) || matched.includes(index)
          return (
            <button
              key={index}
              onClick={() => handleCardClick(index)}
              className="aspect-square rounded-xl bg-purple-800/50 border-2 border-purple-500/50 hover:border-pink-500/50 transition-all duration-300 flex items-center justify-center text-4xl hover:glow-soft disabled:opacity-50"
              disabled={isFlipped || matched.includes(index)}
            >
              {isFlipped ? (
                <span className="animate-pulse">{card === 1 ? '💕' : card === 2 ? '🌹' : card === 3 ? '⭐' : card === 4 ? '🌙' : card === 5 ? '✨' : '💖'}</span>
              ) : (
                <span className="text-purple-400">?</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
