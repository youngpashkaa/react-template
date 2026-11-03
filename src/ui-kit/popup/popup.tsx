import { useEffect, useState } from 'react'

import { POPUP_DELAY } from '@constants'

import { PopupLayout, PopupPortal } from './components'
import { PopupProps } from './types'

export const Popup = (props: PopupProps) => {
  const { opened } = props
  const { mounted } = useMountPopup(opened)

  return (
    <PopupPortal>
      <PopupLayout {...props} mounted={mounted} />
    </PopupPortal>
  )
}

function useMountPopup(opened: boolean) {
  const [mounted, setMounted] = useState(false)

  // Mount immediately on open (adjusting state during render, so there's no extra committed frame).
  if (opened && !mounted) {
    setMounted(true)
  }

  // Unmount after the exit animation; the cleanup cancels the timer if the popup reopens meanwhile.
  useEffect(() => {
    if (opened) return

    const timer = setTimeout(() => {
      setMounted(false)
    }, POPUP_DELAY)

    return () => clearTimeout(timer)
  }, [opened])

  return { mounted }
}
