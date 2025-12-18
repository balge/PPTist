import React, { useMemo, useState, useEffect } from 'react'
import { useMainStore } from '@/store'
import type { PPTElement } from '@/types/slides'
import { getElementListRange } from '@/utils/element'
import type { OperateResizeHandlers, MultiSelectRange } from '@/types/edit'
import useCommonOperate from '../hooks/useCommonOperate'

import ResizeHandler from './ResizeHandler'
import BorderLine from './BorderLine'
import './MultiSelectOperate.scss'

interface MultiSelectOperateProps {
  elementList: PPTElement[]
  scaleMultiElement?: (e: React.MouseEvent, range: MultiSelectRange, command: OperateResizeHandlers) => void
}

const MultiSelectOperate: React.FC<MultiSelectOperateProps> = ({ elementList, scaleMultiElement }) => {
  const { activeElementIdList, canvasScale } = useMainStore()

  const localActiveElementList = useMemo(() => 
    elementList.filter(el => activeElementIdList.includes(el.id))
  , [elementList, activeElementIdList])

  const range = useMemo(() => {
    const { minX, maxX, minY, maxY } = getElementListRange(localActiveElementList)
    return { minX, maxX, minY, maxY }
  }, [localActiveElementList])

  const width = (range.maxX - range.minX) * canvasScale
  const height = (range.maxY - range.minY) * canvasScale

  const { resizeHandlers, borderLines } = useCommonOperate(width, height)

  const disableResize = useMemo(() => {
    return localActiveElementList.some(item => {
      if (
        (item.type === 'image' || item.type === 'shape') && 
        !item.rotate
      ) return false
      return true
    })
  }, [localActiveElementList])

  return (
    <div 
      className="multi-select-operate"
      style={{
        left: range.minX * canvasScale + 'px',
        top: range.minY * canvasScale + 'px',
      }}
    >
      {borderLines.map(line => (
        <BorderLine 
          key={line.type} 
          type={line.type} 
          style={line.style}
        />
      ))}

      {!disableResize && resizeHandlers.map(point => (
        <ResizeHandler
          key={point.direction}
          type={point.direction}
          style={point.style}
          onMouseDown={(e) => {
            e.stopPropagation()
            scaleMultiElement?.(e, range, point.direction)
          }}
        />
      ))}
    </div>
  )
}

export default MultiSelectOperate
