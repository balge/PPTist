import React from 'react'
import type { PPTImageElement } from '@/types/slides'
import useClipImage from '../useClipImage'

import ImageRectOutline from './ImageRectOutline'
import ImageEllipseOutline from './ImageEllipseOutline'
import ImagePolygonOutline from './ImagePolygonOutline'

interface ImageOutlineProps {
  elementInfo: PPTImageElement
}

const ImageOutline: React.FC<ImageOutlineProps> = ({ elementInfo }) => {
  const { clipShape } = useClipImage(elementInfo)

  if (clipShape.type === 'rect') {
    return (
      <ImageRectOutline
        width={elementInfo.width}
        height={elementInfo.height}
        radius={clipShape.radius}
        outline={elementInfo.outline}
      />
    )
  }
  else if (clipShape.type === 'ellipse') {
    return (
      <ImageEllipseOutline
        width={elementInfo.width}
        height={elementInfo.height}
        outline={elementInfo.outline}
      />
    )
  }
  else if (clipShape.type === 'polygon' && clipShape.createPath) {
    return (
      <ImagePolygonOutline
        width={elementInfo.width}
        height={elementInfo.height}
        outline={elementInfo.outline}
        createPath={clipShape.createPath}
      />
    )
  }

  return null
}

export default ImageOutline
