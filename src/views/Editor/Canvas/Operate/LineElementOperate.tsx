import React, { useMemo } from 'react'
import { useMainStore } from '@/store'
import type { PPTLineElement } from '@/types/slides'
import { OperateLineHandlers } from '@/types/edit'

import ResizeHandler from './ResizeHandler'
import styles from './LineElementOperate.module.scss'

interface LineElementOperateProps {
  elementInfo: PPTLineElement;
  handlerVisible: boolean;
  dragLineElement?: (
    e: React.MouseEvent,
    element: PPTLineElement,
    command: OperateLineHandlers
  ) => void;
}

/**
 * 组件职责：线条元素的操作层
 * - 渲染线条端点与控制点的操作手柄（start/end/ctrl/cubic）
 * - 手柄位置使用元素局部坐标并按画布缩放比例换算
 * - 通过 dragLineElement 派发端点/控制点拖拽交互
 * - 辅助显示锚线以便观察控制点与端点的连接关系
 */
const LineElementOperate: React.FC<LineElementOperateProps> = ({
  elementInfo,
  handlerVisible,
  dragLineElement,
}) => {
  const { canvasScale } = useMainStore()

  const svgWidth = Math.max(elementInfo.start[0], elementInfo.end[0])
  const svgHeight = Math.max(elementInfo.start[1], elementInfo.end[1])

  /**
   * 计算线条操作手柄的位置与类型
   * - 起点/终点始终存在
   * - 优先处理单控制点（curve、broken、broken2），其次处理双控制点（cubic）
   */
  const resizeHandlers = useMemo(() => {
    const handlers = [
      {
        handler: OperateLineHandlers.START,
        style: {
          left: elementInfo.start[0] * canvasScale + 'px',
          top: elementInfo.start[1] * canvasScale + 'px',
        },
      },
      {
        handler: OperateLineHandlers.END,
        style: {
          left: elementInfo.end[0] * canvasScale + 'px',
          top: elementInfo.end[1] * canvasScale + 'px',
        },
      },
    ]

    if (elementInfo.curve || elementInfo.broken || elementInfo.broken2) {
      const ctrlHandler = (elementInfo.curve ||
        elementInfo.broken ||
        elementInfo.broken2) as [number, number]

      handlers.push({
        handler: OperateLineHandlers.C,
        style: {
          left: ctrlHandler[0] * canvasScale + 'px',
          top: ctrlHandler[1] * canvasScale + 'px',
        },
      })
    }
    else if (elementInfo.cubic) {
      const [ctrlHandler1, ctrlHandler2] = elementInfo.cubic
      handlers.push({
        handler: OperateLineHandlers.C1,
        style: {
          left: ctrlHandler1[0] * canvasScale + 'px',
          top: ctrlHandler1[1] * canvasScale + 'px',
        },
      })
      handlers.push({
        handler: OperateLineHandlers.C2,
        style: {
          left: ctrlHandler2[0] * canvasScale + 'px',
          top: ctrlHandler2[1] * canvasScale + 'px',
        },
      })
    }

    return handlers
  }, [elementInfo, canvasScale])

  return (
    <div className={styles.lineElementOperate}>
      {handlerVisible && (
        <>
          {resizeHandlers.map((point) => (
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
                <line
                  className={styles.anchorLine}
                  x1={elementInfo.start[0]}
                  y1={elementInfo.start[1]}
                  x2={elementInfo.curve[0]}
                  y2={elementInfo.curve[1]}
                ></line>
                <line
                  className={styles.anchorLine}
                  x1={elementInfo.end[0]}
                  y1={elementInfo.end[1]}
                  x2={elementInfo.curve[0]}
                  y2={elementInfo.curve[1]}
                ></line>
              </g>
            )}
            {elementInfo.cubic &&
              elementInfo.cubic.map((item, index) => (
                <g key={index}>
                  {index === 0 && (
                    <line
                      className={styles.anchorLine}
                      x1={elementInfo.start[0]}
                      y1={elementInfo.start[1]}
                      x2={item[0]}
                      y2={item[1]}
                    ></line>
                  )}
                  {index === 1 && (
                    <line
                      className={styles.anchorLine}
                      x1={elementInfo.end[0]}
                      y1={elementInfo.end[1]}
                      x2={item[0]}
                      y2={item[1]}
                    ></line>
                  )}
                </g>
              ))}
          </svg>
        </>
      )}
    </div>
  )
}

export default LineElementOperate
