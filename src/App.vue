<script setup lang="ts">
import { provide } from 'vue'
import { Transition } from 'vue'
import ArcadePage from './components/ArcadePage.vue'
import RetroHomePage from './components/RetroHomePage.vue'
import { useSiteRouting } from './composables/useSiteRouting'

const { currentPage, navigate } = useSiteRouting()

provide('siteNavigate', navigate)
</script>

<template>
  <div class="site-root">
    <Transition name="page-shift" mode="out-in">
      <RetroHomePage v-if="currentPage === 'home'" key="home" :on-navigate="navigate" />
      <ArcadePage v-else key="arcade" />
    </Transition>
  </div>
</template>

<style>
*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body,
#app,
.site-root {
  width: 100%;
  height: 100%;
  margin: 0;
}

html {
  background: #000;
}

body {
  overflow: hidden;
  color: #fff;
  background: #000;
}

.site-root {
  position: relative;
  overflow: hidden;
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
