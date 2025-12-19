import React, { useRef } from 'react'
import { useMainStore } from '@/store'
import type { PPTVideoElement } from '@/types/slides'
import VideoPlayer from './VideoPlayer'
import styles from './index.module.scss'
import useContextMenu from '@/hooks/useContextMenu'
import type { ContextmenuItem } from '@/components/Contextmenu/types'

export interface ElementProps {
  elementInfo: PPTVideoElement;
  selectElement: (
    e: MouseEvent | TouchEvent,
    element: PPTVideoElement,
    canMove?: boolean
  ) => void;
  contextmenus: () => ContextmenuItem[] | null;
}

const VideoElement: React.FC<ElementProps> = ({
  elementInfo,
  selectElement,
  contextmenus,
}) => {
  const element = elementInfo as PPTVideoElement
  const { canvasScale } = useMainStore()
  const contentRef = useRef<HTMLDivElement>(null)

  const handleSelectElement = (
    e: React.MouseEvent | React.TouchEvent,
    canMove = true
  ) => {
    e.stopPropagation()
    selectElement?.(e.nativeEvent, element, canMove)
  }

  /**
   * 绑定右键菜单到内容容器
   */
  useContextMenu(contentRef, () => contextmenus?.() || [])

  return (
    <div
      className={styles.editableElementVideo}
      style={{
        top: element.top + 'px',
        left: element.left + 'px',
        width: element.width + 'px',
        height: element.height + 'px',
      }}
    >
      <div
        className={styles.rotateWrapper}
        style={{ transform: `rotate(${element.rotate}deg)` }}
      >
        <div
          className={styles.elementContent}
          ref={contentRef}
          onMouseDown={(e) => handleSelectElement(e, false)}
          onTouchStart={(e) => handleSelectElement(e, false)}
        >
          <VideoPlayer
            width={element.width}
            height={element.height}
            src={element.src}
            poster={element.poster}
            scale={canvasScale}
          />
          {['t', 'b', 'l', 'r'].map((item) => (
            <div
              key={item}
              className={`${styles.handlerBorder} ${styles[item]}`}
              onMouseDown={(e) => handleSelectElement(e)}
              onTouchStart={(e) => handleSelectElement(e)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default VideoElement
