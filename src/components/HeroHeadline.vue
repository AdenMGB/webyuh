<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const words = ['BetterSEQTA', 'open tools', 'for students', 'for free', 'AdenMGB'] as const

/** Keeps the clipped viewport as wide as the longest phrase (absolute words don't size the box). */
const sizerWord = 'BetterSEQTA'

const index = ref(0)
const prevIndex = ref<number | null>(null)
const reduceMotion =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

let timer: ReturnType<typeof setInterval> | undefined

const activeWord = computed(() => words[index.value])

function advance() {
  prevIndex.value = index.value
  index.value = (index.value + 1) % words.length
}

onMounted(() => {
  if (reduceMotion) return
  timer = setInterval(advance, 2800)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="headline">
    <p class="headline__kicker">We build</p>

    <h1 class="headline__display" aria-live="polite">
      <span class="visually-hidden">{{ activeWord }}</span>
      <span class="headline__viewport" aria-hidden="true">
        <span class="headline__sizer">{{ sizerWord }}</span>
        <span
          v-for="(word, i) in words"
          :key="word"
          class="headline__word"
          :class="{
            'headline__word--active': i === index,
            'headline__word--exit': i === prevIndex,
          }"
        >
          <span class="headline__chunk">{{ word }}</span>
        </span>
      </span>
    </h1>
  </div>
</template>

<style scoped>
.headline {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--spacing-16);
  width: min(100%, 720px);
  will-change: transform;
}

.headline__kicker {
  margin: 0;
  font-size: clamp(28px, 4vw, 32px);
  font-weight: var(--font-weight-regular);
  line-height: 1.01;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--color-bone-white);
}

.headline__display {
  margin: 0;
  width: 100%;
}

.headline__viewport {
  position: relative;
  display: block;
  width: max-content;
  max-width: 100%;
  overflow: hidden;
  font-size: clamp(48px, 9vw, var(--text-display-sm));
  font-weight: var(--font-weight-regular);
  line-height: 1.1;
  letter-spacing: var(--tracking-display-sm);
}

.headline__sizer {
  display: block;
  visibility: hidden;
  white-space: nowrap;
  line-height: 1.1;
}

.headline__word {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  transform: translate3d(0, 110%, 0);
  opacity: 0;
  pointer-events: none;
  transition:
    transform 0.85s var(--ease-focus),
    opacity 0.55s var(--ease-focus);
}

.headline__word--active {
  transform: translate3d(0, 0, 0);
  opacity: 1;
}

.headline__word--exit {
  transform: translate3d(0, -110%, 0);
  opacity: 0;
}

.headline__chunk {
  display: inline-block;
  white-space: nowrap;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (prefers-reduced-motion: reduce) {
  .headline__word {
    transition: none;
  }

  .headline__word:not(.headline__word--active) {
    display: none;
  }
}
</style>
