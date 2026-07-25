import { Euler, MathUtils, Vector3 } from 'three'

export type CubePose = {
  position: Vector3
  scale: Vector3
  rotation: Euler
}

function pose(
  x: number,
  y: number,
  z: number,
  s = 0.85,
  rx = 0.12,
  ry = 0.35,
  rz = 0.08,
): CubePose {
  return {
    position: new Vector3(x, y, z),
    scale: new Vector3(s, s, s),
    rotation: new Euler(rx, ry, rz),
  }
}

/**
 * Scroll-linked formations inspired by vividand.co's tetromino morphs.
 * 0: L, 1: one cube close, 2: cross, 3: stairs, 4: spread.
 */
export const formations: CubePose[][] = [
  [
    pose(0.95, 0.95, 0.05, 0.9, 0.2, 0.55, 0.1),
    pose(0, 0.95, 0.05, 0.9, 0.2, 0.55, 0.1),
    pose(0, 0, 0.05, 0.9, 0.2, 0.55, 0.1),
    pose(0, -0.95, 0.05, 0.9, 0.2, 0.55, 0.1),
    pose(0.95, 0.95, -0.75, 0.55, 0.1, -0.4, 0.2),
    pose(0, -0.95, -0.75, 0.55, -0.15, 0.5, -0.1),
  ],
  [
    pose(0.25, 0.05, 1.55, 1.35, 0.35, 0.7, 0.12),
    pose(-1.55, 0.85, -0.55, 0.48, 0.1, -0.5, 0.2),
    pose(1.65, 0.55, -0.85, 0.45, -0.2, 0.8, -0.1),
    pose(-0.85, -1.25, -0.35, 0.55, 0.45, 0.25, -0.3),
    pose(1.35, -0.95, 0.15, 0.4, 0.15, -0.7, 0.35),
    pose(-1.45, -0.15, -1.15, 0.38, -0.35, 0.4, 0.45),
  ],
  [
    pose(0, 0, 0.1, 0.88, 0.25, 0.4, 0.05),
    pose(0, 1.05, 0.1, 0.78, 0.15, 0.5, 0.1),
    pose(0, -1.05, 0.1, 0.78, 0.35, 0.3, -0.1),
    pose(1.05, 0, 0.1, 0.78, 0.2, 0.6, 0.15),
    pose(-1.05, 0, 0.1, 0.78, 0.2, -0.4, -0.1),
    pose(0, 0, -0.95, 0.6, -0.2, 0.7, 0.2),
  ],
  [
    pose(-1.2, -0.9, 0.2, 0.7, 0.3, 0.4, 0.1),
    pose(-0.4, -0.35, 0.05, 0.75, 0.25, 0.5, 0.08),
    pose(0.4, 0.2, -0.1, 0.8, 0.2, 0.55, 0.05),
    pose(1.2, 0.75, -0.25, 0.85, 0.15, 0.6, 0.02),
    pose(-1.2, 0.75, -0.8, 0.5, -0.2, -0.5, 0.3),
    pose(1.2, -0.9, -0.8, 0.5, 0.4, 0.3, -0.25),
  ],
  [
    pose(-1.6, 0.7, 0.3, 0.62, 0.2, -0.4, 0.2),
    pose(1.55, 0.55, 0.15, 0.68, -0.15, 0.7, -0.1),
    pose(0.1, -0.15, 0.85, 0.95, 0.3, 0.5, 0.1),
    pose(-0.9, -1.1, -0.2, 0.58, 0.45, 0.2, -0.3),
    pose(1.1, -1.0, -0.45, 0.55, 0.1, -0.65, 0.35),
    pose(0.2, 1.25, -0.7, 0.5, -0.3, 0.45, 0.25),
  ],
]

/** Scroll stops for each formation keyframe. */
export const formationStops = [0, 0.18, 0.42, 0.68, 1] as const

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
    const stagger = MathUtils.clamp((p - c * 0.06) / 0.75, 0, 1)
    const e = MathUtils.smootherstep(stagger, 0, 1)
    current.position.set(T.position.x * e, T.position.y * e - (1 - e) * 1.4, T.position.z * e)
    current.scale.setScalar(T.scale.x * (0.15 + 0.85 * e))
    current.rotation.set(T.rotation.x * e, T.rotation.y * e + (1 - e) * 1.2, T.rotation.z * e)
  }
}

export function createPoseBuffer(count = 6): CubePose[] {
  return Array.from({ length: count }, () => ({
    position: new Vector3(),
    scale: new Vector3(1, 1, 1),
    rotation: new Euler(),
  }))
}
