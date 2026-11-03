import { FC, useEffect, useRef } from 'react'

import { clearAllBodyScrollLocks } from 'body-scroll-lock'
import { CSSTransition } from 'react-transition-group'

import { POPUP_DELAY } from '@constants'
import { PopupProps } from '@ui-kit'

import * as S from './styled-components'

export const PopupLayout: FC<PopupProps> = ({ onClose, opened, children, mounted, ...rest }) => {
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const root = document.getElementById('root')
    if (!root || !opened) return

    root.style.overflow = 'hidden'

    return () => {
      clearAllBodyScrollLocks()
      root.style.overflow = ''
    }
  }, [opened])

  return (
    <S.PopupLayout $mounted={mounted}>
      <CSSTransition in={opened} appear nodeRef={overlayRef} timeout={POPUP_DELAY} classNames={S.overlayAnimation}>
        <S.PopupOverlay ref={overlayRef} onClick={onClose} />
      </CSSTransition>
      <CSSTransition in={opened} appear nodeRef={contentRef} timeout={POPUP_DELAY} classNames={S.contentAnimation}>
        <S.PopupContainer {...rest} ref={contentRef}>
          {children}
          <S.PopupClose onClick={onClose} />
        </S.PopupContainer>
      </CSSTransition>
    </S.PopupLayout>
  )
}
