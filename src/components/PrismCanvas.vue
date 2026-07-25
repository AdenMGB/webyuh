<script setup lang="ts">
import { TresCanvas } from '@tresjs/core'
import { ACESFilmicToneMapping, SRGBColorSpace } from 'three'
import { computed } from 'vue'
import type { PrismQuality } from '../composables/prismCapability'
import PrismScene from './PrismScene.vue'

const props = withDefaults(
  defineProps<{
    quality?: PrismQuality
  }>(),
  { quality: 'high' },
)

const isLow = computed(() => props.quality === 'low')
const dpr = computed(() => (isLow.value ? 1 : ([1, 1.5] as [number, number])))
</script>

<template>
  <TresCanvas
    clear-color="#101010"
    :clear-alpha="1"
    :alpha="true"
    :antialias="!isLow"
    :dpr="dpr"
    :tone-mapping="ACESFilmicToneMapping"
    :tone-mapping-exposure="1.05"
    :output-color-space="SRGBColorSpace"
    :window-size="true"
  >
    <PrismScene :quality="quality" />
  </TresCanvas>
</template>
