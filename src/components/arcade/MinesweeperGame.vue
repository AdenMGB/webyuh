<script setup lang="ts">
import { reactive } from 'vue'
import './shared.css'

type Cell = { mine: boolean; revealed: boolean; flagged: boolean; count: number }

const rows = 10
const cols = 10
const mines = 14
const state = reactive({
  cells: [] as Cell[],
  flags: 0,
  status: 'playing' as 'playing' | 'won' | 'lost',
  message: 'Reveal safe cells. Right click or long press to flag mines.',
})

function index(row: number, col: number) {
  return row * cols + col
}

function neighbors(cellIndex: number) {
  const row = Math.floor(cellIndex / cols)
  const col = cellIndex % cols
  const result: number[] = []
  for (let y = -1; y <= 1; y += 1) {
    for (let x = -1; x <= 1; x += 1) {
      if (x || y) {
        const nextRow = row + y
        const nextCol = col + x
        if (nextRow >= 0 && nextRow < rows && nextCol >= 0 && nextCol < cols) result.push(index(nextRow, nextCol))
      }
    }
  }
  return result
}

function reset() {
  state.cells = Array.from({ length: rows * cols }, () => ({ mine: false, revealed: false, flagged: false, count: 0 }))
  state.flags = 0
  state.status = 'playing'
  state.message = 'Fresh field. Use number clues to sweep safely.'
  let placed = 0
  while (placed < mines) {
    const cell = state.cells[Math.floor(Math.random() * state.cells.length)]
    if (cell && !cell.mine) {
      cell.mine = true
      placed += 1
    }
  }
  state.cells.forEach((cell, cellIndex) => {
    cell.count = neighbors(cellIndex).filter((neighborIndex) => state.cells[neighborIndex]?.mine).length
  })
}

function reveal(cellIndex: number) {
  const cell = state.cells[cellIndex]
  if (!cell || state.status !== 'playing' || cell.flagged || cell.revealed) return
  cell.revealed = true
  if (cell.mine) {
    state.status = 'lost'
    state.message = 'Boom. Mine triggered.'
    state.cells.forEach((entry) => (entry.revealed = entry.revealed || entry.mine))
    return
  }
  if (cell.count === 0) neighbors(cellIndex).forEach(reveal)
  if (state.cells.every((entry) => entry.revealed || entry.mine)) {
    state.status = 'won'
    state.message = 'Field cleared. Perfect sweep.'
  }
}

function flag(event: MouseEvent, cellIndex: number) {
  event.preventDefault()
  const cell = state.cells[cellIndex]
  if (!cell || state.status !== 'playing' || cell.revealed) return
  cell.flagged = !cell.flagged
  state.flags += cell.flagged ? 1 : -1
}

reset()
</script>

<template>
  <div class="arcade-game">
    <div class="arcade-hud">
      <span>Mines {{ mines }}</span>
      <span>Flags {{ state.flags }}</span>
      <span>{{ state.status }}</span>
    </div>
    <div class="mine-board arcade-board-panel">
      <button
        v-for="(cell, cellIndex) in state.cells"
        :key="cellIndex"
        type="button"
        class="mine-cell"
        :class="{ revealed: cell.revealed, flagged: cell.flagged, mine: cell.revealed && cell.mine }"
        @click="reveal(cellIndex)"
        @contextmenu="flag($event, cellIndex)"
      >
        {{ cell.flagged && !cell.revealed ? '⚑' : cell.revealed && cell.mine ? '•' : cell.revealed && cell.count ? cell.count : '' }}
      </button>
    </div>
    <p class="arcade-message">{{ state.message }}</p>
    <div class="arcade-controls"><button type="button" @click="reset">New Field</button></div>
  </div>
</template>

<style scoped>
.mine-board {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 0.25rem;
  max-width: 36rem;
  padding: 0.7rem;
}

.mine-cell {
  display: grid;
  aspect-ratio: 1;
  border: 1px solid rgba(255, 70, 47, 0.12);
  border-radius: 0.45rem;
  background: rgba(255, 255, 255, 0.045);
  color: #ffd8cf;
  cursor: pointer;
  font: inherit;
  font-weight: 850;
  place-items: center;
}

.mine-cell.revealed {
  background: rgba(255, 67, 43, 0.12);
}

.mine-cell.flagged {
  color: #ff5c40;
}

.mine-cell.mine {
  background: #ff3320;
  color: #190000;
}
</style>
