import React from 'react'
import { useSlidesStore } from '@/store'
import type { PPTVideoElement } from '@/types/slides'
import VideoPlayer from './VideoPlayer'
import styles from './ScreenVideoElement.module.scss'

interface ScreenVideoElementProps {
  elementInfo: PPTVideoElement
  scale?: number
  slideId?: string
}

const ScreenVideoElement: React.FC<ScreenVideoElementProps> = ({ elementInfo, scale = 1, slideId }) => {
  const { currentSlide } = useSlidesStore()
  
  const inCurrentSlide = !slideId || currentSlide?.id === slideId

  if (!inCurrentSlide) return null

  return (
    <div 
      className={styles.screenElementVideo}
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
        <div className={styles.elementContent}>
          <VideoPlayer
            width={elementInfo.width}
            height={elementInfo.height}
            src={elementInfo.src} 
            poster={elementInfo.poster}  
            autoplay={elementInfo.autoplay}
            scale={scale} 
          />
        </div>
      </div>
    </div>
  )
}

export default ScreenVideoElement
