import React from 'react'
import type { PPTElementOutline } from '@/types/slides'
import useElementOutline from '@/views/components/element/hooks/useElementOutline'
import styles from './ImageEllipseOutline.module.scss'

interface ImageEllipseOutlineProps {
  width: number;
  height: number;
  outline?: PPTElementOutline;
}

const ImageEllipseOutline: React.FC<ImageEllipseOutlineProps> = ({
  width,
  height,
  outline,
}) => {
  const { outlineWidth, outlineColor, strokeDashArray } =
    useElementOutline(outline)

  if (!outline) return null

  return (
    <svg
      className={styles.imageEllipseOutlineSvg}
      width={width}
      height={height}
      overflow="visible"
    >
      <ellipse
        vectorEffect="non-scaling-stroke"
        strokeLinecap="butt"
        strokeMiterlimit={8}
        fill="transparent"
        cx={width / 2}
        cy={height / 2}
        rx={width / 2}
        ry={height / 2}
        stroke={outlineColor}
        strokeWidth={outlineWidth}
        strokeDasharray={strokeDashArray}
      ></ellipse>
    </svg>
  )
}

export default ImageEllipseOutline
