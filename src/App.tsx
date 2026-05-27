import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'

const TAGS = ['Cake', 'Joy', 'Music', 'Memories']
const BALLOONS = [
  { id: 'left', x: '10%', delay: '0s', scale: 1 },
  { id: 'center', x: '44%', delay: '1.1s', scale: 1.1 },
  { id: 'right', x: '78%', delay: '0.4s', scale: 0.95 },
]

const CONFETTI = Array.from({ length: 18 }, (_, index) => ({
  id: `confetti-${index}`,
  left: `${8 + ((index * 7) % 84)}%`,
  delay: `${(index % 6) * 0.08}s`,
  duration: `${1.1 + (index % 5) * 0.12}s`,
  rotate: `${(index % 2 === 0 ? 1 : -1) * (12 + (index % 6) * 5)}deg`,
}))

const App = () => {
  const [showSplash, setShowSplash] = useState(true)
  const [revealMain, setRevealMain] = useState(false)
  const [confettiBurst, setConfettiBurst] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const hasAutoPlayed = useRef(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioSrc = `${import.meta.env.BASE_URL}birthday-song.mp3`

  const mainClassName = useMemo(
    () => `main-screen ${revealMain ? 'main-screen--visible' : ''}`,
    [revealMain],
  )

  const triggerReveal = () => {
    if (!showSplash) return
    setShowSplash(false)
    setRevealMain(true)
    setConfettiBurst(true)
    window.setTimeout(() => setConfettiBurst(false), 1600)
  }

  useEffect(() => {
    const timer = window.setTimeout(triggerReveal, 3000)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!showSplash && audioRef.current && !hasAutoPlayed.current) {
      hasAutoPlayed.current = true
      audioRef.current.volume = 0.8
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true)
        })
        .catch(() => {
        })
    }
  }, [showSplash, isPlaying])

  const toggleAudio = async () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
      return
    }

    try {
      audioRef.current.volume = 0.8
      await audioRef.current.play()
      setIsPlaying(true)
    } catch (error) {
      console.error('Birthday song playback failed:', error)
    }
  }

  return (
    <div className="page-shell">
      {showSplash && (
        <button type="button" className="splash-screen" onClick={triggerReveal} aria-label="Reveal birthday greeting">
          <div className="splash-card">
            <p className="splash-kicker">Surprise!</p>
            <h2>Birthday magic incoming</h2>
            <div className="gift-stage" aria-hidden="true">
              <div className="gift-box">
                <span className="gift-ribbon gift-ribbon--vertical" />
                <span className="gift-ribbon gift-ribbon--horizontal" />
                <span className="gift-bow" />
                <span className="gift-spark gift-spark--one" />
                <span className="gift-spark gift-spark--two" />
                <span className="gift-spark gift-spark--three" />
              </div>
            </div>
            <p className="splash-hint">Click to reveal or wait a moment</p>
          </div>
        </button>
      )}

      <main className={mainClassName} aria-hidden={showSplash}>
        <div className="main-background" aria-hidden="true" />
        <div className="main-glow" aria-hidden="true" />

        <div className={`confetti-layer ${confettiBurst ? 'confetti-layer--active' : ''}`} aria-hidden="true">
          {CONFETTI.map((piece) => (
            <span
              key={piece.id}
              className="confetti-piece"
              style={
                {
                  left: piece.left,
                  animationDelay: piece.delay,
                  animationDuration: piece.duration,
                  ['--confetti-rotation' as string]: piece.rotate,
                } as CSSProperties
              }
            />
          ))}
        </div>

        <div className="balloon-layer" aria-hidden="true">
          {BALLOONS.map((balloon) => (
            <span
              key={balloon.id}
              className="balloon"
              style={
                {
                  left: balloon.x,
                  animationDelay: balloon.delay,
                  ['--balloon-scale' as string]: balloon.scale,
                } as CSSProperties
              }
            >
              <span className="balloon-string" />
            <span className="balloon-knot" />
            </span>
          ))}
        </div>

        <div className="content-shell">
          <p className="date-pill">May 30</p>
          <h1>Happy Birthday Sankavi</h1>
          <p className="wish-copy">
            Wishing you a day wrapped in cake, laughter, music, and the kind of moments that stay bright all
            year.
          </p>

          <div className="tag-row" aria-label="Birthday wishes">
            {TAGS.map((tag) => (
              <span key={tag} className="wish-tag">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <audio ref={audioRef} src={audioSrc} loop playsInline />

        <button
          type="button"
          className={`music-pill ${isPlaying ? 'music-pill--playing' : ''}`}
          onClick={toggleAudio}
          aria-label={isPlaying ? 'Pause birthday song' : 'Play birthday song'}
        >
          <span className="music-pill__icon" aria-hidden="true">
            ♪
          </span>
          <span className="music-pill__label">{isPlaying ? 'Pause' : 'Play'}</span>
        </button>

        <p className="signature" aria-hidden="true">
          Wishes by Dishon
        </p>
      </main>
    </div>
  )
}

export default App
