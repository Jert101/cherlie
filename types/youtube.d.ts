// YouTube IFrame API types
declare namespace YT {
  interface PlayerState {
    UNSTARTED: -1
    ENDED: 0
    PLAYING: 1
    PAUSED: 2
    BUFFERING: 3
    CUED: 5
  }

  interface PlayerVars {
    autoplay?: 0 | 1
    loop?: 0 | 1
    playlist?: string
    controls?: 0 | 1
    modestbranding?: 0 | 1
    rel?: 0 | 1
    mute?: 0 | 1
    enablejsapi?: 0 | 1
  }

  interface PlayerOptions {
    videoId?: string
    playerVars?: PlayerVars
    events?: {
      onReady?: (event: any) => void
      onStateChange?: (event: any) => void
      onError?: (event: any) => void
    }
  }

  class Player {
    constructor(elementId: string, options: PlayerOptions)
    playVideo(): void
    pauseVideo(): void
    stopVideo(): void
    setVolume(volume: number): void
    getVolume(): number
    mute(): void
    unMute(): void
    getPlayerState(): number
  }
}

declare global {
  interface Window {
    YT: typeof YT
    onYouTubeIframeAPIReady?: () => void
  }
}
