import debounce from 'lodash/debounce'
import { create } from 'zustand'

interface DeviceStore {
  isMobile: boolean
}

const readDesktopBreakpoint = () => {
  const value = getComputedStyle(document.documentElement).getPropertyValue('--breakpoint-desktop').trim()
  if (!value) {
    throw new Error('--breakpoint-desktop is not defined: keep it in the `@theme static` block of src/index.css')
  }
  return value
}

const checkIsMobile = () => !window.matchMedia(`(min-width: ${readDesktopBreakpoint()})`).matches

export const useDeviceStore = create<DeviceStore>((set) => {
  const handleWindowResize = debounce(() => {
    set({ isMobile: checkIsMobile() })
  }, 200)

  window.addEventListener('resize', handleWindowResize)

  return { isMobile: checkIsMobile() }
})
