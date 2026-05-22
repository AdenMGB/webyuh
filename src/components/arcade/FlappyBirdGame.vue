<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive } from 'vue'
import './shared.css'

type Pipe = { x: number; gap: number; scored: boolean }

const state = reactive({
  running: false,
  birdY: 46,
  velocity: 0,
  pipes: [] as Pipe[],
  score: 0,
  best: 0,
  message: 'Click, tap, or press space to flap through the gates.',
})

let frame = 0
let tickCount = 0

function start() {
  state.running = true
  state.birdY = 46
  state.velocity = 0
  state.pipes = [{ x: 95, gap: 42, scored: false }]
  state.score = 0
  tickCount = 0
  state.message = 'Stay calm. Small taps beat panic taps.'
}

function flap() {
  if (!state.running) start()
  state.velocity = -1.75
}

function loop() {
  if (state.running) {
    tickCount += 1
    state.velocity += 0.085
    state.birdY += state.velocity
    if (tickCount % 105 === 0) state.pipes.push({ x: 105, gap: 22 + Math.random() * 48, scored: false })
    state.pipes.forEach((pipe) => (pipe.x -= 0.62))
    state.pipes = state.pipes.filter((pipe) => pipe.x > -12)

    state.pipes.forEach((pipe) => {
      if (!pipe.scored && pipe.x < 18) {
        pipe.scored = true
        state.score += 1
        state.best = Math.max(state.best, state.score)
      }
      const inColumn = pipe.x < 24 && pipe.x > 8
      const outsideGap = state.birdY < pipe.gap - 12 || state.birdY > pipe.gap + 12
      if (inColumn && outsideGap) crash()
    })
    if (state.birdY < 2 || state.birdY > 98) crash()
  }
  frame = requestAnimationFrame(loop)
}

function crash() {
  state.running = false
  state.best = Math.max(state.best, state.score)
  state.message = 'Crash. Tap Play Now to thread it cleaner.'
}

function key(event: KeyboardEvent) {
  if (event.key === ' ') {
    event.preventDefault()
    flap()
  }
}

onMounted(() => {
  frame = requestAnimationFrame(loop)
  window.addEventListener('keydown', key)
})
onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  window.removeEventListener('keydown', key)
})
</script>

<template>
  <div class="arcade-game">
    <div class="arcade-hud"><span>Score {{ state.score }}</span><span>Best {{ state.best }}</span></div>
    <button type="button" class="flappy-board arcade-board-panel" @click="flap">
      <span class="bird" :style="{ top: `${state.birdY}%`, transform: `rotate(${state.velocity * 10}deg)` }"></span>
      <span v-for="pipe in state.pipes" :key="`${pipe.x}-${pipe.gap}`" class="pipe top" :style="{ left: `${pipe.x}%`, height: `${pipe.gap - 12}%` }"></span>
      <span v-for="pipe in state.pipes" :key="`b-${pipe.x}-${pipe.gap}`" class="pipe bottom" :style="{ left: `${pipe.x}%`, top: `${pipe.gap + 12}%` }"></span>
    </button>
    <p class="arcade-message">{{ state.message }}</p>
    <div class="arcade-controls"><button type="button" @click="start">Play Now</button><button type="button" @click="flap">Flap</button></div>
  </div>
</template>

<style scoped>
.flappy-board {
  position: relative;
  height: min(58vw, 30rem);
  min-height: 19rem;
  width: 100%;
  cursor: pointer;
  overflow: hidden;
}

.bird {
  position: absolute;
  left: 18%;
  width: 2.4rem;
  height: 2rem;
  border-radius: 55% 45% 45% 55%;
  background: linear-gradient(135deg, #ffe3da, #ff3924 58%, #790008);
  box-shadow: 0 0 1.4rem rgba(255, 45, 29, 0.55);
}

.pipe {
  position: absolute;
  width: 4rem;
  border-radius: 0.8rem;
  background: linear-gradient(90deg, #610007, #ff3924, #610007);
  box-shadow: 0 0 1rem rgba(255, 45, 29, 0.25);
}

.top { top: 0; }
.bottom { bottom: 0; }
</style>
