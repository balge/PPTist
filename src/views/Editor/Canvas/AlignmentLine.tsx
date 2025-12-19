import React from 'react'
import type { AlignmentLineProps } from '@/types/edit'

interface Props extends AlignmentLineProps {
  canvasScale: number
}

const AlignmentLine: React.FC<Props> = ({ type, axis, length, canvasScale }) => {
  const style: React.CSSProperties = {
    position: 'absolute',
    zIndex: 100,
    backgroundColor: '#d14424',
  }

  if (type === 'vertical') {
    style.left = axis.x * canvasScale
    style.top = axis.y * canvasScale
    style.width = 1
    style.height = length * canvasScale
  }
  else {
    style.left = axis.x * canvasScale
    style.top = axis.y * canvasScale
    style.width = length * canvasScale
    style.height = 1
  }

  return <div className="alignment-line" style={style} />
}

export default AlignmentLine
