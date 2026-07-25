export type PrismRenderMode = 'webgl' | 'fallback'
export type PrismQuality = 'high' | 'low'

export type PrismCapability = {
  mode: PrismRenderMode
  quality: PrismQuality
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

function isMobileLike(env: {
  isCoarsePointer?: () => boolean
  isNarrowViewport?: () => boolean
  maxTouchPoints?: number
}): boolean {
  const coarse = env.isCoarsePointer?.() ?? isCoarsePointer()
  const narrow = env.isNarrowViewport?.() ?? isNarrowViewport()
  const touchPoints = env.maxTouchPoints ?? navigator.maxTouchPoints ?? 0
  return coarse || (touchPoints > 0 && narrow)
}

/**
 * Always prefer the real WebGL prism when the GPU can run it.
 * Mobile/low-power devices get a lighter quality preset instead of a CSS fallback.
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
    return { mode: 'fallback', quality: 'low', reason: 'ssr' }
  }

  const reducedMotion = env.prefersReducedMotion?.() ?? prefersReducedMotion()
  if (reducedMotion) {
    return { mode: 'fallback', quality: 'low', reason: 'reduced-motion' }
  }

  const webgl = env.hasWebGL?.() ?? hasWebGL()
  if (!webgl) {
    return { mode: 'fallback', quality: 'low', reason: 'no-webgl' }
  }

  const saveData = env.hasSaveData?.() ?? hasSaveData()
  const lowMemory = env.hasLowMemory?.() ?? hasLowMemory()
  const lowCpu = env.hasLowCpu?.() ?? hasLowCpu()
  const narrow = env.isNarrowViewport?.() ?? isNarrowViewport()
  const mobile = isMobileLike(env)

  if (mobile || saveData || lowMemory || (lowCpu && narrow)) {
    return { mode: 'webgl', quality: 'low', reason: mobile ? 'mobile' : 'low-power' }
  }

  return { mode: 'webgl', quality: 'high', reason: 'ok' }
}
