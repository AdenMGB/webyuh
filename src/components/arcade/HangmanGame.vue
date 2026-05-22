<script setup lang="ts">
import { computed, reactive } from 'vue'
import './shared.css'

const words = ['shader', 'arcade', 'betterseqta', 'launcher', 'typescript', 'interface', 'velocity', 'gradient']
const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('')
const state = reactive({ word: '', guesses: [] as string[], wrong: 0, wins: 0, losses: 0 })

const display = computed(() => state.word.split('').map((letter) => (state.guesses.includes(letter) ? letter : '_')).join(' '))
const status = computed(() => (state.wrong >= 6 ? 'lost' : state.word.split('').every((letter) => state.guesses.includes(letter)) ? 'won' : 'playing'))

function reset() {
  state.word = words[Math.floor(Math.random() * words.length)] ?? 'arcade'
  state.guesses = []
  state.wrong = 0
}

function guess(letter: string) {
  if (status.value !== 'playing' || state.guesses.includes(letter)) return
  state.guesses.push(letter)
  if (!state.word.includes(letter)) state.wrong += 1
  if (state.word.split('').every((wordLetter) => state.guesses.includes(wordLetter))) state.wins += 1
  if (state.wrong >= 6) state.losses += 1
}

reset()
</script>

<template>
  <div class="arcade-game hangman-game">
    <div class="arcade-hud"><span>Wrong {{ state.wrong }}/6</span><span>Wins {{ state.wins }}</span><span>Losses {{ state.losses }}</span></div>
    <div class="hangman-stage arcade-board-panel">
      <div class="gallows">
        <span class="beam"></span><span class="rope"></span><span v-if="state.wrong > 0" class="head"></span><span v-if="state.wrong > 1" class="body"></span><span v-if="state.wrong > 2" class="arm left"></span><span v-if="state.wrong > 3" class="arm right"></span><span v-if="state.wrong > 4" class="leg left"></span><span v-if="state.wrong > 5" class="leg right"></span>
      </div>
      <strong>{{ display }}</strong>
    </div>
    <p class="arcade-message">{{ status === 'won' ? 'Solved. Clean guesswork.' : status === 'lost' ? `Lost. Word was ${state.word}.` : 'Guess the developer-themed word.' }}</p>
    <div class="letters"><button v-for="letter in alphabet" :key="letter" type="button" :disabled="state.guesses.includes(letter)" @click="guess(letter)">{{ letter }}</button></div>
    <div class="arcade-controls"><button type="button" @click="reset">New Word</button></div>
  </div>
</template>

<style scoped>
.hangman-stage {
  display: grid;
  gap: 1rem;
  justify-items: center;
  padding: 1.2rem;
}

.gallows {
  position: relative;
  width: 13rem;
  height: 14rem;
}

.beam,
.rope,
.body,
.arm,
.leg {
  position: absolute;
  background: #ff4a31;
  box-shadow: 0 0 1rem rgba(255, 45, 29, 0.35);
}

.beam { left: 2rem; top: 1rem; width: 8rem; height: 0.35rem; }
.rope { left: 9.5rem; top: 1rem; width: 0.25rem; height: 2rem; }
.head { position: absolute; left: 8.45rem; top: 3rem; width: 2.2rem; height: 2.2rem; border: 0.28rem solid #ffd5ca; border-radius: 50%; }
.body { left: 9.45rem; top: 5.4rem; width: 0.35rem; height: 4rem; }
.arm { top: 6.2rem; width: 2.4rem; height: 0.28rem; }
.arm.left { left: 7.2rem; transform: rotate(-28deg); }
.arm.right { left: 9.6rem; transform: rotate(28deg); }
.leg { top: 9rem; width: 2.7rem; height: 0.28rem; }
.leg.left { left: 7.2rem; transform: rotate(-50deg); }
.leg.right { left: 9.45rem; transform: rotate(50deg); }

.hangman-stage strong {
  color: #ffe1d8;
  font-size: clamp(1.6rem, 5vw, 3rem);
  letter-spacing: 0.12em;
}

.letters {
  display: grid;
  grid-template-columns: repeat(13, 1fr);
  gap: 0.35rem;
}

.letters button {
  min-height: 2.4rem;
  border: 1px solid rgba(255, 70, 47, 0.14);
  border-radius: 0.55rem;
  background: rgba(255, 65, 43, 0.08);
  color: #ffe1d8;
  cursor: pointer;
  font: inherit;
  font-weight: 780;
}

.letters button:disabled {
  opacity: 0.3;
}

@media (max-width: 700px) {
  .letters { grid-template-columns: repeat(7, 1fr); }
}
</style>
