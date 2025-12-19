import React, { useMemo } from 'react'
import type { PPTAudioElement } from '@/types/slides'
import './BaseAudioElement.scss'
import { VolumeNotice } from '@icon-park/react'

interface BaseAudioElementProps {
  elementInfo: PPTAudioElement;
}

const BaseAudioElement: React.FC<BaseAudioElementProps> = ({ elementInfo }) => {
  const audioIconSize = useMemo(() => {
    return Math.min(elementInfo.width, elementInfo.height) + 'px'
  }, [elementInfo.width, elementInfo.height])
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
        <div className="element-content" style={{ color: elementInfo.color }}>
          <VolumeNotice
            className="audio-icon"
            style={{
              fontSize: audioIconSize,
              color: elementInfo.color,
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default BaseAudioElement
