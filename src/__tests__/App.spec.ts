import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import App from '../App.vue'

describe('App', () => {
  it('renders the AdenMGB portfolio', () => {
    const wrapper = mount(App)
    expect(wrapper.text()).toContain('AdenMGB')
    expect(wrapper.text()).toContain('GitHub')
    expect(wrapper.text()).toContain('aden@adenmgb.com')
  })
})
