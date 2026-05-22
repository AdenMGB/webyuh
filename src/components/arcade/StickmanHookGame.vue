<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive } from 'vue'
import './shared.css'

const anchors = [
  { x: 28, y: 26 },
  { x: 50, y: 18 },
  { x: 72, y: 30 },
]

const state = reactive({ running: false, x: 10, y: 58, vx: 0.75, vy: 0, hooked: false, anchor: 0, best: 0, message: 'Hold to hook the nearest anchor. Release to launch.' })
let frame = 0

function start() {
  state.running = true
  state.x = 10
  state.y = 58
  state.vx = 0.75
  state.vy = 0
  state.hooked = false
  state.message = 'Swing. Release at the bottom for speed.'
}

function nearestAnchor() {
  return anchors.reduce((best, anchor, index) => Math.abs(anchor.x - state.x) < Math.abs(anchors[best]!.x - state.x) ? index : best, 0)
}

function hook() {
  if (!state.running) start()
  state.anchor = nearestAnchor()
  state.hooked = true
}

function release() { state.hooked = false }

function loop() {
  if (state.running) {
    if (state.hooked) {
      const anchor = anchors[state.anchor]!
      const dx = anchor.x - state.x
      const dy = anchor.y - state.y
      state.vx += dx * 0.0024
      state.vy += dy * 0.0024
    } else {
      state.vy += 0.045
    }
    state.vx *= 0.996
    state.vy *= 0.996
    state.x += state.vx
    state.y += state.vy
    if (state.y > 86) {
      state.y = 86
      state.vy *= -0.42
      state.vx *= 0.88
    }
    if (state.x >= 94) {
      state.best += 1
      state.message = 'Finish crossed. Again with more style.'
      start()
    }
    if (state.x < -5 || state.y < -10) start()
  }
  frame = requestAnimationFrame(loop)
}

onMounted(() => { frame = requestAnimationFrame(loop) })
onBeforeUnmount(() => cancelAnimationFrame(frame))
</script>

<template>
  <div class="arcade-game">
    <div class="arcade-hud"><span>Finishes {{ state.best }}</span><span>{{ state.hooked ? 'Hooked' : 'Freefall' }}</span></div>
    <button type="button" class="hook-board arcade-board-panel" @pointerdown="hook" @pointerup="release" @pointerleave="release">
      <span v-for="anchor in anchors" :key="anchor.x" class="anchor" :style="{ left: `${anchor.x}%`, top: `${anchor.y}%` }"></span>
      <svg v-if="state.hooked" class="rope" viewBox="0 0 100 100" preserveAspectRatio="none"><line :x1="anchors[state.anchor]?.x" :y1="anchors[state.anchor]?.y" :x2="state.x" :y2="state.y" /></svg>
      <span class="stickman" :style="{ left: `${state.x}%`, top: `${state.y}%` }"></span>
      <span class="finish"></span>
    </button>
    <p class="arcade-message">{{ state.message }}</p>
    <div class="arcade-controls"><button type="button" @click="start">Play Now</button><button type="button" @pointerdown="hook" @pointerup="release">Hold Hook</button></div>
  </div>
</template>

<style scoped>
.hook-board {
  position: relative;
  height: min(56vw, 28rem);
  min-height: 19rem;
  width: 100%;
  cursor: pointer;
  overflow: hidden;
  touch-action: none;
}

.anchor {
  position: absolute;
  width: 1.5rem;
  height: 1.5rem;
  border: 2px solid #ffd0c5;
  border-radius: 50%;
  box-shadow: 0 0 1.4rem rgba(255, 45, 29, 0.5);
  transform: translate(-50%, -50%);
}

.rope {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.rope line {
  stroke: rgba(255, 96, 70, 0.82);
  stroke-width: 0.35;
}

.stickman {
  position: absolute;
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #ffe2da, #ff3924);
  box-shadow: 0 0 1.4rem rgba(255, 45, 29, 0.56);
  transform: translate(-50%, -50%);
}

.finish {
  position: absolute;
  top: 0;
  right: 7%;
  width: 0.25rem;
  height: 100%;
  background: repeating-linear-gradient(to bottom, #ff3924 0 1rem, transparent 1rem 2rem);
}
</style>
