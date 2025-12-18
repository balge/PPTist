import React from 'react'
import type { AlignmentLineProps } from '@/types/edit'

const AlignmentLine: React.FC<AlignmentLineProps> = ({ type, axis, length }) => {
  const style: React.CSSProperties = {
    position: 'absolute',
    zIndex: 100,
    backgroundColor: '#d14424',
  }

  if (type === 'vertical') {
    style.left = axis.x
    style.top = axis.y
    style.width = 1
    style.height = length
  } else {
    style.left = axis.x
    style.top = axis.y
    style.width = length
    style.height = 1
  }

  return <div className="alignment-line" style={style} />
}

export default AlignmentLine
