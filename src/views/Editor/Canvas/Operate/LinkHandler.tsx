import React, { useMemo } from 'react'
import { useMainStore, useSlidesStore } from '@/store'
import type { PPTElement, PPTElementLink } from '@/types/slides'
import useLink from '@/hooks/useLink'
import Divider from '@/components/Divider'
import './LinkHandler.scss'

interface LinkHandlerProps {
  elementInfo: PPTElement
  link: PPTElementLink
  openLinkDialog?: () => void
}

const LinkHandler: React.FC<LinkHandlerProps> = ({ elementInfo, link, openLinkDialog }) => {
  const { canvasScale, setActiveElementIdList } = useMainStore()
  const { slides, updateSlideIndex } = useSlidesStore()
  const { removeLink } = useLink()

  const height = useMemo(() => 'height' in elementInfo ? elementInfo.height : 0, [elementInfo])

  const turnTarget = (slideId: string) => {
    const targetIndex = slides.findIndex(item => item.id === slideId)
    if (targetIndex !== -1) {
      setActiveElementIdList([])
      updateSlideIndex(targetIndex)
    }
  }

  return (
    <div 
      className="link-handler"
      style={{ top: height * canvasScale + 10 + 'px' }}
    >
      {link.type === 'web' ? (
        <a className="link" href={link.target} target="_blank" rel="noreferrer">{link.target}</a>
      ) : (
        <a className="link" onClick={() => turnTarget(link.target)}>幻灯片页面 {link.target}</a>
      )}
      
      <div className="btns">
        <div className="btn" onClick={() => openLinkDialog?.()}>更换</div>
        <Divider type="vertical" />
        <div className="btn" onClick={() => removeLink(elementInfo)}>移除</div>
      </div>
    </div>
  )
}

export default LinkHandler
