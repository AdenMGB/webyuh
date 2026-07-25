<script setup lang="ts">
defineProps<{
  scrolled?: boolean
}>()

const links = [
  { label: 'About', href: '#about' },
  { label: 'BetterSEQTA', href: '#betterseqta' },
] as const
</script>

<template>
  <header class="nav" :class="{ 'nav--scrolled': scrolled }">
    <div class="nav__inner">
      <a class="nav__wordmark" href="#top" data-cursor="Top">AdenMGB</a>

      <nav class="nav__links" aria-label="Primary">
        <a
          v-for="link in links"
          :key="link.href"
          class="nav__ghost"
          :href="link.href"
          data-cursor="Go"
        >
          {{ link.label }}
        </a>
        <a class="nav__contact" href="#contact" data-cursor="Contact">Contact</a>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.nav {
  position: sticky;
  top: 0;
  z-index: 20;
  background: transparent;
  transition:
    background-color 0.45s var(--ease-focus),
    border-color 0.45s var(--ease-focus);
  border-bottom: 1px solid transparent;
}

.nav--scrolled {
  background: rgb(16 16 16 / 0.82);
  border-bottom-color: rgb(64 63 63 / 0.45);
}

.nav__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-20);
  max-width: var(--page-max-width);
  margin-inline: auto;
  padding: var(--spacing-20) var(--spacing-40);
}

.nav__wordmark {
  font-size: var(--text-caption);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition:
    color var(--duration-default) var(--ease-focus),
    transform var(--duration-default) var(--ease-focus);
}

.nav__wordmark:hover {
  color: var(--color-fog-blue);
  transform: scale(1.02);
}

.nav__links {
  display: flex;
  align-items: center;
  gap: var(--spacing-40);
}

.nav__ghost {
  position: relative;
  font-size: 14px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: color var(--duration-default) var(--ease-focus);
}

.nav__ghost::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -4px;
  width: 100%;
  height: 1px;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 0.45s var(--ease-focus);
}

.nav__ghost:hover {
  color: var(--color-fog-blue);
}

.nav__ghost:hover::after {
  transform: scaleX(1);
}

.nav__contact {
  font-size: 14px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border: 1px solid var(--color-bone-white);
  border-radius: var(--radius-nav);
  padding: 9px 15px;
  transition:
    color var(--duration-default) var(--ease-focus),
    border-color var(--duration-default) var(--ease-focus),
    transform var(--duration-default) var(--ease-focus),
    background-color var(--duration-default) var(--ease-focus);
}

.nav__contact:hover {
  color: var(--color-fog-blue);
  border-color: var(--color-fog-blue);
  transform: scale(1.03);
}

@media (max-width: 720px) {
  .nav__inner {
    padding: var(--spacing-16) var(--spacing-20);
    gap: var(--spacing-16);
  }

  .nav__links {
    gap: var(--spacing-16);
  }

  .nav__ghost {
    display: none;
  }
}
</style>
