'use client'

import { useEffect, useRef } from 'react'

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    class Particle {
      x: number
      y: number
      radius: number
      speedX: number
      speedY: number
      opacity: number
      twinkleSpeed: number
      canvasWidth: number
      canvasHeight: number

      constructor(canvasWidth: number, canvasHeight: number) {
        this.canvasWidth = canvasWidth
        this.canvasHeight = canvasHeight
        this.x = Math.random() * canvasWidth
        this.y = Math.random() * canvasHeight
        this.radius = Math.random() * 2 + 0.5
        this.speedX = (Math.random() - 0.5) * 0.5
        this.speedY = (Math.random() - 0.5) * 0.5
        this.opacity = Math.random() * 0.5 + 0.3
        this.twinkleSpeed = Math.random() * 0.02 + 0.01
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY

        if (this.x < 0 || this.x > this.canvasWidth) this.speedX *= -1
        if (this.y < 0 || this.y > this.canvasHeight) this.speedY *= -1

        this.opacity += Math.sin(Date.now() * this.twinkleSpeed) * 0.01
        this.opacity = Math.max(0.2, Math.min(0.8, this.opacity))
      }

      draw() {
        if (!ctx) return
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(236, 72, 153, ${this.opacity})`
        ctx.fill()

        // Glow effect
        ctx.shadowBlur = 10
        ctx.shadowColor = 'rgba(236, 72, 153, 0.5)'
        ctx.fill()
        ctx.shadowBlur = 0
      }
    }

    const particles: Particle[] = []
    const particleCount = 100

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      // Update canvas dimensions in particles when resized
      particles.forEach(particle => {
        particle.canvasWidth = canvas.width
        particle.canvasHeight = canvas.height
      })
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle(canvas.width, canvas.height))
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle) => {
        particle.update()
        particle.draw()
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  )
}
