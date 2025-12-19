import React from 'react'
import clsx from 'clsx'
import type { OperateBorderLines } from '@/types/edit'
import styles from './BorderLine.module.scss'

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
      className={clsx(styles.borderLine, styles[type], { [styles.wide]: isWide })}
      style={style}
    />
  )
}

export default BorderLine
