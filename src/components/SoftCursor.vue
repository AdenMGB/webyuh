<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const visible = ref(false)
const active = ref(false)
const label = ref('')
const root = ref<HTMLElement | null>(null)

const canUse =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(pointer: fine)').matches &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches

let raf = 0
let targetX = 0
let targetY = 0
let currentX = 0
let currentY = 0
let lastTs = 0

function onMove(event: PointerEvent) {
  if (!canUse) return
  visible.value = true
  targetX = event.clientX
  targetY = event.clientY
}

function onLeave() {
  visible.value = false
  active.value = false
  label.value = ''
}

function onOver(event: PointerEvent) {
  const target = event.target as HTMLElement | null
  const hit = target?.closest?.('a, button, [data-cursor]') as HTMLElement | null
  if (!hit) {
    active.value = false
    label.value = ''
    return
  }
  active.value = true
  label.value = hit.dataset.cursor || ''
}

function tick(ts = performance.now()) {
  const dt = lastTs ? Math.min(0.05, (ts - lastTs) / 1000) : 1 / 60
  lastTs = ts
  const alpha = 1 - Math.exp(-14 * dt)
  currentX += (targetX - currentX) * alpha
  currentY += (targetY - currentY) * alpha

  if (root.value && visible.value) {
    root.value.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`
  }
  raf = window.requestAnimationFrame(tick)
}

onMounted(() => {
  if (!canUse) return
  window.addEventListener('pointermove', onMove, { passive: true })
  window.addEventListener('pointerleave', onLeave)
  window.addEventListener('pointerover', onOver, { passive: true })
  document.documentElement.classList.add('has-soft-cursor')
  raf = window.requestAnimationFrame(tick)
})

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onMove)
  window.removeEventListener('pointerleave', onLeave)
  window.removeEventListener('pointerover', onOver)
  document.documentElement.classList.remove('has-soft-cursor')
  window.cancelAnimationFrame(raf)
})
</script>

<template>
  <div
    v-if="canUse"
    ref="root"
    class="soft-cursor"
    :class="{
      'soft-cursor--visible': visible,
      'soft-cursor--active': active,
    }"
    aria-hidden="true"
  >
    <span class="soft-cursor__ring" />
    <span v-if="label" class="soft-cursor__label">{{ label }}</span>
  </div>
</template>

<style scoped>
.soft-cursor {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 80;
  width: 0;
  height: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.25s var(--ease-focus);
}

.soft-cursor--visible {
  opacity: 1;
}

.soft-cursor__ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 18px;
  height: 18px;
  border: 1px solid rgb(255 253 249 / 0.75);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition:
    width 0.35s var(--ease-focus),
    height 0.35s var(--ease-focus),
    background-color 0.35s var(--ease-focus),
    border-color 0.35s var(--ease-focus);
}

.soft-cursor--active .soft-cursor__ring {
  width: 56px;
  height: 56px;
  background: rgb(255 253 249 / 0.08);
  border-color: rgb(255 253 249 / 0.95);
}

.soft-cursor__label {
  position: absolute;
  top: 0;
  left: 0;
  transform: translate(-50%, -50%);
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-bone-white);
  white-space: nowrap;
}
</style>
