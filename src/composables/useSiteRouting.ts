import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

export type SitePage = 'home' | 'arcade'

function applyPageLayout(page: SitePage) {
  document.body.style.overflow = page === 'arcade' ? 'auto' : 'hidden'
}

export function useSiteRouting(onPageChange?: (page: SitePage) => void) {
  const currentPage = ref<SitePage>('home')

  function syncPage() {
    const page: SitePage = window.location.pathname === '/arcade' ? 'arcade' : 'home'
    currentPage.value = page
    applyPageLayout(page)
    onPageChange?.(page)
  }

  async function navigate(event: MouseEvent, href: string) {
    event.preventDefault()

    if (href === '/arcade') {
      history.pushState({}, '', '/arcade')
      currentPage.value = 'arcade'
      applyPageLayout('arcade')
      onPageChange?.('arcade')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    if (currentPage.value === 'arcade') {
      history.pushState({}, '', '/')
      currentPage.value = 'home'
      applyPageLayout('home')
      onPageChange?.('home')
      await nextTick()
    }

    if (href.startsWith('#')) {
      const target = document.querySelector<HTMLElement>(href)
      target?.scrollIntoView({ behavior: 'smooth' })
    } else if (href === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  onMounted(() => {
    syncPage()
    window.addEventListener('popstate', syncPage)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('popstate', syncPage)
    document.body.style.overflow = ''
  })

  return { currentPage, navigate }
}
