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

/**
 * Use the full desktop prism wherever WebGL is available — including mobile.
 */
export function resolvePrismCapability(
  env: {
    hasWebGL?: () => boolean
    prefersReducedMotion?: () => boolean
  } = {},
): PrismCapability {
  if (typeof window === 'undefined') {
    return { mode: 'fallback', reason: 'ssr' }
  }

  const reducedMotion = env.prefersReducedMotion?.() ?? prefersReducedMotion()
  if (reducedMotion) {
    return { mode: 'fallback', reason: 'reduced-motion' }
  }

  const webgl = env.hasWebGL?.() ?? hasWebGL()
  if (!webgl) {
    return { mode: 'fallback', reason: 'no-webgl' }
  }

  return { mode: 'webgl', reason: 'ok' }
}
