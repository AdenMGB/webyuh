import { describe, expect, it } from 'vitest'
import { resolvePrismCapability } from '../composables/prismCapability'

describe('resolvePrismCapability', () => {
  it('enables full webgl when available', () => {
    const result = resolvePrismCapability({
      hasWebGL: () => true,
      prefersReducedMotion: () => false,
    })
    expect(result).toEqual({ mode: 'webgl', reason: 'ok' })
  })

  it('does not special-case mobile away from webgl', () => {
    const result = resolvePrismCapability({
      hasWebGL: () => true,
      prefersReducedMotion: () => false,
    })
    expect(result.mode).toBe('webgl')
  })

  it('falls back for reduced motion', () => {
    const result = resolvePrismCapability({
      hasWebGL: () => true,
      prefersReducedMotion: () => true,
    })
    expect(result).toEqual({ mode: 'fallback', reason: 'reduced-motion' })
  })

  it('falls back when webgl is unavailable', () => {
    const result = resolvePrismCapability({
      hasWebGL: () => false,
      prefersReducedMotion: () => false,
    })
    expect(result).toEqual({ mode: 'fallback', reason: 'no-webgl' })
  })
})
