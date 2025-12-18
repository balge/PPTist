import React from 'react'
import type { PPTImageElement } from '@/types/slides'
import useElementShadow from '@/views/components/element/hooks/useElementShadow'
import useElementFlip from '@/views/components/element/hooks/useElementFlip'
import useClipImage from './useClipImage'
import useFilter from './useFilter'

import ImageOutline from './ImageOutline'
import './BaseImageElement.scss'

interface BaseImageElementProps {
  elementInfo: PPTImageElement
}

const BaseImageElement: React.FC<BaseImageElementProps> = ({ elementInfo }) => {
  const { shadowStyle } = useElementShadow(elementInfo.shadow)
  const { flipStyle } = useElementFlip(elementInfo.flipH, elementInfo.flipV)
  const { clipShape, imgPosition } = useClipImage(elementInfo)
  const { filter } = useFilter(elementInfo.filters)

  return (
    <div 
      className="base-element-image"
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
            filter: shadowStyle ? `drop-shadow(${shadowStyle})` : '',
            transform: flipStyle,
          }}
        >
          <ImageOutline elementInfo={elementInfo} />

          <div className="image-content" style={{ clipPath: clipShape.style }}>
            <img 
              src={elementInfo.src} 
              draggable={false} 
              style={{
                top: imgPosition.top,
                left: imgPosition.left,
                width: imgPosition.width,
                height: imgPosition.height,
                filter: filter,
              }} 
              alt=""
            />
            {elementInfo.colorMask && (
              <div 
                className="color-mask"
                style={{
                  backgroundColor: elementInfo.colorMask,
                }}
              ></div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BaseImageElement
