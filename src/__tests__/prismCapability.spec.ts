import { describe, expect, it } from 'vitest'
import { resolvePrismCapability } from '../composables/prismCapability'

describe('resolvePrismCapability', () => {
  it('enables high-quality webgl on capable desktop environments', () => {
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
    expect(result).toEqual({ mode: 'webgl', quality: 'high', reason: 'ok' })
  })

  it('keeps webgl on mobile with a low-quality preset', () => {
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
    expect(result).toEqual({ mode: 'webgl', quality: 'low', reason: 'mobile' })
  })

  it('uses low quality for touch + narrow viewports', () => {
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
    expect(result).toEqual({ mode: 'webgl', quality: 'low', reason: 'mobile' })
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
    expect(result).toEqual({ mode: 'fallback', quality: 'low', reason: 'reduced-motion' })
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
    expect(result).toEqual({ mode: 'fallback', quality: 'low', reason: 'no-webgl' })
  })
})
