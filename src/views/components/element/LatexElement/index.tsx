import React, { useRef } from 'react'
import type { PPTLatexElement } from '@/types/slides'
import emitter, { EmitterEvents } from '@/utils/emitter'
import styles from './index.module.scss'
import type { ContextmenuItem } from '@/components/Contextmenu/types'
import useContextMenu from '@/hooks/useContextMenu'

export interface ElementProps {
  elementInfo: PPTLatexElement;
  selectElement: (
    e: MouseEvent | TouchEvent,
    element: PPTLatexElement,
    canMove?: boolean
  ) => void;
  contextmenus: () => ContextmenuItem[] | null;
}

const LatexElement: React.FC<ElementProps> = ({
  elementInfo,
  selectElement,
  contextmenus,
}) => {
  const contentRef = useRef<HTMLDivElement>(null)

  const handleSelectElement = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    selectElement?.(e.nativeEvent, elementInfo)
  }

  const openLatexEditor = () => {
    emitter.emit(EmitterEvents.OPEN_LATEX_EDITOR)
  }

  /**
   * 绑定右键菜单到内容容器
   */
  useContextMenu(contentRef, () => contextmenus?.() || [])

  return (
    <div
      className={styles.editableElementLatex}
      style={{
        top: elementInfo.top + 'px',
        left: elementInfo.left + 'px',
        width: elementInfo.width + 'px',
        height: elementInfo.height + 'px',
      }}
    >
      <div
        className={styles.rotateWrapper}
        style={{ transform: `rotate(${elementInfo.rotate}deg)` }}
      >
        <div
          ref={contentRef}
          className={styles.elementContent}
          onMouseDown={handleSelectElement}
          onTouchStart={handleSelectElement}
          onDoubleClick={openLatexEditor}
        >
          <svg
            overflow="visible"
            width={elementInfo.width}
            height={elementInfo.height}
            stroke={elementInfo.color}
            strokeWidth={elementInfo.strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <g
              transform={`scale(${
                elementInfo.width / elementInfo.viewBox[0]
              }, ${
                elementInfo.height / elementInfo.viewBox[1]
              }) translate(0,0) matrix(1,0,0,1,0,0)`}
            >
              <path d={elementInfo.path}></path>
            </g>
          </svg>
        </div>
      </div>
    </div>
  )
}

export default LatexElement
