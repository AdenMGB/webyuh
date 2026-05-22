<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

type Project = {
  name: string
  line: string
  href: string
}

const navItems = [
  { label: 'AdenMGB', href: '#intro' },
  { label: 'Work', href: '#work' },
  { label: 'Contact', href: '#contact' },
]

const projects: Project[] = [
  {
    name: 'BetterSEQTA',
    line: 'A cleaner school interface ecosystem built around speed and usability.',
    href: 'https://github.com/BetterSEQTA',
  },
  {
    name: 'DesQTA',
    line: 'A native desktop direction for the BetterSEQTA experience.',
    href: 'https://github.com/BetterSEQTA/DesQTA',
  },
  {
    name: 'BetterSEQTA Cloud',
    line: 'Cloud features for syncing, accounts, and connected BetterSEQTA tools.',
    href: 'https://adenmgb.com',
  },
]

const canvasRef = ref<HTMLCanvasElement | null>(null)
const activeSection = ref('AdenMGB')

let cleanupCanvas: (() => void) | undefined
let cleanupObservers: (() => void) | undefined

onMounted(() => {
  cleanupObservers = setupObservers()

  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  if (!prefersReducedMotion && import.meta.env.MODE !== 'test' && canvasRef.value) {
    cleanupCanvas = setupProductCanvas(canvasRef.value)
  }

})

onBeforeUnmount(() => {
  cleanupCanvas?.()
  cleanupObservers?.()
})

function setupObservers() {
  const sections = [...document.querySelectorAll<HTMLElement>('[data-section]')]
  const revealItems = [...document.querySelectorAll<HTMLElement>('[data-reveal]')]

  if (!('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'))

    return () => {}
  }

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

      if (visible) {
        activeSection.value = visible.target.getAttribute('data-section') ?? 'AdenMGB'
      }
    },
    { rootMargin: '-42% 0px -48% 0px', threshold: [0.1, 0.35, 0.65] },
  )

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          revealObserver.unobserve(entry.target)
        }
      })
    },
    { rootMargin: '0px 0px -16% 0px', threshold: 0.15 },
  )

  sections.forEach((section) => sectionObserver.observe(section))
  revealItems.forEach((item) => revealObserver.observe(item))

  return () => {
    sectionObserver.disconnect()
    revealObserver.disconnect()
  }
}

function setupProductCanvas(canvas: HTMLCanvasElement) {
  const context = canvas.getContext('2d', { alpha: true })
  if (!context) {
    return () => {}
  }

  let animationFrame = 0
  let currentProgress = 0
  let targetProgress = 0
  let width = 0
  let height = 0
  let pixelRatio = 1

  const resize = () => {
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
    width = Math.max(window.innerWidth, 320)
    height = Math.max(window.innerHeight, 520)
    canvas.width = Math.floor(width * pixelRatio)
    canvas.height = Math.floor(height * pixelRatio)
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
  }

  const updateTarget = () => {
    const story = document.querySelector<HTMLElement>('.story')
    if (!story) {
      targetProgress = 0

      return
    }

    const rect = story.getBoundingClientRect()
    const distance = rect.height - window.innerHeight
    targetProgress = Math.min(Math.max(-rect.top / Math.max(distance, 1), 0), 1)
  }

  const roundedRect = (x: number, y: number, rectWidth: number, rectHeight: number, radius: number) => {
    const round = Math.min(radius, rectWidth / 2, rectHeight / 2)
    context.beginPath()
    context.moveTo(x + round, y)
    context.arcTo(x + rectWidth, y, x + rectWidth, y + rectHeight, round)
    context.arcTo(x + rectWidth, y + rectHeight, x, y + rectHeight, round)
    context.arcTo(x, y + rectHeight, x, y, round)
    context.arcTo(x, y, x + rectWidth, y, round)
    context.closePath()
  }

  const draw = () => {
    currentProgress += (targetProgress - currentProgress) * 0.085

    context.clearRect(0, 0, width, height)

    const centerX = width / 2
    const centerY = height / 2
    const introScale = 1 - currentProgress * 0.09
    const rotate = -4 + currentProgress * 8
    const lift = -currentProgress * height * 0.08
    const deviceWidth = Math.min(width * 0.68, 760) * introScale
    const deviceHeight = deviceWidth * 0.6
    const x = centerX - deviceWidth / 2
    const y = centerY - deviceHeight / 2 + lift

    const glow = context.createRadialGradient(centerX, centerY, 20, centerX, centerY, Math.max(width, height) * 0.45)
    glow.addColorStop(0, `rgba(255, 255, 255, ${0.1 + currentProgress * 0.06})`)
    glow.addColorStop(0.55, 'rgba(190, 195, 205, 0.055)')
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)')
    context.fillStyle = glow
    context.fillRect(0, 0, width, height)

    context.save()
    context.translate(centerX, centerY + lift)
    context.rotate((rotate * Math.PI) / 180)
    context.translate(-centerX, -(centerY + lift))

    context.shadowColor = 'rgba(0, 0, 0, 0.65)'
    context.shadowBlur = 70
    context.shadowOffsetY = 42
    roundedRect(x, y, deviceWidth, deviceHeight, 34)
    context.fillStyle = '#0a0c10'
    context.fill()

    context.shadowBlur = 0
    roundedRect(x + 8, y + 8, deviceWidth - 16, deviceHeight - 16, 26)
    const screen = context.createLinearGradient(x, y, x + deviceWidth, y + deviceHeight)
    screen.addColorStop(0, '#fbfbfd')
    screen.addColorStop(0.48, '#c6c8cf')
    screen.addColorStop(1, '#4a4d55')
    context.fillStyle = screen
    context.fill()

    context.globalAlpha = 0.82
    context.strokeStyle = 'rgba(255, 255, 255, 0.6)'
    context.lineWidth = 1
    for (let index = 0; index < 5; index += 1) {
      const lineY = y + deviceHeight * (0.31 + index * 0.085)
      const lineWidth = deviceWidth * (0.56 - index * 0.045 + currentProgress * 0.05)
      roundedRect(x + deviceWidth * 0.19, lineY, lineWidth, 6, 3)
      context.stroke()
    }

    context.globalAlpha = 1
    context.fillStyle = 'rgba(255, 255, 255, 0.85)'
    roundedRect(x + deviceWidth * 0.19, y + deviceHeight * 0.19, deviceWidth * 0.24, 11, 5)
    context.fill()

    context.restore()

    const ringRadius = Math.min(width, height) * (0.2 + currentProgress * 0.08)
    context.beginPath()
    context.arc(centerX, centerY + lift, ringRadius, 0, Math.PI * 2)
    context.strokeStyle = `rgba(255, 255, 255, ${0.1 - currentProgress * 0.04})`
    context.lineWidth = 1
    context.stroke()

    animationFrame = requestAnimationFrame(draw)
  }

  resize()
  updateTarget()
  draw()

  window.addEventListener('resize', resize)
  window.addEventListener('scroll', updateTarget, { passive: true })

  return () => {
    cancelAnimationFrame(animationFrame)
    window.removeEventListener('resize', resize)
    window.removeEventListener('scroll', updateTarget)
  }
}

</script>

<template>
  <div class="site-shell">
    <nav class="top-nav" aria-label="Primary navigation">
      <a
        v-for="item in navItems"
        :key="item.href"
        :href="item.href"
        :class="{ 'is-active': activeSection === item.label }"
      >
        {{ item.label }}
      </a>
    </nav>

    <main>
      <section id="intro" class="hero" data-section="AdenMGB">
        <div class="hero-inner">
          <p class="eyebrow" data-reveal>Developer. Creative technologist.</p>
          <h1 data-reveal>AdenMGB</h1>
          <p class="lead" data-reveal>Open-source interfaces and BetterSEQTA tools from Adelaide.</p>
        </div>
      </section>

      <section class="story" aria-label="AdenMGB product story">
        <div class="sticky-stage">
          <canvas ref="canvasRef" aria-hidden="true"></canvas>
          <div class="story-copy">
            <p class="eyebrow" data-reveal>Built with intent</p>
            <h2 data-reveal>Less noise. More signal.</h2>
            <p data-reveal>Focused interfaces, smooth motion, and tools that stay out of the way.</p>
          </div>
        </div>
      </section>

      <section id="work" class="panel" data-section="Work">
        <div class="section-heading" data-reveal>
          <p class="eyebrow">Selected work</p>
          <h2>BetterSEQTA, refined.</h2>
        </div>

        <div class="work-list">
          <a v-for="project in projects" :key="project.name" :href="project.href" target="_blank" rel="noreferrer" data-reveal>
            <span>{{ project.name }}</span>
            <p>{{ project.line }}</p>
          </a>
        </div>
      </section>

      <section id="contact" class="contact" data-section="Contact">
        <div class="contact-inner" data-reveal>
          <p class="eyebrow">Contact</p>
          <h2>Build something clean.</h2>
          <div class="contact-links">
            <a href="https://github.com/AdenMGB" target="_blank" rel="noreferrer">GitHub</a>
            <a href="mailto:aden@adenmgb.com">aden@adenmgb.com</a>
            <a href="https://discord.com/" target="_blank" rel="noreferrer">Discord: AdenMGB</a>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
:global(*) {
  box-sizing: border-box;
}

:global(html) {
  scroll-behavior: smooth;
  background: #000;
}

:global(body) {
  min-width: 320px;
  margin: 0;
  color: #f5f5f7;
  background: #000;
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

:global(a) {
  color: inherit;
}

.site-shell {
  min-height: 100vh;
  overflow-x: clip;
  background:
    radial-gradient(circle at 50% 8%, rgba(255, 255, 255, 0.085), transparent 29rem),
    linear-gradient(#050505, #000 44rem);
}

.top-nav {
  position: fixed;
  top: 1rem;
  left: 50%;
  z-index: 20;
  display: flex;
  gap: 0.35rem;
  padding: 0.35rem;
  transform: translateX(-50%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  background: rgba(18, 18, 20, 0.52);
  box-shadow: 0 18px 55px rgba(0, 0, 0, 0.32);
  backdrop-filter: blur(30px) saturate(1.25);
}

.top-nav a {
  padding: 0.62rem 0.95rem;
  border-radius: 999px;
  color: rgba(245, 245, 247, 0.68);
  font-size: 0.82rem;
  font-weight: 700;
  text-decoration: none;
  transition: color 260ms cubic-bezier(0.22, 1, 0.36, 1), background 260ms cubic-bezier(0.22, 1, 0.36, 1);
}

.top-nav a:hover,
.top-nav a.is-active {
  color: #fff;
  background: rgba(255, 255, 255, 0.09);
}

.hero,
.panel,
.contact {
  width: min(1100px, calc(100% - 2rem));
  margin: 0 auto;
}

.hero {
  display: grid;
  min-height: 100vh;
  place-items: center;
  text-align: center;
}

.hero-inner {
  max-width: 920px;
}

.eyebrow {
  margin: 0 0 1rem;
  color: rgba(245, 245, 247, 0.62);
  font-size: clamp(0.88rem, 1.6vw, 1rem);
  font-weight: 750;
  letter-spacing: 0.05em;
}

h1,
h2,
p {
  margin-top: 0;
}

h1 {
  margin-bottom: 1.4rem;
  font-size: clamp(4.9rem, 16vw, 13.4rem);
  font-weight: 830;
  line-height: 0.82;
  letter-spacing: -0.105em;
}

h2 {
  margin-bottom: 1.1rem;
  font-size: clamp(2.6rem, 7vw, 6.4rem);
  font-weight: 800;
  line-height: 0.96;
  letter-spacing: -0.07em;
  text-wrap: balance;
}

.lead,
.story-copy p,
.work-list p,
.section-heading > p:not(.eyebrow) {
  color: rgba(245, 245, 247, 0.68);
  font-size: clamp(1.15rem, 2.2vw, 1.6rem);
  line-height: 1.45;
}

.story {
  height: 250vh;
}

.sticky-stage {
  position: sticky;
  top: 0;
  display: grid;
  height: 100vh;
  overflow: hidden;
  place-items: center;
}

.sticky-stage canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.story-copy {
  position: relative;
  z-index: 1;
  width: min(820px, calc(100% - 2rem));
  margin-top: 34vh;
  text-align: center;
}

.panel {
  padding: 10rem 0 7rem;
}

.section-heading {
  max-width: 820px;
  margin: 0 auto 4rem;
  text-align: center;
}

.work-list {
  display: grid;
  gap: 0.85rem;
  max-width: 920px;
  margin: 0 auto;
}

.work-list a {
  display: grid;
  grid-template-columns: 0.44fr 1fr;
  gap: 1.4rem;
  align-items: center;
  min-height: 7.4rem;
  padding: 1.45rem 1.7rem;
  border: 1px solid rgba(255, 255, 255, 0.085);
  border-radius: 1.85rem;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.066), rgba(255, 255, 255, 0.032));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.055);
  text-decoration: none;
  transition: transform 500ms cubic-bezier(0.22, 1, 0.36, 1), background 500ms cubic-bezier(0.22, 1, 0.36, 1), border-color 500ms cubic-bezier(0.22, 1, 0.36, 1);
}

.work-list a:hover {
  border-color: rgba(255, 255, 255, 0.2);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.092), rgba(255, 255, 255, 0.046));
  transform: scale(1.01) translateY(-2px);
}

.work-list span {
  font-size: clamp(1.5rem, 3vw, 2.45rem);
  font-weight: 760;
  letter-spacing: -0.055em;
}

.work-list p {
  margin: 0;
  font-size: clamp(1rem, 2vw, 1.35rem);
}

.contact {
  display: grid;
  min-height: 92vh;
  place-items: center;
  text-align: center;
}

.contact-inner {
  max-width: 900px;
}

.contact-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
  margin-top: 2rem;
}

.contact-links a {
  display: inline-flex;
  min-height: 3rem;
  align-items: center;
  justify-content: center;
  padding: 0 1rem;
  border: 1px solid rgba(255, 255, 255, 0.11);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.045);
  color: rgba(245, 245, 247, 0.82);
  font-weight: 720;
  text-decoration: none;
  transition: transform 420ms cubic-bezier(0.22, 1, 0.36, 1), background 420ms cubic-bezier(0.22, 1, 0.36, 1);
}

.contact-links a:hover {
  background: rgba(255, 255, 255, 0.09);
  transform: translateY(-2px);
}

[data-reveal] {
  opacity: 0;
  transform: translateY(2.4rem) scale(0.985);
  transition: opacity 950ms cubic-bezier(0.16, 1, 0.3, 1), transform 950ms cubic-bezier(0.16, 1, 0.3, 1);
}

[data-reveal].is-visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.hero [data-reveal]:nth-child(2) {
  transition-delay: 90ms;
}

.hero [data-reveal]:nth-child(3) {
  transition-delay: 180ms;
}

@media (max-width: 700px) {
  .hero,
  .panel,
  .contact {
    width: min(100% - 1.1rem, 1100px);
  }

  .top-nav {
    top: auto;
    bottom: 0.8rem;
  }

  .story {
    height: 230vh;
  }

  .story-copy {
    margin-top: 42vh;
  }

  .panel {
    padding: 5.5rem 0;
  }

  .work-list a {
    grid-template-columns: 1fr;
    gap: 0.45rem;
  }

}

@media (prefers-reduced-motion: reduce) {
  :global(html) {
    scroll-behavior: auto;
  }

  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
