import { gsap } from 'gsap'

export function createSpeedOfLightAnimation(onComplete?: () => void) {
  // Create warp speed effect container with unique ID
  const containerId = `warp-container-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  const warpContainer = document.createElement('div')
  warpContainer.id = containerId
  warpContainer.className = 'fixed inset-0 z-50 pointer-events-none'
  warpContainer.style.cssText = 'position: fixed; inset: 0; z-index: 9999; pointer-events: none;'
  
  const warpEffect = document.createElement('div')
  warpEffect.className = 'warp-effect'
  warpEffect.style.cssText = 'position: absolute; inset: 0; background: radial-gradient(circle, rgba(236, 72, 153, 0.8) 0%, rgba(107, 70, 193, 0.9) 50%, #0F172A 100%);'
  
  const starsTunnel = document.createElement('div')
  starsTunnel.className = 'stars-tunnel'
  starsTunnel.style.cssText = 'position: absolute; inset: 0;'
  
  warpContainer.appendChild(warpEffect)
  warpContainer.appendChild(starsTunnel)
  
  // Append to body only if it exists
  if (document.body) {
    document.body.appendChild(warpContainer)
  } else {
    // Wait for body to be available
    const checkBody = setInterval(() => {
      if (document.body) {
        document.body.appendChild(warpContainer)
        clearInterval(checkBody)
      }
    }, 10)
  }
  
  let cleanupTimer: NodeJS.Timeout | null = null
  const stars: HTMLElement[] = []
  
  // Animate warp speed
  gsap.fromTo(warpEffect,
    { opacity: 0 },
    { 
      opacity: 1, 
      duration: 0.2,
      onComplete: () => {
        // Create star tunnel effect
        for (let i = 0; i < 50; i++) {
          const star = document.createElement('div')
          star.style.cssText = `
            position: absolute;
            width: 2px;
            height: 2px;
            background: white;
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            opacity: ${Math.random()};
          `
          starsTunnel.appendChild(star)
          stars.push(star)
          
          gsap.to(star, {
            scale: 20,
            opacity: 0,
            duration: 1.5,
            ease: 'power2.out',
            delay: Math.random() * 0.5
          })
        }
      }
    }
  )
  
  // Clean up function
  const cleanup = () => {
    if (cleanupTimer) {
      clearTimeout(cleanupTimer)
      cleanupTimer = null
    }
    
    // Kill all GSAP animations
    gsap.killTweensOf([warpContainer, warpEffect, ...stars])
    
    // Remove stars
    stars.forEach(star => {
      try {
        if (star.parentNode) {
          star.parentNode.removeChild(star)
        }
      } catch (e) {
        // Ignore errors
      }
    })
    
    // Remove container
    try {
      if (warpContainer.parentNode) {
        warpContainer.parentNode.removeChild(warpContainer)
      }
    } catch (e) {
      // Ignore cleanup errors - element might already be removed
    }
  }
  
  // Clean up and call onComplete
  cleanupTimer = setTimeout(() => {
    // Fade out container
    gsap.to(warpContainer, {
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
        cleanup()
        if (onComplete) {
          onComplete()
        }
      }
    })
  }, 1500)
  
  // Return cleanup function for manual cleanup if needed
  return cleanup
}
