<script setup lang="ts">
import { TresCanvas } from '@tresjs/core'
import { ACESFilmicToneMapping, SRGBColorSpace } from 'three'
import { computed } from 'vue'
import type { PrismProfile } from '../composables/prismCapability'
import PrismScene from './PrismScene.vue'

const props = withDefaults(
  defineProps<{
    profile?: PrismProfile
  }>(),
  { profile: 'full' },
)

const isCompatible = computed(() => props.profile === 'compatible')
const dpr = computed(() => (isCompatible.value ? 1 : ([1, 2] as [number, number])))
</script>

<template>
  <TresCanvas
    clear-color="#101010"
    :clear-alpha="1"
    :alpha="true"
    :antialias="true"
    :dpr="dpr"
    :tone-mapping="ACESFilmicToneMapping"
    :tone-mapping-exposure="1.05"
    :output-color-space="SRGBColorSpace"
    :window-size="true"
  >
    <PrismScene :profile="profile" />
  </TresCanvas>
</template>
