import React from 'react'
import type { PPTElementOutline } from '@/types/slides'
import useElementOutline from '@/views/components/element/hooks/useElementOutline'
import './ElementOutline.scss'

interface ElementOutlineProps {
  width: number
  height: number
  outline?: PPTElementOutline
}

const ElementOutline: React.FC<ElementOutlineProps> = ({ width, height, outline }) => {
  const { outlineWidth, outlineColor, strokeDashArray } = useElementOutline(outline)

  if (!outline) return null

  return (
    <svg 
      className="element-outline-svg"
      width={width}
      height={height}
      overflow="visible"
    >
      <path 
        vectorEffect="non-scaling-stroke" 
        strokeLinecap="butt" 
        strokeMiterlimit="8"
        fill="transparent"
        d={`M0,0 L${width},0 L${width},${height} L0,${height} Z`} 
        stroke={outlineColor}
        strokeWidth={outlineWidth} 
        strokeDasharray={strokeDashArray} 
      ></path>
    </svg>
  )
}

export default ElementOutline
