export type PrismRenderMode = 'webgl' | 'fallback'
/** `full` = desktop MeshTransmissionMaterial path. `compatible` = mobile-safe glass path. */
export type PrismProfile = 'full' | 'compatible'

export type PrismCapability = {
  mode: PrismRenderMode
  profile: PrismProfile
  reason: string
}

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    const gl =
      canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: false }) ||
      canvas.getContext('webgl', { failIfMajorPerformanceCaveat: false }) ||
      canvas.getContext('experimental-webgl', { failIfMajorPerformanceCaveat: false })

    if (!gl || !(gl instanceof WebGLRenderingContext || gl instanceof WebGL2RenderingContext)) {
      return false
    }

    // iOS keeps a hard cap on live WebGL contexts — release the probe immediately.
    const lose = gl.getExtension('WEBGL_lose_context')
    lose?.loseContext()
    return true
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
 * MeshTransmissionMaterial renders HalfFloat FBOs and syncs with ReadPixels every
 * frame. On phones that stalls the GPU so the canvas mounts but never paints.
 * Mobile still gets real WebGL glass — just a compatible profile.
 */
export function resolvePrismCapability(
  env: {
    hasWebGL?: () => boolean
    prefersReducedMotion?: () => boolean
    isCoarsePointer?: () => boolean
    isNarrowViewport?: () => boolean
    hasSaveData?: () => boolean
    hasLowMemory?: () => boolean
    maxTouchPoints?: number
  } = {},
): PrismCapability {
  if (typeof window === 'undefined') {
    return { mode: 'fallback', profile: 'compatible', reason: 'ssr' }
  }

  const reducedMotion = env.prefersReducedMotion?.() ?? prefersReducedMotion()
  if (reducedMotion) {
    return { mode: 'fallback', profile: 'compatible', reason: 'reduced-motion' }
  }

  const webgl = env.hasWebGL?.() ?? hasWebGL()
  if (!webgl) {
    return { mode: 'fallback', profile: 'compatible', reason: 'no-webgl' }
  }

  const mobile = isMobileLike(env)
  const saveData = env.hasSaveData?.() ?? hasSaveData()
  const lowMemory = env.hasLowMemory?.() ?? hasLowMemory()

  if (mobile || saveData || lowMemory) {
    return { mode: 'webgl', profile: 'compatible', reason: mobile ? 'mobile' : 'low-power' }
  }

  return { mode: 'webgl', profile: 'full', reason: 'ok' }
}
