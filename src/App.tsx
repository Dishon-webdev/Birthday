import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react'

const rand = (min: number, max: number) => Math.random() * (max - min) + min
const randInt = (min: number, max: number) => Math.floor(rand(min, max))

interface StarParticle {
  x: number; y: number; z: number; px: number; py: number
}

function useStarCanvas(canvasRef: React.RefObject<HTMLCanvasElement | null>, active: boolean) {
  const starsRef = useRef<StarParticle[]>([])
  const rafRef = useRef<number>(0)
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let W = 0, H = 0

    const resize = () => {
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight
      starsRef.current = Array.from({ length: 280 }, () => ({
        x: rand(-W / 2, W / 2), y: rand(-H / 2, H / 2),
        z: rand(0.1, 1), px: 0, py: 0,
      }))
    }
    resize()
    window.addEventListener('resize', resize)

    const onMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX - W / 2, y: e.clientY - H / 2 }
    }
    window.addEventListener('mousemove', onMouse)

    let speed = 0.0005
    const maxSpeed = 0.0016
    let frame = 0

    const draw = () => {
      frame++
      if (speed < maxSpeed) speed += 0.000003
      ctx.fillStyle = 'rgba(3,4,10,0.16)'
      ctx.fillRect(0, 0, W, H)

      const cx = W / 2 + mouseRef.current.x * 0.035
      const cy = H / 2 + mouseRef.current.y * 0.035
      ctx.save()
      ctx.translate(cx, cy)

      for (const s of starsRef.current) {
        s.z -= speed
        if (s.z <= 0) {
          s.x = rand(-W / 2, W / 2); s.y = rand(-H / 2, H / 2)
          s.z = 1; s.px = s.x; s.py = s.y
        }
        const scale = 1 / s.z
        const sx = s.x * scale, sy = s.y * scale
        const r = Math.min((1 - s.z) * 2.6, 2.4)
        const alpha = Math.min((1 - s.z) * 1.5, 1)
        const key = (Math.abs(s.x * s.y) | 0)
        const isGold = key % 9 === 0
        const isCyan = key % 13 === 0

        ctx.beginPath()
        ctx.arc(sx, sy, r, 0, Math.PI * 2)
        ctx.fillStyle = isGold
          ? `rgba(240,192,80,${alpha})`
          : isCyan ? `rgba(80,220,255,${alpha})`
          : `rgba(220,225,255,${alpha})`
        ctx.fill()

        if (s.z < 0.55) {
          const ps = 1 / (s.z + speed * 22)
          ctx.beginPath()
          ctx.moveTo(s.px * ps, s.py * ps)
          ctx.lineTo(sx, sy)
          ctx.strokeStyle = isGold
            ? `rgba(240,192,80,${alpha * 0.5})`
            : isCyan ? `rgba(80,220,255,${alpha * 0.4})`
            : `rgba(200,210,255,${alpha * 0.3})`
          ctx.lineWidth = r * 0.65
          ctx.stroke()
        }
        s.px = s.x; s.py = s.y
      }

      if (frame % 200 === 0) {
        const mx = rand(-W / 2, W / 2)
        const my = rand(-H / 2, 0)
        const len = rand(100, 200)
        const g = ctx.createLinearGradient(mx, my, mx + len, my + len * 0.3)
        g.addColorStop(0, 'rgba(255,255,255,0)')
        g.addColorStop(0.45, 'rgba(255,240,180,0.85)')
        g.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.strokeStyle = g; ctx.lineWidth = 1.4
        ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(mx + len, my + len * 0.3); ctx.stroke()
      }

      ctx.restore()
      rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouse)
    }
  }, [active, canvasRef])
}

const GLITCH_CHARS = '!<>-_\\/[]{}—=+*^?#◆◈✦'
function useGlitchText(target: string, active: boolean) {
  const [text, setText] = useState(target)
  useEffect(() => {
    if (!active) return
    let iter = 0
    const interval = setInterval(() => {
      setText(target.split('').map((ch, i) =>
        i < iter ? ch : ch === ' ' ? ' ' : GLITCH_CHARS[randInt(0, GLITCH_CHARS.length)]
      ).join(''))
      iter += 0.45
      if (iter >= target.length) clearInterval(interval)
    }, 28)
    return () => clearInterval(interval)
  }, [target, active])
  return text
}

interface ConfettiP {
  id: number; x: number; y: number; vx: number; vy: number
  color: string; rot: number; rotV: number; size: number; life: number; shape: 'rect' | 'circle'
}
const CONFETTI_COLORS = ['#f0c060','#50dcff','#ff6090','#a0ff80','#ffffff','#ffaa40','#c87fff']

function useCakeConfetti() {
  const [particles, setParticles] = useState<ConfettiP[]>([])
  const rafRef = useRef<number>(0)

  const burst = useCallback((ox: number, oy: number) => {
    const ps: ConfettiP[] = Array.from({ length: 70 }, (_, id) => ({
      id, x: ox, y: oy,
      vx: rand(-11, 11), vy: rand(-18, -5),
      color: CONFETTI_COLORS[randInt(0, CONFETTI_COLORS.length)],
      rot: rand(0, 360), rotV: rand(-7, 7),
      size: rand(5, 12), life: 1,
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
    }))
    setParticles(ps)
    const animate = () => {
      setParticles(prev => {
        const next = prev.map(p => ({
          ...p, x: p.x + p.vx, y: p.y + p.vy,
          vy: p.vy + 0.52, vx: p.vx * 0.975,
          rot: p.rot + p.rotV, life: p.life - 0.016,
        })).filter(p => p.life > 0)
        if (next.length === 0) return next
        rafRef.current = requestAnimationFrame(animate)
        return next
      })
    }
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(animate)
  }, [])

  return { particles, burst }
}

function useScrollReveal(dep: boolean) {
  useEffect(() => {
    if (!dep) return
    const els = document.querySelectorAll<HTMLElement>('.reveal')
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('reveal--in'); io.unobserve(e.target) } })
    }, { threshold: 0.12 })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [dep])
}

const BOOT_LINES = [
  '> GALAXY SYSTEM BOOT — v19.0.0',
  '> SCANNING IDENTITY: SHARON',
  '> DATE LOCKED: 03 · 06 · 2006',
  '> MISSION CLASS: BIRTHDAY LEGEND',
  '> AGE MILESTONE DETECTED: 19 YEARS',
  '> CELEBRATION PROTOCOL INITIALIZING…',
]

function useTypewriter(lines: string[], active: boolean, onDone: () => void) {
  const [displayed, setDisplayed] = useState<string[]>([])
  const [lineIdx, setLineIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const doneRef = useRef(false)

  useEffect(() => {
    if (!active || doneRef.current) return
    if (lineIdx >= lines.length) {
      doneRef.current = true
      const t = window.setTimeout(onDone, 700)
      return () => window.clearTimeout(t)
    }
    const line = lines[lineIdx]
    if (charIdx <= line.length) {
      const t = window.setTimeout(() => {
        setDisplayed(prev => { const n = [...prev]; n[lineIdx] = line.slice(0, charIdx); return n })
        setCharIdx(c => c + 1)
      }, charIdx === 0 ? 320 : 24)
      return () => window.clearTimeout(t)
    } else {
      const t = window.setTimeout(() => { setLineIdx(l => l + 1); setCharIdx(0) }, 180)
      return () => window.clearTimeout(t)
    }
  }, [active, lineIdx, charIdx, lines, onDone])

  return displayed
}

const PHOTO_SRC = '/sharon.jpeg'

const App = () => {
  const [phase, setPhase] = useState<'splash' | 'main'>('splash')
  const [glitchActive, setGlitchActive] = useState(false)
  const [candlesLit, setCandlesLit] = useState(0)
  const [cakeBurst, setCakeBurst] = useState(false)
  const [countVal, setCountVal] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [photoLoaded, setPhotoLoaded] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const hasAutoPlayed = useRef(false)
  const cakeRef = useRef<HTMLButtonElement>(null)
  const audioSrc = `${import.meta.env.BASE_URL}birthday-song.mp3`

  const goToMain = useCallback(() => {
    if (phase !== 'splash') return
    setPhase('main')
    window.setTimeout(() => setGlitchActive(true), 900)
    window.setTimeout(() => {
      let i = 0
      const t = setInterval(() => { i++; setCandlesLit(i); if (i >= 5) clearInterval(t) }, 300)
    }, 1400)
    window.setTimeout(() => {
      let n = 0; const target = 19
      const step = () => {
        n += Math.ceil((target - n) / 5)
        if (n >= target) { setCountVal(target); return }
        setCountVal(n); window.setTimeout(step, 60)
      }
      step()
    }, 800)
  }, [phase])

  const splashLines = useMemo(() => BOOT_LINES, [])
  const displayed = useTypewriter(splashLines, phase === 'splash', goToMain)

  useStarCanvas(canvasRef, true)
  useScrollReveal(phase === 'main')

  const glitchedName = useGlitchText('SHARON', glitchActive)
  const { particles, burst } = useCakeConfetti()

  useEffect(() => {
    if (phase === 'main' && audioRef.current && !hasAutoPlayed.current) {
      hasAutoPlayed.current = true
      audioRef.current.volume = 0.72
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {})
    }
  }, [phase])

  const handleCakeClick = () => {
    setCakeBurst(true)
    window.setTimeout(() => setCakeBurst(false), 120)
    if (cakeRef.current) {
      const r = cakeRef.current.getBoundingClientRect()
      burst(r.left + r.width / 2, r.top + r.height / 3)
    }
  }

  const toggleAudio = async () => {
    if (!audioRef.current) return
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false) }
    else { try { await audioRef.current.play(); setIsPlaying(true) } catch {} }
  }

  return (
    <div className="shell">
      <canvas ref={canvasRef} className="star-canvas" aria-hidden="true" />
      <div className="scanlines" aria-hidden="true" />

      {/* SPLASH */}
      {phase === 'splash' && (
        <div className="splash" onClick={goToMain} role="button" tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && goToMain()} aria-label="Skip intro">
          <div className="hud-corner hud-corner--tl" aria-hidden="true" />
          <div className="hud-corner hud-corner--tr" aria-hidden="true" />
          <div className="hud-corner hud-corner--bl" aria-hidden="true" />
          <div className="hud-corner hud-corner--br" aria-hidden="true" />
          <div className="terminal">
            <div className="terminal-header" aria-hidden="true">
              <span className="t-dot t-dot--r" /><span className="t-dot t-dot--y" /><span className="t-dot t-dot--g" />
              <span className="t-title">BIRTHDAY_MISSION.exe</span>
            </div>
            <div className="terminal-body" role="log" aria-live="polite">
              {displayed.map((line, i) => (
                <p key={i} className="t-line">
                  {line}{i === displayed.length - 1 && <span className="t-cursor" aria-hidden="true">█</span>}
                </p>
              ))}
            </div>
          </div>
          <p className="splash-skip">[ CLICK ANYWHERE TO SKIP ]</p>
        </div>
      )}

      {/* MAIN */}
      <main className={`main ${phase === 'main' ? 'main--visible' : ''}`} aria-hidden={phase !== 'main'}>
        <div className="hud-corner hud-corner--tl" aria-hidden="true" />
        <div className="hud-corner hud-corner--tr" aria-hidden="true" />
        <div className="hud-corner hud-corner--bl" aria-hidden="true" />
        <div className="hud-corner hud-corner--br" aria-hidden="true" />

        <div className="status-bar" aria-hidden="true">
          <span className="status-item"><span className="status-dot" />ONLINE</span>
          <span className="status-item">03 · 06 · 2006 → 03 · 06 · 2026</span>
          <span className="status-item">SQUAD: BESTO FRIENDO</span>
        </div>

        {/* HERO */}
        <section className="hero reveal" aria-label="Birthday greeting">
          <div className="hero-eyebrow">
            <span className="eyebrow-line" aria-hidden="true" />
            <span className="eyebrow-text">19 YEARS OF LEGEND</span>
            <span className="eyebrow-line" aria-hidden="true" />
          </div>

          <div className="hero-age-wrap" aria-label="Age 19">
            <span className="hero-age-num" aria-hidden="true">{countVal}</span>
            <div className="hero-age-ring" aria-hidden="true" />
          </div>

          <h1 className="hero-title">
            <span className="title-line1">HAPPY BIRTHDAY</span>
            <span className="title-name">{glitchedName}</span>
          </h1>

          <p className="hero-sub">
            Born 03 · 06 · 2006 · Nineteen years of stories, fire, and unforgettable moments.
          </p>

          <div className="hero-divider" aria-hidden="true">
            <span /><span className="divider-diamond">◆</span><span />
          </div>
        </section>

        {/* PHOTO */}
        <section className="photo-section reveal" aria-label="Sharon's photo">
          <div className="photo-frame-wrap">
            <div className="photo-frame-glow" aria-hidden="true" />
            <div className={`photo-frame ${photoLoaded ? 'photo-frame--loaded' : ''}`}>
              <img
                src={PHOTO_SRC}
                alt="Sharon"
                className="photo-img"
                onLoad={() => setPhotoLoaded(true)}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
              {!photoLoaded && (
                <div className="photo-placeholder" aria-hidden="true">
                  <span className="placeholder-icon">◈</span>
                  <span className="placeholder-text">LOADING PHOTO…</span>
                </div>
              )}
              <div className="photo-overlay" aria-hidden="true" />
              <div className="photo-corner photo-corner--tl" aria-hidden="true" />
              <div className="photo-corner photo-corner--tr" aria-hidden="true" />
              <div className="photo-corner photo-corner--bl" aria-hidden="true" />
              <div className="photo-corner photo-corner--br" aria-hidden="true" />
            </div>
            <div className="photo-caption">
              <span className="caption-name">SHARON</span>
              <span className="caption-sep">·</span>
              <span className="caption-date">03 · 06 · 2006</span>
            </div>
          </div>
        </section>

        {/* CAKE */}
        <section className="cake-section reveal" aria-label="Birthday cake">
          <button ref={cakeRef} type="button"
            className={`cake-btn ${cakeBurst ? 'cake-btn--burst' : ''}`}
            onClick={handleCakeClick} aria-label="Click the cake to celebrate">
            <div className="cake-candles" aria-hidden="true">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className={`candle ${i < candlesLit ? 'candle--lit' : ''}`}
                  style={{ '--cd': `${i * 0.28}s` } as CSSProperties}>
                  <div className="candle-flame"><div className="flame-core" /></div>
                  <div className="candle-body" />
                </div>
              ))}
            </div>
            <div className="cake-tier cake-tier--top"><span className="tier-deco">✦ ✦ ✦</span></div>
            <div className="cake-tier cake-tier--mid">
              <span className="tier-stripe" /><span className="tier-stripe" /><span className="tier-stripe" />
            </div>
            <div className="cake-tier cake-tier--base"><span className="tier-deco tier-deco--base">◈ JUNE 03 · 19 ◈</span></div>
            <p className="cake-hint" aria-hidden="true">[ TAP TO CELEBRATE ]</p>
          </button>

          <div className="confetti-layer" aria-hidden="true">
            {particles.map(p => (
              <div key={p.id} className="confetti-p" style={{
                left: p.x, top: p.y,
                width: p.size, height: p.shape === 'circle' ? p.size : p.size * 0.5,
                background: p.color,
                borderRadius: p.shape === 'circle' ? '50%' : '1px',
                transform: `rotate(${p.rot}deg)`,
                opacity: p.life,
              }} />
            ))}
          </div>
        </section>

        {/* STATS */}
        <section className="stats-section reveal" aria-label="Birthday stats">
          {[
            { icon: '◎', val: '19', sub: 'Years of greatness' },
            { icon: '⬡', val: '2006', sub: 'Birth year · Legend' },
            { icon: '◈', val: '#1', sub: 'Rank in my world' },
            { icon: '◆', val: '∞', sub: 'Memories ahead' },
          ].map(s => (
            <div key={s.sub} className="stat-card">
              <span className="stat-icon" aria-hidden="true">{s.icon}</span>
              <span className="stat-val">{s.val}</span>
              <span className="stat-sub">{s.sub}</span>
            </div>
          ))}
        </section>

        {/* MESSAGE */}
        <section className="message-section reveal" aria-label="Birthday message">
          <div className="message-card">
            <div className="msg-accent" aria-hidden="true" />
            <h2 className="msg-title">A MESSAGE FOR YOU</h2>
<p className="msg-body">
  Nineteen years ago the world got a little more interesting —
  specifically, the trash can outside. We found you, cleaned you up,
  and decided to keep you. Best decision ever, honestly.
</p>
<p className="msg-body">
  But in all seriousness — you've been lighting up every room, every
  moment, every memory since day one. Today is yours, Sharon. Every
  single second of it. Here's to <em>nineteen</em> — and to every
  incredible year still to come. 🗑️→👑
</p>
            <div className="msg-signature">
              <span className="sig-line" aria-hidden="true" />
              <span className="sig-text">From your Besto Friendo, Dishon ✦</span>
              <span className="sig-line" aria-hidden="true" />
            </div>
          </div>
        </section>

        <footer className="footer">
          <span className="footer-text">03 · 06 · 2006 — 03 · 06 · 2025 · 19 YEARS · SHARON</span>
        </footer>

        <audio ref={audioRef} src={audioSrc} loop playsInline />

        <button type="button"
          className={`music-btn ${isPlaying ? 'music-btn--on' : ''}`}
          onClick={toggleAudio}
          aria-label={isPlaying ? 'Pause music' : 'Play music'}>
          <span className="music-icon" aria-hidden="true">{isPlaying ? '⏸' : '▶'}</span>
          <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
        </button>
      </main>
    </div>
  )
}

export default App