import React from 'react'
import type { PPTElementOutline } from '@/types/slides'
import useElementOutline from '@/views/components/element/hooks/useElementOutline'
import styles from './ImageRectOutline.module.scss'

interface ImageRectOutlineProps {
  width: number
  height: number
  outline?: PPTElementOutline
  radius?: string
}

const ImageRectOutline: React.FC<ImageRectOutlineProps> = ({ width, height, outline, radius = '0' }) => {
  const { outlineWidth, outlineColor, strokeDashArray } = useElementOutline(outline)

  if (!outline) return null

  return (
    <svg 
      className={styles.imageRectOutlineSvg}
      width={width}
      height={height}
      overflow="visible"
    >
      <rect 
        vectorEffect="non-scaling-stroke" 
        strokeLinecap="butt" 
        strokeMiterlimit="8"
        fill="transparent"
        rx={radius} 
        ry={radius}
        width={width}
        height={height}
        stroke={outlineColor}
        strokeWidth={outlineWidth} 
        strokeDasharray={strokeDashArray} 
      ></rect>
    </svg>
  )
}

export default ImageRectOutline
