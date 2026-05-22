<script setup lang="ts">
import { computed, ref } from 'vue'
import TetrisGame from './arcade/TetrisGame.vue'
import TwentyFortyEightGame from './arcade/TwentyFortyEightGame.vue'
import PongGame from './arcade/PongGame.vue'
import MinesweeperGame from './arcade/MinesweeperGame.vue'
import StickmanHookGame from './arcade/StickmanHookGame.vue'
import FlappyBirdGame from './arcade/FlappyBirdGame.vue'
import HangmanGame from './arcade/HangmanGame.vue'
import ConnectFourGame from './arcade/ConnectFourGame.vue'
import type { ArcadeGame, ArcadeGameId } from './arcade/types'

const games: ArcadeGame[] = [
  {
    id: 'tetris',
    icon: '🧱',
    title: 'Tetris',
    description: 'Stack falling tetrominoes, clear rows, and survive rising speed levels.',
    component: TetrisGame,
  },
  {
    id: '2048',
    icon: '🔢',
    title: '2048',
    description: 'Slide matching tiles, chain merges, and chase the 2048 tile.',
    component: TwentyFortyEightGame,
  },
  {
    id: 'pong',
    icon: '🏓',
    title: 'Pong',
    description: 'Classic paddle duel with spin, rallies, and first-to-seven scoring.',
    component: PongGame,
  },
  {
    id: 'minesweeper',
    icon: '💣',
    title: 'Minesweeper',
    description: 'Clear the field, flag bombs, and use number clues to stay alive.',
    component: MinesweeperGame,
  },
  {
    id: 'hook',
    icon: '🪝',
    title: 'Stickman Hook',
    description: 'Swing through anchors with momentum and land past the finish line.',
    component: StickmanHookGame,
  },
  {
    id: 'flappy',
    icon: '🐦',
    title: 'Flappy Bird',
    description: 'Tap through pipe gaps, manage gravity, and build a clean streak.',
    component: FlappyBirdGame,
  },
  {
    id: 'hangman',
    icon: '🧍',
    title: 'Hangman',
    description: 'Guess developer-themed words before the stickman is complete.',
    component: HangmanGame,
  },
  {
    id: 'connect4',
    icon: '🔵',
    title: 'Connect 4',
    description: 'Drop red discs against the CPU and connect four before it does.',
    component: ConnectFourGame,
  },
]

const fallbackGame = games[0]!
const selectedId = ref<ArcadeGameId>('tetris')
const selectedGame = computed<ArcadeGame>(() => games.find((game) => game.id === selectedId.value) ?? fallbackGame)
</script>

<template>
  <main class="arcade-page">
    <section class="arcade-hero">
      <p class="eyebrow">Redline arcade</p>
      <h1 class="arcade-title">Arcade</h1>
      <p class="lead">A collection of playable browser games, built into the site with a black and red arcade cabinet feel.</p>
    </section>

    <section class="arcade-catalog" aria-label="Arcade game selection">
      <button
        v-for="game in games"
        :key="game.id"
        type="button"
        class="arcade-tile"
        :class="{ 'is-active': game.id === selectedId }"
        @click="selectedId = game.id"
      >
        <span class="arcade-icon">{{ game.icon }}</span>
        <strong>{{ game.title }}</strong>
        <small>Play Now</small>
      </button>
    </section>

    <section class="arcade-stage" :aria-label="`${selectedGame.title} game`">
      <div class="arcade-stage-copy">
        <span>{{ selectedGame.icon }}</span>
        <div>
          <p class="eyebrow">Now playing</p>
          <h2>{{ selectedGame.title }}</h2>
          <p>{{ selectedGame.description }}</p>
        </div>
      </div>

      <component :is="selectedGame.component" :key="selectedGame.id" />
    </section>
  </main>
</template>

<style scoped>
.arcade-page {
  width: min(1240px, calc(100% - 2rem));
  margin: 0 auto;
  padding: 10rem 0 7rem;
}

.arcade-hero {
  max-width: 980px;
  margin: 0 auto 4rem;
  text-align: center;
}

.arcade-title {
  margin: 0 0 1.3rem;
  background: linear-gradient(105deg, #f1c8be 8%, #ff3a25 46%, #85000a 78%);
  background-clip: text;
  font-size: clamp(4.2rem, 13vw, 11rem);
  line-height: 0.9;
  letter-spacing: -0.09em;
  text-shadow: 0 1rem 5rem rgba(255, 40, 24, 0.24);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.lead,
.arcade-stage-copy p:not(.eyebrow) {
  color: rgba(245, 245, 247, 0.68);
  font-size: clamp(1.1rem, 2vw, 1.45rem);
  line-height: 1.5;
}

.eyebrow {
  margin: 0 0 0.8rem;
  color: rgba(245, 245, 247, 0.62);
  font-size: 0.86rem;
  font-weight: 780;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.arcade-catalog {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.85rem;
  margin-bottom: 1.2rem;
}

.arcade-tile {
  display: grid;
  gap: 0.55rem;
  min-height: 10rem;
  padding: 1.1rem;
  border: 1px solid rgba(255, 70, 47, 0.12);
  border-radius: 1.55rem;
  background:
    radial-gradient(circle at 50% 0%, rgba(255, 45, 29, 0.16), transparent 70%),
    linear-gradient(180deg, rgba(255, 65, 43, 0.08), rgba(0, 0, 0, 0.26));
  color: #f5f5f7;
  cursor: pointer;
  font: inherit;
  text-align: left;
  transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1), border-color 260ms cubic-bezier(0.22, 1, 0.36, 1), background 260ms cubic-bezier(0.22, 1, 0.36, 1);
}

.arcade-tile:hover,
.arcade-tile.is-active {
  border-color: rgba(255, 91, 62, 0.34);
  background:
    radial-gradient(circle at 50% 0%, rgba(255, 45, 29, 0.26), transparent 70%),
    linear-gradient(180deg, rgba(255, 65, 43, 0.14), rgba(0, 0, 0, 0.28));
  transform: translateY(-3px);
}

.arcade-icon {
  font-size: 2.4rem;
}

.arcade-tile strong {
  font-size: clamp(1.25rem, 2.4vw, 1.8rem);
  line-height: 1;
  letter-spacing: -0.05em;
}

.arcade-tile small {
  color: #ffb3a2;
  font-weight: 760;
}

.arcade-stage {
  display: grid;
  gap: 1rem;
  padding: clamp(1rem, 2vw, 1.4rem);
  border: 1px solid rgba(255, 70, 47, 0.13);
  border-radius: 2rem;
  background:
    radial-gradient(circle at 18% 0%, rgba(255, 45, 29, 0.16), transparent 27rem),
    linear-gradient(145deg, rgba(18, 4, 4, 0.78), rgba(0, 0, 0, 0.6));
  box-shadow: inset 0 1px 0 rgba(255, 96, 70, 0.08), 0 2rem 7rem rgba(0, 0, 0, 0.42);
  backdrop-filter: blur(24px) saturate(1.18);
}

.arcade-stage-copy {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 0.4rem 0.4rem 0.8rem;
}

.arcade-stage-copy > span {
  font-size: 3rem;
}

.arcade-stage-copy h2 {
  margin: 0 0 0.45rem;
  font-size: clamp(2rem, 4.5vw, 4.4rem);
  line-height: 0.9;
  letter-spacing: -0.07em;
}

.arcade-stage-copy p {
  margin-top: 0;
}

@media (max-width: 820px) {
  .arcade-page {
    width: min(100% - 1rem, 1240px);
    padding: 6rem 0 5.5rem;
  }

  .arcade-catalog {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .arcade-tile {
    min-height: 8.5rem;
  }

  .arcade-stage {
    border-radius: 1.4rem;
  }
}

@media (max-width: 480px) {
  .arcade-catalog {
    grid-template-columns: 1fr;
  }
}
</style>
