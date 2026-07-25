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
  Euler,
  MathUtils,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  ShaderMaterial,
  Vector2,
  Vector3,
} from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { computed, onBeforeUnmount, shallowRef } from 'vue'
import type { PrismQuality } from '../composables/prismCapability'
import { pointerTarget, scrollProgress } from '../composables/motionField'

const props = withDefaults(
  defineProps<{
    quality?: PrismQuality
  }>(),
  { quality: 'high' },
)

const isLow = computed(() => props.quality === 'low')

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

const cubes = [
  {
    position: new Vector3(0.1, 0.05, 0.08),
    scale: new Vector3(0.95, 0.95, 0.95),
    rotation: new Euler(0.35, 0.55, 0.12),
  },
  {
    position: new Vector3(-0.85, 0.4, -0.25),
    scale: new Vector3(0.58, 0.58, 0.58),
    rotation: new Euler(0.15, -0.45, 0.28),
  },
  {
    position: new Vector3(0.8, 0.28, -0.4),
    scale: new Vector3(0.54, 0.54, 0.54),
    rotation: new Euler(-0.25, 0.7, -0.15),
  },
  {
    position: new Vector3(-0.28, -0.65, 0.15),
    scale: new Vector3(0.72, 0.72, 0.72),
    rotation: new Euler(0.55, 0.2, -0.35),
  },
  {
    position: new Vector3(0.62, -0.42, 0.48),
    scale: new Vector3(0.46, 0.46, 0.46),
    rotation: new Euler(0.1, -0.8, 0.4),
  },
  {
    position: new Vector3(-0.55, -0.12, 0.62),
    scale: new Vector3(0.4, 0.4, 0.4),
    rotation: new Euler(-0.4, 0.35, 0.55),
  },
]

const detail = props.quality === 'low' ? 6 : 20
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

const mobileGlassMaterial = new MeshPhysicalMaterial({
  color: glassColor,
  transmission: 0.94,
  thickness: 0.55,
  roughness: 0.08,
  metalness: 0,
  ior: 1.45,
  clearcoat: 0.45,
  clearcoatRoughness: 0.12,
  transparent: true,
  opacity: 1,
  depthWrite: true,
  attenuationColor: new Color(glassColor),
  attenuationDistance: 4,
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

const rimMeshes = cubes.map((cube) => {
  const mesh = new Mesh(rimGeometry, rimMaterial)
  mesh.position.copy(cube.position)
  mesh.rotation.copy(cube.rotation)
  mesh.scale.copy(cube.scale).multiply(rimScale)
  return mesh
})

const coreMeshes = cubes.map((cube) => {
  const mesh = new Mesh(coreGeometry, coreMaterial)
  mesh.position.copy(cube.position)
  mesh.rotation.copy(cube.rotation)
  mesh.scale.copy(cube.scale).multiply(coreScale)
  return mesh
})

const mobileGlassMeshes = cubes.map((cube) => {
  const mesh = new Mesh(rimGeometry, mobileGlassMaterial)
  mesh.position.copy(cube.position)
  mesh.rotation.copy(cube.rotation)
  mesh.scale.copy(cube.scale)
  return mesh
})

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

let smoothedScroll = 0
let smoothedPointerX = 0
let smoothedPointerY = 0

const { onBeforeRender } = useLoop()

onBeforeRender(({ delta, elapsed }) => {
  const timeUniform = rimMaterial.uniforms.uTime
  if (timeUniform) timeUniform.value = elapsed

  if (!group.value) return

  smoothedScroll = MathUtils.damp(smoothedScroll, scrollProgress.value, 4, delta)
  smoothedPointerX = MathUtils.damp(smoothedPointerX, pointerTarget.x, 3.2, delta)
  smoothedPointerY = MathUtils.damp(smoothedPointerY, pointerTarget.y, 3.2, delta)

  if (prefersReducedMotion) {
    group.value.rotation.y = smoothedScroll * Math.PI * 0.6
    group.value.rotation.x = 0.15
    group.value.rotation.z = 0
    group.value.position.x = 0
    group.value.position.y = 0
    group.value.scale.setScalar(1)
    return
  }

  const idle = elapsed * 0.12
  const px = smoothedPointerX
  const py = smoothedPointerY

  group.value.rotation.y = idle + smoothedScroll * Math.PI * 1.35 + px * 0.55
  group.value.rotation.x =
    Math.sin(elapsed * 0.14) * 0.1 + smoothedScroll * 0.45 + py * 0.4
  group.value.rotation.z = Math.cos(elapsed * 0.11) * 0.05 - smoothedScroll * 0.2 + px * 0.12

  group.value.position.x = px * 0.45
  group.value.position.y = MathUtils.lerp(0.15, -0.55, smoothedScroll) - py * 0.28
  group.value.scale.setScalar(MathUtils.lerp(1, 0.78, smoothedScroll))

  if (camera.value) {
    camera.value.position.x = MathUtils.damp(camera.value.position.x, px * 0.22, 2.4, delta)
    camera.value.position.y = MathUtils.damp(
      camera.value.position.y,
      0.15 - py * 0.16,
      2.4,
      delta,
    )
    camera.value.lookAt(px * 0.15, -py * 0.1, 0)
  }

  if (!isLow.value) {
    const fringe = 0.0007 + Math.hypot(px, py) * 0.0006
    aberrationOffset.set(fringe, fringe * 0.9)
  }
})

onBeforeUnmount(() => {
  rimGeometry.dispose()
  coreGeometry.dispose()
  rimMaterial.dispose()
  coreMaterial.dispose()
  mobileGlassMaterial.dispose()
})
</script>

<template>
  <TresPerspectiveCamera ref="camera" :position="cameraPosition" :fov="28" />

  <Suspense v-if="!isLow">
    <Environment preset="city" :environment-intensity="0.7" />
  </Suspense>

  <TresAmbientLight :intensity="isLow ? 0.42 : 0.22" color="#fffdf9" />
  <TresDirectionalLight
    :position="keyLightPosition"
    :intensity="isLow ? 1.05 : 0.7"
    color="#fffdf9"
  />
  <TresDirectionalLight
    :position="fillLightPosition"
    :intensity="isLow ? 0.55 : 0.3"
    color="#6f879c"
  />
  <TresPointLight
    color="#ff2a2a"
    :intensity="isLow ? 2.2 : 1.6"
    :distance="10"
    :decay="2"
    :position="redLightPosition"
  />
  <TresPointLight
    color="#2a7fff"
    :intensity="isLow ? 2.2 : 1.6"
    :distance="10"
    :decay="2"
    :position="cyanLightPosition"
  />
  <TresPointLight
    color="#2aff2a"
    :intensity="isLow ? 1.7 : 1.2"
    :distance="10"
    :decay="2"
    :position="limeLightPosition"
  />

  <TresGroup ref="group">
    <primitive v-for="(mesh, index) in coreMeshes" :key="`core-${index}`" :object="mesh" />

    <!-- Desktop: full transmission glass -->
    <template v-if="!isLow">
      <RoundedBox
        v-for="(cube, index) in cubes"
        :key="`glass-${index}`"
        :args="glassArgs"
        :position="cube.position"
        :rotation="cube.rotation"
        :scale="cube.scale"
      >
        <MeshTransmissionMaterial
          :color="glassColor"
          :background="fboBackground"
          :transmission="1"
          :thickness="0.55"
          :backside="true"
          :backside-thickness="0.22"
          :chromatic-aberration="0.1"
          :anisotropic-blur="0.14"
          :roughness="0.04"
          :ior="1.5"
          :clearcoat="0.55"
          :clearcoat-roughness="0.08"
          :attenuation-distance="6"
          :attenuation-color="glassColor"
          :resolution="1024"
          :backside-resolution="512"
          :samples="12"
          :distortion="0.08"
          :distortion-scale="0.2"
          :temporal-distortion="0.1"
        />
      </RoundedBox>
    </template>

    <!-- Mobile: same cubes/motion, cheaper physical glass -->
    <template v-else>
      <primitive
        v-for="(mesh, index) in mobileGlassMeshes"
        :key="`mobile-glass-${index}`"
        :object="mesh"
      />
    </template>

    <primitive v-for="(mesh, index) in rimMeshes" :key="`rim-${index}`" :object="mesh" />
  </TresGroup>

  <Suspense v-if="!isLow">
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
