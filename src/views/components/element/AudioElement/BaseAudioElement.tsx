import React from 'react'
import type { PPTAudioElement } from '@/types/slides'
import './BaseAudioElement.scss'

// Icons
const IconVolumeNotice = () => <svg width="1em" height="1em" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"><path d="M24 6V42C17 42 11.7985 32.8391 11.7985 32.8391H6C4.89543 32.8391 4 31.9437 4 30.8391V17.1609C4 16.0563 4.89543 15.1609 6 15.1609H11.7985C11.7985 15.1609 17 6 24 6Z" fill="currentColor" stroke="none"/><path d="M32 24C32 18.4772 36.4772 14 42 14" strokeLinecap="round"/><path d="M32 24C32 29.5228 36.4772 34 42 34" strokeLinecap="round"/></svg>

interface BaseAudioElementProps {
  elementInfo: PPTAudioElement
}

const BaseAudioElement: React.FC<BaseAudioElementProps> = ({ elementInfo }) => {
  return (
    <div 
      className="base-element-audio"
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
          style={{ color: elementInfo.color }}
        >
          <div style={{ fontSize: Math.min(elementInfo.width, elementInfo.height) + 'px' }}>
            <IconVolumeNotice />
          </div>
        </div>
      </div>
    </div>
  )
}

export default BaseAudioElement
