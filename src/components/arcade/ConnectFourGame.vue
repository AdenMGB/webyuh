<script setup lang="ts">
import { reactive } from 'vue'
import './shared.css'

const rows = 6
const cols = 7
const state = reactive({ board: Array.from({ length: rows * cols }, () => 0), turn: 1, message: 'Drop red discs. CPU answers in black.', winner: 0 })

function index(row: number, col: number) { return row * cols + col }

function reset() {
  state.board = Array.from({ length: rows * cols }, () => 0)
  state.turn = 1
  state.winner = 0
  state.message = 'Your move. Connect four red discs.'
}

function drop(col: number, player = state.turn) {
  if (state.winner) return false
  for (let row = rows - 1; row >= 0; row -= 1) {
    const cell = index(row, col)
    if (!state.board[cell]) {
      state.board[cell] = player
      const winner = checkWinner()
      if (winner) {
        state.winner = winner
        state.message = winner === 1 ? 'You connected four.' : 'CPU connected four.'
      }
      return true
    }
  }
  return false
}

function playerDrop(col: number) {
  if (state.turn !== 1 || state.winner || !drop(col, 1)) return
  if (!state.winner) {
    state.turn = 2
    window.setTimeout(cpuMove, 280)
  }
}

function cpuMove() {
  const valid = Array.from({ length: cols }, (_, col) => col).filter((col) => !state.board[index(0, col)])
  const centerSorted = valid.sort((a, b) => Math.abs(a - 3) - Math.abs(b - 3))
  drop(centerSorted[Math.floor(Math.random() * Math.min(centerSorted.length, 3))] ?? 3, 2)
  if (!state.winner) {
    state.turn = 1
    state.message = 'Your move.'
  }
}

function checkWinner() {
  const dirs = [[1, 0], [0, 1], [1, 1], [1, -1]]
  for (let row = 0; row < rows; row += 1) for (let col = 0; col < cols; col += 1) {
    const player = state.board[index(row, col)]
    if (!player) continue
    if (dirs.some(([dx, dy]) => [0, 1, 2, 3].every((step) => state.board[index(row + dy! * step, col + dx! * step)] === player))) return player
  }
  return 0
}

reset()
</script>

<template>
  <div class="arcade-game">
    <div class="arcade-hud"><span>{{ state.turn === 1 ? 'Your turn' : 'CPU thinking' }}</span><span>{{ state.winner ? 'Game over' : 'Live' }}</span></div>
    <div class="connect-board arcade-board-panel">
      <button v-for="col in cols" :key="`drop-${col}`" type="button" class="drop-button" @click="playerDrop(col - 1)">Drop</button>
      <span v-for="(cell, cellIndex) in state.board" :key="cellIndex" class="disc" :class="{ red: cell === 1, black: cell === 2 }"></span>
    </div>
    <p class="arcade-message">{{ state.message }}</p>
    <div class="arcade-controls"><button type="button" @click="reset">New Match</button></div>
  </div>
</template>

<style scoped>
.connect-board {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.45rem;
  max-width: 42rem;
  padding: 0.8rem;
}

.drop-button {
  min-height: 2.2rem;
  border: 1px solid rgba(255, 70, 47, 0.16);
  border-radius: 999px;
  background: rgba(255, 65, 43, 0.1);
  color: #ffb5a6;
  cursor: pointer;
  font: inherit;
  font-size: 0.78rem;
  font-weight: 800;
}

.disc {
  aspect-ratio: 1;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.045);
  box-shadow: inset 0 0 0 0.28rem rgba(0, 0, 0, 0.28);
}

.disc.red {
  background: radial-gradient(circle, #ffd4ca, #ff3924 58%, #7b0008);
}

.disc.black {
  background: radial-gradient(circle, #555, #090909 62%);
  box-shadow: inset 0 0 0 0.22rem rgba(255, 45, 29, 0.22);
}
</style>
