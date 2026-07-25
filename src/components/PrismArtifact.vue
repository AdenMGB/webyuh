<script setup lang="ts">
import { TresCanvas } from '@tresjs/core'
import { ACESFilmicToneMapping, SRGBColorSpace } from 'three'
import { onMounted, ref } from 'vue'
import PrismScene from './PrismScene.vue'

const canRender = ref(false)

onMounted(() => {
  try {
    const canvas = document.createElement('canvas')
    canRender.value = Boolean(
      canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl'),
    )
  } catch {
    canRender.value = false
  }
})
</script>

<template>
  <div class="prism" aria-hidden="true">
    <TresCanvas
      v-if="canRender"
      clear-color="#101010"
      :clear-alpha="1"
      :alpha="true"
      :antialias="true"
      :dpr="[1, 2]"
      :tone-mapping="ACESFilmicToneMapping"
      :tone-mapping-exposure="1.05"
      :output-color-space="SRGBColorSpace"
      :window-size="true"
    >
      <PrismScene />
    </TresCanvas>
  </div>
</template>

<style scoped>
.prism {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
  pointer-events: none;
  overflow: visible;
}

.prism :deep(canvas) {
  display: block;
  width: 100% !important;
  height: 100% !important;
  pointer-events: none !important;
}
</style>
