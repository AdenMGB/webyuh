import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import HeroHeadline from '../components/HeroHeadline.vue'

describe('HeroHeadline', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn<() => MediaQueryList>().mockImplementation(
        () =>
          ({
            matches: false,
            addEventListener: vi.fn<() => void>(),
            removeEventListener: vi.fn<() => void>(),
          }) as unknown as MediaQueryList,
      ),
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the kicker and first rotating word', () => {
    const wrapper = mount(HeroHeadline)
    expect(wrapper.text()).toContain('We build')
    expect(wrapper.text()).toContain('BetterSEQTA')
  })

  it('advances to the next word on the interval', async () => {
    const wrapper = mount(HeroHeadline)
    vi.advanceTimersByTime(2800)
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('open tools')
  })
})
