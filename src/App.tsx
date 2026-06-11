import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react'

/* ─── Utilities ─────────────────────────────────────────── */
const rand = (a: number, b: number) => Math.random() * (b - a) + a

/* ─── Petal / Rose-petal confetti on blessings ─────────── */
interface Petal {
  id: number; x: number; y: number; vx: number; vy: number
  rot: number; rotV: number; size: number; life: number; color: string
}
const PETAL_COLORS = ['#D4A017','#C0392B','#8B0000','#F4C430','#E8735A','#FFF8E7','#FFD700']

function usePetals() {
  const [petals, setPetals] = useState<Petal[]>([])
  const raf = useRef<number>(0)

  const burst = useCallback((ox: number, oy: number) => {
    const ps: Petal[] = Array.from({ length: 55 }, (_, id) => ({
      id, x: ox, y: oy,
      vx: rand(-9, 9), vy: rand(-16, -4),
      rot: rand(0, 360), rotV: rand(-5, 5),
      size: rand(6, 14), life: 1,
      color: PETAL_COLORS[Math.floor(rand(0, PETAL_COLORS.length))],
    }))
    setPetals(ps)
    const animate = () => {
      setPetals(prev => {
        const next = prev.map(p => ({
          ...p,
          x: p.x + p.vx, y: p.y + p.vy,
          vy: p.vy + 0.45, vx: p.vx * 0.98,
          rot: p.rot + p.rotV, life: p.life - 0.018,
        })).filter(p => p.life > 0)
        if (next.length === 0) return next
        raf.current = requestAnimationFrame(animate)
        return next
      })
    }
    cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(animate)
  }, [])

  return { petals, burst }
}

/* ─── Kolam drawing hook ────────────────────────────────── */
function useKolamDraw(active: boolean) {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    if (!active) return
    let p = 0
    const id = setInterval(() => {
      p += 1.4
      setProgress(Math.min(p, 100))
      if (p >= 100) clearInterval(id)
    }, 28)
    return () => clearInterval(id)
  }, [active])
  return progress
}

/* ─── Scroll reveal ─────────────────────────────────────── */
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.reveal')
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('reveal--in'); io.unobserve(e.target) }
      })
    }, { threshold: 0.1 })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])
}

/* ─── Typewriter for splash ─────────────────────────────── */
function useTypewriter(text: string, active: boolean, onDone: () => void) {
  const [out, setOut] = useState('')
  const done = useRef(false)
  useEffect(() => {
    if (!active || done.current) return
    if (out.length >= text.length) {
      done.current = true
      const t = setTimeout(onDone, 1200)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setOut(text.slice(0, out.length + 1)), 48)
    return () => clearTimeout(t)
  }, [active, out, text, onDone])
  return out
}

/* ─── Blessings ─────────────────────────────────────────── */
interface Blessing {
  id: number; name: string; msg: string; time: string
}
const SAMPLE_BLESSINGS: Blessing[] = [
  { id: 1, name: 'Aachi (Paati)', msg: 'May Lord Murugan bless this little one with health, wisdom and prosperity. வாழ்த்துக்கள்! 🙏', time: 'Just now' },
  { id: 2, name: 'Thaatha', msg: 'Our hearts are overflowing with joy. May you grow strong and noble like your father. ஆயுஷ்மான் பவ!', time: '2 min ago' },
  { id: 3, name: 'Periamma', msg: 'Welcome to this beautiful world, little one. You are surrounded by so much love already! 🌸', time: '5 min ago' },
]

/* ─── Kolam SVG component ───────────────────────────────── */
function KolamPattern({ progress }: { progress: number }) {
  const dash = (total: number) => {
    const drawn = (progress / 100) * total
    return `${drawn} ${total}`
  }
  return (
    <svg viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg"
      className="kolam-svg" aria-label="Traditional kolam pattern" role="img">
      <defs>
        <radialGradient id="kolamGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#D4A017" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#8B0000" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="160" cy="160" r="155" fill="url(#kolamGlow)" />

      {/* Outer lotus ring */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2
        const cx = 160 + Math.cos(angle) * 130
        const cy = 160 + Math.sin(angle) * 130
        const r2x = 160 + Math.cos(angle) * 108
        const r2y = 160 + Math.sin(angle) * 108
        return (
          <ellipse key={i}
            cx={(cx + r2x) / 2} cy={(cy + r2y) / 2}
            rx="16" ry="9"
            transform={`rotate(${(i / 12) * 360 + 90}, ${(cx + r2x) / 2}, ${(cy + r2y) / 2})`}
            fill="none" stroke="#D4A017" strokeWidth="1.4"
            strokeDasharray={dash(60)} strokeDashoffset="0"
            opacity="0.85"
          />
        )
      })}

      {/* Outer octagram */}
      {[0, 45, 90, 135].map(deg => (
        <rect key={deg}
          x="60" y="60" width="200" height="200"
          fill="none" stroke="#C0392B" strokeWidth="1.2"
          transform={`rotate(${deg} 160 160)`}
          strokeDasharray={dash(800)} opacity="0.7"
        />
      ))}

      {/* Mid lotus petals */}
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2
        const cx = 160 + Math.cos(a) * 80
        const cy = 160 + Math.sin(a) * 80
        return (
          <ellipse key={i}
            cx={cx} cy={cy} rx="22" ry="11"
            transform={`rotate(${(i / 8) * 360 + 90}, ${cx}, ${cy})`}
            fill="none" stroke="#D4A017" strokeWidth="1.6"
            strokeDasharray={dash(100)} opacity="0.9"
          />
        )
      })}

      {/* Inner hexagram */}
      {[0, 60].map(deg => (
        <polygon key={deg}
          points="160,105 200,133 200,187 160,215 120,187 120,133"
          fill="none" stroke="#8B0000" strokeWidth="1.5"
          transform={`rotate(${deg} 160 160)`}
          strokeDasharray={dash(350)} opacity="0.8"
        />
      ))}

      {/* Circle rings */}
      {[45, 90, 130].map((r, i) => (
        <circle key={i}
          cx="160" cy="160" r={r}
          fill="none" stroke={i === 1 ? '#C0392B' : '#D4A017'}
          strokeWidth={i === 1 ? 1.8 : 1}
          strokeDasharray={dash(2 * Math.PI * r)}
          opacity={0.6 + i * 0.1}
        />
      ))}

      {/* Center lotus */}
      {Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2
        const cx = 160 + Math.cos(a) * 30
        const cy = 160 + Math.sin(a) * 30
        return (
          <ellipse key={i}
            cx={cx} cy={cy} rx="14" ry="7"
            transform={`rotate(${(i / 6) * 360 + 90}, ${cx}, ${cy})`}
            fill={progress > 80 ? 'rgba(212,160,23,0.12)' : 'none'}
            stroke="#D4A017" strokeWidth="1.8"
            strokeDasharray={dash(64)} opacity="1"
          />
        )
      })}

      {/* Center Om dot */}
      {progress > 90 && (
        <text x="160" y="168" textAnchor="middle"
          fontSize="22" fill="#C0392B" fontFamily="serif"
          opacity={Math.min((progress - 90) / 10, 1)}>ॐ</text>
      )}

      {/* Dot grid corners */}
      {[-1, 1].flatMap(sx => [-1, 1].map(sy => (
        [0.35, 0.6, 0.85].map((f, j) => (
          <circle key={`${sx}${sy}${j}`}
            cx={160 + sx * 145 * f} cy={160 + sy * 145 * f}
            r="2.5" fill="#D4A017"
            opacity={progress > 40 ? 0.6 : 0}
          />
        ))
      )))}
    </svg>
  )
}

/* ─── Diyas (oil lamps) component ───────────────────────── */
function Diya({ lit }: { lit: boolean }) {
  return (
    <div className={`diya ${lit ? 'diya--lit' : ''}`}>
      <div className="diya-flame">
        <div className="diya-flame-inner" />
      </div>
      <svg viewBox="0 0 40 22" xmlns="http://www.w3.org/2000/svg" className="diya-body-svg">
        <ellipse cx="20" cy="16" rx="18" ry="7" fill="#C0392B" />
        <ellipse cx="20" cy="14" rx="16" ry="6" fill="#D4A017" />
        <ellipse cx="20" cy="13" rx="10" ry="4" fill="#FFF3CD" opacity="0.7" />
        <path d="M 20 13 Q 28 10 32 12" stroke="#8B0000" strokeWidth="1.2" fill="none" />
      </svg>
    </div>
  )
}

/* ─── Main App ──────────────────────────────────────────── */
const App = () => {
  const [phase, setPhase] = useState<'splash' | 'main'>('splash')
  const [dyasLit, setDyasLit] = useState(0)
  const [blessings, setBlessings] = useState<Blessing[]>(SAMPLE_BLESSINGS)
  const [wishName, setWishName] = useState('')
  const [wishMsg, setWishMsg] = useState('')
  const [wishSent, setWishSent] = useState(false)
  const { petals, burst } = usePetals()
  const kolamProgress = useKolamDraw(phase === 'main')
  const blessBtnRef = useRef<HTMLButtonElement>(null)

  const goMain = useCallback(() => {
    if (phase !== 'splash') return
    setPhase('main')
    let i = 0
    const t = setInterval(() => { i++; setDyasLit(i); if (i >= 7) clearInterval(t) }, 280)
  }, [phase])

  const splashText = 'ஸ்வாகதம் — Welcome to the Cradle Ceremony'
  const typed = useTypewriter(splashText, phase === 'splash', goMain)

  useScrollReveal()

  const submitBlessing = () => {
    if (!wishName.trim() || !wishMsg.trim()) return
    const nb: Blessing = {
      id: Date.now(), name: wishName.trim(), msg: wishMsg.trim(), time: 'Just now'
    }
    setBlessings(prev => [nb, ...prev])
    setWishName(''); setWishMsg(''); setWishSent(true)
    setTimeout(() => setWishSent(false), 3000)
    if (blessBtnRef.current) {
      const r = blessBtnRef.current.getBoundingClientRect()
      burst(r.left + r.width / 2, r.top)
    }
  }

  return (
    <div className="shell">
      <div className="scanlines" aria-hidden="true" />

      {/* ── SPLASH ── */}
      {phase === 'splash' && (
        <div className="splash" onClick={goMain} role="button" tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && goMain()} aria-label="Enter ceremony">
          <div className="splash-gopuram" aria-hidden="true">
            <GopuramSVG />
          </div>
          <div className="splash-content">
            <div className="splash-om" aria-hidden="true">ॐ</div>
            <p className="splash-typed" aria-live="polite">
              {typed}<span className="t-cursor">|</span>
            </p>
            <p className="splash-skip">[ தொட்டு உள்ளே வாருங்கள் · Touch to Enter ]</p>
          </div>
          <div className="splash-diyas" aria-hidden="true">
            {Array.from({ length: 7 }, (_, i) => (
              <Diya key={i} lit={i < dyasLit} />
            ))}
          </div>
        </div>
      )}

      {/* ── MAIN ── */}
      <main className={`main ${phase === 'main' ? 'main--visible' : ''}`}
        aria-hidden={phase !== 'main'}>

        {/* Gopuram header */}
        <div className="gopuram-header" aria-hidden="true">
          <GopuramSVG slim />
          <div className="gopuram-lamps">
            {Array.from({ length: 7 }, (_, i) => <Diya key={i} lit={true} />)}
          </div>
        </div>

        {/* ── HERO ── */}
        <section className="hero reveal" aria-label="Ceremony welcome">
          <div className="hero-kolam" aria-hidden="true">
            <KolamPattern progress={kolamProgress} />
          </div>

          <div className="hero-inner">
            <p className="hero-eyebrow">
              <span className="line-ornament">✦</span>
              திருவிழா · Sacred Ceremony
              <span className="line-ornament">✦</span>
            </p>
            <h1 className="hero-title">
              <span className="title-top">Cradle Ceremony</span>
              <span className="title-tamil">தொட்டில் விழா</span>
            </h1>
            <div className="hero-lotus" aria-hidden="true">
              <LotusRow />
            </div>
            <p className="hero-sub">
              A blessed child has arrived, filling our home with divine grace.<br />
              We joyfully invite you to witness this sacred beginning.
            </p>
            <div className="hero-parents">
              <span className="parents-label">Hosted with love by</span>
              <span className="parents-name">Dineshkumar &amp; Sutharsana</span>
            </div>
          </div>
        </section>

        {/* ── BABY DETAILS ── */}
        <section className="baby-section reveal" aria-label="Baby details">
          <div className="section-header">
            <div className="section-line" aria-hidden="true" />
            <h2 className="section-title">
              <span className="s-title-om" aria-hidden="true">ॐ</span>
              The Blessed One
            </h2>
            <div className="section-line" aria-hidden="true" />
          </div>

          <div className="baby-cards">
            {[
              { icon: '🌸', label: 'Name', value: '[Baby\'s Name]', sub: 'To be revealed at ceremony' },
              { icon: '📅', label: 'Born on', value: 'Aadi Month', sub: 'Auspicious Tamil month' },
              { icon: '⭐', label: 'Nakshathram', value: 'Rohini', sub: 'Star of birth' },
              { icon: '🕉️', label: 'Rashi', value: 'Rishabha', sub: 'Taurus · Vrishabha' },
            ].map(c => (
              <div key={c.label} className="baby-card">
                <span className="baby-card-icon" aria-hidden="true">{c.icon}</span>
                <span className="baby-card-label">{c.label}</span>
                <span className="baby-card-value">{c.value}</span>
                <span className="baby-card-sub">{c.sub}</span>
              </div>
            ))}
          </div>

          <div className="photo-placeholder-wrap reveal">
            <div className="photo-placeholder">
              <div className="photo-corners">
                {['tl','tr','bl','br'].map(c => (
                  <div key={c} className={`pc pc--${c}`} />
                ))}
              </div>
              <span className="photo-icon" aria-hidden="true">🌷</span>
              <span className="photo-label">Baby's Photo</span>
              <span className="photo-hint">Add your image here</span>
            </div>
          </div>
        </section>

        {/* ── CEREMONY DETAILS ── */}
        <section className="ceremony-section reveal" aria-label="Ceremony details">
          <div className="ceremony-bg-pattern" aria-hidden="true" />

          <div className="section-header">
            <div className="section-line" aria-hidden="true" />
            <h2 className="section-title">
              <span className="s-title-om" aria-hidden="true">ॐ</span>
              Ceremony Details
            </h2>
            <div className="section-line" aria-hidden="true" />
          </div>

          <div className="ceremony-cards">
            {[
              {
                icon: '🗓️',
                tamil: 'நாள்',
                heading: 'Auspicious Date',
                line1: '[Ceremony Date]',
                line2: '[Tamil Calendar Date]',
              },
              {
                icon: '🕰️',
                tamil: 'நேரம்',
                heading: 'Muhurtham Time',
                line1: '[Time] onwards',
                line2: 'Shubha Muhurtham',
              },
              {
                icon: '📍',
                tamil: 'இடம்',
                heading: 'Venue',
                line1: '[Venue Name]',
                line2: '[Address, City]',
              },
            ].map(c => (
              <div key={c.heading} className="ceremony-card">
                <div className="ceremony-card-top">
                  <span className="ceremony-icon" aria-hidden="true">{c.icon}</span>
                  <span className="ceremony-tamil">{c.tamil}</span>
                </div>
                <h3 className="ceremony-card-heading">{c.heading}</h3>
                <p className="ceremony-card-line1">{c.line1}</p>
                <p className="ceremony-card-line2">{c.line2}</p>
              </div>
            ))}
          </div>

          <div className="ceremony-note reveal">
            <span className="note-icon" aria-hidden="true">🌺</span>
            <p>Dress code: <strong>Traditional attire welcomed and encouraged</strong></p>
            <span className="note-icon" aria-hidden="true">🌺</span>
          </div>
        </section>

        {/* ── BLESSINGS ── */}
        <section className="blessings-section reveal" aria-label="Blessings and wishes">
          <div className="section-header">
            <div className="section-line" aria-hidden="true" />
            <h2 className="section-title">
              <span className="s-title-om" aria-hidden="true">ॐ</span>
              Blessings &amp; Wishes
            </h2>
            <div className="section-line" aria-hidden="true" />
          </div>

          {/* Input form */}
          <div className="blessing-form reveal">
            <p className="form-heading">🙏 Leave your blessings for the child</p>
            <div className="form-row">
              <input
                type="text"
                className="form-input"
                placeholder="Your name"
                value={wishName}
                onChange={e => setWishName(e.target.value)}
                maxLength={40}
                aria-label="Your name"
              />
            </div>
            <div className="form-row">
              <textarea
                className="form-input form-textarea"
                placeholder="Write your blessing or wishes here… (Tamil / English)"
                value={wishMsg}
                onChange={e => setWishMsg(e.target.value)}
                maxLength={200}
                rows={3}
                aria-label="Your blessing"
              />
            </div>
            <button
              ref={blessBtnRef}
              type="button"
              className="bless-btn"
              onClick={submitBlessing}
              aria-label="Send blessing"
            >
              {wishSent ? '✓ Blessing Sent! 🌸' : 'Send Blessing 🙏'}
            </button>
          </div>

          {/* Blessings wall */}
          <div className="blessings-wall">
            {blessings.map(b => (
              <div key={b.id} className="blessing-card reveal">
                <div className="blessing-header">
                  <div className="blessing-avatar" aria-hidden="true">
                    {b.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="blessing-meta">
                    <span className="blessing-name">{b.name}</span>
                    <span className="blessing-time">{b.time}</span>
                  </div>
                  <span className="blessing-deco" aria-hidden="true">🪔</span>
                </div>
                <p className="blessing-msg">{b.msg}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="footer">
          <div className="footer-kolam" aria-hidden="true">
            <SmallKolam />
          </div>
          <p className="footer-text">
            <span className="footer-om" aria-hidden="true">ॐ</span>
            With love &amp; blessings — Dineshkumar &amp; Sutharsana
          </p>
          <p className="footer-sub">
            தொட்டில் விழா · Cradle Ceremony
          </p>
          <div className="footer-diyas" aria-hidden="true">
            {Array.from({ length: 5 }, (_, i) => <Diya key={i} lit={true} />)}
          </div>
        </footer>

        {/* Confetti layer */}
        <div className="confetti-layer" aria-hidden="true">
          {petals.map(p => (
            <div key={p.id} className="petal" style={{
              left: p.x, top: p.y,
              width: p.size, height: p.size * 0.55,
              background: p.color,
              borderRadius: '50% 0 50% 0',
              transform: `rotate(${p.rot}deg)`,
              opacity: p.life,
            } as CSSProperties} />
          ))}
        </div>
      </main>
    </div>
  )
}

/* ─── Gopuram SVG ───────────────────────────────────────── */
function GopuramSVG({ slim = false }: { slim?: boolean }) {
  const h = slim ? 90 : 200
  const w = slim ? 420 : 360
  return (
    <svg viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', maxHeight: h }} aria-hidden="true">
      <defs>
        <linearGradient id="gpGold" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#D4A017" />
          <stop offset="100%" stopColor="#8B0000" />
        </linearGradient>
      </defs>
      {slim ? (
        /* slim top bar */
        <>
          <rect x="0" y="70" width={w} height="20" fill="#8B0000" opacity="0.9" />
          <rect x="0" y="68" width={w} height="3" fill="#D4A017" />
          {Array.from({ length: 21 }, (_, i) => (
            <g key={i}>
              <rect x={i * 20 + 4} y="38" width="12" height="32" rx="4" fill="url(#gpGold)" />
              <ellipse cx={i * 20 + 10} cy="36" rx="6" ry="8" fill="#D4A017" />
              <circle cx={i * 20 + 10} cy="28" r="3.5" fill="#C0392B" />
            </g>
          ))}
          <rect x="0" y="85" width={w} height="5" fill="#D4A017" opacity="0.5" />
        </>
      ) : (
        /* full splash gopuram */
        <>
          {/* Main tower */}
          <rect x="130" y="40" width="100" height="160" rx="4" fill="#8B0000" opacity="0.95" />
          {/* Tiers */}
          {[0, 1, 2, 3].map(t => (
            <rect key={t}
              x={110 + t * 10} y={40 + t * 26}
              width={140 - t * 20} height={26}
              rx="3" fill={t % 2 === 0 ? '#D4A017' : '#C0392B'} opacity={0.92 - t * 0.05} />
          ))}
          {/* Kalasham (finial) */}
          <ellipse cx="180" cy="35" rx="14" ry="18" fill="#D4A017" />
          <circle cx="180" cy="17" r="7" fill="#C0392B" />
          <circle cx="180" cy="10" r="4" fill="#D4A017" />
          {/* Decorative pillars */}
          {[-50, 50].map(dx => (
            <g key={dx}>
              <rect x={180 + dx - 8} y="100" width="16" height="100" rx="4" fill="#C0392B" opacity="0.8" />
              <ellipse cx={180 + dx} cy="98" rx="8" ry="12" fill="#D4A017" opacity="0.9" />
            </g>
          ))}
          {/* Base */}
          <rect x="80" y="195" width="200" height="10" rx="2" fill="#D4A017" opacity="0.7" />
          {/* Small kalashams on side pillars */}
          {[-50, 50].map(dx => (
            <circle key={dx} cx={180 + dx} cy="85" r="5" fill="#D4A017" opacity="0.9" />
          ))}
          {/* Dots row */}
          {Array.from({ length: 9 }, (_, i) => (
            <circle key={i} cx={100 + i * 20} cy="192" r="3" fill="#D4A017" opacity="0.6" />
          ))}
          {/* Om center */}
          <text x="180" y="130" textAnchor="middle" fontSize="28"
            fill="#FFF8E7" fontFamily="serif" opacity="0.92">ॐ</text>
        </>
      )}
    </svg>
  )
}

/* ─── Lotus row ─────────────────────────────────────────── */
function LotusRow() {
  return (
    <div className="lotus-row" aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} viewBox="0 0 40 36" xmlns="http://www.w3.org/2000/svg"
          className="lotus-icon" style={{ opacity: i === 2 ? 1 : 0.55 + Math.abs(2 - i) * -0.1 }}>
          <ellipse cx="20" cy="24" rx="10" ry="5" fill="#D4A017" opacity="0.3" />
          {[0, -10, 10, -20, 20].map((dx, j) => (
            <ellipse key={j}
              cx={20 + dx} cy={22 - Math.abs(dx) * 0.2}
              rx={j === 0 ? 7 : 5.5} ry={j === 0 ? 14 : 11}
              fill={j === 0 ? '#C0392B' : '#D4A017'}
              opacity={j === 0 ? 0.9 : 0.75}
              transform={`rotate(${dx * 1.5} ${20 + dx} 22)`}
            />
          ))}
          <ellipse cx="20" cy="24" rx="5" ry="3" fill="#FFF3CD" opacity="0.9" />
        </svg>
      ))}
    </div>
  )
}

/* ─── Small footer kolam ────────────────────────────────── */
function SmallKolam() {
  return (
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"
      style={{ width: 80, height: 80, opacity: 0.5 }} aria-hidden="true">
      {[20, 40, 55].map((r, i) => (
        <circle key={i} cx="60" cy="60" r={r}
          fill="none" stroke={i === 1 ? '#C0392B' : '#D4A017'} strokeWidth="1" />
      ))}
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2
        return <circle key={i} cx={60 + Math.cos(a) * 40} cy={60 + Math.sin(a) * 40} r="3" fill="#D4A017" opacity="0.8" />
      })}
      <text x="60" y="65" textAnchor="middle" fontSize="14" fill="#C0392B" fontFamily="serif">ॐ</text>
    </svg>
  )
}

export default App