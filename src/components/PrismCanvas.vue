<script setup lang="ts">
import { TresCanvas } from '@tresjs/core'
import { ACESFilmicToneMapping, SRGBColorSpace } from 'three'
import PrismScene from './PrismScene.vue'
</script>

<template>
  <TresCanvas
    clear-color="#101010"
    :clear-alpha="1"
    :alpha="true"
    :antialias="true"
    :dpr="[1, 1.5]"
    :tone-mapping="ACESFilmicToneMapping"
    :tone-mapping-exposure="1.05"
    :output-color-space="SRGBColorSpace"
    :window-size="true"
  >
    <PrismScene />
  </TresCanvas>
</template>
