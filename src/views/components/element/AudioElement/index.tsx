import React, { useMemo } from 'react'
import { useMainStore, useSlidesStore } from '@/store'
import type { PPTAudioElement } from '@/types/slides'
import AudioPlayer from './AudioPlayer'
import { ElementProps } from '../types'
import './index.scss'

// Icons
const IconVolumeNotice = () => <svg width="1em" height="1em" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"><path d="M24 6V42C17 42 11.7985 32.8391 11.7985 32.8391H6C4.89543 32.8391 4 31.9437 4 30.8391V17.1609C4 16.0563 4.89543 15.1609 6 15.1609H11.7985C11.7985 15.1609 17 6 24 6Z" fill="currentColor" stroke="none"/><path d="M32 24C32 18.4772 36.4772 14 42 14" strokeLinecap="round"/><path d="M32 24C32 29.5228 36.4772 34 42 34" strokeLinecap="round"/></svg>

const AudioElement: React.FC<ElementProps> = ({ elementInfo, selectElement, contextmenus }) => {
  const element = elementInfo as PPTAudioElement
  const { canvasScale, handleElementId } = useMainStore()
  const { viewportRatio, viewportSize } = useSlidesStore()

  const audioIconSize = useMemo(() => {
    return Math.min(element.width, element.height) + 'px'
  }, [element.width, element.height])

  const audioPlayerPosition = useMemo(() => {
    const canvasWidth = viewportSize
    const canvasHeight = viewportSize * viewportRatio

    const audioWidth = 280 / canvasScale
    const audioHeight = 50 / canvasScale

    const elWidth = element.width
    const elHeight = element.height
    const elLeft = element.left
    const elTop = element.top

    let left = 0
    let top = elHeight
    
    if (elLeft + audioWidth >= canvasWidth) left = elWidth - audioWidth
    if (elTop + elHeight + audioHeight >= canvasHeight) top = -audioHeight

    return {
      left: left + 'px',
      top: top + 'px',
    }
  }, [viewportSize, viewportRatio, canvasScale, element.width, element.height, element.left, element.top])

  const handleSelectElement = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    selectElement?.(e, element)
  }

  return (
    <div 
      className="editable-element-audio"
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
        >
          <div 
            className="audio-icon"
            style={{
              fontSize: audioIconSize,
              color: element.color,
            }}
          >
            <IconVolumeNotice />
          </div>
          
          {handleElementId === element.id && (
            <AudioPlayer
              className="audio-player"
              style={{ ...audioPlayerPosition }}
              src={element.src} 
              loop={element.loop}
              scale={canvasScale}
              onMouseDown={(e) => e.stopPropagation()}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default AudioElement
