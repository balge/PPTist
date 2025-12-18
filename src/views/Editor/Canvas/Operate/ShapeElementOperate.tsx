import React, { useMemo } from 'react'
import { useMainStore } from '@/store'
import type { PPTShapeElement } from '@/types/slides'
import type { OperateResizeHandlers } from '@/types/edit'
import { SHAPE_PATH_FORMULAS } from '@/configs/shapes'
import useCommonOperate from '../hooks/useCommonOperate'

import RotateHandler from './RotateHandler'
import ResizeHandler from './ResizeHandler'
import BorderLine from './BorderLine'
import './ShapeElementOperate.scss'

interface ShapeElementOperateProps {
  elementInfo: PPTShapeElement
  handlerVisible: boolean
  rotateElement: (e: React.MouseEvent, element: PPTShapeElement) => void
  scaleElement: (e: React.MouseEvent, element: PPTShapeElement, command: OperateResizeHandlers) => void
  moveShapeKeypoint?: (e: React.MouseEvent, element: PPTShapeElement, index: number) => void
}

const ShapeElementOperate: React.FC<ShapeElementOperateProps> = ({
  elementInfo,
  handlerVisible,
  rotateElement,
  scaleElement,
  moveShapeKeypoint,
}) => {
  const { canvasScale } = useMainStore()

  const scaleWidth = elementInfo.width * canvasScale
  const scaleHeight = elementInfo.height * canvasScale

  const { resizeHandlers, borderLines } = useCommonOperate(scaleWidth, scaleHeight)

  const keypoints = useMemo(() => {
    if (!elementInfo.pathFormula || elementInfo.keypoints === undefined) return []
    const pathFormula = SHAPE_PATH_FORMULAS[elementInfo.pathFormula]
    if (!pathFormula) return []

    return elementInfo.keypoints.map((keypoint, index) => {
      const getBaseSize = pathFormula.getBaseSize![index]
      const relative = pathFormula.relative![index]
      const keypointPos = getBaseSize(elementInfo.width, elementInfo.height) * keypoint

      let styles: React.CSSProperties = {}
      if (relative === 'left') styles = { left: keypointPos * canvasScale + 'px' }
      else if (relative === 'right') styles = { left: (elementInfo.width - keypointPos) * canvasScale + 'px' }
      else if (relative === 'center') styles = { left: (elementInfo.width - keypointPos) / 2 * canvasScale + 'px' }
      else if (relative === 'top') styles = { top: keypointPos * canvasScale + 'px' }
      else if (relative === 'bottom') styles = { top: (elementInfo.height - keypointPos) * canvasScale + 'px' }
      else if (relative === 'left_bottom') styles = { left: keypointPos * canvasScale + 'px', top: elementInfo.height * canvasScale + 'px' }
      else if (relative === 'right_bottom') styles = { left: (elementInfo.width - keypointPos) * canvasScale + 'px', top: elementInfo.height * canvasScale + 'px' }
      else if (relative === 'top_right') styles = { left: elementInfo.width * canvasScale + 'px', top: keypointPos * canvasScale + 'px' }
      else if (relative === 'bottom_right') styles = { left: elementInfo.width * canvasScale + 'px', top: (elementInfo.height - keypointPos) * canvasScale + 'px' }

      return {
        keypoint,
        styles,
      }
    })
  }, [elementInfo, canvasScale])

  return (
    <div className="shape-element-operate">
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
          {keypoints.map((item, index) => (
            <div 
              key={index}
              className="operate-keypoint-handler"
              style={item.styles}
              onMouseDown={(e) => {
                e.stopPropagation()
                moveShapeKeypoint?.(e, elementInfo, index)
              }}
            />
          ))}
        </>
      )}
    </div>
  )
}

export default ShapeElementOperate
