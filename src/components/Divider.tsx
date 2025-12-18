import React from 'react'
import './Divider.scss'
import clsx from 'clsx'

interface DividerProps {
  type?: 'horizontal' | 'vertical'
  margin?: number
}

const Divider: React.FC<DividerProps> = ({ type = 'horizontal', margin = -1 }) => {
  const style: React.CSSProperties = {
    margin: type === 'horizontal'
      ? `${margin >= 0 ? margin : 24}px 0`
      : `0 ${margin >= 0 ? margin : 8}px`,
  }

  return (
    <div
      className={clsx('divider', type)}
      style={style}
    />
  )
}

export default Divider
