<script setup lang="ts">
import { Environment, MeshTransmissionMaterial, RoundedBox } from '@tresjs/cientos'
import { useLoop } from '@tresjs/core'
import {
  BloomPmndrs,
  ChromaticAberrationPmndrs,
  EffectComposerPmndrs,
  SMAAPmndrs,
} from '@tresjs/post-processing'
import {
  AdditiveBlending,
  Color,
  DoubleSide,
  MathUtils,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  ShaderMaterial,
  Vector2,
  Vector3,
} from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { computed, onBeforeUnmount, reactive, shallowRef } from 'vue'
import type { PrismProfile } from '../composables/prismCapability'
import {
  CUBE_COUNT,
  createPoseBuffer,
  sampleFormation,
  sampleIntro,
} from '../composables/prismFormations'
import { introProgress, pointerTarget, scrollProgress } from '../composables/motionField'

const props = withDefaults(
  defineProps<{
    profile?: PrismProfile
  }>(),
  { profile: 'full' },
)

const isCompatible = computed(() => props.profile === 'compatible')

const glassColor = '#fffdf9'
const fboBackground = new Color('#101010')

const group = shallowRef<{
  rotation: { x: number; y: number; z: number }
  position: { x: number; y: number; z: number }
  scale: { setScalar: (s: number) => void }
} | null>(null)

const camera = shallowRef<{
  position: { x: number; y: number; z: number }
  lookAt: (x: number, y: number, z: number) => void
} | null>(null)

/** Live cube poses for imperative meshes + sampling. */
const cubeStates = createPoseBuffer(CUBE_COUNT)
const targetPoses = createPoseBuffer(CUBE_COUNT)

/** Reactive numeric poses so Tres RoundedBox props actually update each frame. */
const cubeUi = reactive(
  Array.from({ length: CUBE_COUNT }, () => ({
    x: 0,
    y: 0,
    z: 0,
    rx: 0,
    ry: 0,
    rz: 0,
    s: 1,
  })),
)

const detail = props.profile === 'compatible' ? 8 : 20
const glassArgs = [1, 1, 1, detail, 0.36] as [number, number, number, number, number]
const coreScale = new Vector3(0.5, 0.5, 0.5)
const rimScale = new Vector3(1.03, 1.03, 1.03)

const cameraPosition = new Vector3(0, 0.15, 6.8)
const keyLightPosition = new Vector3(4, 6, 2)
const fillLightPosition = new Vector3(-3, 2, 4)
const redLightPosition = new Vector3(3.2, 1.6, 2.8)
const cyanLightPosition = new Vector3(-3.0, -1.0, 2.2)
const limeLightPosition = new Vector3(0.6, 3.2, -2.4)

const aberrationOffset = new Vector2(0.0009, 0.0009)
const aberration = {
  offset: aberrationOffset,
  radialModulation: true,
  modulationOffset: 0.4,
}

const rimGeometry = new RoundedBoxGeometry(1, 1, 1, detail, 0.36)
const coreGeometry = new RoundedBoxGeometry(1, 1, 1, Math.max(4, detail - 2), 0.32)
const coreMaterial = new MeshStandardMaterial({ color: '#000000', roughness: 1, metalness: 0 })

const compatibleGlassMaterial = new MeshPhysicalMaterial({
  color: glassColor,
  transmission: 1,
  thickness: 0.55,
  roughness: 0.04,
  metalness: 0,
  ior: 1.5,
  clearcoat: 0.55,
  clearcoatRoughness: 0.08,
  transparent: true,
  opacity: 1,
  attenuationColor: new Color(glassColor),
  attenuationDistance: 6,
  envMapIntensity: 1.1,
})

const rimMaterial = new ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uRed: { value: new Color('#ff2a2a') },
    uCyan: { value: new Color('#2a7fff') },
    uLime: { value: new Color('#2aff2a') },
  },
  vertexShader: /* glsl */ `
    varying vec3 vNormalW;
    varying vec3 vViewDir;

    void main() {
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vNormalW = normalize(mat3(modelMatrix) * normal);
      vViewDir = normalize(cameraPosition - worldPos.xyz);
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform float uTime;
    uniform vec3 uRed;
    uniform vec3 uCyan;
    uniform vec3 uLime;

    varying vec3 vNormalW;
    varying vec3 vViewDir;

    void main() {
      float ndotv = abs(dot(normalize(vNormalW), normalize(vViewDir)));
      float fresnel = pow(1.0 - ndotv, 2.7);

      float band = 0.5 + 0.5 * sin(uTime * 0.7 + fresnel * 7.0);
      vec3 prism = mix(uRed, uCyan, band);
      prism = mix(prism, uLime, fresnel * 0.55);

      float alpha = smoothstep(0.18, 0.95, fresnel) * 0.32;
      gl_FragColor = vec4(prism * 0.85, alpha);
    }
  `,
  transparent: true,
  depthWrite: false,
  blending: AdditiveBlending,
  side: DoubleSide,
  toneMapped: false,
})

const rimMeshes = cubeStates.map(() => new Mesh(rimGeometry, rimMaterial))
const coreMeshes = cubeStates.map(() => new Mesh(coreGeometry, coreMaterial))
const compatibleGlassMeshes = cubeStates.map(() => new Mesh(rimGeometry, compatibleGlassMaterial))

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

let smoothedScroll = 0
let smoothedPointerX = 0
let smoothedPointerY = 0
let smoothedIntro = 0

function applyPoseToMeshes() {
  for (let i = 0; i < cubeStates.length; i += 1) {
    const pose = cubeStates[i]!
    const rim = rimMeshes[i]!
    const core = coreMeshes[i]!
    const glass = compatibleGlassMeshes[i]!
    const ui = cubeUi[i]!

    rim.position.copy(pose.position)
    rim.rotation.copy(pose.rotation)
    rim.scale.copy(pose.scale).multiply(rimScale)

    core.position.copy(pose.position)
    core.rotation.copy(pose.rotation)
    core.scale.copy(pose.scale).multiply(coreScale)

    glass.position.copy(pose.position)
    glass.rotation.copy(pose.rotation)
    glass.scale.copy(pose.scale)

    ui.x = pose.position.x
    ui.y = pose.position.y
    ui.z = pose.position.z
    ui.rx = pose.rotation.x
    ui.ry = pose.rotation.y
    ui.rz = pose.rotation.z
    ui.s = pose.scale.x
  }
}

// Seed collapsed intro pose so first frame isn't a pop.
sampleIntro(0, cubeStates)
applyPoseToMeshes()

const { onBeforeRender } = useLoop()

onBeforeRender(({ delta, elapsed }) => {
  const timeUniform = rimMaterial.uniforms.uTime
  if (timeUniform) timeUniform.value = elapsed

  if (!group.value) return

  smoothedScroll = MathUtils.damp(smoothedScroll, scrollProgress.value, 2.6, delta)
  smoothedPointerX = MathUtils.damp(smoothedPointerX, pointerTarget.x, 2.4, delta)
  smoothedPointerY = MathUtils.damp(smoothedPointerY, pointerTarget.y, 2.4, delta)
  smoothedIntro = MathUtils.damp(smoothedIntro, introProgress.value, 3.6, delta)

  if (smoothedIntro < 0.999) {
    sampleIntro(smoothedIntro, targetPoses)
  } else {
    sampleFormation(smoothedScroll, targetPoses)
  }

  for (let i = 0; i < cubeStates.length; i += 1) {
    const cur = cubeStates[i]!
    const next = targetPoses[i]!
    // Keep position morphs calm, but let cubes keep tumbling.
    cur.position.lerp(next.position, 1 - Math.exp(-3.8 * delta))
    cur.scale.lerp(next.scale, 1 - Math.exp(-3.8 * delta))
    const spin = elapsed * (0.35 + i * 0.08)
    const targetRx = next.rotation.x + Math.sin(spin * 0.7 + i) * 0.35
    const targetRy = next.rotation.y + spin * 0.55
    const targetRz = next.rotation.z + Math.cos(spin * 0.55 + i * 0.4) * 0.22
    cur.rotation.x = MathUtils.damp(cur.rotation.x, targetRx, 4.5, delta)
    cur.rotation.y = MathUtils.damp(cur.rotation.y, targetRy, 4.5, delta)
    cur.rotation.z = MathUtils.damp(cur.rotation.z, targetRz, 4.5, delta)
  }
  applyPoseToMeshes()

  const px = smoothedPointerX
  const py = smoothedPointerY

  if (prefersReducedMotion) {
    group.value.rotation.y = 0.35
    group.value.rotation.x = 0.12
    group.value.rotation.z = 0
    group.value.position.x = 0
    group.value.position.y = 0
    group.value.scale.setScalar(1)
    return
  }

  // Stronger continuous rotation; positions stay the subtle formation path.
  const idle = elapsed * 0.14
  group.value.rotation.y = idle + px * 0.45
  group.value.rotation.x = Math.sin(elapsed * 0.13) * 0.1 + py * 0.28
  group.value.rotation.z = Math.cos(elapsed * 0.1) * 0.05 + px * 0.08
  group.value.position.x = px * 0.12
  group.value.position.y = py * -0.08
  group.value.scale.setScalar(1)

  if (camera.value) {
    camera.value.position.x = MathUtils.damp(camera.value.position.x, px * 0.12, 2.2, delta)
    camera.value.position.y = MathUtils.damp(camera.value.position.y, 0.15 - py * 0.08, 2.2, delta)
    camera.value.position.z = MathUtils.damp(camera.value.position.z, 6.8, 2.0, delta)
    camera.value.lookAt(px * 0.08, -py * 0.05, 0)
  }

  if (!isCompatible.value) {
    const fringe = 0.0006 + Math.hypot(px, py) * 0.00025
    aberrationOffset.set(fringe, fringe * 0.9)
  }
})

onBeforeUnmount(() => {
  rimGeometry.dispose()
  coreGeometry.dispose()
  rimMaterial.dispose()
  coreMaterial.dispose()
  compatibleGlassMaterial.dispose()
})
</script>

<template>
  <TresPerspectiveCamera ref="camera" :position="cameraPosition" :fov="28" />

  <Suspense>
    <Environment
      preset="city"
      :environment-intensity="isCompatible ? 1 : 0.7"
    />
  </Suspense>

  <TresAmbientLight :intensity="isCompatible ? 0.3 : 0.22" color="#fffdf9" />
  <TresDirectionalLight
    :position="keyLightPosition"
    :intensity="isCompatible ? 0.9 : 0.7"
    color="#fffdf9"
  />
  <TresDirectionalLight
    :position="fillLightPosition"
    :intensity="isCompatible ? 0.4 : 0.3"
    color="#6f879c"
  />
  <TresPointLight
    color="#ff2a2a"
    :intensity="isCompatible ? 2 : 1.6"
    :distance="10"
    :decay="2"
    :position="redLightPosition"
  />
  <TresPointLight
    color="#2a7fff"
    :intensity="isCompatible ? 2 : 1.6"
    :distance="10"
    :decay="2"
    :position="cyanLightPosition"
  />
  <TresPointLight
    color="#2aff2a"
    :intensity="isCompatible ? 1.5 : 1.2"
    :distance="10"
    :decay="2"
    :position="limeLightPosition"
  />

  <TresGroup ref="group">
    <primitive v-for="(mesh, index) in coreMeshes" :key="`core-${index}`" :object="mesh" />

    <template v-if="!isCompatible">
      <RoundedBox
        v-for="(cube, index) in cubeUi"
        :key="`glass-${index}`"
        :args="glassArgs"
        :position="[cube.x, cube.y, cube.z]"
        :rotation="[cube.rx, cube.ry, cube.rz]"
        :scale="[cube.s, cube.s, cube.s]"
      >
        <MeshTransmissionMaterial
          :color="glassColor"
          :background="fboBackground"
          :transmission="1"
          :thickness="0.55"
          :backside="true"
          :backside-thickness="0.22"
          :chromatic-aberration="0.08"
          :anisotropic-blur="0.04"
          :roughness="0.04"
          :ior="1.5"
          :clearcoat="0.55"
          :clearcoat-roughness="0.08"
          :attenuation-distance="6"
          :attenuation-color="glassColor"
          :resolution="1024"
          :backside-resolution="512"
          :samples="12"
          :distortion="0.04"
          :distortion-scale="0.12"
          :temporal-distortion="0"
        />
      </RoundedBox>
    </template>

    <template v-else>
      <primitive
        v-for="(mesh, index) in compatibleGlassMeshes"
        :key="`compatible-glass-${index}`"
        :object="mesh"
      />
    </template>

    <primitive v-for="(mesh, index) in rimMeshes" :key="`rim-${index}`" :object="mesh" />
  </TresGroup>

  <Suspense v-if="!isCompatible">
    <EffectComposerPmndrs>
      <BloomPmndrs
        :intensity="0.28"
        :luminance-threshold="0.88"
        :luminance-smoothing="0.4"
        :radius="0.55"
        mipmap-blur
      />
      <ChromaticAberrationPmndrs v-bind="aberration" />
      <SMAAPmndrs />
    </EffectComposerPmndrs>
  </Suspense>
</template>
