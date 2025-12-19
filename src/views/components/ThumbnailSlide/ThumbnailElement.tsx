import React, { useMemo } from 'react'
import { ElementTypes, type PPTElement } from '@/types/slides'

import clsx from 'clsx'
import BaseImageElement from '../element/ImageElement/BaseImageElement'
import BaseTextElement from '../element/TextElement/BaseTextElement'
import BaseShapeElement from '../element/ShapeElement/BaseShapeElement'
import BaseLineElement from '../element/LineElement/BaseLineElement'
import BaseChartElement from '../element/ChartElement/BaseChartElement'
import BaseTableElement from '../element/TableElement/BaseTableElement'
import BaseLatexElement from '../element/LatexElement/BaseLatexElement'
import BaseVideoElement from '../element/VideoElement/BaseVideoElement'
import BaseAudioElement from '../element/AudioElement/BaseAudioElement'

interface ThumbnailElementProps {
  elementInfo: PPTElement;
  elementIndex: number;
}

const ThumbnailElement: React.FC<ThumbnailElementProps> = ({
  elementInfo,
  elementIndex,
}) => {
  const CurrentElementComponent = useMemo(() => {
    const elementTypeMap = {
      [ElementTypes.IMAGE]: BaseImageElement,
      [ElementTypes.TEXT]: BaseTextElement,
      [ElementTypes.SHAPE]: BaseShapeElement,
      [ElementTypes.LINE]: BaseLineElement,
      [ElementTypes.CHART]: BaseChartElement,
      [ElementTypes.TABLE]: BaseTableElement,
      [ElementTypes.LATEX]: BaseLatexElement,
      [ElementTypes.VIDEO]: BaseVideoElement,
      [ElementTypes.AUDIO]: BaseAudioElement,
    }
    return elementTypeMap[elementInfo.type] || null
  }, [elementInfo.type])

  return (
    <div
      className={clsx('thumbnail-element', `base-element-${elementInfo.id}`)}
      style={{
        zIndex: elementIndex,
      }}
    >
      {/* @ts-ignore */}
      <CurrentElementComponent elementInfo={elementInfo} />
    </div>
  )
}

export default ThumbnailElement
