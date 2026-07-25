<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import HeroHeadline from "./components/HeroHeadline.vue";
import PrismArtifact from "./components/PrismArtifact.vue";
import SiteNav from "./components/SiteNav.vue";
import {
  disableDeviceOrientation,
  enableDeviceOrientation,
  gyroActive,
  resetPointerTarget,
  setPointerTarget,
  setScrollProgress,
  updateParallaxLayers,
} from "./composables/motionField";

const ready = ref(false);
const siteRoot = ref<HTMLElement | null>(null);

let rafId = 0;
let gyroRequested = false;
const prefersReducedMotion =
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const isTouchDevice =
  typeof window !== "undefined" &&
  ((typeof window.matchMedia === "function" &&
    window.matchMedia("(pointer: coarse)").matches) ||
    navigator.maxTouchPoints > 0);

function onScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  setScrollProgress(max > 0 ? window.scrollY / max : 0);
}

function onPointerMove(event: PointerEvent) {
  if (prefersReducedMotion || gyroActive.value) return;
  setPointerTarget(event.clientX, event.clientY);
}

function onPointerLeave() {
  resetPointerTarget();
}

async function onFirstGesture() {
  if (gyroRequested || prefersReducedMotion || !isTouchDevice) return;
  gyroRequested = true;
  await enableDeviceOrientation();
}

function tick() {
  if (!prefersReducedMotion && siteRoot.value) {
    updateParallaxLayers(siteRoot.value);
  }
  rafId = window.requestAnimationFrame(tick);
}

onMounted(() => {
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerleave", onPointerLeave);
  // iOS requires a user gesture before DeviceOrientationEvent.requestPermission()
  window.addEventListener("pointerdown", onFirstGesture, { passive: true });
  window.addEventListener("touchstart", onFirstGesture, { passive: true });
  rafId = window.requestAnimationFrame(tick);
  requestAnimationFrame(() => {
    ready.value = true;
  });
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", onScroll);
  window.removeEventListener("resize", onScroll);
  window.removeEventListener("pointermove", onPointerMove);
  window.removeEventListener("pointerleave", onPointerLeave);
  window.removeEventListener("pointerdown", onFirstGesture);
  window.removeEventListener("touchstart", onFirstGesture);
  disableDeviceOrientation();
  window.cancelAnimationFrame(rafId);
});
</script>

<template>
  <div ref="siteRoot" class="site" :class="{ 'site--ready': ready }">
    <PrismArtifact />

    <div class="site__content">
      <SiteNav />

      <main>
        <section id="top" class="hero">
          <div class="hero__stage">
            <div class="hero__title reveal reveal--delay-1">
              <HeroHeadline />
            </div>
          </div>
          <p
            class="hero__lead reveal reveal--delay-2"
            data-parallax="0.22"
            data-parallax-mouse="14"
          >
            A developer volunteering on BetterSEQTA — open tools that make school software kinder
            for students and staff.
          </p>
        </section>

        <section id="about" class="band">
          <div class="band__inner">
            <p class="eyebrow" data-parallax="0.12">About</p>
            <h2 class="band__display" data-parallax="0.28" data-parallax-mouse="18">
              Building for free.
            </h2>
            <p class="band__body" data-parallax="0.18" data-parallax-mouse="10">
              I’m AdenMGB — an Adelaide developer who puts IT skills toward open education tooling.
              Not for a paycheck: because students deserve software that feels human. BetterSEQTA is
              where most of that energy goes.
            </p>
          </div>
        </section>

        <section id="betterseqta" class="work">
          <div class="work__inner">
            <p class="section-note" data-parallax="0.1">Singular focus</p>
            <h2 class="work__title" data-parallax="0.24" data-parallax-mouse="16">
              <a href="https://betterseqta.org/" target="_blank" rel="noopener noreferrer">
                BetterSEQTA+
              </a>
            </h2>
            <p class="work__meta" data-parallax="0.16">Open source · Chrome · Edge · Firefox</p>
            <p class="work__body" data-parallax="0.2" data-parallax-mouse="10">
              An open-source browser extension that makes SEQTA Learn actually usable — themes, dark
              mode, notifications, plugins, and layout tools used by tens of thousands of students
              and staff.
            </p>
            <a
              class="work__link"
              data-parallax="0.12"
              href="https://betterseqta.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit betterseqta.org
            </a>
          </div>
        </section>

        <footer id="contact" class="footer">
          <div class="footer__rule" />
          <div class="footer__inner">
            <div class="footer__col">
              <p class="footer__label">Contact</p>
              <a class="footer__link" href="mailto:aden@adenmgb.com">aden@adenmgb.com</a>
            </div>
            <div class="footer__col footer__col--end">
              <p class="footer__label">Elsewhere</p>
              <a
                class="footer__link"
                href="https://github.com/AdenMGB"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
              <a
                class="footer__link"
                href="https://github.com/BetterSEQTA"
                target="_blank"
                rel="noopener noreferrer"
              >
                BetterSEQTA org
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  </div>
</template>

<style scoped>
.site {
  position: relative;
  min-height: 100vh;
  color: var(--color-bone-white);
  background: var(--surface-obsidian-canvas);
}

.site__content {
  position: relative;
  z-index: 1;
}

.hero {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100vh;
  max-width: var(--page-max-width);
  margin-inline: auto;
  padding: var(--spacing-40) var(--spacing-40) var(--spacing-108);
}

.hero__stage {
  position: relative;
  display: flex;
  align-items: center;
  min-height: min(52vh, 560px);
}

.hero__title {
  position: relative;
  z-index: 2;
}

.site__content [data-parallax] {
  will-change: transform;
  backface-visibility: hidden;
}

.hero__lead {
  margin: var(--spacing-40) 0 0;
  max-width: 440px;
  font-size: var(--text-body-lg);
  line-height: var(--leading-body-sm);
  letter-spacing: var(--tracking-body-lg);
}

.band,
.work,
.footer {
  background: transparent;
}

.band {
  padding: var(--section-gap) var(--spacing-40);
}

.band__inner,
.work__inner,
.footer__rule,
.footer__inner {
  max-width: var(--page-max-width);
  margin-inline: auto;
}

.eyebrow {
  margin: 0 0 var(--spacing-20);
  font-size: 17px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-fog-blue);
}

.band__display {
  margin: 0 0 var(--spacing-40);
  max-width: 12ch;
  font-size: clamp(56px, 9vw, var(--text-display-sm));
  font-weight: var(--font-weight-regular);
  line-height: var(--leading-display-sm);
  letter-spacing: var(--tracking-display-sm);
}

.band__body {
  margin: 0;
  max-width: 440px;
  font-size: var(--text-body-sm);
  line-height: var(--leading-body-sm);
}

.work {
  padding: var(--section-gap) var(--spacing-40);
}

.work__inner {
  border-top: 1px solid var(--color-ash-border);
  border-bottom: 1px solid var(--color-ash-border);
  padding: var(--spacing-72) 0;
}

.section-note {
  margin: 0 0 var(--spacing-20);
  max-width: 440px;
  font-size: var(--text-body-sm);
  line-height: var(--leading-body-sm);
  color: var(--color-bone-white);
}

.work__title {
  margin: 0;
  font-size: clamp(40px, 6vw, var(--text-heading-sm));
  font-weight: var(--font-weight-regular);
  line-height: var(--leading-heading-sm);
  letter-spacing: var(--tracking-heading-sm);
}

.work__title a {
  transition: color var(--duration-default) var(--ease-focus);
}

.work__title a:hover {
  color: var(--color-fog-blue);
}

.work__meta {
  margin: var(--spacing-20) 0 var(--spacing-40);
  font-size: var(--text-body);
  color: var(--color-fog-blue);
  padding-bottom: 30px;
}

.work__body {
  margin: 0 0 var(--spacing-40);
  max-width: 440px;
  font-size: var(--text-body-sm);
  line-height: var(--leading-body-sm);
}

.work__link {
  display: inline-block;
  font-size: 14px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border-bottom: 1px solid var(--color-bone-white);
  padding-bottom: 4px;
  transition:
    color var(--duration-default) var(--ease-focus),
    border-color var(--duration-default) var(--ease-focus);
}

.work__link:hover {
  color: var(--color-fog-blue);
  border-color: var(--color-fog-blue);
}

.footer {
  padding: 0 var(--spacing-40) var(--spacing-72);
}

.footer__rule {
  margin-top: 15px;
  border-top: 1px solid var(--color-ash-border);
}

.footer__inner {
  display: flex;
  justify-content: space-between;
  gap: var(--spacing-40);
  padding-top: var(--spacing-40);
}

.footer__col {
  display: flex;
  flex-direction: column;
  gap: var(--element-gap);
}

.footer__col--end {
  align-items: flex-end;
  text-align: right;
}

.footer__label {
  margin: 0 0 var(--spacing-16);
  font-size: 14px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-fog-blue);
}

.footer__link {
  font-size: var(--text-body-sm);
  transition: color var(--duration-default) var(--ease-focus);
}

.footer__link:hover {
  color: var(--color-fog-blue);
}

.reveal {
  opacity: 0;
  transform: translateY(16px);
  transition:
    opacity 0.8s var(--ease-focus),
    transform 0.8s var(--ease-focus);
}

.reveal--delay-1 {
  transition-delay: 0.12s;
}

.reveal--delay-2 {
  transition-delay: 0.24s;
}

.site--ready .reveal {
  opacity: 1;
  transform: translateY(0);
}

@media (max-width: 720px) {
  .hero,
  .band,
  .work,
  .footer {
    padding-inline: var(--spacing-20);
  }

  .hero__lead {
    font-size: var(--text-body-sm);
  }

  .footer__inner {
    flex-direction: column;
  }

  .footer__col--end {
    align-items: flex-start;
    text-align: left;
  }
}
</style>
