import React from 'react'
import clsx from 'clsx'
import { useMainStore } from '@/store'
import type { PPTImageElement } from '@/types/slides'
import type { OperateResizeHandlers } from '@/types/edit'
import useCommonOperate from '../hooks/useCommonOperate'

import RotateHandler from './RotateHandler'
import ResizeHandler from './ResizeHandler'
import BorderLine from './BorderLine'
import './ImageElementOperate.scss'

interface ImageElementOperateProps {
  elementInfo: PPTImageElement
  handlerVisible: boolean
  rotateElement: (e: React.MouseEvent, element: PPTImageElement) => void
  scaleElement: (e: React.MouseEvent, element: PPTImageElement, command: OperateResizeHandlers) => void
}

const ImageElementOperate: React.FC<ImageElementOperateProps> = ({
  elementInfo,
  handlerVisible,
  rotateElement,
  scaleElement,
}) => {
  const { canvasScale, clipingImageElementId } = useMainStore()

  const isCliping = clipingImageElementId === elementInfo.id

  const scaleWidth = elementInfo.width * canvasScale
  const scaleHeight = elementInfo.height * canvasScale

  const { resizeHandlers, borderLines } = useCommonOperate(scaleWidth, scaleHeight)

  return (
    <div className={clsx("image-element-operate", { 'cliping': isCliping })}>
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
          <RotateHandler
            style={{ left: scaleWidth / 2 + 'px' }}
            onMouseDown={(e) => {
              e.stopPropagation()
              rotateElement(e, elementInfo)
            }}
          />
        </>
      )}
    </div>
  )
}

export default ImageElementOperate
