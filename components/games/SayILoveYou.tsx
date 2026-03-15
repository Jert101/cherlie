'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { gsap } from 'gsap'

const WORDS = ['I', 'Love', 'You'] as const
const CORRECT_ORDER = ['I', 'Love', 'You']

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export default function SayILoveYou() {
  const [order, setOrder] = useState<string[]>([])
  const [tapped, setTapped] = useState<string[]>([])
  const [gameWon, setGameWon] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    setOrder(shuffle([...WORDS]))
    setTapped([])
  }, [])

  useEffect(() => {
    const loadMessage = async () => {
      try {
        const { data } = await supabase
          .from('games')
          .select('success_message')
          .eq('game_name', 'say-ilove-you')
          .single()
        if (data?.success_message) setSuccessMessage(data.success_message)
        else setSuccessMessage('You said it perfectly. I love you too — always.')
      } catch {
        setSuccessMessage('You said it perfectly. I love you too — always.')
      }
    }
    loadMessage()
  }, [])

  const handleTap = (word: string) => {
    const next = [...tapped, word]
    setTapped(next)

    if (next.length === 3) {
      const correct = next.every((w, i) => w === CORRECT_ORDER[i])
      if (correct) {
        setGameWon(true)
        gsap.fromTo('.success-modal', { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' })
      } else {
        setTapped([])
        setOrder(shuffle([...WORDS]))
      }
    }
  }

  const playAgain = () => {
    setGameWon(false)
    setTapped([])
    setOrder(shuffle([...WORDS]))
  }

  if (gameWon) {
    return (
      <div className="success-modal text-center p-8 rounded-2xl bg-gradient-to-b from-purple-900/60 to-pink-900/40 border border-pink-500/30 shadow-[0_0_40px_rgba(236,72,153,0.2)]">
        <div className="flex justify-center gap-2 mb-4">
          {['💕', '💖', '💕'].map((e, i) => (
            <span key={i} className="text-5xl animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}>{e}</span>
          ))}
        </div>
        <h3 className="text-2xl md:text-3xl font-bold text-handwritten text-pink-300 mb-2">
          I love you too.
        </h3>
        <p className="text-purple-200 text-sm md:text-base mb-6 max-w-md mx-auto">{successMessage}</p>
        <button
          onClick={playAgain}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-pink-500/30"
        >
          Say it again
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6">
      <p className="text-center text-sm text-pink-200/90 text-handwritten">
        Tap the words in the right order: <strong className="text-pink-300">I</strong> → <strong className="text-pink-300">Love</strong> → <strong className="text-pink-300">You</strong>
      </p>
      <div className="flex flex-wrap justify-center gap-3 md:gap-4">
        {order.map((word) => {
          const used = tapped.includes(word)
          const indexInTapped = tapped.indexOf(word)
          const isNext = indexInTapped === -1 && tapped.length < 3 && (tapped.length === 0 && word === 'I' || tapped.length === 1 && word === 'Love' || tapped.length === 2 && word === 'You')
          return (
            <button
              key={`${word}-${order.indexOf(word)}`}
              onClick={() => handleTap(word)}
              className={`min-w-[5rem] md:min-w-[6rem] py-4 px-6 rounded-2xl border-2 text-xl md:text-2xl font-bold text-handwritten transition-all duration-300 ${
                used
                  ? 'bg-pink-500/40 border-pink-400/60 text-pink-100 shadow-[0_0_16px_rgba(236,72,153,0.3)]'
                  : isNext
                    ? 'bg-purple-800/50 border-pink-500/50 text-pink-200 hover:scale-105 hover:shadow-[0_0_20px_rgba(236,72,153,0.4)]'
                    : 'bg-purple-900/40 border-purple-500/40 text-purple-300 hover:border-pink-500/40'
              }`}
            >
              {word}
            </button>
          )
        })
        }
      </div>
      {tapped.length > 0 && tapped.length < 3 && (
        <p className="text-center text-purple-200/80 text-sm">
          So far: <span className="text-pink-300 font-semibold">{tapped.join(' ')}</span>
        </p>
      )}
    </div>
  )
}
