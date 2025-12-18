import React, { useMemo } from 'react'
import type { PPTLineElement, LinePoint } from '@/types/slides'
import { getLineElementPath } from '@/utils/element'
import useElementShadow from '@/views/components/element/hooks/useElementShadow'

import LinePointMarker from './LinePointMarker'
import { ElementProps } from '../types'
import './index.scss'

const LineElement: React.FC<ElementProps> = ({ elementInfo, selectElement, contextmenus }) => {
  const element = elementInfo as PPTLineElement
  const { shadowStyle } = useElementShadow(element.shadow)

  const handleSelectElement = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    selectElement?.(e, element)
  }

  const svgWidth = useMemo(() => {
    const width = Math.abs(element.start[0] - element.end[0])
    return width < 24 ? 24 : width
  }, [element.start, element.end])

  const svgHeight = useMemo(() => {
    const height = Math.abs(element.start[1] - element.end[1])
    return height < 24 ? 24 : height
  }, [element.start, element.end])

  const lineDashArray = useMemo(() => {
    const size = element.width
    if (element.style === 'dashed') return size <= 8 ? `${size * 5} ${size * 2.5}` : `${size * 5} ${size * 1.5}`
    if (element.style === 'dotted') return size <= 8 ? `${size * 1.8} ${size * 1.6}` : `${size * 1.5} ${size * 1.2}`
    return '0 0'
  }, [element.width, element.style])

  const path = useMemo(() => {
    return getLineElementPath(element)
  }, [element])

  const startPoint = element.points[0] as Exclude<LinePoint, ''> | undefined
  const endPoint = element.points[1] as Exclude<LinePoint, ''> | undefined

  return (
    <div 
      className="editable-element-shape"
      style={{
        top: element.top + 'px',
        left: element.left + 'px',
        width: svgWidth + 'px',
        height: svgHeight + 'px',
      }}
    >
      <div 
        className="element-content" 
        style={{ filter: shadowStyle ? `drop-shadow(${shadowStyle})` : '' }}
        onMouseDown={handleSelectElement}
        onTouchStart={handleSelectElement}
      >
        <svg
          overflow="visible" 
          width={svgWidth}
          height={svgHeight}
        >
          <defs>
            {startPoint && (
              <LinePointMarker
                id={element.id}
                position="start"
                type={startPoint}
                color={element.color}
                baseSize={element.width}
              />
            )}
            {endPoint && (
              <LinePointMarker
                id={element.id}
                position="end"
                type={endPoint}
                color={element.color}
                baseSize={element.width}
              />
            )}
          </defs>
          <path
            className="line-point"
            d={path} 
            stroke={element.color} 
            strokeWidth={element.width} 
            strokeDasharray={lineDashArray}
            fill="none" 
            markerStart={startPoint ? `url(#${element.id}-${startPoint}-start)` : ''}
            markerEnd={endPoint ? `url(#${element.id}-${endPoint}-end)` : ''}
          ></path>
          <path
            className="line-path"
            d={path} 
            stroke="transparent" 
            strokeWidth="20" 
            fill="none" 
            // v-contextmenu="contextmenus"
          ></path>
        </svg>
      </div>
    </div>
  )
}

export default LineElement
