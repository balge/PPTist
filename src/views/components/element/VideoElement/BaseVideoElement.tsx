import React from 'react'
import type { PPTVideoElement } from '@/types/slides'
import './BaseVideoElement.scss'

// Simple IconPlayOne component since we are using it here too
const IconPlayOne = () => <svg width="1em" height="1em" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"><path d="M15 24V11.8756L25.5 17.9378L36 24L25.5 30.0622L15 36.1244V24Z" fill="currentColor" stroke="none"/></svg>

interface BaseVideoElementProps {
  elementInfo: PPTVideoElement
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
          style={{ backgroundImage: elementInfo.poster ? `url(${elementInfo.poster})` : '' }}
        >
          <div className="icon">
            <IconPlayOne />
          </div>
        </div>
      </div>
    </div>
  )
}

export default BaseVideoElement
