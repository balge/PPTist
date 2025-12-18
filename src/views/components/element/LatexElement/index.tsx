import React from 'react'
import type { PPTLatexElement } from '@/types/slides'
import emitter, { EmitterEvents } from '@/utils/emitter'
import { ElementProps } from '../types'
import './index.scss'

const LatexElement: React.FC<ElementProps> = ({ elementInfo, selectElement, contextmenus }) => {
  const element = elementInfo as PPTLatexElement

  const handleSelectElement = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    selectElement?.(e, element)
  }

  const openLatexEditor = () => {
    emitter.emit(EmitterEvents.OPEN_LATEX_EDITOR)
  }

  return (
    <div 
      className="editable-element-latex"
      style={{
        top: element.top + 'px',
        left: element.left + 'px',
        width: element.width + 'px',
        height: element.height + 'px',
      }}
    >
      <div
        className="rotate-wrapper"
        style={{ transform: `rotate(${element.rotate}deg)` }}
      >
        <div 
          className="element-content" 
          // v-contextmenu="contextmenus"
          onMouseDown={handleSelectElement}
          onTouchStart={handleSelectElement}
          onDoubleClick={openLatexEditor}
        >
          <svg 
            overflow="visible" 
            width={element.width}
            height={element.height}
            stroke={element.color} 
            strokeWidth={element.strokeWidth} 
            fill="none" 
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <g 
              transform={`scale(${element.width / element.viewBox[0]}, ${element.height / element.viewBox[1]}) translate(0,0) matrix(1,0,0,1,0,0)`}
            >
              <path d={element.path}></path>
            </g>
          </svg>
        </div>
      </div>
    </div>
  )
}

export default LatexElement
