import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import App from '../App.vue'

describe('App', () => {
  it('renders the retro AdenMGB homepage', () => {
    const wrapper = mount(App)
    expect(wrapper.text()).toContain('Welcome To My Website')
    expect(wrapper.text()).toContain('AdenMGB')
    expect(wrapper.text()).toContain('My GitHub')
    expect(wrapper.text()).toContain('My Arcade')
  })
})
