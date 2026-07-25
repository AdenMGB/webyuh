export type PrismRenderMode = 'webgl' | 'fallback'

export type PrismCapability = {
  mode: PrismRenderMode
  reason: string
}

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(
      canvas.getContext('webgl2') ||
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl'),
    )
  } catch {
    return false
  }
}

function prefersReducedMotion(): boolean {
  return (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

function isCoarsePointer(): boolean {
  return (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(pointer: coarse)').matches
  )
}

function isNarrowViewport(): boolean {
  return (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(max-width: 900px)').matches
  )
}

function hasSaveData(): boolean {
  const connection = (
    navigator as Navigator & {
      connection?: { saveData?: boolean }
    }
  ).connection
  return Boolean(connection?.saveData)
}

function hasLowMemory(): boolean {
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory
  return typeof memory === 'number' && memory > 0 && memory <= 4
}

function hasLowCpu(): boolean {
  const cores = navigator.hardwareConcurrency
  return typeof cores === 'number' && cores > 0 && cores <= 4
}

/**
 * Transmission glass + post-processing is too heavy for phones.
 * Skip WebGL on touch/mobile/low-power devices and fall back to CSS.
 */
export function resolvePrismCapability(
  env: {
    hasWebGL?: () => boolean
    prefersReducedMotion?: () => boolean
    isCoarsePointer?: () => boolean
    isNarrowViewport?: () => boolean
    hasSaveData?: () => boolean
    hasLowMemory?: () => boolean
    hasLowCpu?: () => boolean
    maxTouchPoints?: number
  } = {},
): PrismCapability {
  if (typeof window === 'undefined') {
    return { mode: 'fallback', reason: 'ssr' }
  }

  const reducedMotion = env.prefersReducedMotion?.() ?? prefersReducedMotion()
  if (reducedMotion) {
    return { mode: 'fallback', reason: 'reduced-motion' }
  }

  const saveData = env.hasSaveData?.() ?? hasSaveData()
  if (saveData) {
    return { mode: 'fallback', reason: 'save-data' }
  }

  const lowMemory = env.hasLowMemory?.() ?? hasLowMemory()
  if (lowMemory) {
    return { mode: 'fallback', reason: 'low-memory' }
  }

  const coarse = env.isCoarsePointer?.() ?? isCoarsePointer()
  const narrow = env.isNarrowViewport?.() ?? isNarrowViewport()
  const touchPoints = env.maxTouchPoints ?? navigator.maxTouchPoints ?? 0
  const isMobileLike = coarse || (touchPoints > 0 && narrow)

  if (isMobileLike) {
    return { mode: 'fallback', reason: 'mobile' }
  }

  // Weak laptops still struggle with MeshTransmissionMaterial FBOs.
  const lowCpu = env.hasLowCpu?.() ?? hasLowCpu()
  if (lowCpu && narrow) {
    return { mode: 'fallback', reason: 'low-power' }
  }

  const webgl = env.hasWebGL?.() ?? hasWebGL()
  if (!webgl) {
    return { mode: 'fallback', reason: 'no-webgl' }
  }

  return { mode: 'webgl', reason: 'ok' }
}
