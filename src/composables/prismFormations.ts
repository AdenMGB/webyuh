import { Euler, MathUtils, Vector3 } from 'three'

export const CUBE_COUNT = 4

export type CubePose = {
  position: Vector3
  scale: Vector3
  rotation: Euler
}

function pose(
  x: number,
  y: number,
  z: number,
  s = 0.92,
  rx = 0.18,
  ry = 0.48,
  rz = 0.06,
): CubePose {
  return {
    position: new Vector3(x, y, z),
    scale: new Vector3(s, s, s),
    rotation: new Euler(rx, ry, rz),
  }
}

/**
 * Compact 4-cube formations (vivid-style tetromino language).
 * 0: L
 * 1: one cube close-up (others stay put, slightly smaller)
 * 2: T
 * 3: skewed diamond / Z
 */
export const formations: CubePose[][] = [
  // L
  [
    pose(0.9, 0.9, 0.05, 0.92),
    pose(0, 0.9, 0.05, 0.92),
    pose(0, 0, 0.05, 0.92),
    pose(0, -0.9, 0.05, 0.92),
  ],
  // Close-up: only the foot cube steps forward and grows; rest barely shifts
  [
    pose(0.55, 0.15, 1.05, 1.28, 0.28, 0.62, 0.08),
    pose(-0.15, 0.85, -0.2, 0.72, 0.16, 0.42, 0.05),
    pose(-0.15, 0.05, -0.25, 0.72, 0.16, 0.42, 0.05),
    pose(-0.15, -0.75, -0.3, 0.72, 0.16, 0.42, 0.05),
  ],
  // T
  [
    pose(-0.9, 0.55, 0.05, 0.9),
    pose(0, 0.55, 0.05, 0.9),
    pose(0.9, 0.55, 0.05, 0.9),
    pose(0, -0.45, 0.05, 0.9),
  ],
  // Skewed Z / diamond step
  [
    pose(-0.7, 0.55, 0.12, 0.88, 0.2, 0.4, 0.08),
    pose(0.15, 0.55, 0.02, 0.88, 0.2, 0.5, 0.06),
    pose(-0.15, -0.4, 0.02, 0.88, 0.22, 0.45, 0.05),
    pose(0.7, -0.4, -0.08, 0.88, 0.18, 0.55, 0.04),
  ],
]

/** Scroll stops for each formation keyframe. */
export const formationStops = [0, 0.22, 0.55, 1] as const

export function sampleFormation(scroll: number, out: CubePose[]): void {
  const t = MathUtils.clamp(scroll, 0, 1)
  let i = 0
  while (i < formationStops.length - 2 && t > formationStops[i + 1]!) i += 1

  const a = formationStops[i]!
  const b = formationStops[i + 1]!
  const local = b === a ? 0 : MathUtils.smoothstep(t, a, b)
  const from = formations[i]!
  const to = formations[i + 1]!

  for (let c = 0; c < out.length; c += 1) {
    const current = out[c]!
    const A = from[c]!
    const B = to[c]!
    current.position.lerpVectors(A.position, B.position, local)
    current.scale.lerpVectors(A.scale, B.scale, local)
    current.rotation.x = MathUtils.lerp(A.rotation.x, B.rotation.x, local)
    current.rotation.y = MathUtils.lerp(A.rotation.y, B.rotation.y, local)
    current.rotation.z = MathUtils.lerp(A.rotation.z, B.rotation.z, local)
  }
}

/** Intro assemble: from collapsed origin → L formation. */
export function sampleIntro(progress: number, out: CubePose[]): void {
  const p = MathUtils.smoothstep(MathUtils.clamp(progress, 0, 1), 0, 1)
  const target = formations[0]!
  for (let c = 0; c < out.length; c += 1) {
    const current = out[c]!
    const T = target[c]!
    const stagger = MathUtils.clamp((p - c * 0.05) / 0.8, 0, 1)
    const e = MathUtils.smootherstep(stagger, 0, 1)
    current.position.set(T.position.x * e, T.position.y * e - (1 - e) * 0.8, T.position.z * e)
    current.scale.setScalar(T.scale.x * (0.2 + 0.8 * e))
    current.rotation.set(T.rotation.x * e, T.rotation.y * e + (1 - e) * 0.6, T.rotation.z * e)
  }
}

export function createPoseBuffer(count = CUBE_COUNT): CubePose[] {
  return Array.from({ length: count }, () => ({
    position: new Vector3(),
    scale: new Vector3(1, 1, 1),
    rotation: new Euler(),
  }))
}
