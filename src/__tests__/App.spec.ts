import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import App from '../App.vue'

describe('App', () => {
  it('renders the AdenMGB homepage', () => {
    const wrapper = mount(App)
    expect(wrapper.text()).toContain('adenmgb')
    expect(wrapper.text()).toContain('Building better tools for students')
    expect(wrapper.text()).toContain('BetterSEQTA+')
    expect(wrapper.text()).toContain('Arcade')
  })
})
