import React from 'react'
import { useMainStore } from '@/store'
import type { PPTTableElement } from '@/types/slides'
import type { OperateResizeHandlers } from '@/types/edit'
import useCommonOperate from '../hooks/useCommonOperate'

import RotateHandler from './RotateHandler'
import ResizeHandler from './ResizeHandler'
import BorderLine from './BorderLine'

interface TableElementOperateProps {
  elementInfo: PPTTableElement;
  handlerVisible: boolean;
  rotateElement: (e: React.MouseEvent, element: PPTTableElement) => void;
  scaleElement: (
    e: React.MouseEvent,
    element: PPTTableElement,
    command: OperateResizeHandlers
  ) => void;
}

const TableElementOperate: React.FC<TableElementOperateProps> = ({
  elementInfo,
  handlerVisible,
  rotateElement,
  scaleElement,
}) => {
  const { canvasScale } = useMainStore()

  const outlineWidth = elementInfo.outline.width || 1
  const scaleWidth = (elementInfo.width + outlineWidth) * canvasScale
  const scaleHeight = elementInfo.height * canvasScale

  const { resizeHandlers, borderLines } = useCommonOperate(
    scaleWidth,
    scaleHeight
  )

  return (
    <div className="table-element-operate">
      {borderLines.map((line) => (
        <BorderLine key={line.type} type={line.type} style={line.style} />
      ))}
      {handlerVisible && (
        <>
          {resizeHandlers.map((point) => (
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

export default TableElementOperate
