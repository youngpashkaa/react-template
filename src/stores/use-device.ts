import debounce from 'lodash/debounce'
import { create } from 'zustand'

interface DeviceStore {
  isMobile: boolean
}

const readDesktopBreakpoint = () =>
  getComputedStyle(document.documentElement).getPropertyValue('--breakpoint-desktop').trim()

const checkIsMobile = () => !window.matchMedia(`(min-width: ${readDesktopBreakpoint()})`).matches

export const useDeviceStore = create<DeviceStore>((set) => {
  const handleWindowResize = debounce(() => {
    set({ isMobile: checkIsMobile() })
  }, 200)

  window.addEventListener('resize', handleWindowResize)

  return { isMobile: checkIsMobile() }
})
