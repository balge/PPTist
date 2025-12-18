import React, { useMemo } from 'react'
import { ElementTypes, type PPTElement } from '@/types/slides'
import {
  ImageElement,
  TextElement,
  ShapeElement,
  PlaceholderElement,
} from '@/views/components/element'

interface ThumbnailElementProps {
  elementInfo: PPTElement
  elementIndex: number
}

const ThumbnailElement: React.FC<ThumbnailElementProps> = ({ elementInfo, elementIndex }) => {
  const CurrentElementComponent = useMemo(() => {
    const elementTypeMap = {
      [ElementTypes.IMAGE]: ImageElement,
      [ElementTypes.TEXT]: TextElement,
      [ElementTypes.SHAPE]: ShapeElement,
      [ElementTypes.LINE]: PlaceholderElement,
      [ElementTypes.CHART]: PlaceholderElement,
      [ElementTypes.TABLE]: PlaceholderElement,
      [ElementTypes.LATEX]: PlaceholderElement,
      [ElementTypes.VIDEO]: PlaceholderElement,
      [ElementTypes.AUDIO]: PlaceholderElement,
    }
    return elementTypeMap[elementInfo.type] || PlaceholderElement
  }, [elementInfo.type])

  const rotate = 'rotate' in elementInfo ? elementInfo.rotate : 0
  const height = 'height' in elementInfo ? elementInfo.height : 0

  return (
    <div
      className="thumbnail-element"
      style={{
        position: 'absolute',
        left: elementInfo.left,
        top: elementInfo.top,
        width: elementInfo.width,
        height: height,
        transform: `rotate(${rotate}deg)`,
        zIndex: elementIndex,
        pointerEvents: 'none', // 缩略图中的元素不需要交互
      }}
    >
      <CurrentElementComponent elementInfo={elementInfo} />
    </div>
  )
}

export default ThumbnailElement
