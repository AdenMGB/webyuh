import { reactive, ref } from 'vue'

/** Page scroll progress in [0, 1]. */
export const scrollProgress = ref(0)

/** Raw normalized look target in [-1, 1] (center = 0) — pointer and/or gyro. */
export const pointerTarget = reactive({ x: 0, y: 0 })

/** Lerped pointer used for silky vivid-style motion. */
export const smoothPointer = reactive({ x: 0, y: 0 })

/** Lerped scroll progress for background / formation easing. */
export const smoothScroll = ref(0)

/** Page-load assemble progress in [0, 1]. */
export const introProgress = ref(0)

/** True once device orientation is driving motion. */
export const gyroActive = ref(false)

export function setIntroProgress(value: number) {
  introProgress.value = Math.min(1, Math.max(0, value))
}

export function setScrollProgress(value: number) {
  scrollProgress.value = Math.min(1, Math.max(0, value))
}

export function setPointerTarget(clientX: number, clientY: number) {
  if (gyroActive.value) return
  const w = window.innerWidth || 1
  const h = window.innerHeight || 1
  pointerTarget.x = (clientX / w) * 2 - 1
  pointerTarget.y = (clientY / h) * 2 - 1
}

export function setOrientationTarget(beta: number, gamma: number) {
  // beta: front/back tilt, gamma: left/right. Normalize around a natural phone hold (~55°).
  const x = Math.min(1, Math.max(-1, gamma / 32))
  const y = Math.min(1, Math.max(-1, (beta - 55) / 32))
  pointerTarget.x = x
  pointerTarget.y = y
}

export function resetPointerTarget() {
  if (gyroActive.value) return
  pointerTarget.x = 0
  pointerTarget.y = 0
}

function onDeviceOrientation(event: DeviceOrientationEvent) {
  if (event.beta == null || event.gamma == null) return
  setOrientationTarget(event.beta, event.gamma)
}

/**
 * Start listening to device orientation (gyro).
 * iOS 13+ requires a user gesture to call requestPermission().
 */
export async function enableDeviceOrientation(): Promise<boolean> {
  if (typeof window === 'undefined') return false
  if (gyroActive.value) return true

  const orientationEvent = window.DeviceOrientationEvent as
    | (typeof DeviceOrientationEvent & {
        requestPermission?: () => Promise<'granted' | 'denied' | 'default'>
      })
    | undefined

  if (!orientationEvent) return false

  try {
    if (typeof orientationEvent.requestPermission === 'function') {
      const permission = await orientationEvent.requestPermission()
      if (permission !== 'granted') return false
    }

    window.addEventListener('deviceorientation', onDeviceOrientation, true)
    gyroActive.value = true
    return true
  } catch {
    return false
  }
}

export function disableDeviceOrientation() {
  if (typeof window === 'undefined') return
  window.removeEventListener('deviceorientation', onDeviceOrientation, true)
  gyroActive.value = false
}

function damp(current: number, target: number, lambda: number, dt: number) {
  return current + (target - current) * (1 - Math.exp(-lambda * dt))
}

/** Advance lerped pointer / scroll — call once per animation frame. */
export function tickMotion(dt = 1 / 60) {
  const frame = Math.min(0.05, Math.max(0.001, dt))
  smoothPointer.x = damp(smoothPointer.x, pointerTarget.x, 7.5, frame)
  smoothPointer.y = damp(smoothPointer.y, pointerTarget.y, 7.5, frame)
  smoothScroll.value = damp(smoothScroll.value, scrollProgress.value, 5.5, frame)
}

/**
 * Apply vivid/locomotive-style parallax to `[data-parallax]` nodes.
 * `data-parallax` = scroll speed factor (e.g. 0.18).
 * Optional `data-parallax-mouse` = cursor/gyro shift in px at full pointer.
 * Optional `data-parallax-scale` = extra scale amplitude (e.g. 0.04).
 */
export function updateParallaxLayers(root: ParentNode = document) {
  const nodes = root.querySelectorAll<HTMLElement>('[data-parallax]')
  const vh = window.innerHeight || 1

  nodes.forEach((node) => {
    const speed = Number(node.dataset.parallax || 0)
    const mouseAmp = Number(node.dataset.parallaxMouse || 0)
    const scaleAmp = Number(node.dataset.parallaxScale || 0)
    const rect = node.getBoundingClientRect()
    const centerOffset = (rect.top + rect.height / 2 - vh / 2) / vh
    const absOffset = Math.min(1.5, Math.abs(centerOffset))
    const scrollShift = -centerOffset * speed * 140
    const mouseX = smoothPointer.x * mouseAmp
    const mouseY = smoothPointer.y * mouseAmp * 0.65
    const scale = 1 + (0.5 - Math.min(1, absOffset)) * scaleAmp

    node.style.transform = `translate3d(${mouseX.toFixed(2)}px, ${(scrollShift + mouseY).toFixed(2)}px, 0) scale(${scale.toFixed(4)})`
    node.style.filter = 'none'
  })
}

/** Drive CSS custom properties used by atmosphere drift. */
export function updateAtmosphereVars(root: HTMLElement) {
  const px = smoothPointer.x
  const py = smoothPointer.y
  const scroll = smoothScroll.value
  root.style.setProperty('--motion-x', px.toFixed(4))
  root.style.setProperty('--motion-y', py.toFixed(4))
  root.style.setProperty('--motion-scroll', scroll.toFixed(4))
  root.style.setProperty('--motion-scroll-y', `${(scroll * -12).toFixed(2)}vh`)
}

/**
 * Observe `[data-reveal]` nodes and toggle `.is-inview` when they enter.
 * Mirrors vivid's scroll-call / mask reveal pattern.
 */
export function bindRevealObserver(root: ParentNode = document): () => void {
  if (typeof IntersectionObserver === 'undefined') {
    root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((node) => {
      node.classList.add('is-inview')
    })
    return () => undefined
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const node = entry.target as HTMLElement
        if (entry.isIntersecting) {
          node.classList.add('is-inview')
          if (node.dataset.revealOnce !== 'false') observer.unobserve(node)
        } else if (node.dataset.revealOnce === 'false') {
          node.classList.remove('is-inview')
        }
      })
    },
    { threshold: 0.18, rootMargin: '0px 0px -8% 0px' },
  )

  root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((node) => observer.observe(node))
  return () => observer.disconnect()
}
