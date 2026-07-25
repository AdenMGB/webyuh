import { describe, expect, it } from 'vitest'
import { resolvePrismCapability } from '../composables/prismCapability'

describe('resolvePrismCapability', () => {
  it('uses the full profile on capable desktops', () => {
    const result = resolvePrismCapability({
      hasWebGL: () => true,
      prefersReducedMotion: () => false,
      isCoarsePointer: () => false,
      isNarrowViewport: () => false,
      hasSaveData: () => false,
      hasLowMemory: () => false,
      maxTouchPoints: 0,
    })
    expect(result).toEqual({ mode: 'webgl', profile: 'full', reason: 'ok' })
  })

  it('keeps webgl on mobile with a compatible profile', () => {
    const result = resolvePrismCapability({
      hasWebGL: () => true,
      prefersReducedMotion: () => false,
      isCoarsePointer: () => true,
      isNarrowViewport: () => true,
      hasSaveData: () => false,
      hasLowMemory: () => false,
      maxTouchPoints: 5,
    })
    expect(result).toEqual({ mode: 'webgl', profile: 'compatible', reason: 'mobile' })
  })

  it('falls back for reduced motion', () => {
    const result = resolvePrismCapability({
      hasWebGL: () => true,
      prefersReducedMotion: () => true,
      isCoarsePointer: () => false,
      isNarrowViewport: () => false,
      hasSaveData: () => false,
      hasLowMemory: () => false,
      maxTouchPoints: 0,
    })
    expect(result).toEqual({
      mode: 'fallback',
      profile: 'compatible',
      reason: 'reduced-motion',
    })
  })

  it('falls back when webgl is unavailable', () => {
    const result = resolvePrismCapability({
      hasWebGL: () => false,
      prefersReducedMotion: () => false,
      isCoarsePointer: () => false,
      isNarrowViewport: () => false,
      hasSaveData: () => false,
      hasLowMemory: () => false,
      maxTouchPoints: 0,
    })
    expect(result).toEqual({ mode: 'fallback', profile: 'compatible', reason: 'no-webgl' })
  })
})
