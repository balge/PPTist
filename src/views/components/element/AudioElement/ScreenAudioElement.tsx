import React, { useMemo, useRef } from 'react'
import { useSlidesStore } from '@/store'
import type { PPTAudioElement } from '@/types/slides'
import AudioPlayer, { AudioPlayerRef } from './AudioPlayer'
import './ScreenAudioElement.scss'

// Icons
const IconVolumeNotice = ({ className, style, onClick }: any) => <svg onClick={onClick} className={className} style={style} width="1em" height="1em" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"><path d="M24 6V42C17 42 11.7985 32.8391 11.7985 32.8391H6C4.89543 32.8391 4 31.9437 4 30.8391V17.1609C4 16.0563 4.89543 15.1609 6 15.1609H11.7985C11.7985 15.1609 17 6 24 6Z" fill="currentColor" stroke="none"/><path d="M32 24C32 18.4772 36.4772 14 42 14" strokeLinecap="round"/><path d="M32 24C32 29.5228 36.4772 34 42 34" strokeLinecap="round"/></svg>

interface ScreenAudioElementProps {
  elementInfo: PPTAudioElement
  scale?: number
  slideId?: string
}

const ScreenAudioElement: React.FC<ScreenAudioElementProps> = ({ elementInfo, scale = 1, slideId }) => {
  const { currentSlide, viewportRatio, viewportSize } = useSlidesStore()
  const audioPlayerRef = useRef<AudioPlayerRef>(null)

  const inCurrentSlide = !slideId || currentSlide?.id === slideId

  const audioIconSize = useMemo(() => {
    return Math.min(elementInfo.width, elementInfo.height) + 'px'
  }, [elementInfo.width, elementInfo.height])

  const audioPlayerPosition = useMemo(() => {
    const canvasWidth = viewportSize
    const canvasHeight = viewportSize * viewportRatio

    const audioWidth = 280 / scale
    const audioHeight = 50 / scale

    const elWidth = elementInfo.width
    const elHeight = elementInfo.height
    const elLeft = elementInfo.left
    const elTop = elementInfo.top

    let left = 0
    let top = elHeight
    
    if (elLeft + audioWidth >= canvasWidth) left = elWidth - audioWidth
    if (elTop + elHeight + audioHeight >= canvasHeight) top = -audioHeight

    return {
      left: left + 'px',
      top: top + 'px',
    }
  }, [viewportSize, viewportRatio, scale, elementInfo])

  const toggle = () => {
    audioPlayerRef.current?.toggle()
  }

  if (!inCurrentSlide) return null

  return (
    <div 
      className="base-element-audio screen-element-audio"
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
        <div className="element-content">
          <IconVolumeNotice 
            className="audio-icon" 
            style={{
              fontSize: audioIconSize,
              color: elementInfo.color,
            }}
            onClick={toggle}
          />
          <AudioPlayer
            ref={audioPlayerRef}
            className="audio-player"
            style={{ ...audioPlayerPosition }}
            src={elementInfo.src} 
            loop={elementInfo.loop}
            autoplay={elementInfo.autoplay}
            scale={scale}
          />
        </div>
      </div>
    </div>
  )
}

export default ScreenAudioElement
