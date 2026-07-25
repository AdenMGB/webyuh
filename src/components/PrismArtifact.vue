<script setup lang="ts">
import { defineAsyncComponent, onMounted, ref } from 'vue'
import { resolvePrismCapability } from '../composables/prismCapability'

const PrismCanvas = defineAsyncComponent(() => import('./PrismCanvas.vue'))

const mode = ref<'pending' | 'webgl' | 'fallback'>('pending')

onMounted(() => {
  const capability = resolvePrismCapability()
  mode.value = capability.mode
})
</script>

<template>
  <div class="prism" aria-hidden="true" :data-prism-mode="mode">
    <PrismCanvas v-if="mode === 'webgl'" />
    <div v-else class="prism__fallback">
      <span class="prism__orb prism__orb--a" />
      <span class="prism__orb prism__orb--b" />
      <span class="prism__orb prism__orb--c" />
    </div>
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
  overflow: hidden;
}

.prism :deep(canvas) {
  display: block;
  width: 100% !important;
  height: 100% !important;
  pointer-events: none !important;
}

.prism__fallback {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 70% 55% at 62% 42%, rgb(42 127 255 / 0.14), transparent 62%),
    radial-gradient(ellipse 55% 45% at 38% 58%, rgb(255 42 42 / 0.1), transparent 60%),
    radial-gradient(ellipse 50% 40% at 50% 48%, rgb(42 255 42 / 0.06), transparent 58%),
    var(--surface-obsidian-canvas);
}

.prism__orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(48px);
  opacity: 0.55;
  will-change: transform;
  animation: prism-drift var(--duration-prism) var(--ease-focus) infinite alternate;
}

.prism__orb--a {
  width: min(52vw, 420px);
  height: min(52vw, 420px);
  top: 18%;
  right: 8%;
  background: rgb(42 127 255 / 0.35);
}

.prism__orb--b {
  width: min(44vw, 340px);
  height: min(44vw, 340px);
  top: 36%;
  right: 28%;
  background: rgb(255 42 42 / 0.28);
  animation-delay: -2.2s;
  animation-duration: 8.2s;
}

.prism__orb--c {
  width: min(36vw, 280px);
  height: min(36vw, 280px);
  top: 48%;
  right: 16%;
  background: rgb(42 255 42 / 0.18);
  animation-delay: -4.1s;
  animation-duration: 9.4s;
}

@keyframes prism-drift {
  from {
    transform: translate3d(0, 0, 0) scale(1);
  }
  to {
    transform: translate3d(-4%, 5%, 0) scale(1.08);
  }
}

@media (prefers-reduced-motion: reduce) {
  .prism__orb {
    animation: none;
  }
}
</style>
