import React from 'react'
import clsx from 'clsx'
import type { OperateBorderLines } from '@/types/edit'
import './BorderLine.scss'

interface BorderLineProps {
  type: OperateBorderLines;
  isWide?: boolean;
  style?: React.CSSProperties;
}

const BorderLine: React.FC<BorderLineProps> = ({
  type,
  isWide = false,
  style,
}) => {
  return (
    <div
      className={clsx('border-line', type, { wide: isWide })}
      style={style}
    />
  )
}

export default BorderLine
