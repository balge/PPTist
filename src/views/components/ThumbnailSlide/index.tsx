import React, { useMemo } from 'react'
import { useSlidesStore } from '@/store'
import type { Slide } from '@/types/slides'
import useSlideBackgroundStyle from '@/hooks/useSlideBackgroundStyle'
import ThumbnailElement from './ThumbnailElement'
import './index.scss'

interface ThumbnailSlideProps {
  slide: Slide
  size: number
  visible?: boolean
}

const ThumbnailSlide: React.FC<ThumbnailSlideProps> = ({ slide, size, visible = true }) => {
  const { viewportRatio, viewportSize } = useSlidesStore()

  const { backgroundStyle } = useSlideBackgroundStyle(slide.background)

  const scale = useMemo(() => size / viewportSize, [size, viewportSize])

  return (
    <div 
      className="thumbnail-slide"
      style={{
        width: size,
        height: size * viewportRatio,
      }}
    >
      {visible ? (
        <div 
          className="elements"
          style={{
            width: viewportSize,
            height: viewportSize * viewportRatio,
            transform: `scale(${scale})`,
          }}
        >
          <div className="background" style={backgroundStyle}></div>
          {slide.elements.map((element, index) => (
            <ThumbnailElement
              key={element.id}
              elementInfo={element}
              elementIndex={index + 1}
            />
          ))}
        </div>
      ) : (
        <div className="placeholder">加载中 ...</div>
      )}
    </div>
  )
}

export default ThumbnailSlide
