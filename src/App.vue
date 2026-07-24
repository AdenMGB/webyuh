<script setup lang="ts">
import { provide, watchEffect } from 'vue'
import { Transition } from 'vue'
import ArcadePage from './components/ArcadePage.vue'
import HomePage from './components/HomePage.vue'
import { useSiteRouting } from './composables/useSiteRouting'

const { currentPage, navigate } = useSiteRouting()

provide('siteNavigate', navigate)

watchEffect(() => {
  document.body.classList.toggle('page-home', currentPage.value === 'home')
  document.body.classList.toggle('page-arcade', currentPage.value === 'arcade')
})
</script>

<template>
  <div class="site-root" :class="currentPage === 'home' ? 'site-root--home' : 'site-root--arcade'">
    <Transition name="page-shift" mode="out-in">
      <HomePage v-if="currentPage === 'home'" key="home" :on-navigate="navigate" />
      <ArcadePage v-else key="arcade" />
    </Transition>
  </div>
</template>

<style>
.site-root {
  position: relative;
  width: 100%;
  min-height: 100%;
}

.site-root--home {
  overflow: visible;
  background: var(--surface-page-canvas);
}

.site-root--arcade {
  overflow: hidden;
  height: 100%;
  color: #fff;
  background: #000;
}

.page-shift-enter-active,
.page-shift-leave-active {
  transition:
    opacity 320ms ease,
    transform 320ms ease,
    filter 320ms ease;
}

.page-shift-enter-from {
  opacity: 0;
  filter: blur(8px);
  transform: scale(1.02);
}

.page-shift-leave-to {
  opacity: 0;
  filter: blur(6px);
  transform: scale(0.98);
}

@media (prefers-reduced-motion: reduce) {
  .page-shift-enter-active,
  .page-shift-leave-active {
    transition: none;
  }
}
</style>
