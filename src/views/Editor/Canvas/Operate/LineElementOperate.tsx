import React, { useMemo } from 'react'
import { useMainStore } from '@/store'
import type { PPTLineElement } from '@/types/slides'
import { OperateLineHandlers } from '@/types/edit'

import ResizeHandler from './ResizeHandler'
import './LineElementOperate.scss'

interface LineElementOperateProps {
  elementInfo: PPTLineElement
  handlerVisible: boolean
  dragLineElement?: (e: React.MouseEvent, element: PPTLineElement, command: OperateLineHandlers) => void
}

const LineElementOperate: React.FC<LineElementOperateProps> = ({
  elementInfo,
  handlerVisible,
  dragLineElement,
}) => {
  const { canvasScale } = useMainStore()

  const svgWidth = Math.max(elementInfo.start[0], elementInfo.end[0])
  const svgHeight = Math.max(elementInfo.start[1], elementInfo.end[1])

  const resizeHandlers = useMemo(() => {
    const handlers = [
      {
        handler: OperateLineHandlers.START,
        style: {
          left: elementInfo.start[0] * canvasScale + 'px',
          top: elementInfo.start[1] * canvasScale + 'px',
        }
      },
      {
        handler: OperateLineHandlers.END,
        style: {
          left: elementInfo.end[0] * canvasScale + 'px',
          top: elementInfo.end[1] * canvasScale + 'px',
        }
      },
    ]

    if (elementInfo.curve || elementInfo.broken || elementInfo.broken2) {
      const ctrlHandler = (elementInfo.curve || elementInfo.broken || elementInfo.broken2) as [number, number]

      handlers.push({
        handler: OperateLineHandlers.C,
        style: {
          left: ctrlHandler[0] * canvasScale + 'px',
          top: ctrlHandler[1] * canvasScale + 'px',
        }
      })
    }
    else if (elementInfo.cubic) {
      const [ctrlHandler1, ctrlHandler2] = elementInfo.cubic
      handlers.push({
        handler: OperateLineHandlers.C1,
        style: {
          left: ctrlHandler1[0] * canvasScale + 'px',
          top: ctrlHandler1[1] * canvasScale + 'px',
        }
      })
      handlers.push({
        handler: OperateLineHandlers.C2,
        style: {
          left: ctrlHandler2[0] * canvasScale + 'px',
          top: ctrlHandler2[1] * canvasScale + 'px',
        }
      })
    }

    return handlers
  }, [elementInfo, canvasScale])

  return (
    <div className="line-element-operate">
      {handlerVisible && (
        <>
          {resizeHandlers.map(point => (
            <ResizeHandler
              key={point.handler}
              // @ts-ignore
              type={point.handler} // Reuse ResizeHandler with line specific type if compatible or ignore TS for now
              style={point.style}
              onMouseDown={(e) => {
                e.stopPropagation()
                dragLineElement?.(e, elementInfo, point.handler)
              }}
            />
          ))}

          <svg 
            width={svgWidth || 1} 
            height={svgHeight || 1} 
            stroke={elementInfo.color}
            overflow="visible" 
            style={{ transform: `scale(${canvasScale})` }}
          >
            {elementInfo.curve && (
              <g>
                <line className="anchor-line" x1={elementInfo.start[0]} y1={elementInfo.start[1]} x2={elementInfo.curve[0]} y2={elementInfo.curve[1]}></line>
                <line className="anchor-line" x1={elementInfo.end[0]} y1={elementInfo.end[1]} x2={elementInfo.curve[0]} y2={elementInfo.curve[1]}></line>
              </g>
            )}
            {elementInfo.cubic && elementInfo.cubic.map((item, index) => (
              <g key={index}>
                {index === 0 && <line className="anchor-line" x1={elementInfo.start[0]} y1={elementInfo.start[1]} x2={item[0]} y2={item[1]}></line>}
                {index === 1 && <line className="anchor-line" x1={elementInfo.end[0]} y1={elementInfo.end[1]} x2={item[0]} y2={item[1]}></line>}
              </g>
            ))}
          </svg>
        </>
      )}
    </div>
  )
}

export default LineElementOperate
