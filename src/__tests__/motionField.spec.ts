import { beforeEach, describe, expect, it } from 'vitest'
import {
  gyroActive,
  pointerTarget,
  setOrientationTarget,
  setPointerTarget,
} from '../composables/motionField'

describe('motionField', () => {
  beforeEach(() => {
    gyroActive.value = false
    pointerTarget.x = 0
    pointerTarget.y = 0
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
})
