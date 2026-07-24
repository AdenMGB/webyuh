<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

defineProps<{
  onNavigate: (event: MouseEvent, href: string) => void
}>()

const navScrolled = ref(false)
const revealReady = ref(false)

const navLinks = [
  { label: 'Work', href: '#work' },
  { label: 'About', href: '#about' },
  { label: 'Projects', href: '#projects' },
  { label: 'Contact', href: '#contact' },
] as const

const features = [
  {
    id: 'betterseqta',
    title: 'BetterSEQTA+',
    body: 'An open-source browser extension that makes SEQTA Learn actually usable — themes, dark mode, notifications, plugins, and layout tools used by tens of thousands of students and staff across Chrome, Edge, and Firefox.',
    image: '/feature-betterseqta.svg',
    href: 'https://betterseqta.org/',
    linkLabel: 'Visit betterseqta.org',
  },
  {
    id: 'desqta',
    title: 'DesQTA',
    body: 'The native desktop and mobile companion for SEQTA and BetterSEQTA+. As a maintainer, I ship caching, system integration, and offline-friendly flows so schoolwork feels less like a browser tab and more like a real app.',
    image: '/feature-desqta.svg',
    href: 'https://desqta.betterseqta.org/',
    linkLabel: 'Explore DesQTA',
  },
  {
    id: 'volunteer',
    title: 'Volunteering, for free',
    body: 'I put IT skills toward open education tooling — not for a paycheck, but because students deserve better software. BetterSEQTA runs on volunteers; I help keep that ecosystem moving so learning platforms feel human.',
    image: '/feature-volunteer.svg',
    href: 'https://github.com/BetterSEQTA',
    linkLabel: 'See the org on GitHub',
  },
] as const

const projects = [
  {
    name: 'WinDeckOS',
    blurb: 'A performance-focused Windows fork oriented around Steam Big Picture living-room setups.',
    href: 'https://github.com/AdenMGB/WinDeckOS',
    internal: false,
  },
  {
    name: 'Lesson AI Summary',
    blurb: 'An early BetterSEQTA+ plugin that uses Gemini to turn lesson content into clear summaries.',
    href: 'https://github.com/AdenMGB/bs-lesson-ai-summary',
    internal: false,
  },
  {
    name: 'Drop',
    blurb: 'Experiments with open-source game distribution — forking and exploring community-first platforms.',
    href: 'https://github.com/AdenMGB',
    internal: false,
  },
  {
    name: 'Arcade',
    blurb: 'A built-in browser arcade on this site — Tetris, 2048, Pong, and more when you need a break.',
    href: '/arcade',
    internal: true,
  },
] as const

function onScroll() {
  navScrolled.value = window.scrollY > 40
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  requestAnimationFrame(() => {
    revealReady.value = true
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})

const navClass = computed(() => (navScrolled.value ? 'nav--solid' : 'nav--clear'))
</script>

<template>
  <div class="home" :class="{ 'home--ready': revealReady }">
    <header class="nav-wrap" :class="navClass">
      <div class="nav-pill">
        <a class="wordmark" href="#top" @click="onNavigate($event, '#top')">adenmgb</a>
        <nav class="nav-links" aria-label="Primary">
          <a
            v-for="link in navLinks"
            :key="link.href"
            class="nav-link"
            :href="link.href"
            @click="onNavigate($event, link.href)"
          >
            {{ link.label }}
          </a>
          <a class="nav-link" href="/arcade" @click="onNavigate($event, '/arcade')">Arcade</a>
        </nav>
        <a class="btn-accent" href="mailto:aden@adenmgb.com">Email</a>
      </div>
    </header>

    <main>
      <section id="top" class="hero">
        <p class="brand-signal reveal">adenmgb</p>
        <h1 class="hero-title reveal reveal-delay-1">
          Building better tools for students — for free.
        </h1>
        <p class="hero-sub reveal reveal-delay-2">
          Adelaide developer volunteering IT skills on BetterSEQTA, DesQTA, and open projects that make everyday software kinder.
        </p>
        <div class="hero-cta reveal reveal-delay-3">
          <a class="text-link" href="#work" @click="onNavigate($event, '#work')">See the work</a>
          <a
            class="text-link"
            href="https://github.com/AdenMGB"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </div>
        <div class="sphere-wrap reveal reveal-delay-4" aria-hidden="true">
          <img class="sphere" src="/sphere.svg" alt="" width="600" height="600" />
        </div>
      </section>

      <section id="work" class="section">
        <div class="section-inner">
          <p class="section-label">Work</p>
          <h2 class="section-title">Open education tools, maintained in the open.</h2>
        </div>

        <article
          v-for="(feature, index) in features"
          :id="feature.id"
          :key="feature.id"
          class="feature"
          :class="{ 'feature--flip': index % 2 === 1 }"
        >
          <div class="feature-media">
            <img
              class="feature-image"
              :src="feature.image"
              :alt="feature.title"
              width="640"
              height="480"
            />
          </div>
          <div class="feature-copy">
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-body">{{ feature.body }}</p>
            <a
              class="text-link"
              :href="feature.href"
              target="_blank"
              rel="noreferrer"
            >
              {{ feature.linkLabel }}
            </a>
          </div>
        </article>
      </section>

      <section id="about" class="section about">
        <div class="about-grid">
          <div>
            <p class="section-label">About</p>
            <h2 class="section-title">Aden Lindsay — AdenMGB</h2>
          </div>
          <div class="about-copy">
            <p>
              I’m a developer from Adelaide who volunteers on
              <a class="text-link" href="https://betterseqta.org/" target="_blank" rel="noreferrer"
                >BetterSEQTA</a
              >
              — the community-built tools that make SEQTA Learn usable for students and staff. I
              maintain DesQTA and contribute features to BetterSEQTA+, an extension used by tens of
              thousands of people.
            </p>
            <p>
              The through-line is simple: use IT skills to make the world a little better, for free.
              Schools shouldn’t need a design degree to navigate their portal — and open source is
              how we fix that together.
            </p>
          </div>
        </div>
      </section>

      <section id="projects" class="section">
        <div class="section-inner">
          <p class="section-label">Projects</p>
          <h2 class="section-title">More experiments and side quests.</h2>
        </div>
        <ul class="project-list">
          <li v-for="project in projects" :key="project.name" class="project-item">
            <a
              v-if="project.internal"
              class="project-link"
              :href="project.href"
              @click="onNavigate($event, project.href)"
            >
              <span class="project-name">{{ project.name }}</span>
              <span class="project-blurb">{{ project.blurb }}</span>
            </a>
            <a
              v-else
              class="project-link"
              :href="project.href"
              target="_blank"
              rel="noreferrer"
            >
              <span class="project-name">{{ project.name }}</span>
              <span class="project-blurb">{{ project.blurb }}</span>
            </a>
          </li>
        </ul>
      </section>

      <section id="contact" class="section contact">
        <div class="section-inner contact-inner">
          <p class="section-label">Contact</p>
          <h2 class="section-title">Say hello.</h2>
          <p class="contact-body">
            Reach out about BetterSEQTA, collaboration, or anything open-source. The inbox is open.
          </p>
          <div class="contact-actions">
            <a class="btn-accent" href="mailto:aden@adenmgb.com">Email</a>
            <a
              class="text-link"
              href="https://github.com/AdenMGB"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            <a
              class="text-link"
              href="https://discord.gg/9P5HzAz8DT"
              target="_blank"
              rel="noreferrer"
            >
              BetterSEQTA Discord
            </a>
          </div>
        </div>
      </section>
    </main>

    <footer class="footer">
      <p class="footer-micro">© {{ new Date().getFullYear() }} AdenMGB · Adelaide</p>
      <a class="footer-micro text-link" href="/arcade" @click="onNavigate($event, '/arcade')"
        >Arcade</a
      >
    </footer>

    <a class="float-widget" href="/arcade" @click="onNavigate($event, '/arcade')">
      <span class="float-thumb" aria-hidden="true">
        <span class="float-play"></span>
      </span>
      <span class="float-meta">
        <span class="float-label">Arcade</span>
        <span class="float-time">∞:∞</span>
      </span>
    </a>
  </div>
</template>

<style scoped>
.home {
  min-height: 100%;
  color: var(--color-ink-black);
  background: var(--color-paper-white);
}

.nav-wrap {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 40;
  display: flex;
  justify-content: center;
  padding: var(--spacing-16) var(--spacing-24) 0;
  pointer-events: none;
  transition: padding 200ms ease;
}

.nav-pill {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: var(--spacing-24);
  width: min(100%, var(--page-max-width));
  max-width: calc(100vw - 48px);
  margin-inline: auto;
  padding: var(--spacing-12) var(--spacing-16);
  border-radius: var(--radius-navpill);
  transition:
    background-color 200ms ease,
    box-shadow 200ms ease,
    border-color 200ms ease;
}

.nav--clear .nav-pill {
  background: transparent;
}

.nav--solid .nav-pill {
  background: var(--color-periwinkle-glow);
}

.wordmark {
  flex-shrink: 0;
  font-size: var(--text-caption);
  line-height: 1;
  letter-spacing: var(--tracking-caption);
  text-transform: lowercase;
  color: var(--color-ink-black);
}

.nav-links {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  gap: var(--spacing-12) var(--spacing-24);
  justify-content: center;
}

.nav-link {
  font-size: var(--text-caption);
  line-height: 1;
  letter-spacing: var(--tracking-caption);
  text-transform: uppercase;
  color: var(--color-smoke-gray);
  transition: color 200ms ease;
}

.nav-link:hover {
  color: var(--color-ink-black);
}

.btn-accent {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: var(--spacing-12) var(--spacing-16);
  border-radius: var(--radius-buttons);
  background: var(--color-periwinkle-glow);
  font-size: var(--text-caption);
  line-height: 1;
  letter-spacing: var(--tracking-caption);
  text-transform: uppercase;
  color: var(--color-ink-black);
  transition:
    transform 200ms ease,
    opacity 200ms ease;
}

.btn-accent:hover {
  transform: scale(1.02);
}

.btn-accent:active {
  transform: scale(0.98);
}

.nav--solid .btn-accent {
  background: var(--color-paper-white);
}

.hero {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 100vh;
  padding: 140px var(--spacing-24) 0;
  text-align: center;
  overflow: hidden;
}

.brand-signal {
  margin: 0 0 var(--spacing-24);
  font-size: clamp(40px, 8vw, var(--text-display));
  line-height: var(--leading-display);
  letter-spacing: var(--tracking-display);
  color: var(--color-ink-black);
}

.hero-title {
  max-width: 16ch;
  margin: 0;
  font-size: clamp(32px, 5vw, var(--text-display));
  font-weight: var(--font-weight-regular);
  line-height: var(--leading-display);
  letter-spacing: var(--tracking-display);
  color: var(--color-ink-black);
}

.hero-sub {
  max-width: 42ch;
  margin: var(--spacing-24) 0 0;
  font-size: var(--text-subheading);
  line-height: var(--leading-subheading);
  letter-spacing: var(--tracking-subheading);
  color: var(--color-mist-gray);
}

.hero-cta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-24);
  align-items: center;
  justify-content: center;
  margin-top: var(--spacing-40);
}

.sphere-wrap {
  display: flex;
  justify-content: center;
  width: min(100%, 640px);
  margin-top: auto;
  padding-top: var(--spacing-56);
  transform: translateY(12%);
}

.sphere {
  width: min(92vw, 600px);
  height: auto;
  animation: sphere-rise 1.4s ease both;
}

.section {
  padding: var(--section-gap) var(--spacing-24);
}

.section-inner {
  width: min(100%, var(--page-max-width));
  margin: 0 auto var(--spacing-56);
}

.section-label {
  margin: 0 0 var(--spacing-16);
  font-size: var(--text-caption);
  line-height: var(--leading-caption);
  letter-spacing: var(--tracking-caption);
  text-transform: uppercase;
  color: var(--color-smoke-gray);
}

.section-title {
  max-width: 18ch;
  margin: 0;
  font-size: clamp(24px, 4vw, var(--text-heading));
  font-weight: var(--font-weight-regular);
  line-height: var(--leading-heading);
  letter-spacing: var(--tracking-heading);
  color: var(--color-ink-black);
}

.feature {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-40);
  width: min(100%, var(--page-max-width));
  margin: 0 auto;
  padding: var(--spacing-56) 0;
}

.feature + .feature {
  margin-top: var(--spacing-40);
}

.feature-image {
  width: 100%;
  height: auto;
  border-radius: var(--radius-cards);
}

.feature-title {
  margin: 0 0 var(--spacing-16);
  font-size: clamp(22px, 3vw, var(--text-heading));
  font-weight: var(--font-weight-regular);
  line-height: var(--leading-heading);
  letter-spacing: var(--tracking-heading);
}

.feature-body {
  margin: 0 0 var(--spacing-24);
  font-size: var(--text-body);
  line-height: var(--leading-body);
  letter-spacing: var(--tracking-body);
  color: var(--color-mist-gray);
}

.text-link {
  display: inline-block;
  padding-bottom: 2px;
  border-bottom: 1px solid var(--color-veil-gray);
  border-radius: 0 0 var(--radius-linkunderline) var(--radius-linkunderline);
  font-size: var(--text-caption);
  line-height: var(--leading-caption);
  letter-spacing: var(--tracking-caption);
  text-transform: uppercase;
  color: var(--color-ink-black);
  transition: border-color 200ms ease;
}

.text-link:hover {
  border-color: var(--color-ink-black);
}

.about-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-40);
  width: min(100%, var(--page-max-width));
  margin: 0 auto;
}

.about-copy p {
  margin: 0 0 var(--spacing-24);
  font-size: var(--text-body);
  line-height: var(--leading-body);
  letter-spacing: var(--tracking-body);
  color: var(--color-mist-gray);
}

.about-copy p:last-child {
  margin-bottom: 0;
}

.project-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-24);
  width: min(100%, var(--page-max-width));
  margin: 0 auto;
  padding: 0;
  list-style: none;
}

.project-link {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-12);
  padding: var(--spacing-32);
  border-radius: var(--radius-cards);
  transition: background-color 200ms ease;
}

.project-link:hover {
  background: color-mix(in srgb, var(--color-veil-gray) 35%, white);
}

.project-name {
  font-size: var(--text-subheading);
  line-height: var(--leading-subheading);
  letter-spacing: var(--tracking-subheading);
  color: var(--color-ink-black);
}

.project-blurb {
  font-size: var(--text-body);
  line-height: var(--leading-body);
  letter-spacing: var(--tracking-body);
  color: var(--color-mist-gray);
}

.contact-inner {
  margin-bottom: 0;
}

.contact-body {
  max-width: 36ch;
  margin: var(--spacing-24) 0 var(--spacing-40);
  font-size: var(--text-body);
  line-height: var(--leading-body);
  letter-spacing: var(--tracking-body);
  color: var(--color-mist-gray);
}

.contact-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-24);
  align-items: center;
}

.footer {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-16);
  align-items: center;
  justify-content: space-between;
  width: min(100%, var(--page-max-width));
  margin: 0 auto;
  padding: var(--spacing-40) var(--spacing-24) var(--spacing-100);
}

.footer-micro {
  margin: 0;
  font-size: var(--text-caption);
  line-height: var(--leading-caption);
  letter-spacing: var(--tracking-caption);
  text-transform: uppercase;
  color: var(--color-smoke-gray);
}

.float-widget {
  position: fixed;
  right: var(--spacing-24);
  bottom: var(--spacing-24);
  z-index: 30;
  display: flex;
  gap: var(--spacing-12);
  align-items: center;
  min-height: 48px;
  padding: 4px 16px 4px 4px;
  border-radius: 24px;
  background: var(--color-ink-black);
  color: var(--color-paper-white);
  transition: transform 200ms ease;
}

.float-widget:hover {
  transform: scale(1.02);
}

.float-thumb {
  position: relative;
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(145deg, #acafff, #1a6b7a);
}

.float-play {
  width: 0;
  height: 0;
  margin-left: 2px;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-left: 10px solid var(--color-paper-white);
}

.float-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.float-label {
  font-size: var(--text-caption);
  line-height: 1;
  letter-spacing: var(--tracking-caption);
  text-transform: uppercase;
}

.float-time {
  font-size: 12px;
  letter-spacing: var(--tracking-caption);
  color: var(--color-smoke-gray);
}

.reveal {
  opacity: 0;
  transform: translateY(16px);
}

.home--ready .reveal {
  animation: fade-up 700ms ease forwards;
}

.reveal-delay-1 {
  animation-delay: 80ms !important;
}

.reveal-delay-2 {
  animation-delay: 160ms !important;
}

.reveal-delay-3 {
  animation-delay: 240ms !important;
}

.reveal-delay-4 {
  animation-delay: 320ms !important;
}

@keyframes fade-up {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes sphere-rise {
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (min-width: 768px) {
  .nav-wrap {
    padding-inline: 100px;
  }

  .feature {
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-100);
    align-items: center;
  }

  .feature--flip .feature-media {
    order: 2;
  }

  .feature--flip .feature-copy {
    order: 1;
  }

  .about-grid {
    grid-template-columns: 1fr 1.2fr;
    gap: var(--spacing-100);
  }

  .project-list {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 720px) {
  .nav-links {
    display: none;
  }

  .nav-pill {
    justify-content: space-between;
  }

  .hero {
    padding-top: 120px;
  }

  .float-widget {
    right: var(--spacing-16);
    bottom: var(--spacing-16);
  }
}
</style>
