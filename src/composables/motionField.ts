import { reactive, ref } from 'vue'

/** Page scroll progress in [0, 1]. */
export const scrollProgress = ref(0)

/** Normalized look target in [-1, 1] (center = 0) — pointer and/or gyro. */
export const pointerTarget = reactive({ x: 0, y: 0 })

/** True once device orientation is driving motion. */
export const gyroActive = ref(false)

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

/**
 * Apply locomotive-style parallax to `[data-parallax]` nodes.
 * `data-parallax` = scroll speed factor (e.g. 0.18).
 * Optional `data-parallax-mouse` = cursor/gyro shift in px at full pointer.
 */
export function updateParallaxLayers(root: ParentNode = document) {
  const nodes = root.querySelectorAll<HTMLElement>('[data-parallax]')
  const vh = window.innerHeight || 1

  nodes.forEach((node) => {
    const speed = Number(node.dataset.parallax || 0)
    const mouseAmp = Number(node.dataset.parallaxMouse || 0)
    const rect = node.getBoundingClientRect()
    const centerOffset = (rect.top + rect.height / 2 - vh / 2) / vh
    const scrollShift = -centerOffset * speed * 120
    const mouseX = pointerTarget.x * mouseAmp
    const mouseY = pointerTarget.y * mouseAmp * 0.65
    node.style.transform = `translate3d(${mouseX.toFixed(2)}px, ${(scrollShift + mouseY).toFixed(2)}px, 0)`
  })
}
