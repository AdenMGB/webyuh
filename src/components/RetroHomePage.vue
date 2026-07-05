<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

defineProps<{
  onNavigate: (event: MouseEvent, href: string) => void
}>()

type CornerGif = {
  id: (typeof cornerPositions)[number]
  src: string
  alt: string
}

const cornerPositions = ['corner1', 'corner2', 'corner3', 'corner4'] as const

const HERO_GIF = '/gifs/hero-hamster.gif'
const WALLPAPER =
  'https://64.media.tumblr.com/10426862e59a38a5cc04a228999e2aa3/62cd5cf6644e95da-3c/s500x750/b534de2d4f2e521259abcce9f5d19a23bbe15f8e.jpg'
const PROFILE_URL = 'https://github.com/AdenMGB.png'
const BANNER_URL = 'https://maendisease.github.io/assets/img/milindustrialcomplex.png'

const cornerGifs: CornerGif[] = [
  { id: 'corner1', src: '/gifs/corner-hamu.gif', alt: 'Dancing hamster' },
  { id: 'corner2', src: '/gifs/corner-hamwalk.gif', alt: 'Walking hamster' },
  { id: 'corner3', src: '/gifs/corner-email.gif', alt: 'Email me animation' },
  { id: 'corner4', src: '/gifs/corner-safewave.gif', alt: 'SafeSurf badge' },
]
const visitorCount = ref(42069)
const currentYear = new Date().getFullYear()
const marqueeText =
  '★ WELCOME TO MY CORNER OF THE INTERNET ★ BEST VIEWED IN NETSCAPE NAVIGATOR 4.0 ★ UNDER CONSTRUCTION ★ NO STEALING MY HTML ★'

let counterInterval: number | undefined

onMounted(() => {
  const stored = localStorage.getItem('adenmgb-visitors')
  visitorCount.value = stored ? Number.parseInt(stored, 10) + 1 : 42069
  localStorage.setItem('adenmgb-visitors', String(visitorCount.value))

  counterInterval = window.setInterval(() => {
    if (Math.random() > 0.7) {
      visitorCount.value += 1
    }
  }, 4000)
})

onBeforeUnmount(() => {
  if (counterInterval) {
    clearInterval(counterInterval)
  }
})
</script>

<template>
  <div class="retro-shell" :style="{ '--retro-wallpaper': `url('${WALLPAPER}')` }">
    <div class="bg-wrapper" aria-hidden="true">
      <img class="bg" :src="WALLPAPER" alt="" />
    </div>

    <img
      v-for="corner in cornerGifs"
      :key="corner.id"
      class="corner-gif"
      :class="corner.id"
      :src="corner.src"
      :alt="corner.alt"
    />

    <a
      class="orbit-link"
      href="/arcade"
      aria-label="Enter the arcade"
      @click="onNavigate($event, '/arcade')"
    >
      <span class="orbit-label">ARCADE!!!</span>
    </a>

    <main id="app-mount" class="app-mount">
      <div class="marquee-bar" aria-hidden="true">
        <p class="marquee-text">{{ marqueeText }}</p>
      </div>

      <div class="body">
        <img class="hero-spin" :src="HERO_GIF" alt="Spinning character" width="120" height="120" />

        <div class="title-wrapper">
          <h3 class="title">Welcome To My Website</h3>
          <h2 class="subtitle">by</h2>
          <h3 class="subtitle2">AdenMGB</h3>
        </div>

        <img class="profileimg" :src="PROFILE_URL" alt="AdenMGB profile picture" width="64" height="64" />

        <nav class="link-row" aria-label="Social links">
          <a
            class="retro-link"
            href="https://github.com/AdenMGB"
            target="_blank"
            rel="noreferrer"
          >
            My GitHub
          </a>
          <a
            class="retro-link blink"
            href="/arcade"
            @click="onNavigate($event, '/arcade')"
          >
            My Arcade
          </a>
          <a class="retro-link" href="mailto:aden@adenmgb.com">Email Me</a>
        </nav>

        <p class="visitor-counter">
          You are visitor number
          <strong>{{ visitorCount.toLocaleString() }}</strong>
          <span class="blink">!!!</span>
        </p>

        <div class="project-strip">
          <a href="https://github.com/BetterSEQTA" target="_blank" rel="noreferrer">BetterSEQTA</a>
          <span>•</span>
          <a href="https://github.com/BetterSEQTA/DesQTA" target="_blank" rel="noreferrer">DesQTA</a>
          <span>•</span>
          <a href="https://adenmgb.com" target="_blank" rel="noreferrer">BetterSEQTA Cloud</a>
        </div>

        <footer class="footer">
          <img class="advert" :src="BANNER_URL" alt="Military industrial complex banner" width="500" />
          <p class="copyright">© {{ currentYear }} AdenMGB. All rights reserved maybe.</p>
        </footer>
      </div>
    </main>
  </div>
</template>

<style scoped>
.retro-shell {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  isolation: isolate;
  background-color: #000;
  background-image: var(--retro-wallpaper);
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  font-family: "Comic Sans MS", "Comic Sans", cursive;
}

.bg-wrapper {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.bg {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.corner-gif {
  position: absolute;
  z-index: 1;
  display: block;
  width: clamp(90px, 14vw, 150px);
  padding: 20px;
  pointer-events: none;
}

.corner1 {
  top: 0;
  left: 0;
}

.corner2 {
  top: 0;
  right: 0;
}

.corner3 {
  bottom: 0;
  left: 0;
}

.corner4 {
  right: 0;
  bottom: 0;
}

.orbit-link {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 5;
  display: grid;
  place-items: center;
  width: 7rem;
  height: 2.4rem;
  margin: -1.2rem 0 0 -3.5rem;
  border: 3px ridge #ff0;
  background: linear-gradient(180deg, #f0f, #90f);
  color: #fff;
  font-size: 0.85rem;
  font-weight: 700;
  text-decoration: none;
  animation: orbit 15s linear infinite, pulsate 4s linear infinite;
}

.orbit-label {
  text-shadow: 2px 2px 0 #000;
}

.app-mount {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.marquee-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  overflow: hidden;
  border-block: 3px double #0f0;
  background: #000;
}

.marquee-text {
  margin: 0;
  padding: 0.35rem 0;
  animation: marquee 18s linear infinite;
  color: #0f0;
  font-size: 0.95rem;
  font-weight: 700;
  white-space: nowrap;
}

.body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: min(70vw, 720px);
  height: 100%;
  gap: 8px;
  text-align: center;
}

.hero-spin {
  width: clamp(72px, 12vw, 120px);
  height: auto;
}

.title-wrapper {
  position: relative;
  display: block;
  margin-top: 12px;
  filter: contrast(3);
}

.title {
  margin: 0;
  color: rgb(0, 255, 0);
  font-size: clamp(1.6rem, 4vw, 3.1rem);
  font-style: italic;
  text-align: center;
  filter: drop-shadow(0 0 0.5px #000) drop-shadow(10px 5px 2px red);
}

.subtitle {
  margin: 0;
  color: rgb(255, 238, 0);
  font-size: clamp(1.2rem, 3vw, 2.2rem);
  font-style: italic;
  filter: drop-shadow(0 0 0.5px #000) drop-shadow(5px 2px 2px green);
}

.subtitle2 {
  margin: 0;
  color: rgb(255, 0, 0);
  font-size: clamp(2rem, 6vw, 4.4rem);
  font-style: italic;
  filter:
    drop-shadow(0 0 0.5px #000)
    drop-shadow(0 10px 0 rgb(217, 255, 0))
    drop-shadow(0 0 0.5px #000)
    drop-shadow(0 15px 0 rgb(38, 0, 255));
}

.profileimg {
  width: 64px;
  height: 64px;
  border: 4px ridge #fff;
  border-radius: 4px;
  image-rendering: pixelated;
}

.link-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
  margin-top: 0.35rem;
}

.retro-link {
  padding: 0.35rem 0.85rem;
  border: 3px outset #ccc;
  background: linear-gradient(180deg, #eee, #999);
  color: #00f;
  font-size: 1rem;
  font-weight: 700;
  text-decoration: underline;
}

.retro-link:hover {
  border-style: inset;
  color: #f0f;
}

.visitor-counter {
  margin: 0.35rem 0 0;
  color: #fff;
  font-size: 0.95rem;
  text-shadow: 2px 2px 0 #000;
}

.visitor-counter strong {
  color: #ff0;
  font-size: 1.15rem;
}

.project-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  justify-content: center;
  color: #fff;
  font-size: 0.9rem;
}

.project-strip a {
  color: #0ff;
  text-shadow: 1px 1px 0 #000;
}

.footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 0.35rem;
}

.advert {
  width: min(500px, 88vw);
  height: auto;
  border: 4px ridge #888;
}

.copyright {
  margin: 0.35rem 0 0;
  color: #ccc;
  font-size: 0.75rem;
}

.blink {
  animation: blink 1s step-start infinite;
}

@keyframes orbit {
  from {
    transform: rotate(0deg) translateX(150px) rotate(0deg);
  }

  to {
    transform: rotate(360deg) translateX(150px) rotate(-360deg);
  }
}

@keyframes pulsate {
  0%,
  100% {
    transform: rotate(var(--orbit-rotation, 0deg)) translateX(150px) scale(1);
  }

  50% {
    transform: rotate(var(--orbit-rotation, 0deg)) translateX(150px) scale(1.08);
  }
}

@keyframes marquee {
  from {
    transform: translateX(100%);
  }

  to {
    transform: translateX(-100%);
  }
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}

@media (max-width: 640px) {
  .corner-gif {
    width: 72px;
    padding: 8px;
  }

  .orbit-link {
    animation: pulsate 4s linear infinite;
    transform: none;
    position: static;
    margin: 0.5rem 0 0;
  }

  .body {
    width: min(92vw, 720px);
    padding: 2.5rem 0 1rem;
    overflow-y: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .marquee-text,
  .orbit-link,
  .blink {
    animation: none;
  }
}
</style>
