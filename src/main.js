import './style.css'

const butterflies = [
  { delay: '0s', offset: 2, variant: 'pink' },
  { delay: '1.2s', offset: -1.5, variant: 'white' },
  { delay: '2.4s', offset: 1, variant: 'yellow' },
]
const flowers = Array.from({ length: 14 }, (_, idx) => ({ delay: `${idx * 0.2}s` }))
const bubbles = Array.from({ length: 6 }, (_, idx) => ({ delay: `${idx * 0.8}s` }))
const balloons = [
  { left: '10%', delay: '0s' },
  { left: '65%', delay: '1.6s' },
  { left: '80%', delay: '0.8s' },
]

const audioSrc = '/birthday-song.mp3'

let splashTimer = null
let isPlaying = false

const setPlayingState = (button, playing) => {
  if (!button) {
    return
  }
  isPlaying = playing
  button.textContent = playing ? 'Stop' : 'Play'
  button.classList.toggle('btn-stop', playing)
  button.classList.toggle('btn-play', !playing)
}

const playSong = async (audioElement, button) => {
  if (!audioElement) {
    return
  }
  try {
    await audioElement.play()
    setPlayingState(button, true)
  } catch {
    setPlayingState(button, false)
  }
}

const stopSong = (audioElement, button) => {
  if (!audioElement) {
    return
  }
  audioElement.pause()
  audioElement.currentTime = 0
  setPlayingState(button, false)
}

const mountElements = () => {
  const butterflyRow = document.querySelector('[data-anchor="butterflies"]')
  const flowerRain = document.querySelector('[data-anchor="flowers"]')
  const bubbleRow = document.querySelector('[data-anchor="bubbles"]')
  const balloonRow = document.querySelector('[data-anchor="balloons"]')

  butterflies.forEach((butterfly) => {
    const span = document.createElement('span')
    span.className = `butterfly butterfly--${butterfly.variant}`
    span.style.animationDelay = butterfly.delay
    span.style.setProperty('--offset', butterfly.offset.toString())
    butterflyRow?.appendChild(span)
  })

  flowers.forEach((flower) => {
    const span = document.createElement('span')
    span.className = 'flower'
    span.style.animationDelay = flower.delay
    flowerRain?.appendChild(span)
  })

  bubbles.forEach((bubble) => {
    const span = document.createElement('span')
    span.className = 'floating-bubble'
    span.style.animationDelay = bubble.delay
    bubbleRow?.appendChild(span)
  })

  balloons.forEach((balloon) => {
    const span = document.createElement('span')
    span.className = 'balloon'
    span.style.left = balloon.left
    span.style.animationDelay = balloon.delay
    balloonRow?.appendChild(span)
  })
}

document.addEventListener('DOMContentLoaded', () => {
  const splash = document.querySelector('.splash-screen')
  const roseShell = document.querySelector('.rose-shell')
  const audioElement = document.getElementById('birthday-audio')
  const soundButton = document.getElementById('sound-toggle')

  if (audioElement) {
    audioElement.volume = 0.8
    audioElement.src = audioSrc
  }

  mountElements()

  setPlayingState(soundButton, false)

  const showRoseScene = () => {
    splash?.classList.add('hidden')
    roseShell?.classList.remove('hidden')
  }

  splashTimer = window.setTimeout(() => {
    showRoseScene()
    playSong(audioElement, soundButton)
  }, 3200)

  soundButton?.addEventListener('click', () => {
    if (isPlaying) {
      stopSong(audioElement, soundButton)
    } else {
      playSong(audioElement, soundButton)
    }
  })
})

window.addEventListener('beforeunload', () => {
  if (splashTimer) {
    window.clearTimeout(splashTimer)
  }
})
