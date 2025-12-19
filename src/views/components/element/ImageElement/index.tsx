import React, { useMemo, useRef } from 'react'
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
import './index.scss'
import useContextMenu from '@/hooks/useContextMenu'

export interface ElementProps {
  elementInfo: PPTImageElement;
  selectElement: (
    e: MouseEvent | TouchEvent,
    element: PPTImageElement,
    canMove?: boolean
  ) => void;
  contextmenus: () => ContextmenuItem[] | null;
}

const ImageElement: React.FC<ElementProps> = ({
  elementInfo,
  selectElement,
  contextmenus,
}) => {
  const contentRef = useRef<HTMLDivElement>(null)
  const { clipingImageElementId, setClipingImageElementId } = useMainStore()
  const { updateElement } = useSlidesStore()
  const { addHistorySnapshot } = useHistorySnapshot()

  const isCliping = useMemo(
    () => clipingImageElementId === elementInfo.id,
    [clipingImageElementId, elementInfo.id]
  )

  const { shadowStyle } = useElementShadow(elementInfo.shadow)
  const { flipStyle } = useElementFlip(elementInfo.flipH, elementInfo.flipV)
  const { clipShape, imgPosition } = useClipImage(elementInfo)
  const { filter } = useFilter(elementInfo.filters)

  const handleSelectElement = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    selectElement?.(e.nativeEvent, elementInfo)
  }

  const handleClip = (data: ImageClipedEmitData | null) => {
    setClipingImageElementId('')

    if (!data) return

    const { range, position } = data
    const originClip: ImageElementClip = elementInfo.clip || {
      shape: 'rect',
      range: [
        [0, 0],
        [100, 100],
      ],
    }

    const left = elementInfo.left + position.left
    const top = elementInfo.top + position.top
    const width = elementInfo.width + position.width
    const height = elementInfo.height + position.height

    let centerOffsetX = 0
    let centerOffsetY = 0

    if (elementInfo.rotate) {
      const centerX =
        left + width / 2 - (elementInfo.left + elementInfo.width / 2)
      const centerY = -(
        top +
        height / 2 -
        (elementInfo.top + elementInfo.height / 2)
      )

      const radian = (-elementInfo.rotate * Math.PI) / 180

      const rotatedCenterX =
        centerX * Math.cos(radian) - centerY * Math.sin(radian)
      const rotatedCenterY =
        centerX * Math.sin(radian) + centerY * Math.cos(radian)

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
    updateElement({ id: elementInfo.id, props: _props })

    addHistorySnapshot()
  }

  /**
   * 绑定右键菜单到内容容器
   */
  useContextMenu(contentRef, () => contextmenus?.() || [])

  return (
    <div
      className="editable-element-image"
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
        {isCliping ? (
          <ImageClipHandler
            src={elementInfo.src}
            clipData={elementInfo.clip}
            width={elementInfo.width}
            height={elementInfo.height}
            top={elementInfo.top}
            left={elementInfo.left}
            rotate={elementInfo.rotate}
            clipPath={clipShape.style}
            onClip={(range) => handleClip(range)}
          />
        ) : (
          <div
            ref={contentRef}
            className="element-content"
            style={{
              filter: shadowStyle ? `drop-shadow(${shadowStyle})` : '',
              transform: flipStyle,
            }}
            onMouseDown={handleSelectElement}
            onTouchStart={handleSelectElement}
          >
            <ImageOutline elementInfo={elementInfo} />

            <div
              className="image-content"
              style={{ clipPath: clipShape.style }}
            >
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
                onDragStart={(e) => e.preventDefault()}
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
        )}
      </div>
    </div>
  )
}

export default ImageElement
