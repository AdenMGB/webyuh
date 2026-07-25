import { describe, expect, it } from 'vitest'
import { resolvePrismCapability } from '../composables/prismCapability'

describe('resolvePrismCapability', () => {
  it('enables webgl on capable desktop environments', () => {
    const result = resolvePrismCapability({
      hasWebGL: () => true,
      prefersReducedMotion: () => false,
      isCoarsePointer: () => false,
      isNarrowViewport: () => false,
      hasSaveData: () => false,
      hasLowMemory: () => false,
      hasLowCpu: () => false,
      maxTouchPoints: 0,
    })
    expect(result).toEqual({ mode: 'webgl', reason: 'ok' })
  })

  it('falls back on mobile-like coarse pointers', () => {
    const result = resolvePrismCapability({
      hasWebGL: () => true,
      prefersReducedMotion: () => false,
      isCoarsePointer: () => true,
      isNarrowViewport: () => true,
      hasSaveData: () => false,
      hasLowMemory: () => false,
      hasLowCpu: () => false,
      maxTouchPoints: 5,
    })
    expect(result).toEqual({ mode: 'fallback', reason: 'mobile' })
  })

  it('falls back when touch + narrow viewport even if pointer is fine', () => {
    const result = resolvePrismCapability({
      hasWebGL: () => true,
      prefersReducedMotion: () => false,
      isCoarsePointer: () => false,
      isNarrowViewport: () => true,
      hasSaveData: () => false,
      hasLowMemory: () => false,
      hasLowCpu: () => false,
      maxTouchPoints: 2,
    })
    expect(result).toEqual({ mode: 'fallback', reason: 'mobile' })
  })

  it('falls back for reduced motion', () => {
    const result = resolvePrismCapability({
      hasWebGL: () => true,
      prefersReducedMotion: () => true,
      isCoarsePointer: () => false,
      isNarrowViewport: () => false,
      hasSaveData: () => false,
      hasLowMemory: () => false,
      hasLowCpu: () => false,
      maxTouchPoints: 0,
    })
    expect(result).toEqual({ mode: 'fallback', reason: 'reduced-motion' })
  })

  it('falls back when webgl is unavailable', () => {
    const result = resolvePrismCapability({
      hasWebGL: () => false,
      prefersReducedMotion: () => false,
      isCoarsePointer: () => false,
      isNarrowViewport: () => false,
      hasSaveData: () => false,
      hasLowMemory: () => false,
      hasLowCpu: () => false,
      maxTouchPoints: 0,
    })
    expect(result).toEqual({ mode: 'fallback', reason: 'no-webgl' })
  })
})
