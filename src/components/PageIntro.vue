<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { setIntroProgress } from '../composables/motionField'

const emit = defineEmits<{
  done: []
}>()

const phase = ref<'cover' | 'lift' | 'done'>('cover')

const reduceMotion =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

onMounted(() => {
  if (reduceMotion) {
    setIntroProgress(1)
    phase.value = 'done'
    emit('done')
    return
  }

  // Vivid-style: hold full mask briefly, then lift/fade while cubes assemble.
  window.setTimeout(() => {
    phase.value = 'lift'
    const started = performance.now()
    const duration = 1100

    const step = (now: number) => {
      const t = Math.min(1, (now - started) / duration)
      setIntroProgress(t)
      if (t < 1) {
        window.requestAnimationFrame(step)
        return
      }
      phase.value = 'done'
      emit('done')
    }
    window.requestAnimationFrame(step)
  }, 280)
})
</script>

<template>
  <div
    class="intro"
    :class="[`intro--${phase}`]"
    aria-hidden="true"
  >
    <div class="intro__block" />
  </div>
</template>

<style scoped>
.intro {
  position: fixed;
  inset: 0;
  z-index: 60;
  pointer-events: none;
}

.intro--done {
  visibility: hidden;
}

.intro__block {
  position: absolute;
  inset: 0;
  background: var(--surface-obsidian-canvas);
  transform-origin: center bottom;
  transition:
    opacity 1.05s var(--ease-focus),
    transform 1.15s var(--ease-focus);
}

.intro--cover .intro__block {
  opacity: 1;
  transform: scaleY(1);
}

.intro--lift .intro__block,
.intro--done .intro__block {
  opacity: 0;
  transform: scaleY(0);
}
</style>
