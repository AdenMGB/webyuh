<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive } from 'vue'
import './shared.css'

type Point = { x: number; y: number }
type PieceKey = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L'

const width = 10
const height = 20
const shapes: Record<PieceKey, Point[]> = {
  I: [
    { x: -1, y: 0 },
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
  ],
  O: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
  ],
  T: [
    { x: -1, y: 0 },
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
  ],
  S: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: -1, y: 1 },
    { x: 0, y: 1 },
  ],
  Z: [
    { x: -1, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
  ],
  J: [
    { x: -1, y: 0 },
    { x: -1, y: 1 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
  ],
  L: [
    { x: 1, y: 0 },
    { x: -1, y: 1 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
  ],
}

const state = reactive({
  board: Array.from({ length: width * height }, () => ''),
  piece: 'T' as PieceKey,
  next: 'I' as PieceKey,
  x: 4,
  y: 0,
  rotation: 0,
  score: 0,
  lines: 0,
  level: 1,
  running: false,
  over: false,
  message: 'Move with arrows, rotate with up, hard drop with space.',
})

let timer = 0

const activeCells = computed(() => getCells(state.piece, state.rotation, state.x, state.y).map((cell) => `${cell.x}:${cell.y}`))

function randomPiece(): PieceKey {
  const keys = Object.keys(shapes) as PieceKey[]
  return keys[Math.floor(Math.random() * keys.length)] ?? 'T'
}

function getCells(piece: PieceKey, rotation: number, offsetX: number, offsetY: number) {
  return shapes[piece].map((point) => {
    let x = point.x
    let y = point.y
    for (let index = 0; index < rotation % 4; index += 1) {
      const nextX = -y
      y = x
      x = nextX
    }
    return { x: x + offsetX, y: y + offsetY }
  })
}

function collides(piece = state.piece, rotation = state.rotation, x = state.x, y = state.y) {
  return getCells(piece, rotation, x, y).some((cell) => cell.x < 0 || cell.x >= width || cell.y >= height || (cell.y >= 0 && state.board[cell.y * width + cell.x]))
}

function spawnPiece() {
  state.piece = state.next
  state.next = randomPiece()
  state.x = 4
  state.y = 0
  state.rotation = 0
  if (collides()) {
    state.over = true
    state.running = false
    state.message = 'Top out. Start a new stack.'
    stopLoop()
  }
}

function lockPiece() {
  getCells(state.piece, state.rotation, state.x, state.y).forEach((cell) => {
    if (cell.y >= 0) state.board[cell.y * width + cell.x] = state.piece
  })
  clearLines()
  spawnPiece()
}

function clearLines() {
  let cleared = 0
  for (let row = height - 1; row >= 0; row -= 1) {
    const start = row * width
    if (state.board.slice(start, start + width).every(Boolean)) {
      state.board.splice(start, width)
      state.board.unshift(...Array.from({ length: width }, () => ''))
      cleared += 1
      row += 1
    }
  }
  if (cleared) {
    state.lines += cleared
    state.level = 1 + Math.floor(state.lines / 6)
    state.score += [0, 100, 300, 500, 800][cleared]! * state.level
    state.message = cleared === 4 ? 'Tetris. Huge clear.' : `${cleared} line clear.`
    restartLoop()
  }
}

function tick() {
  if (!state.running) return
  if (!collides(state.piece, state.rotation, state.x, state.y + 1)) {
    state.y += 1
  } else {
    lockPiece()
  }
}

function move(dx: number) {
  if (!collides(state.piece, state.rotation, state.x + dx, state.y)) state.x += dx
}

function rotate() {
  const nextRotation = (state.rotation + 1) % 4
  if (!collides(state.piece, nextRotation, state.x, state.y)) state.rotation = nextRotation
  else if (!collides(state.piece, nextRotation, state.x - 1, state.y)) {
    state.x -= 1
    state.rotation = nextRotation
  } else if (!collides(state.piece, nextRotation, state.x + 1, state.y)) {
    state.x += 1
    state.rotation = nextRotation
  }
}

function hardDrop() {
  while (!collides(state.piece, state.rotation, state.x, state.y + 1)) {
    state.y += 1
    state.score += 2
  }
  lockPiece()
}

function reset() {
  stopLoop()
  state.board = Array.from({ length: width * height }, () => '')
  state.next = randomPiece()
  state.score = 0
  state.lines = 0
  state.level = 1
  state.over = false
  state.running = true
  state.message = 'Stack cleanly. Space drops instantly.'
  spawnPiece()
  restartLoop()
}

function stopLoop() {
  if (timer) window.clearInterval(timer)
  timer = 0
}

function restartLoop() {
  stopLoop()
  timer = window.setInterval(tick, Math.max(190, 920 - state.level * 62))
}

function handleKey(event: KeyboardEvent) {
  if (!state.running && event.key !== 'Enter') return
  if (event.key === 'ArrowLeft') move(-1)
  if (event.key === 'ArrowRight') move(1)
  if (event.key === 'ArrowDown') tick()
  if (event.key === 'ArrowUp') rotate()
  if (event.key === ' ') {
    event.preventDefault()
    hardDrop()
  }
  if (event.key === 'Enter') reset()
}

onMounted(() => window.addEventListener('keydown', handleKey))
onBeforeUnmount(() => {
  stopLoop()
  window.removeEventListener('keydown', handleKey)
})
</script>

<template>
  <div class="arcade-game tetris-game">
    <div class="arcade-hud">
      <span>Score {{ state.score }}</span>
      <span>Lines {{ state.lines }}</span>
      <span>Level {{ state.level }}</span>
      <span>Next {{ state.next }}</span>
    </div>
    <div class="tetris-layout">
      <div class="tetris-board arcade-board-panel">
        <span
          v-for="(_, index) in state.board"
          :key="index"
          class="tetris-cell"
          :class="state.board[index] || (activeCells.includes(`${index % width}:${Math.floor(index / width)}`) ? state.piece : '')"
        ></span>
      </div>
      <div class="tetris-side arcade-board-panel">
        <p class="arcade-message">{{ state.message }}</p>
        <div class="arcade-controls">
          <button type="button" @click="reset">{{ state.running ? 'Restart' : 'Play Now' }}</button>
          <button type="button" @click="move(-1)">Left</button>
          <button type="button" @click="rotate">Rotate</button>
          <button type="button" @click="move(1)">Right</button>
          <button type="button" @click="hardDrop">Drop</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tetris-layout {
  display: grid;
  grid-template-columns: minmax(14rem, 25rem) 1fr;
  gap: 1rem;
}

.tetris-board {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 0.18rem;
  padding: 0.7rem;
}

.tetris-cell {
  aspect-ratio: 1;
  border-radius: 0.24rem;
  background: rgba(255, 255, 255, 0.035);
}

.tetris-cell.I,
.tetris-cell.O,
.tetris-cell.T,
.tetris-cell.S,
.tetris-cell.Z,
.tetris-cell.J,
.tetris-cell.L {
  background: linear-gradient(135deg, #ffd2c7, #ff3924 52%, #780008);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.28), 0 0 1rem rgba(255, 45, 29, 0.24);
}

.tetris-side {
  display: grid;
  gap: 1rem;
  align-content: start;
  padding: 1rem;
}

@media (max-width: 760px) {
  .tetris-layout {
    grid-template-columns: 1fr;
  }

  .tetris-board {
    max-width: min(100%, 23rem);
    margin: 0 auto;
  }
}
</style>
