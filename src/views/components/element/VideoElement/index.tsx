import React from 'react'
import { useMainStore } from '@/store'
import type { PPTVideoElement } from '@/types/slides'
import VideoPlayer from './VideoPlayer'
import { ElementProps } from '../types'
import './index.scss'

const VideoElement: React.FC<ElementProps> = ({ elementInfo, selectElement, contextmenus }) => {
  const element = elementInfo as PPTVideoElement
  const { canvasScale } = useMainStore()

  const handleSelectElement = (e: React.MouseEvent | React.TouchEvent, canMove = true) => {
    e.stopPropagation()
    selectElement?.(e, element, canMove)
  }

  return (
    <div 
      className="editable-element-video"
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
          {['t', 'b', 'l', 'r'].map(item => (
            <div 
              key={item}
              className={`handler-border ${item}`}
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
