<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive } from 'vue'
import './shared.css'

const size = 4
const state = reactive({
  board: Array.from({ length: 16 }, () => 0),
  score: 0,
  best: 0,
  moves: 0,
  message: 'Use arrow keys or buttons. Merge up to 2048.',
})

function emptyIndexes() {
  return state.board.map((value, index) => (value === 0 ? index : -1)).filter((index) => index >= 0)
}

function spawn() {
  const empty = emptyIndexes()
  const index = empty[Math.floor(Math.random() * empty.length)]
  if (index !== undefined) state.board[index] = Math.random() > 0.88 ? 4 : 2
}

function reset() {
  state.board = Array.from({ length: 16 }, () => 0)
  state.score = 0
  state.moves = 0
  state.message = 'Fresh board. Build corners and chain merges.'
  spawn()
  spawn()
}

function mergeLine(line: number[]) {
  const compact = line.filter(Boolean)
  const result: number[] = []
  let gained = 0
  for (let index = 0; index < compact.length; index += 1) {
    if (compact[index] === compact[index + 1]) {
      const merged = compact[index]! * 2
      result.push(merged)
      gained += merged
      index += 1
    } else {
      result.push(compact[index]!)
    }
  }
  while (result.length < size) result.push(0)
  return { result, gained }
}

function move(direction: 'up' | 'down' | 'left' | 'right') {
  const previous = state.board.join(',')
  let gained = 0
  const next = [...state.board]

  for (let lineIndex = 0; lineIndex < size; lineIndex += 1) {
    const line: number[] = []
    for (let index = 0; index < size; index += 1) {
      const row = direction === 'up' || direction === 'down' ? index : lineIndex
      const col = direction === 'up' || direction === 'down' ? lineIndex : index
      line.push(state.board[row * size + col]!)
    }
    if (direction === 'down' || direction === 'right') line.reverse()
    const merged = mergeLine(line)
    gained += merged.gained
    if (direction === 'down' || direction === 'right') merged.result.reverse()
    for (let index = 0; index < size; index += 1) {
      const row = direction === 'up' || direction === 'down' ? index : lineIndex
      const col = direction === 'up' || direction === 'down' ? lineIndex : index
      next[row * size + col] = merged.result[index]!
    }
  }

  state.board = next
  if (state.board.join(',') !== previous) {
    state.score += gained
    state.best = Math.max(state.best, state.score)
    state.moves += 1
    spawn()
    state.message = state.board.includes(2048) ? '2048 reached. Keep going for a monster score.' : gained ? `Merged for ${gained}.` : 'Board shifted.'
  }
}

function handleKey(event: KeyboardEvent) {
  if (event.key === 'ArrowUp') move('up')
  if (event.key === 'ArrowDown') move('down')
  if (event.key === 'ArrowLeft') move('left')
  if (event.key === 'ArrowRight') move('right')
}

reset()
onMounted(() => window.addEventListener('keydown', handleKey))
onBeforeUnmount(() => window.removeEventListener('keydown', handleKey))
</script>

<template>
  <div class="arcade-game game-2048">
    <div class="arcade-hud">
      <span>Score {{ state.score }}</span>
      <span>Best {{ state.best }}</span>
      <span>Moves {{ state.moves }}</span>
    </div>
    <div class="board-2048 arcade-board-panel">
      <span v-for="(tile, index) in state.board" :key="index" class="tile-2048" :class="`value-${tile}`">{{ tile || '' }}</span>
    </div>
    <p class="arcade-message">{{ state.message }}</p>
    <div class="arcade-controls">
      <button type="button" @click="reset">New Game</button>
      <button type="button" @click="move('up')">Up</button>
      <button type="button" @click="move('left')">Left</button>
      <button type="button" @click="move('right')">Right</button>
      <button type="button" @click="move('down')">Down</button>
    </div>
  </div>
</template>

<style scoped>
.board-2048 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: clamp(0.45rem, 1.6vw, 0.8rem);
  max-width: 34rem;
  padding: clamp(0.6rem, 2vw, 1rem);
}

.tile-2048 {
  display: grid;
  aspect-ratio: 1;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.045);
  color: #ffe1d8;
  font-size: clamp(1.4rem, 5vw, 3rem);
  font-weight: 850;
  letter-spacing: -0.08em;
  place-items: center;
}

.value-2,
.value-4 {
  background: rgba(255, 86, 57, 0.16);
}

.value-8,
.value-16,
.value-32 {
  background: linear-gradient(135deg, #9f000d, #ff3a25);
}

.value-64,
.value-128,
.value-256,
.value-512,
.value-1024,
.value-2048 {
  background: linear-gradient(135deg, #ffd3c7, #ff3a25 42%, #680007);
  box-shadow: 0 0 1.8rem rgba(255, 45, 29, 0.35);
}
</style>
