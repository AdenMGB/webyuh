import { beforeEach, describe, expect, it } from 'vitest'
import {
  gyroActive,
  pointerTarget,
  setOrientationTarget,
  setPointerTarget,
  setScrollProgress,
  smoothPointer,
  smoothScroll,
  tickMotion,
} from '../composables/motionField'

describe('motionField', () => {
  beforeEach(() => {
    gyroActive.value = false
    pointerTarget.x = 0
    pointerTarget.y = 0
    smoothPointer.x = 0
    smoothPointer.y = 0
    smoothScroll.value = 0
    setScrollProgress(0)
  })

  it('maps device orientation into a clamped look target', () => {
    setOrientationTarget(55, 16)
    expect(pointerTarget.x).toBeCloseTo(0.5)
    expect(pointerTarget.y).toBeCloseTo(0)

    setOrientationTarget(55 + 64, -64)
    expect(pointerTarget.x).toBe(-1)
    expect(pointerTarget.y).toBe(1)
  })

  it('ignores pointer updates while gyro is active', () => {
    gyroActive.value = true
    setOrientationTarget(55, 10)
    setPointerTarget(0, 0)
    expect(pointerTarget.x).toBeCloseTo(10 / 32)
    expect(pointerTarget.y).toBeCloseTo(0)
  })

  it('lerps pointer and scroll toward targets', () => {
    pointerTarget.x = 1
    pointerTarget.y = -1
    setScrollProgress(1)

    tickMotion(1 / 30)
    expect(smoothPointer.x).toBeGreaterThan(0)
    expect(smoothPointer.x).toBeLessThan(1)
    expect(smoothPointer.y).toBeLessThan(0)
    expect(smoothScroll.value).toBeGreaterThan(0)
    expect(smoothScroll.value).toBeLessThan(1)

    for (let i = 0; i < 40; i += 1) tickMotion(1 / 30)
    expect(smoothPointer.x).toBeCloseTo(1, 1)
    expect(smoothPointer.y).toBeCloseTo(-1, 1)
    expect(smoothScroll.value).toBeCloseTo(1, 1)
  })
})
