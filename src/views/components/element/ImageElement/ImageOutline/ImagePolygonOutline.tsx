import React from 'react'
import type { PPTElementOutline } from '@/types/slides'
import useElementOutline from '@/views/components/element/hooks/useElementOutline'
import styles from './ImagePolygonOutline.module.scss'

interface ImagePolygonOutlineProps {
  width: number
  height: number
  createPath: (width: number, height: number) => string
  outline?: PPTElementOutline
}

const ImagePolygonOutline: React.FC<ImagePolygonOutlineProps> = ({ width, height, createPath, outline }) => {
  const { outlineWidth, outlineColor, strokeDashArray } = useElementOutline(outline)

  if (!outline) return null

  return (
    <svg 
      className={styles.imagePolygonOutlineSvg}
      width={width}
      height={height}
      overflow="visible"
    >
      <path 
        vectorEffect="non-scaling-stroke" 
        strokeLinecap="butt" 
        strokeMiterlimit="8"
        fill="transparent"
        d={createPath(width, height)}
        stroke={outlineColor}
        strokeWidth={outlineWidth} 
        strokeDasharray={strokeDashArray} 
      ></path>
    </svg>
  )
}

export default ImagePolygonOutline
