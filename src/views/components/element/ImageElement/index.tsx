import React, { useMemo } from 'react'
import { useMainStore, useSlidesStore } from '@/store'
import type { ImageElementClip, PPTImageElement } from '@/types/slides'
import type { ImageClipedEmitData } from '@/types/edit'
import type { ContextmenuItem } from '@/components/Contextmenu/types'
import useElementShadow from '@/views/components/element/hooks/useElementShadow'
import useElementFlip from '@/views/components/element/hooks/useElementFlip'
import useHistorySnapshot from '@/hooks/useHistorySnapshot'
import useClipImage from './useClipImage'
import useFilter from './useFilter'

import ImageOutline from './ImageOutline'
import ImageClipHandler from './ImageClipHandler'
import { ElementProps } from '../types'
import './index.scss'

const ImageElement: React.FC<ElementProps> = ({ elementInfo, selectElement, contextmenus }) => {
  const element = elementInfo as PPTImageElement
  const { clipingImageElementId, setClipingImageElementId } = useMainStore()
  const { updateElement } = useSlidesStore()
  const { addHistorySnapshot } = useHistorySnapshot()

  const isCliping = useMemo(() => clipingImageElementId === element.id, [clipingImageElementId, element.id])

  const { shadowStyle } = useElementShadow(element.shadow)
  const { flipStyle } = useElementFlip(element.flipH, element.flipV)
  const { clipShape, imgPosition } = useClipImage(element)
  const { filter } = useFilter(element.filters)

  const handleSelectElement = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    selectElement?.(e, element)
  }

  const handleClip = (data: ImageClipedEmitData | null) => {
    setClipingImageElementId('')
    
    if (!data) return

    const { range, position } = data
    const originClip: ImageElementClip = element.clip || { shape: 'rect', range: [[0, 0], [100, 100]] }

    const left = element.left + position.left
    const top = element.top + position.top
    const width = element.width + position.width
    const height = element.height + position.height

    let centerOffsetX = 0
    let centerOffsetY = 0

    if (element.rotate) {
      const centerX = (left + width / 2) - (element.left + element.width / 2)
      const centerY = -((top + height / 2) - (element.top + element.height / 2))

      const radian = -element.rotate * Math.PI / 180

      const rotatedCenterX = centerX * Math.cos(radian) - centerY * Math.sin(radian)
      const rotatedCenterY = centerX * Math.sin(radian) + centerY * Math.cos(radian)

      centerOffsetX = rotatedCenterX - centerX
      centerOffsetY = -(rotatedCenterY - centerY)
    }

    const _props = {
      clip: { ...originClip, range },
      left: left + centerOffsetX,
      top: top + centerOffsetY,
      width,
      height,
    }
    updateElement({ id: element.id, props: _props })
    
    addHistorySnapshot()
  }

  return (
    <div 
      className="editable-element-image"
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
        {isCliping ? (
          <ImageClipHandler
            src={element.src}
            clipData={element.clip}
            width={element.width}
            height={element.height}
            top={element.top}
            left={element.left}
            rotate={element.rotate}
            clipPath={clipShape.style}
            onClip={handleClip}
          />
        ) : (
          <div 
            className="element-content"
            style={{
              filter: shadowStyle ? `drop-shadow(${shadowStyle})` : '',
              transform: flipStyle,
            }}
            // v-contextmenu="contextmenus" // TODO: Implement context menu hook
            onMouseDown={handleSelectElement}
            onTouchStart={handleSelectElement}
          >
            <ImageOutline elementInfo={element} />

            <div className="image-content" style={{ clipPath: clipShape.style }}>
              <img 
                src={element.src} 
                draggable={false} 
                style={{
                  top: imgPosition.top,
                  left: imgPosition.left,
                  width: imgPosition.width,
                  height: imgPosition.height,
                  filter: filter,
                }} 
                onDragStart={(e) => e.preventDefault()}
                alt=""
              />
              {element.colorMask && (
                <div 
                  className="color-mask"
                  style={{
                    backgroundColor: element.colorMask,
                  }}
                ></div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ImageElement
