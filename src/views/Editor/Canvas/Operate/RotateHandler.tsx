import React from 'react'

interface RotateHandlerProps {
  style?: React.CSSProperties
  onMouseDown?: (e: React.MouseEvent) => void
}

const RotateHandler: React.FC<RotateHandlerProps> = ({ style, onMouseDown }) => {
  return (
    <div 
      className="rotate-handler"
      style={style}
      onMouseDown={onMouseDown}
    />
  )
}

export default RotateHandler
