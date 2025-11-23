import { useEffect, useRef, useState, type CSSProperties } from 'react'

const butterflies = [
  { id: 'butterfly-1', delay: '0s', offset: 2, variant: 'pink' },
  { id: 'butterfly-2', delay: '1.2s', offset: -1.5, variant: 'white' },
  { id: 'butterfly-3', delay: '2.4s', offset: 1, variant: 'yellow' },
]
const flowers = Array.from({ length: 14 }, (_, idx) => ({ id: `flower-${idx}`, delay: `${idx * 0.2}s` }))
const bubbles = Array.from({ length: 6 }, (_, idx) => ({ id: `bubble-${idx}`, delay: `${idx * 0.8}s` }))
const balloons = [
  { id: 'balloon-1', left: '10%', delay: '0s' },
  { id: 'balloon-2', left: '65%', delay: '1.6s' },
  { id: 'balloon-3', left: '80%', delay: '0.8s' },
]

const App = () => {
  const [showSplash, setShowSplash] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioSrc = `${import.meta.env.BASE_URL}birthday-song.mp3`

  useEffect(() => {
    const timer = window.setTimeout(() => setShowSplash(false), 3200)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!showSplash && audioRef.current) {
      audioRef.current.volume = 0.8
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false))
    }
  }, [showSplash])

  const handleManualPlay = async () => {
    if (!audioRef.current) {
      return
    }
    try {
      await audioRef.current.play()
      setIsPlaying(true)
    } catch {
      setIsPlaying(false)
    }
  }

  const stopSong = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setIsPlaying(false)
  }

  return (
    <div className="page-shell">
      {showSplash && (
        <div className="splash-screen" role="status" aria-live="polite">
          <div className="splash-content">
            <h2>Surprise!</h2>
            <p>Birthday magic incoming</p>
            <div className="gift-box" aria-hidden="true">
              <span className="box-lid" />
              <span className="box-base" />
            </div>
            <div className="paper-blast" aria-hidden="true" />
            <div className="bubble bubble-a" />
            <div className="bubble bubble-b" />
            <div className="bubble bubble-c" />
            <div className="popper popper-a" />
            <div className="popper popper-b" />
            <div className="firecracker firecracker-a" />
            <div className="firecracker firecracker-b" />
            <div className="chocolate" />
            <div className="cake-flare" />
          </div>
        </div>
      )}

      <div className={`rose-shell ${showSplash ? 'hidden' : ''}`}>
        <div className="rose-gradient" aria-hidden="true" />
        <div className="butterfly-row" aria-hidden="true">
          {butterflies.map((butterfly) => (
            <span
              key={butterfly.id}
              className={`butterfly butterfly--${butterfly.variant}`}
              style={{ animationDelay: butterfly.delay, ['--offset' as string]: butterfly.offset } as CSSProperties}
            />
          ))}
        </div>
        <div className="flower-rain" aria-hidden="true">
          {flowers.map((flower) => (
            <span key={flower.id} className="flower" style={{ animationDelay: flower.delay }} />
          ))}
        </div>
        <div className="bubble-row" aria-hidden="true">
          {bubbles.map((bubble) => (
            <span key={bubble.id} className="floating-bubble" style={{ animationDelay: bubble.delay }} />
          ))}
        </div>
        <div className="balloon-row" aria-hidden="true">
          {balloons.map((balloon) => (
            <span key={balloon.id} className="balloon" style={{ left: balloon.left, animationDelay: balloon.delay }} />
          ))}
        </div>
        <div className="tree-row" aria-hidden="true">
          <div className="tree tree-left">
            <div className="foliage">
              <span className="fruit fruit--pink" />
              <span className="fruit fruit--yellow" />
            </div>
            <div className="trunk" />
          </div>
          <div className="tree tree-right">
            <div className="foliage">
              <span className="fruit fruit--pink" />
              <span className="fruit fruit--yellow" />
              <span className="fruit fruit--pink" />
            </div>
            <div className="trunk" />
          </div>
          <p className="tree-signature" aria-hidden="true">
            Wishes by Dishon
          </p>
        </div>
        <main className="wish-block">
          <p className="subtitle">November 24</p>
          <h1>Happy Birthday Nishanthini</h1>
        </main>

        <audio ref={audioRef} src={audioSrc} loop autoPlay playsInline />

        <div className="sound-control">
          <p className="volume-note">
            <span className="wave">Volume up</span>
          </p>
          {isPlaying ? (
            <button
              type="button"
              className="btn-stop responsive-stop"
              onClick={stopSong}
              disabled={!isPlaying}
            >
              Stop
            </button>
          ) : (
            <button type="button" className="btn-play responsive-stop" onClick={handleManualPlay}>
              Play
            </button>
          )}
        </div>

      </div>
    </div>
  )
}

export default App

