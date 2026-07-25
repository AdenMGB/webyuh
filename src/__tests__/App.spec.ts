import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import App from '../App.vue'

const mountOptions = {
  global: {
    stubs: {
      PrismArtifact: true,
      AtmosphereField: true,
      SoftCursor: true,
      PageIntro: true,
    },
  },
}

describe('App', () => {
  it('renders AdenMGB brand and BetterSEQTA content', () => {
    const wrapper = mount(App, {
      ...mountOptions,
      global: {
        ...mountOptions.global,
        stubs: {
          ...mountOptions.global.stubs,
          HeroHeadline: {
            template: '<h1>We build BetterSEQTA AdenMGB</h1>',
          },
        },
      },
    })
    expect(wrapper.text()).toContain('AdenMGB')
    expect(wrapper.text()).toContain('BetterSEQTA')
    expect(wrapper.find('a[href="https://betterseqta.org/"]').exists()).toBe(true)
  })

  it('exposes about and contact navigation', () => {
    const wrapper = mount(App, mountOptions)
    expect(wrapper.find('a[href="#about"]').exists()).toBe(true)
    expect(wrapper.find('a[href="#contact"]').exists()).toBe(true)
  })
})
