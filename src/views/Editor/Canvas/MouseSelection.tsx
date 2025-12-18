import React from 'react'
import clsx from 'clsx'
import './MouseSelection.scss'

interface MouseSelectionProps {
  top: number
  left: number
  width: number
  height: number
  quadrant: number
}

const MouseSelection: React.FC<MouseSelectionProps> = ({
  top,
  left,
  width,
  height,
  quadrant,
}) => {
  return (
    <div 
      className={clsx('mouse-selection', `quadrant-${quadrant}`)}
      style={{
        top: top + 'px',
        left: left + 'px',
        width: width + 'px',
        height: height + 'px',
      }}
    ></div>
  )
}

export default MouseSelection
