'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

interface LocationModalProps {
  title: string
  children: React.ReactNode
  onClose: () => void
}

export default function LocationModal({ title, children, onClose }: LocationModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (modalRef.current && overlayRef.current) {
      gsap.fromTo(overlayRef.current, 
        { opacity: 0 },
        { opacity: 1, duration: 0.3 }
      )
      gsap.fromTo(modalRef.current,
        { opacity: 0, scale: 0.9, y: 50 },
        { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'power3.out' }
      )
    }
  }, [])

  const handleClose = () => {
    if (modalRef.current && overlayRef.current) {
      gsap.to(modalRef.current, {
        opacity: 0,
        scale: 0.9,
        y: 50,
        duration: 0.3,
        onComplete: onClose
      })
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.3
      })
    } else {
      onClose()
    }
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        ref={modalRef}
        className="relative bg-gradient-to-br from-purple-900/95 to-purple-950/95 backdrop-blur-md rounded-3xl border-2 border-pink-500/30 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden glow"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-pink-500/30">
          <h2 className="text-3xl font-bold text-handwritten text-pink-300">{title}</h2>
          <button
            onClick={handleClose}
            className="text-purple-300 hover:text-pink-300 text-2xl transition-colors w-10 h-10 flex items-center justify-center rounded-full hover:bg-pink-500/20"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          {children}
        </div>
      </div>
    </div>
  )
}
