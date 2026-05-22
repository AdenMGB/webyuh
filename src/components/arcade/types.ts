import type { Component } from 'vue'

export type ArcadeGameId = 'tetris' | '2048' | 'pong' | 'minesweeper' | 'hook' | 'flappy' | 'hangman' | 'connect4'

export type ArcadeGame = {
  id: ArcadeGameId
  icon: string
  title: string
  description: string
  component: Component
}
