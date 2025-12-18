import React, { useMemo } from 'react'
import { useMainStore } from '@/store'
import { PPTVideoElement, PPTLatexElement, PPTAudioElement, PPTChartElement } from '@/types/slides'
import { OperateResizeHandlers } from '@/types/edit'
import useCommonOperate from '../hooks/useCommonOperate'

import RotateHandler from './RotateHandler'
import ResizeHandler from './ResizeHandler'
import BorderLine from './BorderLine'

type PPTElement = PPTVideoElement | PPTLatexElement | PPTAudioElement | PPTChartElement

interface CommonElementOperateProps {
  elementInfo: PPTElement
  handlerVisible: boolean
  rotateElement: (e: React.MouseEvent, element: PPTElement) => void
  scaleElement: (e: React.MouseEvent, element: PPTElement, command: OperateResizeHandlers) => void
}

const CommonElementOperate: React.FC<CommonElementOperateProps> = ({
  elementInfo,
  handlerVisible,
  rotateElement,
  scaleElement,
}) => {
  const { canvasScale } = useMainStore()

  const scaleWidth = elementInfo.width * canvasScale
  const scaleHeight = elementInfo.height * canvasScale

  const { resizeHandlers, borderLines } = useCommonOperate(scaleWidth, scaleHeight)

  const cannotRotate = useMemo(() => 
    ['chart', 'video', 'audio'].includes(elementInfo.type), 
  [elementInfo.type])

  return (
    <div className="common-element-operate">
      {borderLines.map(line => (
        <BorderLine 
          key={line.type} 
          type={line.type} 
          style={line.style}
        />
      ))}
      {handlerVisible && (
        <>
          {resizeHandlers.map(point => (
            <ResizeHandler
              key={point.direction}
              type={point.direction}
              rotate={elementInfo.rotate}
              style={point.style}
              onMouseDown={(e) => {
                e.stopPropagation()
                scaleElement(e, elementInfo, point.direction)
              }}
            />
          ))}
          {!cannotRotate && (
            <RotateHandler
              style={{ left: scaleWidth / 2 + 'px' }}
              onMouseDown={(e) => {
                e.stopPropagation()
                rotateElement(e, elementInfo)
              }}
            />
          )}
        </>
      )}
    </div>
  )
}

export default CommonElementOperate
