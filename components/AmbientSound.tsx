'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '@/lib/supabase'
import { isYouTubeUrl, extractYouTubeId } from '@/lib/youtubeUtils'

export default function AmbientSound() {
  const [enabled, setEnabled] = useState(false)
  const [musicUrl, setMusicUrl] = useState<string | null>(null)
  const [youtubeId, setYoutubeId] = useState<string | null>(null)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [youtubeReady, setYoutubeReady] = useState(false)
  const [animationComplete, setAnimationComplete] = useState(false)
  const [mounted, setMounted] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const youtubePlayerRef = useRef<any>(null)
  const youtubeContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    loadSettings()
    
    // Check localStorage for user preference
    const savedPreference = localStorage.getItem('ambientSoundEnabled')
    if (savedPreference === 'true') {
      setEnabled(true)
    }
    
    // Listen for speed of light animation completion
    const handleAnimationComplete = () => {
      setAnimationComplete(true)
      setHasInteracted(true)
    }
    
    window.addEventListener('speedOfLightComplete', handleAnimationComplete)
    
    // Enable on first user interaction (fallback)
    const enableOnInteraction = () => {
      setHasInteracted(true)
      if (audioRef.current && musicUrl && !youtubeId && enabled && animationComplete) {
        audioRef.current.play().catch(() => {})
      }
      if (youtubePlayerRef.current && youtubeId && enabled && youtubeReady && animationComplete) {
        youtubePlayerRef.current.playVideo()
      }
      document.removeEventListener('click', enableOnInteraction)
      document.removeEventListener('touchstart', enableOnInteraction)
      document.removeEventListener('keydown', enableOnInteraction)
    }
    
    document.addEventListener('click', enableOnInteraction)
    document.addEventListener('touchstart', enableOnInteraction)
    document.addEventListener('keydown', enableOnInteraction)
    
    return () => {
      window.removeEventListener('speedOfLightComplete', handleAnimationComplete)
      document.removeEventListener('click', enableOnInteraction)
      document.removeEventListener('touchstart', enableOnInteraction)
      document.removeEventListener('keydown', enableOnInteraction)
    }
  }, [])
  
  // Separate effect for YouTube player initialization
  useEffect(() => {
    if (!youtubeId) {
      // Clean up if youtubeId is removed
      if (youtubePlayerRef.current) {
        try {
          youtubePlayerRef.current.destroy()
        } catch (err) {
          // Ignore errors during cleanup
        }
        youtubePlayerRef.current = null
        setYoutubeReady(false)
      }
      return
    }
    
    if (youtubePlayerRef.current) return
    
    // Wait for container to be available
    const checkAndInit = () => {
      if (!youtubeContainerRef.current || youtubePlayerRef.current) return
      
      // Check if API is already loaded
      // @ts-ignore
      if (window.YT && window.YT.Player) {
        initializeYouTubePlayer()
      } else {
        // Load the YouTube IFrame API script
        const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]')
        if (!existingScript) {
          const tag = document.createElement('script')
          tag.src = 'https://www.youtube.com/iframe_api'
          const firstScriptTag = document.getElementsByTagName('script')[0]
          if (firstScriptTag && firstScriptTag.parentNode) {
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
          }
        }
        
        // @ts-ignore
        window.onYouTubeIframeAPIReady = initializeYouTubePlayer
      }
    }
    
    // Small delay to ensure DOM is ready
    const initTimer = setTimeout(checkAndInit, 100)
    
    // Also try immediately if container is already available
    if (youtubeContainerRef.current) {
      checkAndInit()
    }
    
    // Cleanup function
    return () => {
      clearTimeout(initTimer)
      if (youtubePlayerRef.current) {
        try {
          // Stop the player first
          try {
            youtubePlayerRef.current.stopVideo()
          } catch (e) {
            // Ignore stop errors
          }
          
          // Small delay before destroy to let stop complete
          setTimeout(() => {
            try {
              // Destroy the YouTube player before React tries to remove the DOM node
              if (youtubePlayerRef.current) {
                youtubePlayerRef.current.destroy()
              }
            } catch (err) {
              // Player might already be destroyed or DOM node removed
            }
            youtubePlayerRef.current = null
            setYoutubeReady(false)
          }, 100)
        } catch (err) {
          // Ignore all cleanup errors
          youtubePlayerRef.current = null
          setYoutubeReady(false)
        }
      }
    }
  }, [youtubeId])
  
  const initializeYouTubePlayer = () => {
    if (!youtubeId || youtubePlayerRef.current || !youtubeContainerRef.current) return
    
    // Check if container is still in the DOM
    if (!document.body.contains(youtubeContainerRef.current)) {
      return
    }
    
    try {
      // Create a unique ID for this player instance
      const playerId = `youtube-player-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
      const container = youtubeContainerRef.current
      
      // Always set a new unique ID to avoid conflicts
      container.id = playerId
      
      // @ts-ignore
      youtubePlayerRef.current = new window.YT.Player(playerId, {
        videoId: youtubeId,
        playerVars: {
          autoplay: 0,
          loop: 1,
          playlist: youtubeId,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          mute: 0,
          enablejsapi: 1,
        },
        events: {
          onReady: () => {
            setYoutubeReady(true)
            // Check if animation is complete and should auto-play
            const savedPreference = localStorage.getItem('ambientSoundEnabled')
            if ((enabled || savedPreference !== 'false') && hasInteracted) {
              setTimeout(() => {
                try {
                  youtubePlayerRef.current?.playVideo()
                  youtubePlayerRef.current?.setVolume(30)
                } catch (e) {
                  // Ignore play errors
                }
              }, 100)
            }
          },
          onError: (event: any) => {
            console.error('YouTube player error:', event.data)
            // Reset on error
            youtubePlayerRef.current = null
            setYoutubeReady(false)
          },
        },
      })
    } catch (err) {
      console.error('Error initializing YouTube player:', err)
      // Reset ref on error
      youtubePlayerRef.current = null
    }
  }

  useEffect(() => {
    // Only play music after animation completes
    if (!animationComplete) return
    
    // Handle regular audio files
    if (audioRef.current && musicUrl && !youtubeId) {
      audioRef.current.volume = 0.3
      audioRef.current.loop = true
      
      if (enabled && hasInteracted) {
        audioRef.current.play().catch((err) => {
          console.log('Audio play failed:', err)
        })
      } else if (!enabled) {
        audioRef.current.pause()
      }
    }
    
    // Handle YouTube
    if (youtubePlayerRef.current && youtubeId && youtubeReady) {
      if (enabled && hasInteracted) {
        youtubePlayerRef.current.playVideo()
        youtubePlayerRef.current.setVolume(30)
      } else if (!enabled) {
        youtubePlayerRef.current.pauseVideo()
      }
    }
  }, [enabled, musicUrl, youtubeId, hasInteracted, youtubeReady, animationComplete])
  
  // Auto-start music when animation completes
  useEffect(() => {
    if (animationComplete && hasInteracted) {
      // Auto-enable music if it's not disabled in localStorage
      const savedPreference = localStorage.getItem('ambientSoundEnabled')
      if (savedPreference !== 'false') {
        setEnabled(true)
        localStorage.setItem('ambientSoundEnabled', 'true')
      }
      
      // Small delay to ensure everything is ready
      setTimeout(() => {
        if (enabled || savedPreference !== 'false') {
          if (audioRef.current && musicUrl && !youtubeId) {
            audioRef.current.volume = 0.3
            audioRef.current.loop = true
            audioRef.current.play().catch((err) => {
              console.log('Audio play failed:', err)
            })
          }
          if (youtubePlayerRef.current && youtubeId && youtubeReady) {
            youtubePlayerRef.current.playVideo()
            youtubePlayerRef.current.setVolume(30)
          }
        }
      }, 200)
    }
  }, [animationComplete, hasInteracted, enabled, musicUrl, youtubeId, youtubeReady])

  const loadSettings = async () => {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('music_url')
        .single()
      if (data?.music_url) {
        if (isYouTubeUrl(data.music_url)) {
          const videoId = extractYouTubeId(data.music_url)
          if (videoId) {
            setYoutubeId(videoId)
          }
        } else {
          setMusicUrl(data.music_url)
        }
      }
    } catch (err) {
      console.error('Error loading music settings:', err)
    }
  }

  const toggleSound = async () => {
    const newState = !enabled
    setEnabled(newState)
    setHasInteracted(true)
    localStorage.setItem('ambientSoundEnabled', String(newState))
    
    // Handle regular audio
    if (newState && audioRef.current && musicUrl && !youtubeId) {
      try {
        audioRef.current.volume = 0.3
        await audioRef.current.play()
      } catch (err) {
        console.log('Audio play failed:', err)
      }
    } else if (!newState && audioRef.current) {
      audioRef.current.pause()
    }
    
    // Handle YouTube
    if (youtubePlayerRef.current && youtubeId && youtubeReady) {
      if (newState) {
        youtubePlayerRef.current.playVideo()
        youtubePlayerRef.current.setVolume(30)
      } else {
        youtubePlayerRef.current.pauseVideo()
      }
    }
  }

  return (
    <>
      {/* Regular audio file */}
      {musicUrl && !youtubeId && (
        <audio
          ref={audioRef}
          loop
          src={musicUrl}
        />
      )}
      
      {/* YouTube player container - render in portal to avoid React cleanup issues */}
      {mounted && typeof window !== 'undefined' && document.body && createPortal(
        <div 
          ref={youtubeContainerRef} 
          className="hidden"
          style={{ display: 'none', position: 'absolute', visibility: 'hidden', pointerEvents: 'none' }}
        />,
        document.body
      )}
      
      {/* Toggle button */}
      {(musicUrl || youtubeId) && (
        <button
          onClick={toggleSound}
          className="fixed bottom-4 right-4 z-50 w-12 h-12 rounded-full bg-purple-900/60 backdrop-blur-sm border-2 border-pink-500/50 hover:border-pink-500/80 flex items-center justify-center text-2xl transition-all duration-300 hover:glow-soft"
          aria-label={enabled ? 'Mute ambient sound' : 'Play ambient sound'}
        >
          {enabled ? '🔊' : '🔇'}
        </button>
      )}
    </>
  )
}
