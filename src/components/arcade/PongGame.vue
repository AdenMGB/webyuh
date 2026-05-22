<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive } from 'vue'
import './shared.css'

const state = reactive({
  running: false,
  playerY: 42,
  aiY: 42,
  ballX: 50,
  ballY: 50,
  vx: 0.8,
  vy: 0.45,
  player: 0,
  ai: 0,
  rally: 0,
  message: 'Move with W/S or drag the arena. First to 7 wins.',
})

let frame = 0

function resetBall(direction = 1) {
  state.ballX = 50
  state.ballY = 50
  state.vx = direction * (0.72 + Math.random() * 0.25)
  state.vy = (Math.random() - 0.5) * 0.9
  state.rally = 0
}

function start() {
  state.running = true
  state.player = 0
  state.ai = 0
  state.message = 'Rally started. Add spin by hitting off-center.'
  resetBall(Math.random() > 0.5 ? 1 : -1)
}

function tick() {
  if (state.running) {
    state.ballX += state.vx
    state.ballY += state.vy
    state.aiY += (state.ballY - state.aiY - 7) * 0.055

    if (state.ballY <= 2 || state.ballY >= 98) state.vy *= -1

    if (state.ballX <= 7 && Math.abs(state.ballY - (state.playerY + 8)) < 12) {
      state.vx = Math.abs(state.vx) + 0.04
      state.vy += (state.ballY - (state.playerY + 8)) * 0.035
      state.rally += 1
    }

    if (state.ballX >= 93 && Math.abs(state.ballY - (state.aiY + 8)) < 12) {
      state.vx = -Math.abs(state.vx) - 0.035
      state.vy += (state.ballY - (state.aiY + 8)) * 0.03
      state.rally += 1
    }

    if (state.ballX < -4) {
      state.ai += 1
      state.message = 'CPU scored. Tighten your angle.'
      resetBall(1)
    }
    if (state.ballX > 104) {
      state.player += 1
      state.message = 'Point AdenMGB. Keep pressure on.'
      resetBall(-1)
    }
    if (state.player >= 7 || state.ai >= 7) {
      state.running = false
      state.message = state.player >= 7 ? 'You won the match.' : 'CPU took the match.'
    }
  }
  frame = requestAnimationFrame(tick)
}

function setPlayer(clientY: number, target: HTMLElement) {
  const rect = target.getBoundingClientRect()
  state.playerY = Math.min(Math.max(((clientY - rect.top) / rect.height) * 100 - 8, 0), 84)
}

function key(event: KeyboardEvent) {
  if (event.key.toLowerCase() === 'w') state.playerY = Math.max(0, state.playerY - 5)
  if (event.key.toLowerCase() === 's') state.playerY = Math.min(84, state.playerY + 5)
  if (event.key === 'Enter') start()
}

onMounted(() => {
  frame = requestAnimationFrame(tick)
  window.addEventListener('keydown', key)
})
onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  window.removeEventListener('keydown', key)
})
</script>

<template>
  <div class="arcade-game">
    <div class="arcade-hud">
      <span>You {{ state.player }}</span>
      <span>CPU {{ state.ai }}</span>
      <span>Rally {{ state.rally }}</span>
    </div>
    <div class="pong-board arcade-board-panel" @pointermove="setPlayer($event.clientY, $event.currentTarget as HTMLElement)">
      <span class="net"></span>
      <span class="paddle player" :style="{ top: `${state.playerY}%` }"></span>
      <span class="paddle ai" :style="{ top: `${state.aiY}%` }"></span>
      <span class="ball" :style="{ left: `${state.ballX}%`, top: `${state.ballY}%` }"></span>
    </div>
    <p class="arcade-message">{{ state.message }}</p>
    <div class="arcade-controls"><button type="button" @click="start">{{ state.running ? 'Restart' : 'Play Now' }}</button></div>
  </div>
</template>

<style scoped>
.pong-board {
  position: relative;
  height: min(60vw, 28rem);
  min-height: 18rem;
  overflow: hidden;
  touch-action: none;
}

.net {
  position: absolute;
  inset: 0 50%;
  width: 1px;
  background: repeating-linear-gradient(to bottom, rgba(255, 103, 75, 0.35) 0 1rem, transparent 1rem 2rem);
}

.paddle {
  position: absolute;
  width: 1rem;
  height: 16%;
  border-radius: 999px;
  background: linear-gradient(#ffd5ca, #ff3824);
  box-shadow: 0 0 1.4rem rgba(255, 45, 29, 0.42);
}

.player { left: 4%; }
.ai { right: 4%; }

.ball {
  position: absolute;
  width: 1.1rem;
  height: 1.1rem;
  border-radius: 50%;
  background: #ffe4dc;
  box-shadow: 0 0 1.8rem rgba(255, 45, 29, 0.8);
  transform: translate(-50%, -50%);
}
</style>
