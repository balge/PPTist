import React from 'react'
import type { PPTVideoElement } from '@/types/slides'
import './BaseVideoElement.scss'
import { PlayOne } from '@icon-park/react'

interface BaseVideoElementProps {
  elementInfo: PPTVideoElement;
}

const BaseVideoElement: React.FC<BaseVideoElementProps> = ({ elementInfo }) => {
  return (
    <div
      className="base-element-video"
      style={{
        top: elementInfo.top + 'px',
        left: elementInfo.left + 'px',
        width: elementInfo.width + 'px',
        height: elementInfo.height + 'px',
      }}
    >
      <div
        className="rotate-wrapper"
        style={{ transform: `rotate(${elementInfo.rotate}deg)` }}
      >
        <div
          className="element-content"
          style={{
            backgroundImage: elementInfo.poster
              ? `url(${elementInfo.poster})`
              : '',
          }}
        >
          <div className="icon">
            <PlayOne />
          </div>
        </div>
      </div>
    </div>
  )
}

export default BaseVideoElement
