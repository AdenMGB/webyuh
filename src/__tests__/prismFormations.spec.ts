import { describe, expect, it } from 'vitest'
import {
  CUBE_COUNT,
  createPoseBuffer,
  formations,
  sampleFormation,
  sampleIntro,
} from '../composables/prismFormations'

describe('prismFormations', () => {
  it('uses four cubes for compact tetromino layouts', () => {
    expect(CUBE_COUNT).toBe(4)
    expect(formations[0]).toHaveLength(4)
  })

  it('starts in an L-like arrangement at scroll 0', () => {
    const out = createPoseBuffer()
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

  it('only enlarges the hero cube on the close keyframe', () => {
    const out = createPoseBuffer()
    sampleFormation(0.22, out)
    const hero = out[0]!
    const others = [out[1]!, out[2]!, out[3]!]

    expect(hero.position.z).toBeGreaterThan(0.8)
    expect(hero.scale.x).toBeGreaterThan(1.1)
    for (const cube of others) {
      expect(cube.scale.x).toBeLessThan(hero.scale.x)
      expect(cube.position.z).toBeLessThan(hero.position.z)
    }
  })

  it('intro assembles from collapsed toward the L formation', () => {
    const start = createPoseBuffer()
    const end = createPoseBuffer()
    sampleIntro(0, start)
    sampleIntro(1, end)

    expect(start[0]!.scale.x).toBeLessThan(end[0]!.scale.x)
    expect(end[0]!.position.distanceTo(formations[0]![0]!.position)).toBeLessThan(0.001)
  })
})
