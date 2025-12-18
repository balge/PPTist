import React, { useMemo } from 'react'
import type { PPTLineElement, LinePoint } from '@/types/slides'
import { getLineElementPath } from '@/utils/element'
import useElementShadow from '@/views/components/element/hooks/useElementShadow'

import LinePointMarker from './LinePointMarker'
import './BaseLineElement.scss'

interface BaseLineElementProps {
  elementInfo: PPTLineElement
}

const BaseLineElement: React.FC<BaseLineElementProps> = ({ elementInfo }) => {
  const { shadowStyle } = useElementShadow(elementInfo.shadow)

  const svgWidth = useMemo(() => {
    const width = Math.abs(elementInfo.start[0] - elementInfo.end[0])
    return width < 24 ? 24 : width
  }, [elementInfo.start, elementInfo.end])

  const svgHeight = useMemo(() => {
    const height = Math.abs(elementInfo.start[1] - elementInfo.end[1])
    return height < 24 ? 24 : height
  }, [elementInfo.start, elementInfo.end])

  const lineDashArray = useMemo(() => {
    const size = elementInfo.width
    if (elementInfo.style === 'dashed') return size <= 8 ? `${size * 5} ${size * 2.5}` : `${size * 5} ${size * 1.5}`
    if (elementInfo.style === 'dotted') return size <= 8 ? `${size * 1.8} ${size * 1.6}` : `${size * 1.5} ${size * 1.2}`
    return '0 0'
  }, [elementInfo.width, elementInfo.style])

  const path = useMemo(() => {
    return getLineElementPath(elementInfo)
  }, [elementInfo])

  const startPoint = elementInfo.points[0] as Exclude<LinePoint, ''> | undefined
  const endPoint = elementInfo.points[1] as Exclude<LinePoint, ''> | undefined

  return (
    <div 
      className="base-element-line"
      style={{
        top: elementInfo.top + 'px',
        left: elementInfo.left + 'px',
      }}
    >
      <div 
        className="element-content"
        style={{ filter: shadowStyle ? `drop-shadow(${shadowStyle})` : '' }}
      >
        <svg
          overflow="visible" 
          width={svgWidth}
          height={svgHeight}
        >
          <defs>
            {startPoint && (
              <LinePointMarker
                id={elementInfo.id}
                position="start"
                type={startPoint}
                color={elementInfo.color}
                baseSize={elementInfo.width}
              />
            )}
            {endPoint && (
              <LinePointMarker
                id={elementInfo.id}
                position="end"
                type={endPoint}
                color={elementInfo.color}
                baseSize={elementInfo.width}
              />
            )}
          </defs>
          <path
            d={path} 
            stroke={elementInfo.color} 
            strokeWidth={elementInfo.width} 
            strokeDasharray={lineDashArray}
            fill="none" 
            markerStart={startPoint ? `url(#${elementInfo.id}-${startPoint}-start)` : ''}
            markerEnd={endPoint ? `url(#${elementInfo.id}-${endPoint}-end)` : ''}
          ></path>
        </svg>
      </div>
    </div>
  )
}

export default BaseLineElement
