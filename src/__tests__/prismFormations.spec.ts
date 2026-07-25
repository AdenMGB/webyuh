import { describe, expect, it } from 'vitest'
import {
  createPoseBuffer,
  formations,
  sampleFormation,
  sampleIntro,
} from '../composables/prismFormations'

describe('prismFormations', () => {
  it('starts in an L-like arrangement at scroll 0', () => {
    const out = createPoseBuffer(6)
    sampleFormation(0, out)

    const foot = out[0]!
    const top = out[1]!
    const mid = out[2]!
    const bottom = out[3]!

    expect(top.position.x).toBeCloseTo(0, 1)
    expect(mid.position.x).toBeCloseTo(0, 1)
    expect(bottom.position.x).toBeCloseTo(0, 1)
    expect(foot.position.x).toBeGreaterThan(0.5)
    expect(foot.position.y).toBeCloseTo(top.position.y, 1)
  })

  it('brings one cube forward on the close keyframe', () => {
    const out = createPoseBuffer(6)
    sampleFormation(0.18, out)
    const hero = out[0]!
    expect(hero.position.z).toBeGreaterThan(1)
    expect(hero.scale.x).toBeGreaterThan(1)
  })

  it('intro assembles from collapsed toward the L formation', () => {
    const start = createPoseBuffer(6)
    const end = createPoseBuffer(6)
    sampleIntro(0, start)
    sampleIntro(1, end)

    expect(start[0]!.scale.x).toBeLessThan(end[0]!.scale.x)
    expect(end[0]!.position.distanceTo(formations[0]![0]!.position)).toBeLessThan(0.001)
  })
})
